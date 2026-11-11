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
import { CanvasRenderer } from "echarts/renderers";
import { META } from "../../lib/meta-colors";
import type { VolumeDay } from "../../lib/meta-types";

echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

export function VolumeTimeline({ data }: { data: VolumeDay[] }) {
  const option = useMemo(() => {
    const dates = data.map((d) => d.date);
    const valid = data.map((d) => d.valid);
    const ngram = data.map((d) => d.ngram);
    const invalidOther = data.map((d) => d.invalid_other);

    const areaSeries = (name: string, values: number[], color: string) => ({
      name,
      type: "line" as const,
      stack: "volume",
      areaStyle: { opacity: 0.6 },
      lineStyle: { width: 1.5 },
      symbol: "none",
      data: values,
      itemStyle: { color },
    });

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
        formatter: (params: { seriesName: string; value: number; dataIndex: number; color: string }[]) => {
          const idx = params[0]?.dataIndex ?? 0;
          const d = data[idx];
          let s = `<b>${d.date}</b><br/>`;
          for (const p of params) {
            s += `<span style="color:${p.color}">●</span> ${p.seriesName}: ${p.value}<br/>`;
          }
          s += `Total: ${d.total}`;
          return s;
        },
      },
      xAxis: {
        type: "category" as const,
        data: dates.map((d) => d.slice(5)),  // "03-18" format
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
        areaSeries("Valid", valid, META.primary),
        areaSeries("N-gram", ngram, META.purple),
        areaSeries("Other Invalid", invalidOther, META.secondary),
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
