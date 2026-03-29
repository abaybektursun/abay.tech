"use client";

import * as Plot from "@observablehq/plot";
import { usePlot } from "./usePlot";

interface ProbePoint {
  label: string;
  layer_idx: number;
  loss_nats: number;
  bits_per_token: number;
  top1_accuracy: number;
  delta_bits_per_token: number | null;
  is_encoder: boolean;
  is_decoder: boolean;
}

interface Props {
  probePoints: ProbePoint[];
  numEncoderLayers: number;
}

export default function LogitLensChart({ probePoints, numEncoderLayers }: Props) {
  const data = probePoints.map((p, i) => ({ ...p, index: i }));
  const encoderEnd = numEncoderLayers;

  const yMax = Math.ceil(Math.max(...data.map((d) => d.loss_nats)) * 1.05);

  const containerRef = usePlot(
    (width) =>
      Plot.plot({
        width,
        height: 420,
        style: { background: "transparent", color: "#71717a", fontSize: "12px" },
        marginLeft: 56,
        marginRight: 56,
        marginBottom: 50,
        x: {
          label: null,
          tickFormat: (_: unknown, i: number) => data[i]?.label ?? "",
          tickRotate: -35,
        },
        y: {
          label: "Loss (nats)",
          grid: true,
          domain: [0, yMax],
        },
        marks: [
          Plot.rectY(
            [{ x1: -0.5, x2: encoderEnd + 0.5, y1: 0, y2: yMax }],
            {
              x1: "x1",
              x2: "x2",
              y1: "y1",
              y2: "y2",
              fill: "#27272a",
              fillOpacity: 0.03,
            }
          ),
          Plot.rectY(
            [{ x1: encoderEnd + 0.5, x2: data.length - 0.5, y1: 0, y2: yMax }],
            {
              x1: "x1",
              x2: "x2",
              y1: "y1",
              y2: "y2",
              fill: "#991b1b",
              fillOpacity: 0.03,
            }
          ),
          Plot.lineY(data, {
            x: "index",
            y: "loss_nats",
            stroke: "#27272a",
            strokeWidth: 2,
            curve: "catmull-rom",
          }),
          Plot.dot(data, {
            x: "index",
            y: "loss_nats",
            fill: (d: typeof data[number]) => (d.delta_bits_per_token !== null && d.delta_bits_per_token > 0 ? "#991b1b" : "#27272a"),
            r: 5,
            stroke: "#f4f4f5",
            strokeWidth: 2,
            tip: true,
            title: (d: typeof data[number]) =>
              `${d.label}\nLoss: ${d.loss_nats.toFixed(2)} nats\nAccuracy: ${(d.top1_accuracy * 100).toFixed(1)}%${
                d.delta_bits_per_token !== null
                  ? `\nΔ bits/tok: ${d.delta_bits_per_token > 0 ? "+" : ""}${d.delta_bits_per_token.toFixed(2)}`
                  : ""
              }`,
          }),
          Plot.lineY(data, {
            x: "index",
            y: (d: typeof data[number]) => d.top1_accuracy * yMax,
            stroke: "#a1a1aa",
            strokeWidth: 1,
            strokeDasharray: "6,3",
            curve: "catmull-rom",
          }),
          Plot.text(["Encoder"], {
            frameAnchor: "top-left",
            dx: 8,
            dy: 8,
            fill: "#a1a1aa",
            fontSize: 11,
            fontWeight: "500",
          }),
          Plot.text(["Decoder"], {
            frameAnchor: "top-right",
            dx: -8,
            dy: 8,
            fill: "#a1a1aa",
            fontSize: 11,
            fontWeight: "500",
          }),
        ],
      }),
    [data, encoderEnd, yMax]
  );

  return (
    <figure className="bg-zinc-50 border border-zinc-100 rounded-lg p-5">
      <div className="flex items-center gap-5 mb-4 text-xs text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-0.5 bg-zinc-800" />
          Loss (nats)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-0.5 bg-zinc-400 border-t border-dashed border-zinc-400" />
          Top-1 accuracy (scaled)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-red-800" />
          Readability dropped
        </span>
      </div>
      <div ref={containerRef} />
    </figure>
  );
}
