"use client";
import { useMemo } from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { ScatterChart, LineChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  MarkLineComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { META } from "../../lib/meta-colors";
import type { TemptationPoint } from "../../lib/meta-types";

echarts.use([ScatterChart, LineChart, GridComponent, TooltipComponent, MarkLineComponent, CanvasRenderer]);

export function TemptationScatterChart({ data }: { data: TemptationPoint[] }) {
  const option = useMemo(() => {
    const allX = data.map((d) => d.neural_bpb);
    const allY = data.map((d) => d.submission_bpb);
    const lo = Math.min(...allX, ...allY) * 0.95;
    const hi = Math.max(...allX, ...allY) * 1.05;

    return {
      grid: { left: 60, right: 30, top: 40, bottom: 50 },
      tooltip: {
        trigger: "item" as const,
        backgroundColor: "#fafafa",
        borderColor: META.gridLine,
        textStyle: { color: "#52525b", fontSize: 12 },
        formatter: (p: { data: number[] }) => {
          const [x, y, pr, lift] = p.data;
          return `PR #${pr}<br/>Neural: ${x.toFixed(4)}<br/>Submission: ${y.toFixed(4)}<br/>Lift: ${lift.toFixed(4)}`;
        },
      },
      xAxis: {
        type: "value" as const,
        name: "Neural BPB (honest)",
        nameLocation: "center" as const,
        nameGap: 30,
        nameTextStyle: { color: "#a1a1aa", fontSize: 12 },
        min: lo,
        max: hi,
        axisLine: { lineStyle: { color: META.gridLine } },
        axisTick: { lineStyle: { color: META.gridLine } },
        axisLabel: { color: "#a1a1aa", fontSize: 11 },
        splitLine: { lineStyle: { color: META.gridLine, type: "dashed" as const } },
      },
      yAxis: {
        type: "value" as const,
        name: "Submission BPB (claimed)",
        nameTextStyle: { color: "#a1a1aa", fontSize: 12 },
        min: lo,
        max: hi,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: "#a1a1aa", fontSize: 11 },
        splitLine: { lineStyle: { color: META.gridLine, type: "dashed" as const } },
      },
      series: [
        {
          name: "Submissions",
          type: "scatter" as const,
          symbolSize: 10,
          itemStyle: { color: META.secondary, opacity: 0.7 },
          data: data.map((d) => [d.neural_bpb, d.submission_bpb, d.pr_num, d.lift]),
        },
        {
          name: "y = x",
          type: "line" as const,
          symbol: "none",
          lineStyle: { color: META.muted, type: "dashed" as const, width: 1.5 },
          data: [
            [lo, lo],
            [hi, hi],
          ],
          tooltip: { show: false },
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
