"use client";

import ReactECharts from "echarts-for-react";

interface ProbePoint {
  label: string;
  layer_idx: number;
  delta_bits_per_token: number | null;
}

interface Matrix {
  label: string;
  layer: number;
  type: string;
  condition_number: number;
}

interface Props {
  probePoints: ProbePoint[];
  matrices: Matrix[];
}

export default function CrossScatter({ probePoints, matrices }: Props) {
  const layers = Array.from({ length: 10 }, (_, i) => i + 1).map((i) => {
    const layerMatrices = matrices.filter(
      (m) => m.layer === i && ["Q", "K", "V", "Out"].includes(m.type)
    );
    const avgCond =
      layerMatrices.reduce((sum, m) => sum + m.condition_number, 0) /
      Math.max(layerMatrices.length, 1);

    const probe = probePoints.find((p) => p.layer_idx === i);
    const delta = probe?.delta_bits_per_token ?? 0;

    return {
      layer: i,
      label: `L${i}`,
      avg_condition: avgCond,
      delta_bpt: delta,
      is_positive: delta > 0,
    };
  });

  const option = {
    backgroundColor: "transparent",
    grid: { left: 72, right: 24, top: 24, bottom: 52, containLabel: false },
    tooltip: {
      backgroundColor: "#fafafa",
      borderColor: "#f4f4f5",
      textStyle: { color: "#27272a", fontSize: 12 },
      formatter: (p: { data: number[] }) => {
        const d = layers[p.data[3]];
        return `<b>Layer ${d.layer}</b><br/>Δ bits/tok: ${d.delta_bpt > 0 ? "+" : ""}${d.delta_bpt.toFixed(2)}<br/>Avg cond #: ${d.avg_condition.toFixed(0)}`;
      },
    },
    xAxis: {
      type: "log" as const,
      min: 800,
      max: 20000,
      name: "Avg Condition Number (Q/K/V/Out) →",
      nameLocation: "middle" as const,
      nameGap: 34,
      nameTextStyle: { color: "#a1a1aa" },
      axisLabel: { color: "#a1a1aa" },
      axisLine: { lineStyle: { color: "#e4e4e7" } },
      splitLine: { lineStyle: { color: "#f4f4f5" } },
    },
    yAxis: {
      type: "value" as const,
      name: "↓ Readability improvement\n(Δ bits/token from logit lens)",
      nameLocation: "middle" as const,
      nameGap: 52,
      nameTextStyle: { color: "#a1a1aa" },
      axisLabel: { color: "#a1a1aa" },
      axisLine: { lineStyle: { color: "#e4e4e7" } },
      splitLine: { lineStyle: { color: "#f4f4f5" } },
    },
    series: [
      {
        type: "scatter",
        symbolSize: 16,
        data: layers.map((d, i) => [d.avg_condition, d.delta_bpt, d.is_positive ? 1 : 0, i]),
        itemStyle: {
          color: (p: { data: number[] }) => (p.data[2] === 1 ? "#991b1b" : "#27272a"),
          borderColor: "#e4e4e7",
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: (p: { data: number[] }) => layers[p.data[3]].label,
          position: "top" as const,
          distance: 8,
          color: "#71717a",
          fontSize: 10,
          fontWeight: 600,
        },
        labelLayout: {
          hideOverlap: true,
        },
        markLine: {
          silent: true,
          symbol: "none",
          label: { show: false },
          lineStyle: { color: "#e4e4e7", width: 1, type: "solid" as const },
          data: [{ yAxis: 0 }],
        },
      },
    ],
  };

  return (
    <figure className="bg-zinc-50 border border-zinc-100 rounded-lg p-5">
      <ReactECharts option={option} style={{ height: 420 }} />
      <figcaption className="text-xs text-zinc-400 mt-3 leading-relaxed">
        Bottom = high readability improvement. Right = high condition number.
        Top-right = encoder layers preparing skip features.
      </figcaption>
    </figure>
  );
}
