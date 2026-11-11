"use client";

import * as Plot from "@observablehq/plot";
import { usePlot } from "../../pr-1019-model-autopsy/components/usePlot";

interface PairResult {
  blocks: number[];
  D: number;
  D_per_Mparam: number;
  is_loop: boolean;
}

interface Convergence {
  convergence_ratios: number[];
  delta_norms_x1_x0: number[];
  delta_norms_x2_x1: number[];
  mean_ratio: number;
}

interface Props {
  pairResults: PairResult[];
  convergence: Convergence;
  amplificationFactor: number;
}

export default function RecurrenceChart({
  pairResults,
  convergence,
  amplificationFactor,
}: Props) {
  const pairData = pairResults.map((p) => ({
    label: `(${p.blocks[0]},${p.blocks[1]})`,
    D_per_Mparam: p.D_per_Mparam,
    D_per_Mparam_milli: p.D_per_Mparam * 1000,
    is_loop: p.is_loop,
  }));

  const pairRef = usePlot(
    (width) =>
      Plot.plot({
        width: Math.min(width, 700),
        height: 320,
        style: { background: "transparent", color: "#71717a", fontSize: "12px" },
        marginLeft: 50,
        marginBottom: 50,
        x: {
          label: "Block pair",
          domain: pairData.map((d) => d.label),
        },
        y: {
          label: "D / Mparam (×10⁻³)",
          grid: true,
        },
        marks: [
          Plot.barY(pairData, {
            x: "label",
            y: "D_per_Mparam_milli",
            fill: (d: (typeof pairData)[number]) => (d.is_loop ? "#e07a5f" : "#3d405b"),
            rx: 3,
            tip: true,
            title: (d: (typeof pairData)[number]) =>
              `Blocks ${d.label}${d.is_loop ? " (LOOP)" : ""}\nD/Mparam: ${d.D_per_Mparam.toFixed(4)}`,
          }),
          Plot.text(pairData, {
            x: "label",
            y: "D_per_Mparam_milli",
            text: (d: (typeof pairData)[number]) => d.D_per_Mparam_milli.toFixed(2),
            dy: -8,
            fill: "#27272a",
            fontSize: 10,
            fontWeight: "600",
          }),
          Plot.ruleY([0]),
        ],
      }),
    [pairData]
  );

  // Convergence: show delta norms across batches
  const convData = convergence.convergence_ratios.map((r, i) => ({
    batch: i,
    ratio: r,
    d01: convergence.delta_norms_x1_x0[i],
    d12: convergence.delta_norms_x2_x1[i],
  }));

  const convRef = usePlot(
    (width) =>
      Plot.plot({
        width: Math.min(width, 700),
        height: 300,
        style: { background: "transparent", color: "#71717a", fontSize: "12px" },
        marginLeft: 55,
        marginBottom: 40,
        x: { label: "Batch", domain: convData.map((d) => d.batch) },
        y: { label: "L2 norm", grid: true },
        color: {
          domain: ["||x\u2081 - x\u2080||", "||x\u2082 - x\u2081||"],
          range: ["#3d405b", "#e07a5f"],
          legend: true,
        },
        marks: [
          Plot.barY(convData, {
            x: "batch",
            y: "d01",
            fill: "#3d405b",
            dx: -6,
            rx: 2,
            tip: true,
            title: (d: (typeof convData)[number]) =>
              `Batch ${d.batch}\n||x\u2081 - x\u2080|| = ${d.d01.toFixed(2)}\n||x\u2082 - x\u2081|| = ${d.d12.toFixed(2)}\nRatio: ${d.ratio.toFixed(4)}`,
          }),
          Plot.barY(convData, {
            x: "batch",
            y: "d12",
            fill: "#e07a5f",
            dx: 6,
            rx: 2,
          }),
        ],
      }),
    [convData]
  );

  return (
    <div className="space-y-6">
      <figure className="bg-zinc-50 border border-zinc-100 rounded-lg p-5">
        <div ref={pairRef} className="flex justify-center" />
        <figcaption className="text-xs text-zinc-400 mt-3 leading-relaxed">
          Quantization damage per million parameters, by block pair.{" "}
          <span className="inline-block w-2 h-2 rounded-sm bg-[#e07a5f] mr-1 align-middle" />
          Loop pair (4,5){" "}
          <span className="inline-block w-2 h-2 rounded-sm bg-[#3d405b] mr-1 align-middle" />
          Non-loop. Amplification factor: {amplificationFactor.toFixed(1)}x.
        </figcaption>
      </figure>

      <figure className="bg-zinc-50 border border-zinc-100 rounded-lg p-5">
        <div ref={convRef} className="flex justify-center" />
        <figcaption className="text-xs text-zinc-400 mt-3 leading-relaxed">
          Representation change per loop pass. Pass 2 moves the representation{" "}
          {(convergence.mean_ratio * 100).toFixed(1)}% as far as pass 1 on average
          (contraction ratio = {convergence.mean_ratio.toFixed(3)}).
          Each subsequent pass contributes diminishing returns.
        </figcaption>
      </figure>
    </div>
  );
}
