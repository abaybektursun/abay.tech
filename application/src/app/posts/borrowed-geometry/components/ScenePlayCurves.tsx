"use client";

import * as Plot from "@observablehq/plot";
import { useMemo } from "react";
import { usePlotResize } from "./usePlotResize";

interface Curve {
  seed: number;
  curve: { iter: number; success: number }[];
}
interface Condition {
  id: string;
  label: string;
  seeds: Curve[];
}
interface Payload {
  conditions: Condition[];
}

const ACCENT = "#2D4A6F";       // editorial blue — pretrained Gemma (the win)
const FAIL = "#C8392E";         // editorial red — random-init baseline
const INK_3 = "#8A8E97";
const RULE = "#E5E5E2";

const COLORS: Record<string, string> = {
  L24: ACCENT,
  NC1: FAIL,
};

const ORDER: Record<string, number> = { L24: 0, NC1: 1 };

const GCIQL_REF = 93.0;

interface Props { data: Payload }

export default function ScenePlayCurves({ data }: Props) {
  // Log y axis can't take 0. Floor success rate at 0.5% — early-training
  // zeros become a flat low band rather than vanishing.
  const Y_FLOOR = 0.5;
  const clamp = (v: number) => Math.max(v, Y_FLOOR);

  const flat = useMemo(() => {
    const rows: { iter: number; success: number; cond: string; series: string; seed: number }[] = [];
    for (const c of data.conditions) {
      for (const s of c.seeds) {
        for (const pt of s.curve) {
          rows.push({
            iter: pt.iter,
            success: clamp(pt.success),
            cond: c.id,
            series: `${c.id}-${s.seed}`,
            seed: s.seed,
          });
        }
      }
    }
    return rows;
  }, [data]);

  const means = useMemo(() => {
    const out: { iter: number; mean: number; cond: string }[] = [];
    for (const c of data.conditions) {
      const byIter = new Map<number, number[]>();
      for (const s of c.seeds) {
        for (const pt of s.curve) {
          if (!byIter.has(pt.iter)) byIter.set(pt.iter, []);
          byIter.get(pt.iter)!.push(pt.success);
        }
      }
      const sorted = Array.from(byIter.entries()).sort((a, b) => a[0] - b[0]);
      for (const [iter, vals] of sorted) {
        const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
        out.push({ iter, mean: clamp(mean), cond: c.id });
      }
    }
    return out;
  }, [data]);

  const finalLabels = useMemo(() => {
    const last: { iter: number; mean: number; cond: string; label: string }[] = [];
    for (const c of data.conditions) {
      const cmeans = means.filter((m) => m.cond === c.id);
      if (!cmeans.length) continue;
      const final = cmeans[cmeans.length - 1];
      last.push({ ...final, label: `${c.label}  ${final.mean.toFixed(1)}%` });
    }
    return last.sort((a, b) => ORDER[a.cond] - ORDER[b.cond]);
  }, [data, means]);

  // Mid-curve inline labels — placed at ~70% of training so they're well
  // separated from end-of-line labels and from each other vertically (log y
  // amplifies the gap between pretrained ~97% and random ~87%).
  const inlineLabels = useMemo(() => {
    const out: { iter: number; mean: number; cond: string; label: string }[] = [];
    for (const c of data.conditions) {
      const cmeans = means.filter((m) => m.cond === c.id);
      if (cmeans.length < 3) continue;
      const idx = Math.floor(cmeans.length * 0.55);
      const pt = cmeans[idx];
      out.push({ ...pt, label: c.label });
    }
    return out;
  }, [data, means]);

  const ref = usePlotResize((width) =>
    Plot.plot({
      width,
      height: Math.max(340, Math.min(440, width * 0.5)),
      marginLeft: 64,
      marginRight: 16,
      marginTop: 28,
      marginBottom: 50,
      style: { background: "transparent", fontFamily: "inherit", fontSize: "12px" },
      color: { domain: Object.keys(COLORS), range: Object.values(COLORS) },
      x: {
        label: "training iteration  →",
        tickFormat: (d: number) => d >= 1000 ? `${(d / 1000).toFixed(0)}k` : `${d}`,
        grid: true,
      },
      y: {
        // Log scale of FAILURE rate (100 - success), reversed so high success
        // sits at the top. Compresses the low-success range, expands the
        // high-success range — gap between 97.3% and 86.9% (failure 2.7 vs
        // 13.1, ~5× apart) becomes visible instead of flat.
        type: "log",
        reverse: true,
        label: "↑  success rate · top stretched to show 95–100% detail",
        domain: [0.5, 100],
        grid: false, // we draw gridlines manually so we can layer minor ones
        ticks: [0.5, 1, 2, 5, 10, 20, 50, 100],
        tickFormat: (d: number) => `${(100 - d).toFixed(d < 1 ? 1 : 0)}%`,
      },
      marks: [
        Plot.frame({ stroke: RULE }),
        // Minor gridlines at LINEAR-spaced success values 10/20/30/40/60/70%.
        // On the log-of-failure axis, these failure values (90, 80, 70, 60,
        // 40, 30) cluster visually at the BOTTOM of the chart — the squashed
        // zone. Density of lines mirrors density of data: many lines packed
        // in 0–80% (compressed), few lines in 80–100% (stretched).
        Plot.gridY([30, 40, 60, 70, 80, 90], {
          stroke: RULE, strokeOpacity: 0.55,
        }),
        // Major gridlines — bolder, log-spaced ticks that match axis labels.
        Plot.gridY([0.5, 1, 2, 5, 10, 20, 50, 100], {
          stroke: RULE, strokeOpacity: 1,
        }),
        // Published GCIQL reference at 93% (failure 7).
        Plot.ruleY([7], { stroke: INK_3, strokeDasharray: "4,3", opacity: 0.65 }),
        Plot.text([{ iter: 0, fail: 7, text: `published GCIQL · ${GCIQL_REF.toFixed(0)}%` }], {
          x: "iter", y: "fail", text: "text",
          dx: 6, dy: -6, textAnchor: "start", fill: INK_3, fontStyle: "italic", fontSize: 11,
        }),
        // Per-seed trajectories: faint.
        Plot.line(flat, {
          x: "iter",
          y: (d: { success: number }) => Math.max(100 - d.success, 0.5),
          stroke: "cond",
          z: "series",
          strokeOpacity: 0.25,
          strokeWidth: 1,
        }),
        // Mean line per condition: bold.
        Plot.line(means, {
          x: "iter",
          y: (d: { mean: number }) => Math.max(100 - d.mean, 0.5),
          stroke: "cond",
          strokeWidth: 2.4,
          curve: "monotone-x",
        }),
        // Inline mid-curve labels naming each condition.
        Plot.text(inlineLabels, {
          x: "iter",
          y: (d: { mean: number }) => Math.max(100 - d.mean, 0.5),
          text: "label",
          dy: -10,
          textAnchor: "middle",
          fill: "cond",
          fontWeight: 600,
          fontSize: 12,
          stroke: "white",
          strokeWidth: 4,
          paintOrder: "stroke",
        }),
        // End-point dots + numeric value labels.
        Plot.dot(finalLabels, {
          x: "iter",
          y: (d: { mean: number }) => Math.max(100 - d.mean, 0.5),
          fill: "cond",
          r: 4,
          stroke: "white",
          strokeWidth: 1.5,
        }),
        Plot.text(finalLabels, {
          x: "iter",
          y: (d: { mean: number }) => Math.max(100 - d.mean, 0.5),
          text: (d: { mean: number }) => `${d.mean.toFixed(1)}%`,
          dx: 8,
          textAnchor: "start",
          fill: "cond",
          fontWeight: 600,
          fontSize: 12,
          fontFamily: "var(--font-mono, ui-monospace, monospace)",
        }),
      ],
    })
  , [flat, means, finalLabels]);

  return (
    <div className="bg-white border border-[--rule] p-4">
      <div ref={ref} />
      {/* Plain-English scale key — shows what's actually being compressed. */}
      <div className="mt-3 px-1 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-x-3 gap-y-1 items-baseline">
        <span className="t-eyebrow" style={{ color: INK_3 }}>y-axis scale</span>
        <span className="text-[12px]" style={{ color: INK_3, lineHeight: 1.55 }}>
          Each gridline marks where the <em>failure rate</em> (100 − success) shrinks by a multiplicative step.
          That means <strong>0% → 50%</strong> takes the same vertical space as <strong>98% → 99%</strong> —
          both halve the failure rate. The chart is stretched at the top so the difference between
          97.3% and 86.9% (failure 2.7 vs 13.1, a 5× gap) is readable, not squashed.
        </span>
      </div>
    </div>
  );
}
