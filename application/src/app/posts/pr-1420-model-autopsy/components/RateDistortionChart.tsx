"use client";

import * as Plot from "@observablehq/plot";
import { usePlot } from "../../pr-1019-model-autopsy/components/usePlot";

interface Matrix {
  layer: number;
  type: string;
  slope: number;
  D_bpb: number;
  is_loop: boolean;
}

interface ByType {
  type: string;
  avg_slope: number;
  total_D: number;
}

interface Props {
  matrices: Matrix[];
  byType: ByType[];
  loopRatio: number;
  baselineBpb: number;
}

const TYPE_ORDER = ["Q", "K", "V", "Out", "MLP_up", "MLP_down"];

export default function RateDistortionChart({
  matrices,
  byType,
  loopRatio,
  baselineBpb,
}: Props) {
  const blockMatrices = matrices.filter((m) => m.layer >= 0);
  const data = blockMatrices.map((m) => ({
    ...m,
    slope_micro: m.slope * 1e6,
  }));

  const heatRef = usePlot(
    (width) =>
      Plot.plot({
        width: Math.min(width, 700),
        height: 480,
        style: { background: "transparent", color: "#71717a", fontSize: "12px" },
        marginLeft: 50,
        marginBottom: 50,
        padding: 0.05,
        x: {
          label: null,
          domain: TYPE_ORDER,
          tickRotate: -25,
        },
        y: {
          label: "Layer",
          domain: Array.from({ length: 11 }, (_, i) => i),
          tickFormat: (d: number) => `${[4, 5].includes(d) ? "* " : ""}L${d}`,
        },
        color: {
          type: "linear",
          range: ["#f2efe9", "#e07a5f"],
          domain: [0, 80],
          label: "Slope (×10⁻⁶ BPB/KB)",
          legend: true,
        },
        marks: [
          Plot.cell(data, {
            x: "type",
            y: "layer",
            fill: "slope_micro",
            rx: 3,
            tip: true,
            title: (d: (typeof data)[number]) =>
              `L${d.layer} ${d.type}${d.is_loop ? " (LOOP)" : ""}\nSlope: ${d.slope.toExponential(2)} BPB/KB\nΔ BPB: ${d.D_bpb >= 0 ? "+" : ""}${d.D_bpb.toFixed(6)}`,
          }),
          Plot.text(
            data.filter((d) => d.slope_micro >= 10),
            {
              x: "type",
              y: "layer",
              text: (d: (typeof data)[number]) => d.slope_micro.toFixed(1),
              fill: (d: (typeof data)[number]) => (d.slope_micro > 40 ? "white" : "#5a3d30"),
              fontSize: 10,
              fontWeight: "600",
            }
          ),
        ],
      }),
    [data]
  );

  const typeData = byType.map((t) => ({
    ...t,
    avg_slope_micro: t.avg_slope * 1e6,
  }));

  const barRef = usePlot(
    (width) =>
      Plot.plot({
        width: Math.min(width, 700),
        height: 300,
        style: { background: "transparent", color: "#71717a", fontSize: "12px" },
        marginLeft: 70,
        marginBottom: 40,
        x: {
          label: "Avg slope (×10⁻⁶ BPB/KB)",
          grid: true,
        },
        y: {
          label: null,
          domain: typeData.map((t) => t.type),
        },
        marks: [
          Plot.barX(typeData, {
            y: "type",
            x: "avg_slope_micro",
            fill: (d: (typeof typeData)[number]) =>
              ["V", "K"].includes(d.type) ? "#e07a5f" : "#3d405b",
            rx: 3,
            tip: true,
            title: (d: (typeof typeData)[number]) =>
              `${d.type}\nAvg slope: ${d.avg_slope.toExponential(2)} BPB/KB\nTotal Δ BPB: +${d.total_D.toFixed(5)}`,
          }),
          Plot.text(typeData, {
            y: "type",
            x: "avg_slope_micro",
            text: (d: (typeof typeData)[number]) => d.avg_slope_micro.toFixed(1),
            dx: 4,
            textAnchor: "start",
            fill: "#27272a",
            fontSize: 10,
            fontWeight: "600",
          }),
        ],
      }),
    [typeData]
  );

  return (
    <div className="space-y-6">
      <figure className="bg-zinc-50 border border-zinc-100 rounded-lg p-5">
        <div ref={heatRef} className="flex justify-center" />
        <figcaption className="text-xs text-zinc-400 mt-3 leading-relaxed">
          Slope = BPB damage per compressed KB. Higher = more sensitive to quantization.
          Baseline: {baselineBpb.toFixed(6)} BPB.{" "}
          <span className="font-medium text-zinc-500">* = loop layer</span>.
          Loop layers average {loopRatio.toFixed(1)}x higher slope than non-loop.
        </figcaption>
      </figure>

      <figure className="bg-zinc-50 border border-zinc-100 rounded-lg p-5">
        <div ref={barRef} className="flex justify-center" />
        <figcaption className="text-xs text-zinc-400 mt-3 leading-relaxed">
          Average slope by matrix type across all layers.{" "}
          <span className="inline-block w-2 h-2 rounded-sm bg-[#e07a5f] mr-1 align-middle" />
          Attention K/V{" "}
          <span className="inline-block w-2 h-2 rounded-sm bg-[#3d405b] mr-1 align-middle" />
          Other. Value projections carry the most sensitive information per byte.
        </figcaption>
      </figure>
    </div>
  );
}
