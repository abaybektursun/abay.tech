"use client";

import { useMemo } from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { BarChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
} from "echarts/components";
import { SVGRenderer } from "echarts/renderers";
import type { InvalidityQuartile } from "../../lib/meta-types";
import { META } from "../../lib/meta-colors";

echarts.use([BarChart, GridComponent, TooltipComponent, SVGRenderer]);

export function InvalidityQuartilesChart({ data }: { data: InvalidityQuartile[] }) {
  const option = useMemo(() => {
    const labels = data.map((d) => `${d.quartile}\n${d.pr_range}`);
    const rates = data.map((d) => d.rate);

    return {
      grid: { left: 60, right: 30, top: 40, bottom: 60 },
      xAxis: {
        type: "category" as const,
        data: labels,
        axisLine: { lineStyle: { color: "#e4e4e7" } },
        axisLabel: {
          color: "#52525b",
          fontSize: 11,
          interval: 0,
        },
        splitLine: { show: false },
      },
      yAxis: {
        name: "Invalidity rate (%)",
        nameLocation: "center" as const,
        nameGap: 45,
        nameTextStyle: { color: "#a1a1aa", fontSize: 12 },
        type: "value" as const,
        max: 60,
        axisLine: { lineStyle: { color: "#e4e4e7" } },
        axisLabel: {
          color: "#a1a1aa",
          formatter: (v: number) => `${v}%`,
        },
        splitLine: { lineStyle: { color: "#f4f4f5" } },
      },
      tooltip: {
        trigger: "axis" as const,
        axisPointer: { type: "shadow" as const },
        formatter: (params: { data: number; dataIndex: number }[]) => {
          const d = data[params[0].dataIndex];
          return `${d.quartile} (${d.pr_range})<br/>Rate: ${d.rate.toFixed(1)}%<br/>Invalid: ${d.invalid} / ${d.total}`;
        },
      },
      series: [
        {
          type: "bar",
          data: rates,
          itemStyle: { color: META.secondary },
          barMaxWidth: 60,
          label: {
            show: true,
            position: "top" as const,
            formatter: (p: { data: number }) => `${p.data.toFixed(1)}%`,
            color: "#52525b",
            fontSize: 12,
            fontWeight: 600,
          },
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
