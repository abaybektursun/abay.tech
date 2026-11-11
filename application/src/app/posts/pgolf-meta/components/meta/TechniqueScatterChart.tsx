"use client";

import { useMemo } from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { ScatterChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
} from "echarts/components";
import { SVGRenderer } from "echarts/renderers";
import type { TechniqueScatterPoint } from "../../lib/meta-types";
import { META } from "../../lib/meta-colors";

echarts.use([ScatterChart, GridComponent, TooltipComponent, SVGRenderer]);

export function TechniqueScatterChart({ data }: { data: TechniqueScatterPoint[] }) {
  const option = useMemo(() => {
    const points = data.map((d) => [d.n_techniques, d.last_val_bpb, d.pr_num]);

    return {
      grid: { left: 60, right: 30, top: 40, bottom: 50 },
      xAxis: {
        name: "Non-template techniques",
        nameLocation: "center" as const,
        nameGap: 35,
        nameTextStyle: { color: "#a1a1aa", fontSize: 12 },
        type: "value" as const,
        axisLine: { lineStyle: { color: "#e4e4e7" } },
        axisLabel: { color: "#a1a1aa" },
        splitLine: { lineStyle: { color: "#f4f4f5" } },
      },
      yAxis: {
        name: "val BPB",
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
        formatter: (params: { data: number[] }) => {
          const d = params.data;
          return `PR #${d[2]}<br/>Techniques: ${d[0]}<br/>val BPB: ${d[1].toFixed(4)}`;
        },
      },
      series: [
        {
          type: "scatter",
          data: points,
          symbolSize: 8,
          itemStyle: { color: META.primary, opacity: 0.5 },
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
