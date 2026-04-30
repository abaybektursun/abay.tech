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

const ACCENT = "#B7361C";
const INK = "#11161D";
const INK_3 = "#8A8E97";
const RULE = "#E5E5E2";

const COLORS: Record<string, string> = {
  L26: ACCENT,
  L24: INK,
  NC1: INK_3,
};

const ORDER: Record<string, number> = { L26: 0, L24: 1, NC1: 2 };

interface Props { data: Payload }

export default function CubeIsolationCurves({ data }: Props) {
  const flat = useMemo(() => {
    const rows: { iter: number; success: number; cond: string; series: string; seed: number }[] = [];
    for (const c of data.conditions) {
      for (const s of c.seeds) {
        for (const pt of s.curve) {
          rows.push({
            iter: pt.iter,
            success: pt.success,
            cond: c.id,
            series: `${c.id}-${s.seed}`,
            seed: s.seed,
          });
        }
      }
    }
    return rows;
  }, [data]);

  // Per-iter mean across seeds within each condition.
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
        out.push({ iter, mean, cond: c.id });
      }
    }
    return out;
  }, [data]);

  // Last-iter mean for each condition (annotations).
  const finalLabels = useMemo(() => {
    const last: { iter: number; mean: number; cond: string; label: string }[] = [];
    for (const c of data.conditions) {
      const cmeans = means.filter((m) => m.cond === c.id);
      if (!cmeans.length) continue;
      const final = cmeans[cmeans.length - 1];
      last.push({ ...final, label: `${c.label}: ${final.mean.toFixed(0)}%` });
    }
    return last.sort((a, b) => ORDER[a.cond] - ORDER[b.cond]);
  }, [data, means]);

  const ref = usePlotResize((width) =>
    Plot.plot({
      width,
      height: Math.max(340, Math.min(440, width * 0.5)),
      marginLeft: 52,
      marginRight: 16,
      marginTop: 24,
      marginBottom: 50,
      style: { background: "transparent", fontFamily: "inherit", fontSize: "12px" },
      color: { domain: Object.keys(COLORS), range: Object.values(COLORS) },
      x: {
        label: "training iteration  →",
        tickFormat: (d: number) => d >= 1000 ? `${(d / 1000).toFixed(0)}k` : `${d}`,
        grid: true,
      },
      y: {
        label: "↑  success rate (%)",
        domain: [0, 100],
        grid: true,
      },
      marks: [
        Plot.frame({ stroke: RULE }),
        // GCIQL reference at 74%.
        Plot.ruleY([74], { stroke: INK_3, strokeDasharray: "4,3", opacity: 0.7 }),
        Plot.text([{ iter: 0, success: 74, text: "published GCIQL · 74%" }], {
          x: "iter", y: "success", text: "text",
          dx: 6, dy: -6, textAnchor: "start", fill: INK_3, fontStyle: "italic", fontSize: 11,
        }),
        // Per-seed trajectories: faint.
        Plot.line(flat, {
          x: "iter",
          y: "success",
          stroke: "cond",
          z: "series",
          strokeOpacity: 0.25,
          strokeWidth: 1,
        }),
        // Mean line per condition: bold.
        Plot.line(means, {
          x: "iter",
          y: "mean",
          stroke: "cond",
          strokeWidth: 2.4,
          curve: "monotone-x",
        }),
        // End-point dots + labels.
        Plot.dot(finalLabels, {
          x: "iter",
          y: "mean",
          fill: "cond",
          r: 4,
          stroke: "white",
          strokeWidth: 1.5,
        }),
        Plot.text(finalLabels, {
          x: "iter",
          y: "mean",
          text: "label",
          dx: 8,
          textAnchor: "start",
          fill: "cond",
          fontWeight: 500,
          fontSize: 12,
        }),
      ],
    })
  , [flat, means, finalLabels]);

  return (
    <div className="bg-white border border-[--rule] p-4">
      <div ref={ref} />
    </div>
  );
}
