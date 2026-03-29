"use client";

import { useState, useMemo } from "react";

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
}

export default function TopKPredictions({ sequences }: Props) {
  const [seqIdx, setSeqIdx] = useState(0);
  if (sequences.length === 0) return null;
  const seq = sequences[seqIdx];

  const highLoss = useMemo(() => {
    const items: { pos: number; tok: Token }[] = [];
    for (let i = 0; i < seq.tokens.length; i++) {
      if (seq.tokens[i].top5) {
        items.push({ pos: i, tok: seq.tokens[i] });
      }
    }
    items.sort((a, b) => (b.tok.l ?? 0) - (a.tok.l ?? 0));
    return items;
  }, [seq]);

  return (
    <div className="bg-zinc-50 border border-zinc-100 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[15px] font-semibold text-zinc-900 mb-1">Top-k Predictions at High-Loss Tokens</h3>
          <p className="text-xs text-zinc-400">
            {highLoss.length} tokens above the 90th-percentile loss threshold.
            Sorted by loss (highest first).
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

      <div className="space-y-3 overflow-auto max-h-[700px]">
        {highLoss.map(({ pos, tok }) => {
          const loss = tok.l!;
          const actualProb = Math.exp(-loss);
          const contextStart = Math.max(0, pos - 5);
          const contextEnd = Math.min(seq.tokens.length, pos + 6);
          const contextTokens = seq.tokens.slice(contextStart, contextEnd);
          const highlightIdx = pos - contextStart;

          const actualInTop5 = tok.top5!.findIndex((p) => p.id === tok.id);

          return (
            <div
              key={pos}
              className="rounded-lg border border-zinc-100 bg-white p-4"
            >
              <div className="font-mono text-sm mb-3" style={{ whiteSpace: "pre-wrap" }}>
                <span className="text-zinc-400">...</span>
                {contextTokens.map((ct, ci) => (
                  <span
                    key={ci}
                    className={ci === highlightIdx ? "bg-zinc-800/15 rounded px-0.5" : ""}
                  >
                    {ct.t}
                  </span>
                ))}
                <span className="text-zinc-400">...</span>
              </div>

              <div className="flex items-center gap-4 mb-2 text-xs text-zinc-400">
                <span>
                  Position {pos} &middot; Loss: {loss.toFixed(3)} nats (
                  {(loss / Math.LN2).toFixed(3)} bits) &middot; P(correct):{" "}
                  {(actualProb * 100).toFixed(2)}%
                </span>
              </div>

              <div className="grid grid-cols-[auto_1fr_auto_auto] gap-x-4 gap-y-1 text-sm font-mono">
                <span className="text-zinc-400 text-xs">Rank</span>
                <span className="text-zinc-400 text-xs">Predicted</span>
                <span className="text-zinc-400 text-xs">Prob</span>
                <span className="text-zinc-400 text-xs">Bar</span>
                {tok.top5!.map((pred, rank) => {
                  const isActual = pred.id === tok.id;
                  return (
                    <div key={rank} className="contents">
                      <span className="text-zinc-400">{rank + 1}.</span>
                      <span className={isActual ? "text-zinc-900 font-semibold" : "text-zinc-600"}>
                        &quot;{pred.t}&quot;
                        {isActual && " \u2190 actual"}
                      </span>
                      <span className="text-right text-zinc-600">{(pred.p * 100).toFixed(1)}%</span>
                      <div className="flex items-center">
                        <div
                          className={`h-2 rounded ${isActual ? "bg-zinc-800" : "bg-zinc-300"}`}
                          style={{ width: `${Math.max(2, pred.p * 200)}px` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {actualInTop5 === -1 && (
                <div className="mt-2 text-xs font-semibold text-zinc-700">
                  Actual: &quot;{tok.t}&quot; (rank {">"}5, prob {(actualProb * 100).toFixed(2)}%)
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
