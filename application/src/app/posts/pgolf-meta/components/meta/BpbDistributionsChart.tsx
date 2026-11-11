"use client";
import { useMemo } from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { BarChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  MarkLineComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { META } from "../../lib/meta-colors";
import type { BpbDistPoint } from "../../lib/meta-types";

echarts.use([BarChart, GridComponent, TooltipComponent, LegendComponent, MarkLineComponent, CanvasRenderer]);

const BIN_STEP = 0.05;
const BIN_MAX = 2.0;
const NUM_BINS = Math.round(BIN_MAX / BIN_STEP) + 1; // 0..2.0 plus one overflow bin

function binData(points: BpbDistPoint[], validFilter: boolean | null): number[] {
  const counts = new Array(NUM_BINS).fill(0);
  for (const p of points) {
    if (p.valid !== validFilter) continue;  // strict equality: null excluded from both
    const idx = p.bpb >= BIN_MAX ? NUM_BINS - 1 : Math.floor(p.bpb / BIN_STEP);
    counts[Math.max(0, Math.min(idx, NUM_BINS - 1))]++;
  }
  return counts;
}

function binLabels(): string[] {
  const labels: string[] = [];
  for (let i = 0; i < NUM_BINS; i++) {
    const lo = (i * BIN_STEP).toFixed(2);
    if (i === NUM_BINS - 1) {
      labels.push(`${lo}+`);
    } else {
      labels.push(lo);
    }
  }
  return labels;
}

export function BpbDistributionsChart({ data }: { data: BpbDistPoint[] }) {
  const option = useMemo(() => {
    const labels = binLabels();
    const validCounts = binData(data, true);
    const invalidCounts = binData(data, false);

    return {
      grid: { left: 60, right: 30, top: 40, bottom: 50 },
      legend: {
        top: 8,
        textStyle: { color: "#71717a", fontSize: 11 },
        itemWidth: 12,
        itemHeight: 8,
      },
      tooltip: {
        trigger: "axis" as const,
        backgroundColor: "#fafafa",
        borderColor: META.gridLine,
        textStyle: { color: "#52525b", fontSize: 12 },
      },
      xAxis: {
        type: "category" as const,
        data: labels,
        name: "Submission BPB",
        nameLocation: "center" as const,
        nameGap: 30,
        nameTextStyle: { color: "#a1a1aa", fontSize: 12 },
        axisLine: { lineStyle: { color: META.gridLine } },
        axisTick: { lineStyle: { color: META.gridLine } },
        axisLabel: { color: "#a1a1aa", fontSize: 10, rotate: 45 },
      },
      yAxis: {
        type: "value" as const,
        name: "Count",
        nameTextStyle: { color: "#a1a1aa", fontSize: 12 },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: "#a1a1aa", fontSize: 11 },
        splitLine: { lineStyle: { color: META.gridLine, type: "dashed" as const } },
      },
      series: [
        {
          name: "Valid",
          type: "bar" as const,
          data: validCounts,
          itemStyle: { color: META.primary, opacity: 0.7 },
          barGap: "0%",
          markLine: {
            silent: true,
            symbol: "none",
            lineStyle: { color: META.muted, type: "dashed" as const, width: 1.5 },
            label: {
              formatter: "BPB < 0.9:\nlikely false positives",
              position: "insideEndTop" as const,
              color: "#71717a",
              fontSize: 10,
            },
            data: [{ xAxis: 18 }],  // index 18 = the 0.90 bin
          },
        },
        {
          name: "Invalid",
          type: "bar" as const,
          data: invalidCounts,
          itemStyle: { color: META.secondary, opacity: 0.7 },
          barGap: "0%",
        },
      ],
    };
  }, [data]);

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={option}
      style={{ height: 400, width: "100%" }}
    />
  );
}
