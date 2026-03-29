"use client";

import { useState } from "react";

interface Token {
  t: string;
  id: number;
  l?: number;
  top5?: { t: string; id: number; p: number }[];
}

interface Sequence {
  idx: number;
  tokens: Token[];
}

interface Props {
  sequences: Sequence[];
  lossThreshold: number;
}

function tokenColor(loss: number, threshold: number): string {
  const ratio = Math.min(loss / (threshold * 1.3), 1);
  const saturation = 12 + 53 * ratio;
  const lightness = 95 - 33 * ratio;
  const alpha = 0.12 + 0.63 * ratio;
  return `hsla(16, ${saturation}%, ${lightness}%, ${alpha})`;
}

export default function LossHeatmap({ sequences, lossThreshold }: Props) {
  const [seqIdx, setSeqIdx] = useState(0);
  if (sequences.length === 0) return null;
  const seq = sequences[seqIdx];

  return (
    <div className="bg-zinc-50 border border-zinc-100 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[15px] font-semibold text-zinc-900 mb-1">Loss Heatmap</h3>
          <p className="text-xs text-zinc-400">
            Light = predicted well, dark = surprised. Hover for loss values.
          </p>
        </div>
        <select
          value={seqIdx}
          onChange={(e) => setSeqIdx(Number(e.target.value))}
          className="bg-white border border-zinc-200 rounded px-2.5 py-1 text-xs text-zinc-600"
        >
          {sequences.map((_, i) => (
            <option key={i} value={i}>
              Sequence {i}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3 mb-4 text-xs text-zinc-400">
        <span>Low loss</span>
        <div
          className="h-2.5 w-24 rounded"
          style={{
            background: "linear-gradient(to right, hsla(16,12%,95%,0.12), hsla(16,38%,78%,0.45), hsla(16,65%,62%,0.75))",
          }}
        />
        <span>High loss</span>
      </div>

      <div
        className="font-mono text-[13px] leading-relaxed overflow-auto max-h-[600px] rounded-lg bg-white p-4 border border-zinc-100"
        style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
      >
        {seq.tokens.map((tok, i) => {
          const loss = tok.l;
          const bg = loss !== undefined ? tokenColor(loss, lossThreshold) : "transparent";
          const title =
            loss !== undefined
              ? `"${tok.t.trim()}" (id ${tok.id})\n${loss.toFixed(3)} nats / ${(loss / Math.LN2).toFixed(3)} bits\nP(correct) = ${(Math.exp(-loss) * 100).toFixed(2)}%`
              : `"${tok.t.trim()}" (id ${tok.id}) — first token, no loss`;
          return (
            <span
              key={i}
              title={title}
              style={{
                backgroundColor: bg,
                borderRadius: "2px",
                textDecoration: tok.top5 ? "underline" : "none",
                textDecorationStyle: tok.top5 ? ("dotted" as const) : undefined,
                textDecorationColor: tok.top5 ? "#c2553a" : undefined,
                textUnderlineOffset: "3px",
              }}
            >
              {tok.t}
            </span>
          );
        })}
      </div>
    </div>
  );
}
