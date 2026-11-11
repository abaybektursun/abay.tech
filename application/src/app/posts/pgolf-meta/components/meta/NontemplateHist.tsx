"use client";
import { useMemo } from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { BarChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  MarkLineComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { META } from "../../lib/meta-colors";
import type { NontemplateCount } from "../../lib/meta-types";

echarts.use([BarChart, GridComponent, TooltipComponent, MarkLineComponent, CanvasRenderer]);

export function NontemplateHist({ data }: { data: NontemplateCount[] }) {
  const option = useMemo(() => {
    const sorted = [...data].sort((a, b) => a.count - b.count);
    const counts = sorted.map((d) => d.count);
    const prs = sorted.map((d) => d.prs);

    return {
      grid: { left: 60, right: 30, top: 40, bottom: 50 },
      tooltip: {
        trigger: "axis" as const,
        axisPointer: { type: "shadow" as const },
        backgroundColor: "#fafafa",
        borderColor: META.gridLine,
        textStyle: { color: "#52525b", fontSize: 12 },
        formatter: (params: { value: number; name: string }[]) => {
          const p = params[0];
          return `${p.name} techniques: ${p.value} PRs`;
        },
      },
      xAxis: {
        type: "category" as const,
        data: counts.map(String),
        name: "Non-template techniques",
        nameLocation: "center" as const,
        nameGap: 32,
        nameTextStyle: { color: "#a1a1aa", fontSize: 12 },
        axisLine: { lineStyle: { color: META.gridLine } },
        axisTick: { lineStyle: { color: META.gridLine } },
        axisLabel: { color: "#a1a1aa", fontSize: 11 },
      },
      yAxis: {
        type: "value" as const,
        name: "PRs",
        nameTextStyle: { color: "#a1a1aa", fontSize: 12 },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: "#a1a1aa", fontSize: 11 },
        splitLine: { lineStyle: { color: META.gridLine, type: "dashed" as const } },
      },
      series: [
        {
          type: "bar" as const,
          data: prs,
          barMaxWidth: 32,
          itemStyle: { color: META.primary, borderRadius: [2, 2, 0, 0] },
          markLine: (() => {
            // Compute weighted median from data
            const expanded: number[] = [];
            for (const d of sorted) for (let i = 0; i < d.prs; i++) expanded.push(d.count);
            expanded.sort((a, b) => a - b);
            const mid = expanded.length > 0
              ? expanded.length % 2 === 1
                ? expanded[Math.floor(expanded.length / 2)]
                : (expanded[expanded.length / 2 - 1] + expanded[expanded.length / 2]) / 2
              : 0;
            return {
              silent: true,
              symbol: "none",
              lineStyle: { color: "#71717a", type: "dashed" as const, width: 1.5 },
              label: {
                formatter: `median = ${mid}`,
                color: "#71717a",
                fontSize: 11,
                position: "insideEndTop" as const,
              },
              data: [{ xAxis: String(mid) }],
            };
          })(),
        },
      ],
    };
  }, [data]);

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={option}
      style={{ height: 360, width: "100%" }}
    />
  );
}
