"use client";

/**
 * CA Rule 90 at the training-edge length (L20). Per-bit error per condition,
 * visualized as 100 bit predictions where errors are highlighted in vermilion.
 *
 * The visceral story: at the boundary of where the trainable interface was
 * trained, the frozen text substrate makes essentially zero errors while
 * matched-capacity baselines are visibly speckled.
 *
 * Source: paper Table B.6 (n=2 means) and abstract (492× / 148× ratios).
 */
import { useMemo } from "react";

const ACCENT = "#B7361C";
const INK = "#11161D";
const INK_2 = "#3A4150";
const INK_3 = "#8A8E97";

const TOTAL_CELLS = 100;
const TICK_WIDTH = 3;     // tick width in viewBox units
const TICK_GAP = 2;       // gap between ticks
const TICK_HEIGHT = 26;   // viewBox tick height
const TICK_RADIUS = 1;    // rounded ends
const HALO_PAD = 2;       // halo extends beyond tick by this many viewBox units
const STRIP_VIEW_W = TOTAL_CELLS * (TICK_WIDTH + TICK_GAP) - TICK_GAP;
const STRIP_VIEW_H = TICK_HEIGHT + HALO_PAD * 2;

interface Row {
  id: string;
  label: string;
  sublabel: string;
  errorRate: number;     // per-bit error
  visibleErrors: number; // count to render in the 100-cell strip
  caption: string;
  ratioLabel: string;
}

const ROWS: Row[] = [
  {
    id: "frozen_gemma",
    label: "Frozen Gemma L24–29",
    sublabel: "6.1M trainable, 2.93B frozen text weights",
    errorRate: 0.0001,
    visibleErrors: 0,
    caption: "1 mistake per 10,000 bits",
    ratioLabel: "reference",
  },
  {
    id: "trained_transformer",
    label: "Trained Transformer",
    sublabel: "6.36M trainable, from scratch · matched-capacity",
    errorRate: 0.0217,
    visibleErrors: 2,
    caption: "≈ 2 per 100",
    ratioLabel: "148× higher error",
  },
  {
    id: "lstm_matched",
    label: "LSTM-matched",
    sublabel: "6.1M trainable, from scratch",
    errorRate: 0.0661,
    visibleErrors: 7,
    caption: "≈ 7 per 100",
    ratioLabel: "492× higher error",
  },
  {
    id: "random",
    label: "Random chance",
    sublabel: "no learning",
    errorRate: 0.5,
    visibleErrors: 50,
    caption: "1 in 2",
    ratioLabel: "pure noise",
  },
];

/* Deterministic error positions — distributed evenly with stable jitter so
 * the visual is consistent across renders and SSR. Linear-congruential PRNG
 * seeded by the row id hash. */
function lcg(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function hash(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function pickErrorIndices(rowId: string, count: number, total: number): Set<number> {
  if (count <= 0) return new Set();
  if (count >= total) return new Set(Array.from({ length: total }, (_, i) => i));
  const rnd = lcg(hash(rowId));
  const picked = new Set<number>();
  // Stratified placement: divide the strip into N buckets, jitter within each.
  const bucketSize = total / count;
  for (let i = 0; i < count; i++) {
    const start = Math.floor(i * bucketSize);
    const end = Math.floor((i + 1) * bucketSize) - 1;
    const idx = Math.max(start, Math.min(end, start + Math.floor(rnd() * (end - start + 1))));
    picked.add(idx);
  }
  return picked;
}

export default function CATrainingEdgeBand() {
  const rows = useMemo(
    () =>
      ROWS.map((r) => ({
        ...r,
        errorIndices: pickErrorIndices(r.id, r.visibleErrors, TOTAL_CELLS),
      })),
    []
  );

  return (
    <div className="bg-white border border-[--rule] p-5">
      {/* header */}
      <div className="flex items-baseline justify-between mb-1 pb-3 border-b border-[--rule]">
        <div className="t-eyebrow">
          training-edge length L20 · 100 bit predictions
        </div>
        <div className="t-data" style={{ color: INK_3 }}>
          ↓ fewer red marks is better
        </div>
      </div>

      {/* rows */}
      <div className="divide-y divide-[--rule]">
        {rows.map((r) => (
          <div
            key={r.id}
            className="grid grid-cols-1 md:grid-cols-[180px_1fr_120px] gap-x-5 gap-y-2 py-4 items-center"
          >
            {/* label */}
            <div>
              <div
                className="text-[13px] font-medium leading-tight"
                style={{ color: r.id === "random" ? INK_3 : INK }}
              >
                {r.label}
              </div>
              <div className="text-[11px] mt-0.5" style={{ color: INK_3 }}>
                {r.sublabel}
              </div>
            </div>

            {/* tile strip — SVG with preserveAspectRatio=none gives perfectly
                uniform ticks at any viewport, no browser rounding artifacts. */}
            <TickStrip errorIndices={r.errorIndices} ariaLabel={`${r.label}: ${r.visibleErrors} errors of ${TOTAL_CELLS} bits`} />

            {/* counts */}
            <div className="md:text-right">
              <div
                className="font-mono text-[13px] tabular-nums"
                style={{ color: r.id === "frozen_gemma" ? ACCENT : INK_2 }}
              >
                {r.caption}
              </div>
              <div className="text-[11px] italic mt-0.5" style={{ color: INK_3 }}>
                {r.ratioLabel}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 mt-1 border-t border-[--rule] text-[11px]" style={{ color: INK_3, fontStyle: "italic" }}>
        Each row: 100 sample bit predictions at length L20. Red ticks are bit-prediction errors,
        positioned deterministically. The Frozen Gemma row makes ≈ 1 mistake every 10,000 bits at this length —
        too rare to fall inside a 100-bit sample. Numbers are paper Table B.6 mean-of-ratios over n=2 seeds.
      </div>
    </div>
  );
}

/* SVG tick strip. preserveAspectRatio="none" lets the SVG stretch to fill
 * its container while keeping every tick perfectly uniform — no fractional
 * pixel widths, no browser rounding artifacts. */
function TickStrip({ errorIndices, ariaLabel }: { errorIndices: Set<number>; ariaLabel: string }) {
  return (
    <svg
      viewBox={`0 0 ${STRIP_VIEW_W} ${STRIP_VIEW_H}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={ariaLabel}
      style={{ display: "block", width: "100%", height: 30 }}
    >
      {/* Halos behind error ticks. Drawn first so ticks sit on top. */}
      {Array.from({ length: TOTAL_CELLS }).map((_, i) =>
        errorIndices.has(i) ? (
          <rect
            key={`halo-${i}`}
            x={i * (TICK_WIDTH + TICK_GAP) - HALO_PAD / 2}
            y={0}
            width={TICK_WIDTH + HALO_PAD}
            height={STRIP_VIEW_H}
            fill={ACCENT}
            opacity={0.18}
            rx={TICK_RADIUS + 1}
          />
        ) : null
      )}
      {/* The ticks themselves. */}
      {Array.from({ length: TOTAL_CELLS }).map((_, i) => {
        const isErr = errorIndices.has(i);
        return (
          <rect
            key={i}
            x={i * (TICK_WIDTH + TICK_GAP)}
            y={HALO_PAD}
            width={TICK_WIDTH}
            height={TICK_HEIGHT}
            fill={isErr ? ACCENT : INK_2}
            opacity={isErr ? 1 : 0.32}
            rx={TICK_RADIUS}
          />
        );
      })}
    </svg>
  );
}
