"use client";

import { useState } from "react";
import * as Plot from "@observablehq/plot";
import { usePlot } from "./usePlot";

interface CurveEntry {
  type: string;
  layer: number;
  sv: number[];
}

interface Props {
  curves: Record<string, CurveEntry>;
}

const TYPES = ["Q", "K", "V", "Out", "MLP_up", "MLP_down"] as const;
type MatrixType = (typeof TYPES)[number];

const LAYER_COLORS = [
  "#dbeafe", "#bfdbfe", "#93c5fd", "#60a5fa", "#3b82f6",
  "#2563eb", "#1d4ed8", "#1e40af", "#1e3a8a", "#172554", "#0f172a",
];

export default function SVCurveViewer({ curves }: Props) {
  const [selectedType, setSelectedType] = useState<MatrixType>("Q");

  const filtered = Object.entries(curves)
    .filter(([, c]) => c.type === selectedType)
    .sort(([, a], [, b]) => a.layer - b.layer);

  const plotData = filtered.flatMap(([label, c]) =>
    c.sv.map((val, i) => ({
      index: i,
      sv: val,
      layer: c.layer,
      label,
    }))
  );

  const containerRef = usePlot(
    (width) =>
      Plot.plot({
        width,
        height: 380,
        style: { background: "transparent", color: "#71717a", fontSize: "12px" },
        marginLeft: 56,
        marginBottom: 40,
        x: { label: "Singular Value Index", },
        y: { label: "Singular Value", grid: true, type: "log" },
        color: {
          type: "ordinal",
          domain: Array.from({ length: 11 }, (_, i) => i),
          range: LAYER_COLORS,
          legend: true,
          label: "Layer",
        },
        marks: [
          Plot.lineY(plotData, {
            x: "index",
            y: "sv",
            stroke: "layer",
            strokeWidth: 1.5,
            curve: "natural",
          }),
          Plot.tip(plotData, Plot.pointerX({
            x: "index",
            y: "sv",
            stroke: "layer",
            title: (d: typeof plotData[number]) =>
              `${d.label}\nIndex: ${d.index}\nσ = ${d.sv.toFixed(4)}`,
          })),
        ],
      }),
    [plotData, selectedType]
  );

  return (
    <figure className="bg-zinc-50 border border-zinc-100 rounded-lg p-5">
      <figcaption className="text-xs text-zinc-400 mb-4 leading-relaxed">
        Each line is one layer. Steep decay = low effective rank. Flat = capacity fully used.
      </figcaption>

      <div className="flex flex-wrap gap-2 mb-4">
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setSelectedType(t)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              selectedType === t
                ? "bg-zinc-800 text-white"
                : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div ref={containerRef} />
    </figure>
  );
}
