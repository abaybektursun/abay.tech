"use client";
import { useMemo } from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { BarChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { META } from "../../lib/meta-colors";
import { formatTechnique } from "../../lib/technique-labels";
import type { TechniqueAdoption } from "../../lib/meta-types";

echarts.use([BarChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

export function TechniqueAdoptionChart({ data }: { data: TechniqueAdoption[] }) {
  const option = useMemo(() => {
    const top20 = [...data].sort((a, b) => b.total - a.total).slice(0, 20).reverse();
    const labels = top20.map((d) => formatTechnique(d.technique));
    const fromTemplate = top20.map((d) => d.from_template);
    const added = top20.map((d) => d.added);

    return {
      grid: { left: 160, right: 40, top: 40, bottom: 30 },
      legend: {
        top: 8,
        textStyle: { color: "#71717a", fontSize: 11 },
        itemWidth: 12,
        itemHeight: 8,
      },
      tooltip: {
        trigger: "axis" as const,
        axisPointer: { type: "shadow" as const },
        backgroundColor: "#fafafa",
        borderColor: META.gridLine,
        textStyle: { color: "#52525b", fontSize: 12 },
      },
      xAxis: {
        type: "value" as const,
        name: "PRs",
        nameTextStyle: { color: "#a1a1aa", fontSize: 12 },
        axisLine: { show: false },
        axisTick: { show: false },
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
          name: "From Template",
          type: "bar" as const,
          stack: "total",
          data: fromTemplate,
          barMaxWidth: 20,
          itemStyle: { color: META.muted },
        },
        {
          name: "Added",
          type: "bar" as const,
          stack: "total",
          data: added,
          barMaxWidth: 20,
          itemStyle: { color: META.primary },
        },
      ],
    };
  }, [data]);

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={option}
      style={{ height: 560, width: "100%" }}
    />
  );
}
