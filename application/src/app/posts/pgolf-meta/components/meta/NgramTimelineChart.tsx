"use client";

import { useMemo } from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
} from "echarts/components";
import { SVGRenderer } from "echarts/renderers";
import type { NgramTimelinePoint } from "../../lib/meta-types";
import { META } from "../../lib/meta-colors";

echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent, SVGRenderer]);

export function NgramTimelineChart({ data }: { data: NgramTimelinePoint[] }) {
  const option = useMemo(() => {
    const sorted = [...data].sort((a, b) => a.pr_num - b.pr_num);

    return {
      grid: { left: 60, right: 30, top: 40, bottom: 50 },
      xAxis: {
        name: "PR Number",
        nameLocation: "center" as const,
        nameGap: 35,
        nameTextStyle: { color: "#a1a1aa", fontSize: 12 },
        type: "value" as const,
        max: "dataMax",
        axisLine: { lineStyle: { color: "#e4e4e7" } },
        axisLabel: { color: "#a1a1aa" },
        splitLine: { lineStyle: { color: "#f4f4f5" } },
      },
      yAxis: {
        name: "Cumulative N-gram PRs",
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
        formatter: (params: { data: number[] }[]) => {
          const [pr, cum] = params[0].data;
          return `PR #${pr}<br/>Cumulative N-gram PRs: ${cum}`;
        },
      },
      series: [
        {
          type: "line",
          step: "end" as const,
          data: sorted.map((d) => [d.pr_num, d.cumulative]),
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: META.purple + "66" },
              { offset: 1, color: META.purple + "0a" },
            ]),
          },
          lineStyle: { color: META.purple, width: 2 },
          itemStyle: { color: META.purple },
          symbol: "none",
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
