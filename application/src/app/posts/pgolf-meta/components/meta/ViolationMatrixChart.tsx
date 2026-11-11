"use client";

import { useMemo } from "react";
import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { HeatmapChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  VisualMapComponent,
} from "echarts/components";
import { SVGRenderer } from "echarts/renderers";
import type { ViolationMatrix } from "../../lib/meta-types";
import { META } from "../../lib/meta-colors";

echarts.use([HeatmapChart, GridComponent, TooltipComponent, VisualMapComponent, SVGRenderer]);

const LABEL_MAP: Record<string, string> = {
  unnormalized_distribution: "Unnormalized",
  multi_pass_rescore: "Multi-pass",
  score_after_adapt: "Score after adapt",
  causality_violation: "Causality",
  dataset_contamination: "Contamination",
};

function cleanLabel(raw: string): string {
  return LABEL_MAP[raw] ?? raw;
}

export function ViolationMatrixChart({ data }: { data: ViolationMatrix }) {
  const option = useMemo(() => {
    const labels = data.labels.map(cleanLabel);

    // Flatten matrix into [x, y, value] triples
    const heatData: [number, number, number][] = [];
    let maxVal = 0;
    for (let y = 0; y < data.matrix.length; y++) {
      for (let x = 0; x < data.matrix[y].length; x++) {
        const v = data.matrix[y][x];
        heatData.push([x, y, v]);
        if (v > maxVal) maxVal = v;
      }
    }

    return {
      grid: { left: 120, right: 30, top: 30, bottom: 90 },
      xAxis: {
        type: "category" as const,
        data: labels,
        axisLine: { lineStyle: { color: "#e4e4e7" } },
        axisLabel: {
          color: "#52525b",
          fontSize: 11,
          interval: 0,
          rotate: 30,
        },
        splitArea: { show: false },
      },
      yAxis: {
        type: "category" as const,
        data: labels,
        axisLine: { lineStyle: { color: "#e4e4e7" } },
        axisLabel: {
          color: "#52525b",
          fontSize: 11,
          interval: 0,
        },
        splitArea: { show: false },
      },
      visualMap: {
        min: 0,
        max: maxVal || 1,
        calculable: false,
        orient: "horizontal" as const,
        left: "center",
        bottom: 0,
        inRange: {
          color: ["#ffffff", META.secondary],
        },
        textStyle: { color: "#a1a1aa" },
      },
      tooltip: {
        formatter: (p: { data: [number, number, number] }) => {
          const [x, y, v] = p.data;
          return `${labels[y]} & ${labels[x]}<br/>Co-occurrence: ${v}`;
        },
      },
      series: [
        {
          type: "heatmap",
          data: heatData,
          label: {
            show: true,
            color: "#52525b",
            fontSize: 12,
            fontWeight: 600,
          },
          itemStyle: {
            borderColor: "#ffffff",
            borderWidth: 2,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 6,
              shadowColor: "rgba(0,0,0,0.15)",
            },
          },
        },
      ],
    };
  }, [data]);

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={option}
      style={{ height: 380, width: "100%" }}
      opts={{ renderer: "svg" }}
    />
  );
}
