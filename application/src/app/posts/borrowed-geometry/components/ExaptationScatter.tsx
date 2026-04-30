"use client";

import * as Plot from "@observablehq/plot";
import { useMemo } from "react";
import { usePlotResize } from "./usePlotResize";

interface HeadEntry {
  layer: number;
  head: number;
  txt_copy: number | null;
  impact: { copy: number; ar: number; ca_r90: number; addition: number };
  max_impact: number;
  named: boolean;
}
interface NamedEntry {
  layer: number; head: number; label: string;
  txt_copy: number | null; ratio: number | null;
  top_task: string; top_impact: number;
}
interface HeadsPayload {
  baselines: Record<string, number>;
  heads: HeadEntry[];
  named: NamedEntry[];
}

const ACCENT = "#B7361C";
const INK = "#11161D";
const INK_3 = "#8A8E97";
const RULE = "#E5E5E2";

interface Props { data: HeadsPayload }

export default function ExaptationScatter({ data }: Props) {
  const baseline = data.baselines.copying ?? 0.143;

  const points = useMemo(() => {
    return data.heads
      .map((h) => ({
        layer: h.layer,
        head: h.head,
        ratio: h.txt_copy != null ? h.txt_copy / baseline : null,
        impact: h.max_impact,
        named: h.named,
        top: h.named && h.max_impact > 0.18,
      }))
      .filter((p) => p.ratio != null) as Array<{ layer: number; head: number; ratio: number; impact: number; named: boolean; top: boolean }>;
  }, [data, baseline]);

  const labels = useMemo(
    () => points.filter((p) => p.top).map((p) => ({
      ratio: p.ratio,
      impact: p.impact,
      label: `L${p.layer}.${p.head}`,
    })),
    [points]
  );

  const ref = usePlotResize((width) =>
    Plot.plot({
      width,
      height: Math.max(360, Math.min(460, width * 0.55)),
      marginLeft: 56,
      marginRight: 24,
      marginTop: 24,
      marginBottom: 48,
      style: {
        background: "transparent",
        fontFamily: "inherit",
        fontSize: "12px",
        overflow: "hidden",
      },
      x: {
        label: "text-copy probe ratio (× slice baseline)  →",
        domain: [-0.05, 4.2],
        grid: true,
        tickFormat: (d: number) => d < 0 ? "" : `${d}×`,
      },
      y: {
        label: "↑  zero-ablation Δ (max across 4 tasks)",
        domain: [0, 0.28],
        grid: true,
        tickFormat: (d: number) => d.toFixed(2),
      },
      marks: [
        Plot.frame({ stroke: RULE }),
        // Threshold line at 1.5× ratio (single-function classification cutoff).
        Plot.ruleX([1.5], { stroke: INK_3, strokeDasharray: "2,4", opacity: 0.6, clip: true }),
        Plot.text(
          [{ x: 1.5, y: 0.265, text: "single-function threshold" }],
          { x: "x", y: "y", text: "text", dx: 6, textAnchor: "start", fill: INK_3, fontStyle: "italic", fontSize: 11, clip: true }
        ),
        // Unnamed heads: small dim dots.
        Plot.dot(points.filter((p) => !p.named), {
          x: "ratio",
          y: "impact",
          r: 2.4,
          fill: INK_3,
          fillOpacity: 0.35,
          clip: true,
        }),
        // Named (non-top) heads: ink dots.
        Plot.dot(points.filter((p) => p.named && !p.top), {
          x: "ratio",
          y: "impact",
          r: 4.5,
          fill: INK,
          fillOpacity: 0.85,
          stroke: "white",
          strokeWidth: 1.2,
          clip: true,
        }),
        // Top-impact named heads: vermilion + halo.
        Plot.dot(points.filter((p) => p.top), {
          x: "ratio",
          y: "impact",
          r: 14,
          fill: ACCENT,
          fillOpacity: 0.12,
          clip: true,
        }),
        Plot.dot(points.filter((p) => p.top), {
          x: "ratio",
          y: "impact",
          r: 7,
          fill: ACCENT,
          stroke: "white",
          strokeWidth: 1.5,
          clip: true,
        }),
        // Labels for top-impact heads.
        Plot.text(labels, {
          x: "ratio",
          y: "impact",
          text: "label",
          dy: -14,
          dx: 12,
          textAnchor: "start",
          fill: INK,
          fontWeight: 500,
          fontSize: 11,
          fontFamily: "var(--font-mono, ui-monospace, monospace)",
          clip: true,
        }),
        // Hover tooltip per head.
        Plot.tip(
          points,
          Plot.pointer({
            x: "ratio",
            y: "impact",
            title: (d: { layer: number; head: number; ratio: number; impact: number }) =>
              `L${d.layer}.${d.head}\nTxtCopy ratio: ${d.ratio.toFixed(2)}×\nablation Δ: ${d.impact.toFixed(3)}`,
          })
        ),
      ],
    })
  , [points, labels]);

  return (
    <div className="bg-white border border-[--rule] p-4">
      <div ref={ref} />
    </div>
  );
}
