"use client";

import * as Plot from "@observablehq/plot";
import { usePlot } from "../../pr-1019-model-autopsy/components/usePlot";

interface MatrixEntry {
  layer: number;
  type: string;
  params: number;
  delta_int5: number;
  delta_int6: number;
  upgrade_benefit: number;
  upgrade_cost_bits: number;
  benefit_per_bit: number;
}

interface Props {
  perMatrix: MatrixEntry[];
  baselineBpb: number;
}

const TYPE_ORDER = ["Q", "K", "V", "Out", "MLP_up", "MLP_down"];

export default function MixedQuantChart({ perMatrix, baselineBpb }: Props) {
  const data = perMatrix.map((d) => ({
    ...d,
    benefit_micro: d.upgrade_benefit * 1e6,
    delta_int5_micro: d.delta_int5 * 1e6,
    delta_int6_micro: d.delta_int6 * 1e6,
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
          domain: [...new Set(data.map((d) => d.layer))].sort((a, b) => a - b),
          tickFormat: (d: number) => `L${d}`,
        },
        color: {
          type: "linear",
          range: ["#f2efe9", "#3d405b"],
          domain: [0, Math.max(...data.map((d) => d.benefit_micro))],
          label: "int5→int6 benefit (×10⁻⁶ BPB)",
          legend: true,
        },
        marks: [
          Plot.cell(data, {
            x: "type",
            y: "layer",
            fill: "benefit_micro",
            rx: 3,
            tip: true,
            title: (d: (typeof data)[number]) =>
              `L${d.layer} ${d.type}\nint5 Δ: ${d.delta_int5 >= 0 ? "+" : ""}${d.delta_int5.toFixed(6)}\nint6 Δ: ${d.delta_int6 >= 0 ? "+" : ""}${d.delta_int6.toFixed(6)}\nUpgrade benefit: ${d.upgrade_benefit >= 0 ? "+" : ""}${d.upgrade_benefit.toFixed(6)}\nParams: ${(d.params / 1024).toFixed(0)}K`,
          }),
          Plot.text(
            data.filter((d) => Math.abs(d.benefit_micro) >= 50),
            {
              x: "type",
              y: "layer",
              text: (d: (typeof data)[number]) => `${d.benefit_micro.toFixed(0)}`,
              fill: (d: (typeof data)[number]) => (d.benefit_micro > 400 ? "white" : "#27272a"),
              fontSize: 10,
              fontWeight: "600",
            }
          ),
        ],
      }),
    [data]
  );

  const ranked = [...data]
    .filter((d) => d.upgrade_benefit > 0)
    .sort((a, b) => b.benefit_per_bit - a.benefit_per_bit);

  const barRef = usePlot(
    (width) =>
      Plot.plot({
        width: Math.min(width, 700),
        height: Math.max(380, ranked.length * 22),
        style: { background: "transparent", color: "#71717a", fontSize: "12px" },
        marginLeft: 90,
        marginRight: 10,
        marginBottom: 40,
        x: {
          label: "Benefit per bit (×10⁻¹⁰ BPB/bit)",
          grid: true,
        },
        y: {
          label: null,
          domain: ranked.map((d) => `L${d.layer} ${d.type}`),
        },
        marks: [
          Plot.barX(ranked, {
            y: (d: (typeof ranked)[number]) => `L${d.layer} ${d.type}`,
            x: (d: (typeof ranked)[number]) => d.benefit_per_bit * 1e10,
            fill: (d: (typeof ranked)[number]) =>
              d.type.startsWith("MLP") ? "#e07a5f" : "#3d405b",
            rx: 3,
            tip: true,
            title: (d: (typeof ranked)[number]) =>
              `L${d.layer} ${d.type}\nBenefit/bit: ${(d.benefit_per_bit * 1e10).toFixed(2)} ×10⁻¹⁰\nTotal benefit: ${(d.upgrade_benefit * 1e6).toFixed(0)} ×10⁻⁶\nParams: ${(d.params / 1024).toFixed(0)}K`,
          }),
        ],
      }),
    [ranked]
  );

  return (
    <div className="space-y-6">
      <figure className="bg-zinc-50 border border-zinc-100 rounded-lg p-5">
        <div ref={heatRef} className="flex justify-center" />
        <figcaption className="text-xs text-zinc-400 mt-3 leading-relaxed">
          Upgrade benefit: how much BPB improves when switching a single matrix
          from int5 to int6. Baseline: {baselineBpb.toFixed(6)} BPB.
          Darker = more benefit from the extra bit.
        </figcaption>
      </figure>

      <figure className="bg-zinc-50 border border-zinc-100 rounded-lg p-5">
        <div ref={barRef} className="flex justify-center" />
        <figcaption className="text-xs text-zinc-400 mt-3 leading-relaxed">
          Efficiency ranking: BPB improvement per additional bit spent.{" "}
          <span className="inline-block w-2 h-2 rounded-sm bg-[#e07a5f] mr-1 align-middle" />
          MLP{" "}
          <span className="inline-block w-2 h-2 rounded-sm bg-[#3d405b] mr-1 align-middle" />
          Attention. Knapsack uses this ranking to allocate the bit budget.
        </figcaption>
      </figure>
    </div>
  );
}
