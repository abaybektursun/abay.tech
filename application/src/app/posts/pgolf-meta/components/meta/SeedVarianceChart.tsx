"use client";

import { useMemo } from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { BarChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  GraphicComponent,
} from "echarts/components";
import { SVGRenderer } from "echarts/renderers";
import type { SeedConfig } from "../../lib/meta-types";
import { META } from "../../lib/meta-colors";

echarts.use([BarChart, GridComponent, TooltipComponent, GraphicComponent, SVGRenderer]);

export function SeedVarianceChart({ data }: { data: SeedConfig[] }) {
  const option = useMemo(() => {
    // Convert std to mBPB (multiply by 1000)
    const stds = data.map((d) => d.std * 1000);
    const sorted = [...stds].sort((a, b) => a - b);
    const n = sorted.length;
    const median = n === 0 ? 0
      : n % 2 === 1 ? sorted[Math.floor(n / 2)]
      : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;

    // Build histogram bins
    const binStep = 0.5; // 0.5 mBPB bins
    const binMax = Math.min(Math.ceil(Math.max(...stds) / binStep) * binStep, 20);
    const nBins = Math.round(binMax / binStep);
    const counts = new Array(nBins).fill(0);
    const labels: string[] = [];

    for (let i = 0; i < nBins; i++) {
      labels.push((i * binStep).toFixed(1));
    }
    for (const s of stds) {
      const idx = Math.min(Math.floor(s / binStep), nBins - 1);
      if (idx >= 0) counts[idx]++;
    }

    return {
      grid: { left: 60, right: 30, top: 40, bottom: 50 },
      graphic: [
        {
          type: "text",
          right: 40,
          top: 10,
          style: {
            text: `median = ${median.toFixed(2)} mBPB`,
            fill: "#71717a",
            fontSize: 12,
          },
        },
      ],
      xAxis: {
        name: "Seed std (mBPB)",
        nameLocation: "center" as const,
        nameGap: 35,
        nameTextStyle: { color: "#a1a1aa", fontSize: 12 },
        type: "category" as const,
        data: labels,
        axisLine: { lineStyle: { color: "#e4e4e7" } },
        axisLabel: {
          color: "#a1a1aa",
          interval: 3,
        },
        splitLine: { show: false },
      },
      yAxis: {
        name: "Count",
        nameLocation: "center" as const,
        nameGap: 45,
        nameTextStyle: { color: "#a1a1aa", fontSize: 12 },
        type: "value" as const,
        axisLine: { lineStyle: { color: "#e4e4e7" } },
        axisLabel: { color: "#a1a1aa" },
        splitLine: { lineStyle: { color: "#f4f4f5" } },
      },
      tooltip: {
        trigger: "axis" as const,
        axisPointer: { type: "shadow" as const },
        formatter: (params: { dataIndex: number; data: number }[]) => {
          const idx = params[0]?.dataIndex ?? 0;
          const lo = idx * binStep;
          const hi = lo + binStep;
          return `[${lo.toFixed(1)}, ${hi.toFixed(1)}) mBPB<br/>Count: ${params[0]?.data ?? 0}`;
        },
      },
      series: [
        {
          type: "bar",
          data: counts,
          itemStyle: { color: META.primary, opacity: 0.75 },
          barMaxWidth: 24,
        },
      ],
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
