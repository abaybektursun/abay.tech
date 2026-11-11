"use client";

import * as Plot from "@observablehq/plot";
import { usePlot } from "../../pr-1019-model-autopsy/components/usePlot";

interface SkipEntry {
  skip_idx: number;
  encoder_source: string;
  decoder_target_block: number;
  gate_mean_sigmoid: number;
  gate_std_sigmoid: number;
  weight_norm: number;
}

interface Props {
  skips: SkipEntry[];
}

export default function SkipGateChart({ skips }: Props) {
  const data = skips.map((s) => ({
    ...s,
    label: `${s.encoder_source.replace("_enc", " p").replace("blk", "B")} \u2192 dec B${s.decoder_target_block}`,
    enc_pct: (1 - s.gate_mean_sigmoid) * 100,
  }));

  const gateRef = usePlot(
    (width) =>
      Plot.plot({
        width: Math.min(width, 700),
        height: 340,
        style: { background: "transparent", color: "#71717a", fontSize: "12px" },
        marginLeft: 140,
        marginBottom: 40,
        x: {
          label: "Gate value (sigmoid)",
          domain: [0.4, 0.85],
          grid: true,
        },
        y: {
          label: null,
          domain: data.map((d) => d.label),
        },
        marks: [
          Plot.dot(data, {
            y: "label",
            x: "gate_mean_sigmoid",
            r: 5,
            fill: "#3d405b",
            tip: true,
            title: (d: (typeof data)[number]) =>
              `Skip ${d.skip_idx}: ${d.encoder_source} \u2192 dec blk${d.decoder_target_block}\nGate: ${d.gate_mean_sigmoid.toFixed(3)} \u00b1 ${d.gate_std_sigmoid.toFixed(3)}\nBlend: ${d.enc_pct.toFixed(0)}% encoder / ${(100 - d.enc_pct).toFixed(0)}% decoder\nWeight norm: ${d.weight_norm.toFixed(1)}`,
          }),
          // Error bars (std)
          Plot.link(data, {
            y1: "label",
            y2: "label",
            x1: (d: (typeof data)[number]) => d.gate_mean_sigmoid - d.gate_std_sigmoid,
            x2: (d: (typeof data)[number]) => d.gate_mean_sigmoid + d.gate_std_sigmoid,
            stroke: "#3d405b",
            strokeWidth: 1.5,
            strokeOpacity: 0.5,
          }),
          // Reference line at 0.5 (equal blend)
          Plot.ruleX([0.5], { stroke: "#d4d4d8", strokeDasharray: "4,3" }),
          // Label
          Plot.text(
            [{ x: 0.5, y: data[0].label }],
            {
              x: "x",
              y: "y",
              text: () => "50/50",
              dy: -12,
              fill: "#a1a1aa",
              fontSize: 9,
            }
          ),
        ],
      }),
    [data]
  );

  const normRef = usePlot(
    (width) =>
      Plot.plot({
        width: Math.min(width, 700),
        height: 340,
        style: { background: "transparent", color: "#71717a", fontSize: "12px" },
        marginLeft: 140,
        marginBottom: 40,
        x: {
          label: "Weight norm",
          grid: true,
        },
        y: {
          label: null,
          domain: data.map((d) => d.label),
        },
        marks: [
          Plot.barX(data, {
            y: "label",
            x: "weight_norm",
            fill: (d: (typeof data)[number]) =>
              d.weight_norm > 15 ? "#e07a5f" : "#3d405b",
            rx: 3,
            tip: true,
            title: (d: (typeof data)[number]) =>
              `Skip ${d.skip_idx}: ${d.encoder_source} \u2192 dec blk${d.decoder_target_block}\nWeight norm: ${d.weight_norm.toFixed(2)}`,
          }),
          Plot.text(data, {
            y: "label",
            x: "weight_norm",
            text: (d: (typeof data)[number]) => d.weight_norm.toFixed(1),
            dx: 4,
            textAnchor: "start",
            fill: "#27272a",
            fontSize: 10,
            fontWeight: "600",
          }),
        ],
      }),
    [data]
  );

  return (
    <div className="space-y-6">
      <figure className="bg-zinc-50 border border-zinc-100 rounded-lg p-5">
        <div ref={gateRef} className="flex justify-center" />
        <figcaption className="text-xs text-zinc-400 mt-3 leading-relaxed">
          Sigmoid gate values per skip connection. Gate = 0 means encoder dominates;
          gate = 1 means decoder dominates. All gates cluster around 0.61&ndash;0.70
          (~35% encoder / 65% decoder blend). Error bars show per-dimension std.
        </figcaption>
      </figure>

      <figure className="bg-zinc-50 border border-zinc-100 rounded-lg p-5">
        <div ref={normRef} className="flex justify-center" />
        <figcaption className="text-xs text-zinc-400 mt-3 leading-relaxed">
          Weight norms of skip projection matrices.{" "}
          <span className="inline-block w-2 h-2 rounded-sm bg-[#e07a5f] mr-1 align-middle" />
          High-norm skips (first loop pass){" "}
          <span className="inline-block w-2 h-2 rounded-sm bg-[#3d405b] mr-1 align-middle" />
          Others. Skips 2&ndash;3 (first encoder loop pass) have 3&ndash;8x
          higher norms than late-layer skips &mdash; the first pass is the most
          important information source for the decoder.
        </figcaption>
      </figure>
    </div>
  );
}
