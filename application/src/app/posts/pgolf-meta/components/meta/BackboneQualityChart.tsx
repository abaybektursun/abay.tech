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
import { SVGRenderer } from "echarts/renderers";
import type { BackbonePoint } from "../../lib/meta-types";
import { META } from "../../lib/meta-colors";

echarts.use([BarChart, GridComponent, TooltipComponent, LegendComponent, SVGRenderer]);

const BIN_MIN = 0.8;
const BIN_MAX = 2.0;
const BIN_STEP = 0.05;

function makeBins(points: BackbonePoint[]): number[] {
  const nBins = Math.round((BIN_MAX - BIN_MIN) / BIN_STEP);
  const counts = new Array(nBins).fill(0);
  for (const p of points) {
    const idx = Math.floor((p.last_val_bpb - BIN_MIN) / BIN_STEP);
    if (idx >= 0) counts[Math.min(idx, nBins - 1)]++;
  }
  return counts;
}

function binLabels(): string[] {
  const labels: string[] = [];
  const nBins = Math.round((BIN_MAX - BIN_MIN) / BIN_STEP);
  for (let i = 0; i < nBins; i++) {
    const lo = BIN_MIN + i * BIN_STEP;
    labels.push(lo.toFixed(2));
  }
  return labels;
}

export function BackboneQualityChart({ data }: { data: BackbonePoint[] }) {
  const option = useMemo(() => {
    const ngram = data.filter((d) => d.is_ngram);
    const nonNgram = data.filter((d) => !d.is_ngram);
    const ngramBins = makeBins(ngram);
    const nonNgramBins = makeBins(nonNgram);
    const labels = binLabels();

    return {
      grid: { left: 60, right: 30, top: 40, bottom: 50 },
      legend: {
        top: 0,
        textStyle: { color: "#71717a", fontSize: 12 },
      },
      xAxis: {
        name: "Neural val BPB",
        nameLocation: "center" as const,
        nameGap: 35,
        nameTextStyle: { color: "#a1a1aa", fontSize: 12 },
        type: "category" as const,
        data: labels,
        axisLine: { lineStyle: { color: "#e4e4e7" } },
        axisLabel: {
          color: "#a1a1aa",
          interval: 3,
        },
        splitLine: { show: false },
      },
      yAxis: {
        name: "Count",
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
        axisPointer: { type: "shadow" as const },
        formatter: (params: { seriesName: string; data: number; dataIndex: number }[]) => {
          const bin = labels[params[0]?.dataIndex ?? 0];
          const lo = parseFloat(bin);
          const hi = lo + BIN_STEP;
          let s = `BPB: [${lo.toFixed(2)}, ${hi.toFixed(2)})`;
          for (const p of params) {
            s += `<br/>${p.seriesName}: ${p.data}`;
          }
          return s;
        },
      },
      series: [
        {
          name: "Non-N-gram PRs",
          type: "bar",
          data: nonNgramBins,
          itemStyle: { color: META.primary, opacity: 0.6 },
          barGap: "-100%",
          barMaxWidth: 20,
        },
        {
          name: "N-gram PRs",
          type: "bar",
          data: ngramBins,
          itemStyle: { color: META.purple, opacity: 0.8 },
          barGap: "-100%",
          barMaxWidth: 20,
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
