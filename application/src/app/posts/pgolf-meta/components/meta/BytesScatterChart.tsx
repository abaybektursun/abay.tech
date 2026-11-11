"use client";

import { useMemo } from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { ScatterChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
} from "echarts/components";
import { SVGRenderer } from "echarts/renderers";
import type { BytesPoint } from "../../lib/meta-types";
import { QUANT_COLORS } from "../../lib/meta-colors";

echarts.use([ScatterChart, GridComponent, TooltipComponent, LegendComponent, SVGRenderer]);

export function BytesScatterChart({ data }: { data: BytesPoint[] }) {
  const option = useMemo(() => {
    // Group by quant_type
    const groups = new Map<string, number[][]>();
    for (const d of data) {
      const key = d.quant_type;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push([d.bytes_total / 1e6, d.submission_bpb]);
    }

    const series = Array.from(groups).map(([qt, pts]) => ({
      name: qt,
      type: "scatter" as const,
      data: pts,
      symbolSize: 6,
      itemStyle: { color: QUANT_COLORS[qt] ?? "#94a3b8", opacity: 0.6 },
    }));

    return {
      grid: { left: 60, right: 30, top: 40, bottom: 50 },
      legend: {
        top: 0,
        textStyle: { color: "#71717a", fontSize: 12 },
      },
      xAxis: {
        name: "Artifact size (MB)",
        nameLocation: "center" as const,
        nameGap: 35,
        nameTextStyle: { color: "#a1a1aa", fontSize: 12 },
        type: "value" as const,
        axisLine: { lineStyle: { color: "#e4e4e7" } },
        axisLabel: { color: "#a1a1aa" },
        splitLine: { lineStyle: { color: "#f4f4f5" } },
      },
      yAxis: {
        name: "Submission BPB",
        nameLocation: "center" as const,
        nameGap: 45,
        nameTextStyle: { color: "#a1a1aa", fontSize: 12 },
        type: "value" as const,
        axisLine: { lineStyle: { color: "#e4e4e7" } },
        axisLabel: { color: "#a1a1aa" },
        splitLine: { lineStyle: { color: "#f4f4f5" } },
      },
      tooltip: {
        trigger: "item" as const,
        formatter: (params: { data: number[]; seriesName: string }) => {
          const d = params.data;
          return `${params.seriesName}<br/>Size: ${d[0].toFixed(2)} MB<br/>Submission BPB: ${d[1].toFixed(4)}`;
        },
      },
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
