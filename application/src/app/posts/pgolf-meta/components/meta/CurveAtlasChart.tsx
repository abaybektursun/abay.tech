"use client";

import { useMemo } from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import {
  GridComponent,
  LegendComponent,
} from "echarts/components";
import { SVGRenderer } from "echarts/renderers";
import type { CurveAtlasRun } from "../../lib/meta-types";
import { TIER_COLORS, TIER_LABELS } from "../../lib/meta-colors";

echarts.use([LineChart, GridComponent, LegendComponent, SVGRenderer]);

const TIER_ORDER = [0, 1, 2] as const;
const TIER_OPACITY: Record<number, number> = { 0: 0.55, 1: 0.15, 2: 0.55 };

export function CurveAtlasChart({ data }: { data: CurveAtlasRun[] }) {
  const option = useMemo(() => {
    // Build one series per tier, curves separated by nulls
    const series = TIER_ORDER.map((tier) => {
      const curves = data.filter((d) => d.tier === tier);
      const points: ([number, number] | null)[] = [];
      for (const curve of curves) {
        for (const [pct, loss] of curve.points) {
          points.push([pct, loss]);
        }
        points.push(null);
      }
      return {
        name: TIER_LABELS[tier],
        type: "line" as const,
        data: points,
        connectNulls: false,
        symbol: "none",
        lineStyle: {
          width: 1,
          color: TIER_COLORS[tier],
          opacity: TIER_OPACITY[tier],
        },
        itemStyle: { color: TIER_COLORS[tier] },
        silent: true,
        emphasis: { disabled: true },
      };
    });

    return {
      grid: { left: 55, right: 20, top: 40, bottom: 50 },
      legend: {
        top: 0,
        textStyle: { color: "#71717a", fontSize: 12 },
      },
      xAxis: {
        name: "Training progress (%)",
        nameLocation: "center" as const,
        nameGap: 30,
        nameTextStyle: { color: "#a1a1aa", fontSize: 12 },
        type: "value" as const,
        min: 0,
        max: 100,
        axisLine: { lineStyle: { color: "#e4e4e7" } },
        axisLabel: {
          color: "#a1a1aa",
          formatter: (v: number) => `${v}%`,
        },
        splitLine: { lineStyle: { color: "#f4f4f5" } },
      },
      yAxis: {
        name: "Train loss",
        nameLocation: "end" as const,
        nameTextStyle: { color: "#a1a1aa", fontSize: 12 },
        type: "value" as const,
        axisLine: { lineStyle: { color: "#e4e4e7" } },
        axisLabel: { color: "#a1a1aa" },
        splitLine: { lineStyle: { color: "#f4f4f5" } },
      },
      tooltip: { show: false },
      animation: false,
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
