"use client";

import { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import type { TaxonomyScatterPoint } from "../lib/meta-types";

export function TaxonomyScatter({ data }: { data: TaxonomyScatterPoint[] }) {
  const option = useMemo(() => {
    const valid = data.filter((d) => d.valid === true);
    const invalid = data.filter((d) => d.valid === false);
    const unknown = data.filter((d) => d.valid === null);

    return {
      grid: { top: 30, right: 30, bottom: 55, left: 65 },
      legend: {
        top: 0,
        textStyle: { color: "#71717a", fontSize: 12 },
      },
      xAxis: {
        name: "PR number",
        nameLocation: "center" as const,
        nameGap: 35,
        nameTextStyle: { color: "#a1a1aa", fontSize: 12 },
        type: "value" as const,
        min: (value: { min: number }) => Math.floor(value.min / 50) * 50,
        max: (value: { max: number }) => Math.ceil(value.max / 50) * 50,
        axisLine: { lineStyle: { color: "#e4e4e7" } },
        axisLabel: { color: "#a1a1aa" },
        splitLine: { lineStyle: { color: "#f4f4f5" } },
      },
      yAxis: {
        name: "BPB",
        nameLocation: "center" as const,
        nameGap: 50,
        nameTextStyle: { color: "#a1a1aa", fontSize: 12 },
        type: "log" as const,
        min: 0.005,
        max: 10,
        axisLine: { lineStyle: { color: "#e4e4e7" } },
        axisLabel: {
          color: "#a1a1aa",
          formatter: (v: number) => (v >= 0.01 ? v.toFixed(2) : v.toExponential(0)),
        },
        splitLine: { lineStyle: { color: "#f4f4f5" } },
      },
      tooltip: {
        trigger: "item" as const,
        formatter: (p: { data: number[] }) => {
          const [pr, bpb] = p.data;
          return `PR_${pr.toString().padStart(4, "0")}<br/>val_bpb: ${bpb < 0.01 ? bpb.toExponential(4) : bpb.toFixed(4)}`;
        },
      },
      series: [
        {
          name: "Valid",
          type: "scatter",
          data: valid.map((d) => [d.pr, d.val_bpb]),
          symbolSize: 6,
          itemStyle: { color: "#81b29a", opacity: 0.7 },
        },
        {
          name: "Invalid",
          type: "scatter",
          data: invalid.map((d) => [d.pr, d.val_bpb]),
          symbolSize: 6,
          itemStyle: { color: "#e07a5f", opacity: 0.7 },
        },
        {
          name: "Unknown",
          type: "scatter",
          data: unknown.map((d) => [d.pr, d.val_bpb]),
          symbolSize: 6,
          itemStyle: { color: "#a1a1aa", opacity: 0.7 },
        },
      ],
    };
  }, [data]);

  return (
    <ReactECharts
      option={option}
      style={{ height: 420, width: "100%" }}
      opts={{ renderer: "svg" }}
    />
  );
}
