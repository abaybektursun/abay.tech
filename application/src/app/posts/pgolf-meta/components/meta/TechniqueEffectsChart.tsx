"use client";
import { useMemo } from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { BarChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { META } from "../../lib/meta-colors";
import { formatTechnique } from "../../lib/technique-labels";
import type { TechniqueEffect } from "../../lib/meta-types";

echarts.use([BarChart, GridComponent, TooltipComponent, CanvasRenderer]);

export function TechniqueEffectsChart({ data }: { data: TechniqueEffect[] }) {
  const option = useMemo(() => {
    const sorted = [...data].sort((a, b) => a.delta - b.delta);
    const labels = sorted.map((d) => formatTechnique(d.technique));
    const deltas = sorted.map((d) => d.delta);

    return {
      grid: { left: 160, right: 60, top: 20, bottom: 30 },
      tooltip: {
        trigger: "axis" as const,
        axisPointer: { type: "shadow" as const },
        backgroundColor: "#fafafa",
        borderColor: META.gridLine,
        textStyle: { color: "#52525b", fontSize: 12 },
        formatter: (params: { name: string; value: number; dataIndex: number }[]) => {
          const p = params[0];
          const d = sorted[p.dataIndex];
          return [
            `<b>${p.name}</b>`,
            `Delta: ${d.delta > 0 ? "+" : ""}${d.delta.toFixed(4)}`,
            `With (n=${d.n_with}): ${d.median_with.toFixed(4)}`,
            `Without (n=${d.n_without}): ${d.median_without.toFixed(4)}`,
          ].join("<br/>");
        },
      },
      xAxis: {
        type: "value" as const,
        name: "Delta BPB (with - without)",
        nameLocation: "center" as const,
        nameGap: 28,
        nameTextStyle: { color: "#a1a1aa", fontSize: 11 },
        axisLine: { lineStyle: { color: META.gridLine } },
        axisTick: { lineStyle: { color: META.gridLine } },
        axisLabel: { color: "#a1a1aa", fontSize: 11 },
        splitLine: { lineStyle: { color: META.gridLine, type: "dashed" as const } },
      },
      yAxis: {
        type: "category" as const,
        data: labels,
        axisLine: { lineStyle: { color: META.gridLine } },
        axisTick: { show: false },
        axisLabel: { color: "#52525b", fontSize: 11, width: 140, overflow: "truncate" as const },
      },
      series: [
        {
          type: "bar" as const,
          data: deltas.map((v) => ({
            value: v,
            itemStyle: { color: v <= 0 ? META.primary : META.secondary },
            label: {
              show: true,
              color: "#71717a",
              fontSize: 10,
              position: v <= 0 ? "left" : "right",
              formatter: `${v > 0 ? "+" : ""}${v.toFixed(3)}`,
            },
          })),
          barMaxWidth: 20,
        },
      ],
    };
  }, [data]);

  const chartHeight = Math.max(400, data.length * 26);

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={option}
      style={{ height: chartHeight, width: "100%" }}
    />
  );
}
