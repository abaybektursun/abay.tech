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
import { STRATEGY_COLORS, STRATEGY_LABELS, META } from "../../lib/meta-colors";
import type { StrategyCount } from "../../lib/meta-types";

echarts.use([BarChart, GridComponent, TooltipComponent, CanvasRenderer]);

export function StrategyBreakdown({ data }: { data: StrategyCount[] }) {
  const option = useMemo(() => {
    const sorted = [...data].sort((a, b) => a.count - b.count);
    const labels = sorted.map((d) => STRATEGY_LABELS[d.strategy] ?? d.strategy);
    const counts = sorted.map((d) => d.count);
    const colors = sorted.map((d) => STRATEGY_COLORS[d.strategy] ?? META.muted);

    return {
      grid: { left: 140, right: 60, top: 20, bottom: 30 },
      tooltip: {
        trigger: "axis" as const,
        axisPointer: { type: "shadow" as const },
        backgroundColor: "#fafafa",
        borderColor: META.gridLine,
        textStyle: { color: "#52525b", fontSize: 12 },
      },
      xAxis: {
        type: "value" as const,
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
        axisLabel: { color: "#52525b", fontSize: 12 },
      },
      series: [
        {
          type: "bar" as const,
          data: counts.map((v, i) => ({ value: v, itemStyle: { color: colors[i] } })),
          barMaxWidth: 28,
          label: {
            show: true,
            position: "right" as const,
            color: "#71717a",
            fontSize: 11,
            formatter: (p: { value: number }) => String(p.value),
          },
        },
      ],
    };
  }, [data]);

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={option}
      style={{ height: 320, width: "100%" }}
    />
  );
}
