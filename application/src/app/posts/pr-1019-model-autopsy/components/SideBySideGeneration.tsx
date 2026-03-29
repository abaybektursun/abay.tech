"use client";

import { useState, useMemo } from "react";

interface GenToken {
  t: string;
  id: number;
}

interface Generation {
  prompt: GenToken[];
  real: GenToken[];
  model: GenToken[];
}

interface Sequence {
  idx: number;
  gen: Generation;
}

interface Props {
  sequences: Sequence[];
  promptLen: number;
  genLen: number;
  temperature: number;
}

export default function SideBySideGeneration({
  sequences,
  promptLen,
  genLen,
  temperature,
}: Props) {
  const [seqIdx, setSeqIdx] = useState(0);
  if (sequences.length === 0) return null;
  const gen = sequences[seqIdx].gen;

  const stats = useMemo(() => {
    let posMatch = 0;
    const realIds = new Set(gen.real.map((t) => t.id));
    const modelIds = new Set(gen.model.map((t) => t.id));
    for (let i = 0; i < gen.real.length; i++) {
      if (gen.real[i].id === gen.model[i].id) posMatch++;
    }
    const unigramOverlap = [...realIds].filter((id) => modelIds.has(id)).length;
    return {
      posMatch,
      posMatchPct: ((posMatch / genLen) * 100).toFixed(1),
      unigramOverlap,
      unigramPct: ((unigramOverlap / realIds.size) * 100).toFixed(0),
    };
  }, [gen, genLen]);

  return (
    <div className="bg-zinc-50 border border-zinc-100 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[15px] font-semibold text-zinc-900 mb-1">Side-by-Side Generation</h3>
          <p className="text-xs text-zinc-400">
            {promptLen}-token prompt, {genLen}-token continuation (temp={temperature},
            seed=42). Highlighted = token matches at same position.
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

      <div className="flex gap-6 mb-4 text-xs text-zinc-400 font-mono">
        <span>
          Position matches: {stats.posMatch}/{genLen} ({stats.posMatchPct}%)
        </span>
        <span>
          Unique token overlap: {stats.unigramOverlap} ({stats.unigramPct}% of real)
        </span>
      </div>

      <div className="mb-4">
        <div className="text-xs text-zinc-400 mb-1 uppercase tracking-wide">
          Prompt ({promptLen} tokens)
        </div>
        <div
          className="font-mono text-[13px] leading-relaxed rounded-lg bg-white p-3 border border-zinc-100"
          style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
        >
          {gen.prompt.map((tok, i) => (
            <span key={i}>{tok.t}</span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-zinc-400 mb-1 uppercase tracking-wide">
            Real continuation
          </div>
          <div
            className="font-mono text-[13px] leading-relaxed rounded-lg bg-white p-3 border border-zinc-100 overflow-auto max-h-[400px]"
            style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
          >
            {gen.real.map((tok, i) => {
              const match = gen.model[i]?.id === tok.id;
              return (
                <span
                  key={i}
                  className={match ? "bg-zinc-800/15 rounded" : ""}
                  title={`Position ${i}: "${tok.t.trim()}" (id ${tok.id})`}
                >
                  {tok.t}
                </span>
              );
            })}
          </div>
        </div>
        <div>
          <div className="text-xs text-zinc-400 mb-1 uppercase tracking-wide">
            Model generation
          </div>
          <div
            className="font-mono text-[13px] leading-relaxed rounded-lg bg-white p-3 border border-zinc-100 overflow-auto max-h-[400px]"
            style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
          >
            {gen.model.map((tok, i) => {
              const match = gen.real[i]?.id === tok.id;
              return (
                <span
                  key={i}
                  className={match ? "bg-zinc-800/15 rounded" : ""}
                  title={`Position ${i}: "${tok.t.trim()}" (id ${tok.id})`}
                >
                  {tok.t}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
