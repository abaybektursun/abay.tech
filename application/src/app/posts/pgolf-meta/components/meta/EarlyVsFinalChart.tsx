"use client";

import { useMemo } from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { ScatterChart, LineChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
} from "echarts/components";
import { SVGRenderer } from "echarts/renderers";
import type { EarlyFinalPoint } from "../../lib/meta-types";
import { PURITY_COLORS, PURITY_LABELS } from "../../lib/meta-colors";

echarts.use([ScatterChart, LineChart, GridComponent, TooltipComponent, LegendComponent, SVGRenderer]);

export function EarlyVsFinalChart({ data }: { data: EarlyFinalPoint[] }) {
  const option = useMemo(() => {
    // Group by purity
    const groups = new Map<number, number[][]>();
    for (const d of data) {
      const key = d.purity ?? -1;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push([d.early, d.final]);
    }

    // Independent axis bounds — tight around each variable's data
    const earlyVals = data.map((d) => d.early).sort((a, b) => a - b);
    const finalVals = data.map((d) => d.final).sort((a, b) => a - b);
    const pct = (arr: number[], p: number) => arr[Math.floor(arr.length * p)];

    const xLo = Math.floor(pct(earlyVals, 0.01) * 20) / 20;
    const xHi = Math.ceil(pct(earlyVals, 0.99) * 20) / 20;
    const yLo = Math.floor(pct(finalVals, 0.01) * 20) / 20;
    const yHi = Math.ceil(pct(finalVals, 0.99) * 20) / 20;

    // Regression line (OLS)
    const n = data.length;
    const sumX = data.reduce((s, d) => s + d.early, 0);
    const sumY = data.reduce((s, d) => s + d.final, 0);
    const sumXY = data.reduce((s, d) => s + d.early * d.final, 0);
    const sumX2 = data.reduce((s, d) => s + d.early * d.early, 0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const scatterSeries = Array.from(groups).map(([p, pts]) => ({
      name: PURITY_LABELS[p] ?? (p === -1 ? "Unknown" : `Purity ${p}`),
      type: "scatter" as const,
      data: pts,
      symbolSize: 7,
      itemStyle: { color: PURITY_COLORS[p] ?? "#94a3b8", opacity: 0.6 },
    }));

    const regressionSeries = {
      name: "r = 0.86",
      type: "line" as const,
      data: [
        [xLo, slope * xLo + intercept],
        [xHi, slope * xHi + intercept],
      ],
      lineStyle: { color: "#a1a1aa", type: "dashed" as const, width: 1.5 },
      symbol: "none",
      tooltip: { show: false },
      itemStyle: { color: "#a1a1aa" },
    };

    return {
      grid: { left: 60, right: 30, top: 40, bottom: 50 },
      legend: {
        top: 0,
        textStyle: { color: "#71717a", fontSize: 12 },
      },
      xAxis: {
        name: "BPB at step 1000",
        nameLocation: "center" as const,
        nameGap: 35,
        nameTextStyle: { color: "#a1a1aa", fontSize: 12 },
        type: "value" as const,
        min: xLo,
        max: xHi,
        axisLine: { lineStyle: { color: "#e4e4e7" } },
        axisLabel: { color: "#a1a1aa" },
        splitLine: { lineStyle: { color: "#f4f4f5" } },
      },
      yAxis: {
        name: "Final BPB",
        nameLocation: "center" as const,
        nameGap: 45,
        nameTextStyle: { color: "#a1a1aa", fontSize: 12 },
        type: "value" as const,
        min: yLo,
        max: yHi,
        axisLine: { lineStyle: { color: "#e4e4e7" } },
        axisLabel: { color: "#a1a1aa" },
        splitLine: { lineStyle: { color: "#f4f4f5" } },
      },
      tooltip: {
        trigger: "item" as const,
        formatter: (params: { data: number[]; seriesName: string }) => {
          const d = params.data;
          return `${params.seriesName}<br/>Early: ${d[0].toFixed(4)}<br/>Final: ${d[1].toFixed(4)}`;
        },
      },
      series: [...scatterSeries, regressionSeries],
    };
  }, [data]);

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={option}
      style={{ height: 420, width: "100%" }}
      opts={{ renderer: "svg" }}
    />
  );
}
