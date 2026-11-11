"use client";

import { useState } from "react";

interface Sequence {
  idx: number;
  prompt: string;
  ground_truth: string;
  float32: string;
  quantized: string;
}

interface Props {
  sequences: Sequence[];
  promptTokens: number;
  temperature: number;
}

function TextBlock({ label, text, color }: { label: string; text: string; color?: string }) {
  return (
    <div>
      <div className="text-xs text-zinc-400 mb-1 uppercase tracking-wide">{label}</div>
      <div
        className="font-mono text-[13px] leading-relaxed rounded-lg bg-white p-3 border border-zinc-100 overflow-auto max-h-[300px]"
        style={{
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          borderLeftColor: color,
          borderLeftWidth: color ? 3 : undefined,
        }}
      >
        {text}
      </div>
    </div>
  );
}

export default function GenerationSamples({ sequences, promptTokens, temperature }: Props) {
  const [seqIdx, setSeqIdx] = useState(0);
  if (sequences.length === 0) return null;
  const seq = sequences[seqIdx];

  return (
    <div className="bg-zinc-50 border border-zinc-100 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[15px] font-semibold text-zinc-900 mb-1">
            Float32 vs Quantized Generation
          </h3>
          <p className="text-xs text-zinc-400">
            {promptTokens}-token prompt from validation data, temp={temperature}.
            Same prompt, same seed &mdash; differences come from quantization noise.
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

      <div className="mb-4">
        <div className="text-xs text-zinc-400 mb-1 uppercase tracking-wide">
          Prompt ({promptTokens} tokens)
        </div>
        <div
          className="font-mono text-[13px] leading-relaxed rounded-lg bg-white p-3 border border-zinc-100"
          style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
        >
          {seq.prompt}
        </div>
      </div>

      <div className="space-y-3">
        <TextBlock label="Ground truth" text={seq.ground_truth} color="#81b29a" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <TextBlock label="Float32 model" text={seq.float32} color="#3d405b" />
          <TextBlock label="Quantized (int6)" text={seq.quantized} color="#e07a5f" />
        </div>
      </div>
    </div>
  );
}
