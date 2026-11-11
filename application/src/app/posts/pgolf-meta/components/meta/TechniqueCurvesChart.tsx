"use client";

import { useMemo } from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  MarkLineComponent,
} from "echarts/components";
import { SVGRenderer } from "echarts/renderers";
import type { TechniqueCurve } from "../../lib/meta-types";
import { formatTechnique } from "../../lib/technique-labels";

echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent, MarkLineComponent, SVGRenderer]);

const COLORS = ["#2563eb", "#10b981", "#8b5cf6", "#f59e0b", "#14b8a6", "#ef4444"];

export function TechniqueCurvesChart({ data }: { data: TechniqueCurve[] }) {
  const option = useMemo(() => {
    const series = data.map((t, i) => ({
      name: formatTechnique(t.technique),
      type: "line" as const,
      data: t.gaps.map(([pct, gap]) => [pct, gap]),
      symbol: "none",
      lineStyle: { width: 2, color: COLORS[i % COLORS.length] },
      itemStyle: { color: COLORS[i % COLORS.length] },
    }));

    // Add zero reference line to the first series
    if (series.length > 0) {
      (series[0] as Record<string, unknown>).markLine = {
        silent: true,
        symbol: "none",
        lineStyle: { color: "#d6d3d1", type: "solid", width: 1 },
        label: { show: false },
        data: [{ yAxis: 0 }],
      };
    }

    return {
      grid: { left: 55, right: 20, top: 50, bottom: 50 },
      legend: {
        top: 0,
        left: 0,
        right: 0,
        textStyle: { color: "#71717a", fontSize: 11 },
        itemWidth: 14,
        itemHeight: 8,
        itemGap: 14,
        type: "plain" as const,
      },
      xAxis: {
        name: "Training progress (%)",
        nameLocation: "center" as const,
        nameGap: 30,
        nameTextStyle: { color: "#a1a1aa", fontSize: 12 },
        type: "value" as const,
        min: 0,
        max: 100,
        axisLine: { lineStyle: { color: "#e4e4e7" } },
        axisLabel: {
          color: "#a1a1aa",
          formatter: (v: number) => `${v}%`,
        },
        splitLine: { lineStyle: { color: "#f4f4f5" } },
      },
      yAxis: {
        name: "Δ train loss (with − without)",
        nameLocation: "center" as const,
        nameGap: 42,
        nameTextStyle: { color: "#a1a1aa", fontSize: 11 },
        type: "value" as const,
        axisLine: { lineStyle: { color: "#e4e4e7" } },
        axisLabel: {
          color: "#a1a1aa",
          formatter: (v: number) => v > 0 ? `+${v.toFixed(2)}` : v.toFixed(2),
        },
        splitLine: { lineStyle: { color: "#f4f4f5" } },
      },
      tooltip: {
        trigger: "axis" as const,
        backgroundColor: "#fafafa",
        borderColor: "#e4e4e7",
        textStyle: { color: "#52525b", fontSize: 12 },
        formatter: (params: { seriesName: string; data: number[]; color: string }[]) => {
          const pct = params[0]?.data[0];
          let s = `<b>${pct}% through training</b><br/>`;
          for (const p of params) {
            const v = p.data[1];
            const sign = v > 0 ? "+" : "";
            s += `<span style="color:${p.color}">●</span> ${p.seriesName}: ${sign}${v.toFixed(3)}<br/>`;
          }
          s += `<span style="color:#a1a1aa">Below zero = technique helps</span>`;
          return s;
        },
      },
      animation: false,
      series,
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
