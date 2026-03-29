"use client";

import * as Plot from "@observablehq/plot";
import { usePlot } from "./usePlot";

interface PerMatrix {
  layer: number;
  type: string;
  delta: number;
}

interface PerLayer {
  layer: number;
  delta: number;
}

interface Props {
  perMatrix: PerMatrix[];
  perLayer: PerLayer[];
  baselineBpb: number;
  fullModelDelta: number;
}

const TYPE_ORDER = ["Q", "K", "V", "Out", "MLP_up", "MLP_down"];

export default function QuantSensitivityHeatmap({
  perMatrix,
  perLayer,
  baselineBpb,
  fullModelDelta,
}: Props) {
  const data = perMatrix.map((d) => ({
    ...d,
    delta_micro: d.delta * 1e6,
  }));

  const containerRef = usePlot(
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
          tickFormat: (d: number) => `L${d}`,
        },
        color: {
          type: "linear",
          scheme: "YlOrRd",
          domain: [0, 500],
          label: "Δ BPB (×10⁻⁶)",
          legend: true,
        },
        marks: [
          Plot.cell(data, {
            x: "type",
            y: "layer",
            fill: "delta_micro",
            rx: 3,
            tip: true,
            title: (d: (typeof data)[number]) =>
              `L${d.layer} ${d.type}\nΔ BPB: +${d.delta.toFixed(6)}\n(${d.delta_micro.toFixed(0)} × 10⁻⁶)`,
          }),
          Plot.text(
            data.filter((d) => d.delta_micro >= 100),
            {
              x: "type",
              y: "layer",
              text: (d: (typeof data)[number]) => `${d.delta_micro.toFixed(0)}`,
              fill: (d: (typeof data)[number]) => (d.delta_micro > 300 ? "white" : "#f4f4f5"),
              fontSize: 10,
              fontWeight: "600",
            }
          ),
        ],
      }),
    [data]
  );

  const layerData = perLayer.map((d) => ({
    ...d,
    label: `L${d.layer}`,
    delta_micro: d.delta * 1e6,
  }));

  const barRef = usePlot(
    (width) =>
      Plot.plot({
        width: Math.min(width, 700),
        height: 340,
        style: { background: "transparent", color: "#71717a", fontSize: "12px" },
        marginLeft: 50,
        marginBottom: 40,
        x: {
          label: null,
          domain: layerData.map((d) => d.label),
        },
        y: {
          label: "Δ BPB (×10⁻⁶)",
          grid: true,
        },
        marks: [
          Plot.barY(layerData, {
            x: "label",
            y: "delta_micro",
            fill: "delta_micro",
            rx: 3,
            tip: true,
            title: (d: (typeof layerData)[number]) =>
              `Layer ${d.layer}\nΔ BPB: +${d.delta.toFixed(6)}\n(all 6 matrices quantized)`,
          }),
          Plot.text(layerData, {
            x: "label",
            y: "delta_micro",
            text: (d: (typeof layerData)[number]) => `${d.delta_micro.toFixed(0)}`,
            dy: -8,
            fill: "#27272a",
            fontSize: 10,
            fontWeight: "600",
          }),
        ],
        color: {
          type: "linear",
          scheme: "YlOrRd",
          domain: [400, 1100],
        },
      }),
    [layerData]
  );

  return (
    <div className="space-y-6">
      <figure className="bg-zinc-50 border border-zinc-100 rounded-lg p-5">
        <div ref={containerRef} className="flex justify-center" />
        <figcaption className="text-xs text-zinc-400 mt-3 leading-relaxed">
          Each cell: quantize only that one matrix to int6, measure BPB degradation.
          Baseline: {baselineBpb.toFixed(6)} BPB. Full int6: +{(fullModelDelta * 1e3).toFixed(1)}×10⁻³.
        </figcaption>
      </figure>

      <figure className="bg-zinc-50 border border-zinc-100 rounded-lg p-5">
        <div ref={barRef} className="flex justify-center" />
        <figcaption className="text-xs text-zinc-400 mt-3 leading-relaxed">
          All 6 matrices of each layer quantized to int6. Decoder layers 9–10 are most sensitive.
        </figcaption>
      </figure>
    </div>
  );
}
