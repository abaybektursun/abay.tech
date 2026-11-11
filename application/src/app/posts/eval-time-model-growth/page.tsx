'use client'

import React from 'react'
import Comments from '@/components/comments'
import { PostEyebrowWithProvenance } from '@/components/ui/ai-provenance'
import { Group } from '@visx/group'
import { scaleBand, scaleLinear, scaleLog } from '@visx/scale'
import { Bar, Line, Circle } from '@visx/shape'
import { AxisBottom, AxisLeft } from '@visx/axis'
import { GridRows, GridColumns } from '@visx/grid'
import { ParentSize } from '@visx/responsive'

// ─── Design tokens ───────────────────────────────────────────────────
const CHART_FONT = 'Inter, system-ui, -apple-system, sans-serif'
const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace'

const PAL = {
  data: '#27272a',       // zinc-800
  muted: '#71717a',      // zinc-500
  grid: '#f4f4f5',       // zinc-100
  border: '#e4e4e7',     // zinc-200
  accent: '#991b1b',     // red-800 — sparingly
  blue: '#1e40af',       // blue-800 — for approved / recommended
  amber: '#92400e',      // amber-800 — for under review
} as const

const tickLabel = { fontSize: 11, fill: PAL.muted, fontFamily: CHART_FONT, fontWeight: 400 as const }
const axisLabelStyle = { fontSize: 11, fill: PAL.muted, fontFamily: CHART_FONT, fontWeight: 500 as const }

// ─── Data ────────────────────────────────────────────────────────────

const RESULTS_1GPU = [
  { config: 'Base LM (int6 quantized)',      bpb: 1.1142, state:    0, effective:  16, note: 'leaderboard' },
  { config: 'Base LM (float, pre-quant)',    bpb: 1.1109, state:    0, effective:  16, note: '' },
  { config: 'N-gram only (no neural)',       bpb: 1.0615, state:  192, effective: 192, note: '' },
  { config: 'Fixed 7-gram, α=0.40',         bpb: 0.5234, state:  192, effective: 208, note: '' },
  { config: 'Backoff 2-7, α=0.40',          bpb: 0.4923, state:  192, effective: 208, note: '' },
  { config: 'Backoff 2-7, entropy-adpt',     bpb: 0.6535, state:  192, effective: 208, note: '' },
  { config: 'Backoff 2-9, order-adpt',      bpb: 0.3779, state:  256, effective: 272, note: '' },
]

const RESULTS_8GPU = [
  { config: 'Base LM (8-GPU, int6)',       bpb: 1.1130, time: 110 },
  { config: 'Backoff 2-7, α=0.40',        bpb: 0.4941, time: 401 },
  { config: 'Backoff 2-9, α=0.40',        bpb: 0.4548, time: 500 },
  { config: 'Backoff 2-7, α=0.80',        bpb: 0.3942, time: 939 },
]

const ALPHA_SWEEP = [
  { alpha: 0.20, bpb: 0.6180 },
  { alpha: 0.40, bpb: 0.4941 },
  { alpha: 0.60, bpb: 0.4263 },
  { alpha: 0.80, bpb: 0.3942 },
]

const ORDER_SCALING = [
  { order: 2,  bpb: 1.1431 },
  { order: 3,  bpb: 1.0993 },
  { order: 5,  bpb: 0.7873 },
  { order: 7,  bpb: 0.6545 },
  { order: 9,  bpb: 0.6268 },
  { order: 12, bpb: 0.6193 },
  { order: 15, bpb: 0.6174 },
  { order: 20, bpb: 0.6162 },
]

const BUCKET_SWEEP = [
  { label: '1M',   buckets: 1_048_576,   bpb: 0.5793, mb: 48 },
  { label: '4M',   buckets: 4_194_304,   bpb: 0.6535, mb: 192 },
  { label: '64M',  buckets: 67_108_864,  bpb: 1.0629, mb: 3072 },
  { label: '256M', buckets: 268_435_456, bpb: 1.1123, mb: 12288 },
]

const SPECTRUM = [
  { technique: 'KV cache (sliding window)', mb: 20,   status: 'accepted' as const },
  { technique: 'Score-first TTT',           mb: 2,    status: 'accepted' as const },
  { technique: 'Per-doc LoRA TTT (8 ep)',   mb: 2,    status: 'accepted' as const },
  { technique: 'N-gram cache (2-7)',        mb: 192,  status: 'review' as const },
  { technique: 'N-gram cache (2-9, 64M)',   mb: 4096, status: 'review' as const },
]

const MODEL_GROWTH = [
  { label: '16 MB artifact',   artifact: 16,  evalState: 0 },
  { label: '+192 MB (ord 2-7)', artifact: 16, evalState: 192 },
  { label: '+256 MB (ord 2-9)', artifact: 16, evalState: 256 },
  { label: '+4 GB (64M bkts)',  artifact: 16, evalState: 4096 },
]

// ─── Charts ──────────────────────────────────────────────────────────

function BpbChart() {
  const margin = { top: 16, right: 72, bottom: 8, left: 210 }
  const data = RESULTS_1GPU.slice().reverse()
  return (
    <ParentSize debounceTime={0}>
      {({ width }) => {
        const w = Math.min(width, 580)
        const h = 250
        const xMax = w - margin.left - margin.right
        const yMax = h - margin.top - margin.bottom
        const xScale = scaleLinear({ domain: [0, 1.2], range: [0, xMax] })
        const yScale = scaleBand({ domain: data.map(d => d.config), range: [0, yMax], padding: 0.25 })
        return (
          <svg width={w} height={h} style={{ fontFamily: CHART_FONT, overflow: 'visible' }}>
            <Group left={margin.left} top={margin.top}>
              {/* Baseline reference — quantized leaderboard score */}
              <Line from={{ x: xScale(1.1142), y: -6 }} to={{ x: xScale(1.1142), y: yMax + 6 }}
                stroke={PAL.data} strokeWidth={1} strokeDasharray="5,4" strokeOpacity={0.15} />
              <text x={xScale(1.1142)} y={-10} textAnchor="middle"
                fontSize={9} fill={PAL.muted} fontFamily={MONO}>leaderboard</text>
              {data.map(d => {
                const isBest = d.config === 'Backoff 2-9, order-adpt'
                const isNeural = d.config.startsWith('Base LM')
                return (
                  <g key={d.config}>
                    <Bar
                      x={0} y={yScale(d.config)!}
                      width={xScale(d.bpb)} height={yScale.bandwidth()}
                      rx={2}
                      fill={isBest ? PAL.accent : PAL.data}
                      fillOpacity={isBest ? 0.65 : isNeural ? 0.35 : 0.2}
                    />
                    <text
                      x={xScale(d.bpb) + 8}
                      y={yScale(d.config)! + yScale.bandwidth() / 2}
                      dominantBaseline="central" fontSize={11}
                      fill={isBest ? PAL.accent : PAL.data}
                      fontFamily={MONO} fontWeight={isBest ? 700 : 500}
                    >
                      {d.bpb.toFixed(4)}
                    </text>
                  </g>
                )
              })}
              <AxisLeft scale={yScale} hideTicks hideAxisLine
                tickLabelProps={{ fontSize: 10, fill: PAL.muted, fontFamily: CHART_FONT, fontWeight: 400 as const, textAnchor: 'end' as const }} />
            </Group>
          </svg>
        )
      }}
    </ParentSize>
  )
}

function GrowthChart() {
  const margin = { top: 12, right: 60, bottom: 44, left: 160 }
  return (
    <ParentSize debounceTime={0}>
      {({ width }) => {
        const w = Math.min(width, 520)
        const h = 180
        const xMax = w - margin.left - margin.right
        const yMax = h - margin.top - margin.bottom
        const yScale = scaleBand({ domain: MODEL_GROWTH.map(d => d.label), range: [0, yMax], padding: 0.3 })
        const xScale = scaleLinear({ domain: [0, 4200], range: [0, xMax] })
        return (
          <svg width={w} height={h} style={{ fontFamily: CHART_FONT, overflow: 'visible' }}>
            <Group left={margin.left} top={margin.top}>
              <GridColumns scale={xScale} height={yMax} stroke={PAL.grid} numTicks={5} />
              {MODEL_GROWTH.map(d => {
                const y = yScale(d.label)!
                const bh = yScale.bandwidth()
                return (
                  <g key={d.label}>
                    {/* Artifact portion */}
                    <Bar x={0} y={y} width={xScale(d.artifact)} height={bh}
                      rx={2} fill={PAL.data} fillOpacity={0.6} />
                    {/* Eval-time state */}
                    {d.evalState > 0 && (
                      <Bar x={xScale(d.artifact)} y={y}
                        width={xScale(d.evalState)} height={bh}
                        rx={0} fill={PAL.accent} fillOpacity={0.35} />
                    )}
                    {/* Total label */}
                    <text
                      x={xScale(d.artifact + d.evalState) + 8}
                      y={y + bh / 2}
                      dominantBaseline="central" fontSize={11}
                      fill={d.evalState > 0 ? PAL.accent : PAL.data}
                      fontFamily={MONO} fontWeight={600}
                    >
                      {d.artifact + d.evalState > 999
                        ? `${((d.artifact + d.evalState) / 1024).toFixed(1)} GB`
                        : `${d.artifact + d.evalState} MB`}
                    </text>
                  </g>
                )
              })}
              <AxisLeft scale={yScale} hideTicks hideAxisLine
                tickLabelProps={{ fontSize: 11, fill: PAL.muted, fontFamily: CHART_FONT, fontWeight: 400 as const, textAnchor: 'end' as const }} />
              <AxisBottom scale={xScale} top={yMax} numTicks={5} stroke={PAL.border}
                tickStroke={PAL.border}
                tickFormat={v => Number(v) >= 1000 ? `${(Number(v)/1024).toFixed(0)} GB` : `${v} MB`}
                tickLabelProps={tickLabel} />
              <text x={xMax / 2} y={yMax + 34} textAnchor="middle" {...axisLabelStyle}>
                Effective model size at eval time
              </text>
            </Group>
          </svg>
        )
      }}
    </ParentSize>
  )
}

function SpectrumChart() {
  const margin = { top: 16, right: 70, bottom: 44, left: 190 }
  const data = SPECTRUM.slice().reverse()
  return (
    <ParentSize debounceTime={0}>
      {({ width }) => {
        const w = Math.min(width, 560)
        const h = 200
        const xMax = w - margin.left - margin.right
        const yMax = h - margin.top - margin.bottom
        const xScale = scaleLog({ domain: [1, 5000], range: [0, xMax] })
        const yScale = scaleBand({ domain: data.map(d => d.technique), range: [0, yMax], padding: 0.3 })
        const logTicks = [1, 10, 100, 1000]
        const logLabels: Record<number, string> = { 1: '1 MB', 10: '10 MB', 100: '100 MB', 1000: '1 GB' }
        return (
          <svg width={w} height={h} style={{ fontFamily: CHART_FONT, overflow: 'visible' }}>
            <Group left={margin.left} top={margin.top}>
              {logTicks.map(t => (
                <Line key={t} from={{ x: xScale(t), y: -4 }} to={{ x: xScale(t), y: yMax + 4 }}
                  stroke={PAL.grid} strokeWidth={1} />
              ))}
              {/* 16 MB artifact line */}
              <Line from={{ x: xScale(16), y: -8 }} to={{ x: xScale(16), y: yMax + 8 }}
                stroke={PAL.data} strokeWidth={1.5} strokeDasharray="6,4" strokeOpacity={0.25} />
              <text x={xScale(16)} y={-12} textAnchor="middle"
                fontSize={9} fill={PAL.data} fontFamily={MONO} fontWeight={500} opacity={0.5}>
                16 MB limit
              </text>

              {data.map(d => {
                const isReview = d.status === 'review'
                return (
                  <g key={d.technique}>
                    <Bar x={0} y={yScale(d.technique)!}
                      width={xScale(d.mb)} height={yScale.bandwidth()}
                      rx={2}
                      fill={isReview ? PAL.accent : PAL.data}
                      fillOpacity={isReview ? 0.4 : 0.2} />
                    <text x={xScale(d.mb) + 8} y={yScale(d.technique)! + yScale.bandwidth() / 2}
                      dominantBaseline="central" fontSize={11}
                      fill={isReview ? PAL.accent : PAL.data}
                      fontFamily={MONO} fontWeight={600}>
                      {d.mb >= 1000 ? `${(d.mb/1024).toFixed(0)} GB` : `${d.mb} MB`}
                    </text>
                  </g>
                )
              })}
              <AxisLeft scale={yScale} hideTicks hideAxisLine
                tickLabelProps={{ fontSize: 11, fill: PAL.muted, fontFamily: CHART_FONT, fontWeight: 400 as const, textAnchor: 'end' as const }} />
              <Line from={{ x: 0, y: yMax }} to={{ x: xMax, y: yMax }} stroke={PAL.border} />
              {logTicks.map(t => (
                <g key={t}>
                  <Line from={{ x: xScale(t), y: yMax }} to={{ x: xScale(t), y: yMax + 5 }}
                    stroke={PAL.border} />
                  <text x={xScale(t)} y={yMax + 18} textAnchor="middle"
                    fontSize={10} fill={PAL.muted} fontFamily={MONO}>
                    {logLabels[t]}
                  </text>
                </g>
              ))}
              <text x={xMax / 2} y={yMax + 36} textAnchor="middle" {...axisLabelStyle}>
                Eval-time state (log scale)
              </text>
            </Group>
          </svg>
        )
      }}
    </ParentSize>
  )
}

function OrderScalingChart() {
  const margin = { top: 16, right: 20, bottom: 44, left: 50 }
  return (
    <ParentSize debounceTime={0}>
      {({ width }) => {
        const w = Math.min(width, 440)
        const h = 220
        const xMax = w - margin.left - margin.right
        const yMax = h - margin.top - margin.bottom
        const xScale = scaleLinear({ domain: [1, 21], range: [0, xMax] })
        const yScale = scaleLinear({ domain: [0.5, 1.2], range: [yMax, 0] })
        return (
          <svg width={w} height={h} style={{ fontFamily: CHART_FONT, overflow: 'visible' }}>
            <Group left={margin.left} top={margin.top}>
              <GridRows scale={yScale} width={xMax} stroke={PAL.grid} numTicks={4} />
              {/* Neural baseline */}
              <Line from={{ x: 0, y: yScale(1.1109) }} to={{ x: xMax, y: yScale(1.1109) }}
                stroke={PAL.data} strokeWidth={1} strokeDasharray="5,4" strokeOpacity={0.15} />
              <text x={xMax} y={yScale(1.1109) - 8} textAnchor="end"
                fontSize={9} fill={PAL.muted} fontFamily={MONO}>neural baseline</text>
              {/* Connect dots */}
              {ORDER_SCALING.slice(0, -1).map((d, i) => (
                <Line key={i}
                  from={{ x: xScale(d.order), y: yScale(d.bpb) }}
                  to={{ x: xScale(ORDER_SCALING[i+1].order), y: yScale(ORDER_SCALING[i+1].bpb) }}
                  stroke={PAL.data} strokeWidth={1.5} strokeOpacity={0.2} />
              ))}
              {ORDER_SCALING.map(d => (
                <g key={d.order}>
                  <Circle cx={xScale(d.order)} cy={yScale(d.bpb)} r={4}
                    fill={PAL.data} fillOpacity={0.6} />
                  <text x={xScale(d.order)} y={yScale(d.bpb) - 10}
                    textAnchor="middle" fontSize={9}
                    fill={PAL.data} fontFamily={MONO} fontWeight={500}>
                    {d.bpb.toFixed(2)}
                  </text>
                </g>
              ))}
              <AxisLeft scale={yScale} numTicks={4} stroke={PAL.border} tickStroke={PAL.border}
                tickLabelProps={tickLabel} />
              <text transform={`translate(-38, ${yMax / 2}) rotate(-90)`}
                textAnchor="middle" {...axisLabelStyle}>BPB</text>
              <AxisBottom scale={xScale} top={yMax} numTicks={6} stroke={PAL.border}
                tickStroke={PAL.border} tickLabelProps={tickLabel} />
              <text x={xMax / 2} y={yMax + 34} textAnchor="middle" {...axisLabelStyle}>
                Max n-gram order
              </text>
            </Group>
          </svg>
        )
      }}
    </ParentSize>
  )
}

function BucketSweepChart() {
  const margin = { top: 16, right: 72, bottom: 8, left: 60 }
  const data = BUCKET_SWEEP.slice().reverse()
  return (
    <ParentSize debounceTime={0}>
      {({ width }) => {
        const w = Math.min(width, 480)
        const h = 170
        const xMax = w - margin.left - margin.right
        const yMax = h - margin.top - margin.bottom
        const xScale = scaleLinear({ domain: [0, 1.2], range: [0, xMax] })
        const yScale = scaleBand({ domain: data.map(d => d.label), range: [0, yMax], padding: 0.3 })
        return (
          <svg width={w} height={h} style={{ fontFamily: CHART_FONT, overflow: 'visible' }}>
            <Group left={margin.left} top={margin.top}>
              {/* Neural baseline */}
              <Line from={{ x: xScale(1.1109), y: -6 }} to={{ x: xScale(1.1109), y: yMax + 6 }}
                stroke={PAL.data} strokeWidth={1} strokeDasharray="5,4" strokeOpacity={0.15} />
              {data.map(d => {
                const isBest = d.bpb < 0.6
                const isWorse = d.bpb > 1.0
                return (
                  <g key={d.label}>
                    <Bar x={0} y={yScale(d.label)!}
                      width={xScale(d.bpb)} height={yScale.bandwidth()}
                      rx={2}
                      fill={isWorse ? PAL.accent : isBest ? PAL.data : PAL.data}
                      fillOpacity={isWorse ? 0.5 : isBest ? 0.5 : 0.2} />
                    <text x={xScale(d.bpb) + 8} y={yScale(d.label)! + yScale.bandwidth() / 2}
                      dominantBaseline="central" fontSize={11}
                      fill={isWorse ? PAL.accent : PAL.data}
                      fontFamily={MONO} fontWeight={isBest ? 700 : 500}>
                      {d.bpb.toFixed(4)}
                    </text>
                  </g>
                )
              })}
              <AxisLeft scale={yScale} hideTicks hideAxisLine
                tickFormat={v => `${v} buckets`}
                tickLabelProps={{ fontSize: 11, fill: PAL.muted, fontFamily: MONO, fontWeight: 400 as const, textAnchor: 'end' as const }} />
            </Group>
          </svg>
        )
      }}
    </ParentSize>
  )
}

function EightGpuChart() {
  const margin = { top: 16, right: 72, bottom: 8, left: 190 }
  const data = RESULTS_8GPU.slice().reverse()
  return (
    <ParentSize debounceTime={0}>
      {({ width }) => {
        const w = Math.min(width, 560)
        const h = 170
        const xMax = w - margin.left - margin.right
        const yMax = h - margin.top - margin.bottom
        const xScale = scaleLinear({ domain: [0, 1.2], range: [0, xMax] })
        const yScale = scaleBand({ domain: data.map(d => d.config), range: [0, yMax], padding: 0.3 })
        return (
          <svg width={w} height={h} style={{ fontFamily: CHART_FONT, overflow: 'visible' }}>
            <Group left={margin.left} top={margin.top}>
              {/* 600s budget line */}
              {data.map(d => {
                const isBest = d.bpb < 0.42
                const isBaseline = d.bpb > 1
                return (
                  <g key={d.config}>
                    <Bar x={0} y={yScale(d.config)!}
                      width={xScale(d.bpb)} height={yScale.bandwidth()}
                      rx={2}
                      fill={isBest ? PAL.accent : PAL.data}
                      fillOpacity={isBest ? 0.65 : isBaseline ? 0.35 : 0.2} />
                    <text x={xScale(d.bpb) + 8} y={yScale(d.config)! + yScale.bandwidth() / 2}
                      dominantBaseline="central" fontSize={11}
                      fill={isBest ? PAL.accent : PAL.data}
                      fontFamily={MONO} fontWeight={isBest ? 700 : 500}>
                      {d.bpb.toFixed(4)}
                    </text>
                  </g>
                )
              })}
              <AxisLeft scale={yScale} hideTicks hideAxisLine
                tickLabelProps={{ fontSize: 11, fill: PAL.muted, fontFamily: CHART_FONT, fontWeight: 400 as const, textAnchor: 'end' as const }} />
            </Group>
          </svg>
        )
      }}
    </ParentSize>
  )
}

function AlphaSweepChart() {
  const margin = { top: 16, right: 20, bottom: 44, left: 50 }
  return (
    <ParentSize debounceTime={0}>
      {({ width }) => {
        const w = Math.min(width, 440)
        const h = 200
        const xMax = w - margin.left - margin.right
        const yMax = h - margin.top - margin.bottom
        const xScale = scaleLinear({ domain: [0.15, 0.85], range: [0, xMax] })
        const yScale = scaleLinear({ domain: [0.35, 0.65], range: [yMax, 0] })
        return (
          <svg width={w} height={h} style={{ fontFamily: CHART_FONT, overflow: 'visible' }}>
            <Group left={margin.left} top={margin.top}>
              <GridRows scale={yScale} width={xMax} stroke={PAL.grid} numTicks={4} />
              {/* Connect dots */}
              {ALPHA_SWEEP.slice(0, -1).map((d, i) => (
                <Line key={i}
                  from={{ x: xScale(d.alpha), y: yScale(d.bpb) }}
                  to={{ x: xScale(ALPHA_SWEEP[i+1].alpha), y: yScale(ALPHA_SWEEP[i+1].bpb) }}
                  stroke={PAL.data} strokeWidth={1.5} strokeOpacity={0.2} />
              ))}
              {/* Dots */}
              {ALPHA_SWEEP.map(d => (
                <g key={d.alpha}>
                  <Circle cx={xScale(d.alpha)} cy={yScale(d.bpb)} r={4.5}
                    fill={PAL.data} fillOpacity={0.65} />
                  <text x={xScale(d.alpha)} y={yScale(d.bpb) - 12}
                    textAnchor="middle" fontSize={10}
                    fill={PAL.data} fontFamily={MONO} fontWeight={600}>
                    {d.bpb.toFixed(4)}
                  </text>
                </g>
              ))}
              <AxisLeft scale={yScale} numTicks={4} stroke={PAL.border} tickStroke={PAL.border}
                tickLabelProps={tickLabel} />
              <text transform={`translate(-38, ${yMax / 2}) rotate(-90)`}
                textAnchor="middle" {...axisLabelStyle}>BPB</text>
              <AxisBottom scale={xScale} top={yMax} numTicks={4} stroke={PAL.border}
                tickStroke={PAL.border}
                tickFormat={v => `α=${Number(v).toFixed(1)}`}
                tickLabelProps={tickLabel} />
            </Group>
          </svg>
        )
      }}
    </ParentSize>
  )
}

// ─── Page ────────────────────────────────────────────────────────────

export default function EvalTimeModelGrowthPage() {
  return (
    <div className="max-w-[600px] mx-auto px-5 pt-6 pb-20 text-zinc-800">

      {/* ─── Header ─── */}
      <header className="mb-10">
        <PostEyebrowWithProvenance ai="eval-time-model-growth">
          Study &middot; March 2026
        </PostEyebrowWithProvenance>
        <h1 className="text-[24px] md:text-[28px] font-semibold leading-snug tracking-tight text-zinc-900 mb-5">
          How to Clean Up All the Parameter Golf Submissions
        </h1>
        <p className="text-[15px] text-zinc-500 leading-relaxed">
          <a href="https://github.com/openai/parameter-golf"
            className="underline decoration-zinc-300 hover:text-zinc-700">Parameter Golf</a> is
          one of the most fun open problems in ML right now &mdash; compress
          language into 16&thinsp;MB. Recently, n-gram caching pushed reported
          scores below 0.5 BPB. We dug into the numbers and found something
          interesting: the probability distribution sums to ~277, not 1. A
          one-line check in the eval script would catch it. This study presents
          the math, the experimental evidence, and proposed fixes.
        </p>
      </header>

      <hr className="border-zinc-100 mb-12" />

      {/* ─── 1. The scores are invalid ─── */}
      <section className="mb-16">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">
          The distribution doesn&apos;t sum to 1.
        </h2>
        <p className="text-xs text-zinc-400 mb-4">
          Credit to{' '}
          <a href="https://github.com/openai/parameter-golf/issues/677#issuecomment-4139902162"
            className="underline decoration-zinc-300" target="_blank" rel="noopener noreferrer">
            @Eppie
          </a>{' '}
          for identifying the probability validity issue, and to Mirco on
          Discord for the <code>P(cache_bin)</code> formulation.
        </p>
        <p className="text-sm leading-relaxed text-zinc-600 mb-4">
          N-gram caching blends a hash-table ratio with the base model&apos;s
          prediction. The blend is only computed for the correct token. The
          other 1,023 tokens are never checked. If they were, the distribution
          would sum to ~277, not 1.0.
        </p>
        <p className="text-sm leading-relaxed text-zinc-600 mb-4">
          The cache stores two hash tables per n-gram order: one counts how
          often each context appears, one counts how often each (context,
          token) pair appears. Their ratio &mdash; <code>full_table[hash(ctx,
          tok)] / ctx_table[hash(ctx)]</code> &mdash; is meant to
          approximate <code>P(tok | ctx)</code>. But because context-only and
          context+token hash to independent bucket indices, the ratio
          doesn&apos;t track token frequency. With 1M buckets and 62M tokens,
          each bucket averages ~62 entries in both tables. The ratio of two
          similarly-populated buckets approaches 1.0. This
          is <code>P(cache_bin)</code>, not <code>P(tok | ctx)</code>.
        </p>
        <p className="text-sm leading-relaxed text-zinc-600 mb-4">
          The blend <code>(1-&alpha;) &middot; p_model + &alpha; &middot;
          P(cache_bin)</code> with <code>P(cache_bin) &asymp; 1.0</code> pushes
          the correct token&apos;s probability up toward <code>p_model +
          &alpha;(1 - p_model)</code>. For any token the model predicts better
          than uniform (p &gt; 1/K), renormalization would strictly decrease its
          probability. The n-gram contribution doesn&apos;t wash out &mdash; it
          actively hurts.
        </p>
        <p className="text-sm leading-relaxed text-zinc-600 mb-6">
          The 1-bucket extreme: <code>P(cache_bin) = T/T = 1.0</code> for
          every lookup. With <code>&alpha; = 1</code>, BPB = 0. Perfect score.
          Which tells us the metric isn&apos;t measuring what we think.
        </p>

        <figure className="my-8">
          <BucketSweepChart />
          <figcaption className="text-xs text-zinc-400 mt-3 leading-relaxed">
            Bucket sweep (backoff 2-7, entropy-adaptive &alpha;): more
            buckets = less inflation = worse reported BPB. 256M buckets
            (near collision-free) scores near baseline. The
            &ldquo;improvement&rdquo; tracks collision density, not
            prediction quality.
          </figcaption>
        </figure>

        <p className="text-sm leading-relaxed text-zinc-600 mb-4">
          The 256M-bucket result (1.1123) is near the float baseline
          (1.1109), suggesting the genuine contribution of collision-free
          n-grams is small. The
          sub-0.5 BPB scores are measurement artifacts from
          point-evaluating an invalid distribution.
        </p>
        <p className="text-sm leading-relaxed text-zinc-600 mb-6">
          The n-gram-only configuration &mdash; hash tables with no neural
          model &mdash; reports 1.0615, below the neural baseline
          at 1.1109. A frequency table with no learned parameters appears to
          outcompress a trained language model. This is only possible because
          the number being reported is not measuring compression.
        </p>

        <h3 className="text-[15px] font-semibold text-zinc-900 mb-3">
          Direct verification: compute the full distribution.
        </h3>
        <p className="text-sm leading-relaxed text-zinc-600 mb-4">
          We ran the n-gram blend for all 1,024 tokens at every scored
          position and measured the sum. On a fresh 1&times;H100 base model
          (1.2711 BPB) with backoff 2-7, &alpha;=0.40:
        </p>
        <div className="my-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left">
                <th className="py-2 pr-4 font-medium text-zinc-700">Metric</th>
                <th className="py-2 pr-4 font-medium text-zinc-700 text-right">Value</th>
              </tr>
            </thead>
            <tbody className="text-zinc-600">
              <tr className="border-b border-zinc-50">
                <td className="py-2 pr-4">Baseline BPB (no n-gram)</td>
                <td className="py-2 pr-4 text-right font-mono">1.2711</td>
              </tr>
              <tr className="border-b border-zinc-50">
                <td className="py-2 pr-4">Reported BPB (point-eval, unnormalized)</td>
                <td className="py-2 pr-4 text-right font-mono">0.5422</td>
              </tr>
              <tr className="border-b border-zinc-50">
                <td className="py-2 pr-4 font-semibold text-zinc-800">Average distribution sum</td>
                <td className="py-2 pr-4 text-right font-mono font-semibold" style={{color: PAL.accent}}>277.0</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">Average NLL after normalization</td>
                <td className="py-2 pr-4 text-right font-mono">6.2906</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm leading-relaxed text-zinc-600 mb-4">
          The blended distribution sums to <strong>277</strong>, not 1.
          After normalizing to a valid distribution, the average NLL
          is 6.29 &mdash; far worse than the baseline. The n-gram
          doesn&apos;t help; it actively hurts once you enforce valid
          probabilities. 62,020,312 positions audited.
        </p>
        <p className="text-sm leading-relaxed text-zinc-600">
          One <code>assert abs(probs.sum() - 1.0) &lt; 1e-4</code> in the
          eval harness catches this instantly. Cost: one <code>torch.sum</code> per
          position, 1&ndash;2 seconds for 62M tokens.
        </p>
      </section>

      {/* ─── 2. How the cache works ─── */}
      <section className="mb-16">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">
          How the n-gram cache works.
        </h2>
        <p className="text-sm leading-relaxed text-zinc-600 mb-4">
          After each token is scored by the base LM, the token and its
          preceding context are inserted into hash tables. When a future
          token&apos;s context matches a previously seen n-gram, the cached
          frequency is mixed with the prediction:
        </p>
        <div className="my-6 bg-zinc-50 border border-zinc-100 rounded-lg px-5 py-4">
          <code className="text-[13px] text-zinc-700 font-mono">
            p<sub>mix</sub> = (1 &minus; &alpha;) &middot; p<sub>model</sub> + &alpha; &middot; p<sub>ngram</sub>
          </code>
        </div>
        <p className="text-sm leading-relaxed text-zinc-600 mb-4">
          The tables are built from already-scored tokens. Causality is
          preserved in single-pass implementations. The technique builds
          192&ndash;256&thinsp;MB of hash tables during evaluation, none of
          which counts toward the 16&thinsp;MB artifact limit.
        </p>
        <figure className="my-8">
          <GrowthChart />
          <figcaption className="text-xs text-zinc-400 mt-3 leading-relaxed">
            Dark bars = 16&thinsp;MB artifact. Red bars = eval-time hash tables.
            The effective model at eval time
            is <span className="font-mono font-semibold text-zinc-700">272&thinsp;MB</span>.
          </figcaption>
        </figure>
      </section>

      {/* ─── 3. Anatomy of the artifact ─── */}
      <section className="mb-16">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">
          Anatomy of the artifact.
        </h2>
        <p className="text-sm leading-relaxed text-zinc-600 mb-6">
          The following experiments characterize how the measurement artifact
          behaves across configurations. The reported BPB numbers are from an
          invalid distribution &mdash; they measure how much <code>P(cache_bin)</code> inflates
          the correct token&apos;s probability, not how well the model compresses
          language.
        </p>

        <h3 className="text-sm font-semibold text-zinc-900 mb-3">
          Alpha sweep: more weight on the inflated ratio = lower reported BPB.
        </h3>
        <p className="text-sm leading-relaxed text-zinc-600 mb-4">
          Higher &alpha; gives more weight to <code>P(cache_bin) &asymp; 1.0</code>.
          The reported BPB drops monotonically. This isn&apos;t the model
          deferring to better predictions &mdash; it&apos;s the blend assigning
          more weight to the inflated hash ratio.
        </p>
        <figure className="my-8">
          <AlphaSweepChart />
          <figcaption className="text-xs text-zinc-400 mt-3 leading-relaxed">
            8&times;&thinsp;H100 alpha sweep. Monotonic &ldquo;improvement&rdquo;
            tracks &alpha;, not prediction quality.
          </figcaption>
        </figure>

        <h3 className="text-sm font-semibold text-zinc-900 mb-3 mt-10">
          Order scaling: reported BPB vs max order.
        </h3>
        <p className="text-sm leading-relaxed text-zinc-600 mb-4">
          Each additional n-gram order adds another pair of hash tables
          and changes which order&apos;s hash ratio is used for each token.
          The reported BPB drops with more orders but saturates around 9&ndash;12.
        </p>
        <figure className="my-8">
          <OrderScalingChart />
          <figcaption className="text-xs text-zinc-400 mt-3 leading-relaxed">
            Reported BPB vs max n-gram order. Saturates around order 9&ndash;12.
            Each additional order adds memory but diminishing inflation.
          </figcaption>
        </figure>

        <h3 className="text-sm font-semibold text-zinc-900 mb-3 mt-10">
          Stride decomposition: the artifact magnitude is ~0.62 BPB.
        </h3>
        <p className="text-sm leading-relaxed text-zinc-600 mb-4">
          The n-gram &ldquo;delta&rdquo; is ~0.62 BPB regardless of sliding window
          stride. This is the artifact magnitude, not a compression improvement.
        </p>
        <div className="my-6 bg-zinc-50 border border-zinc-100 rounded-lg overflow-hidden">
          <div className="grid grid-cols-4 text-xs font-medium text-zinc-500 border-b border-zinc-100">
            <div className="px-4 py-2.5">Stride</div>
            <div className="px-4 py-2.5 text-right">Baseline</div>
            <div className="px-4 py-2.5 text-right">With cache</div>
            <div className="px-4 py-2.5 text-right font-semibold text-zinc-700">Artifact &Delta;</div>
          </div>
          {[
            { stride: '64', base: '1.1109', cache: '0.4923', delta: '\u22120.619' },
            { stride: '256', base: '1.1132', cache: '0.4930', delta: '\u22120.620' },
            { stride: '2048', base: '1.1367', cache: '0.5005', delta: '\u22120.636' },
          ].map((r, i) => (
            <div key={i} className={`grid grid-cols-4 text-xs ${i % 2 === 0 ? '' : 'bg-white'}`}>
              <div className="px-4 py-2 font-mono text-zinc-700">{r.stride}</div>
              <div className="px-4 py-2 text-right font-mono text-zinc-500">{r.base}</div>
              <div className="px-4 py-2 text-right font-mono text-zinc-500">{r.cache}</div>
              <div className="px-4 py-2 text-right font-mono font-semibold text-zinc-700">{r.delta}</div>
            </div>
          ))}
        </div>

        <h3 className="text-sm font-semibold text-zinc-900 mb-3 mt-10">
          8-GPU all-reduce: the artifact fits in the time budget.
        </h3>
        <p className="text-sm leading-relaxed text-zinc-600 mb-4">
          With all-reduce sync of hash table deltas, every GPU has the full
          global cache. Backoff 2-7 at &alpha;=0.40 finishes in 401&thinsp;s,
          well under the 600&thinsp;s budget. The inflated scores are not just
          theoretically possible &mdash; they&apos;re practically achievable
          within competition constraints.
        </p>
        <figure className="my-8">
          <EightGpuChart />
          <figcaption className="text-xs text-zinc-400 mt-3 leading-relaxed">
            8-GPU results. First three configs under 600&thinsp;s.
            &alpha;=0.80 (939&thinsp;s) exceeds the budget.
          </figcaption>
        </figure>
      </section>

      {/* ─── 4. A separate question ─── */}
      <section className="mb-16">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">
          A separate question: what should the competition measure?
        </h2>
        <p className="text-sm leading-relaxed text-zinc-600 mb-4">
          The distribution issue above is a measurement bug. What follows
          is a different kind of question: even with valid scores, should the
          competition constrain what happens at eval time? This is a design
          conversation, not a mathematical one. Reasonable people can disagree.
        </p>
        <p className="text-sm leading-relaxed text-zinc-600 mb-4">
          The competition gives evaluation 8&times;&thinsp;H100 and 600&thinsp;s
          for a 16&thinsp;MB model. In deployment, inference is constrained
          by hardware cost, latency, and concurrent users. These are different
          environments, and it&apos;s interesting to think about whether the
          competition should reflect deployment realities or stay focused on
          pure compression research.
        </p>
        <div className="my-8 bg-zinc-50 border border-zinc-100 rounded-lg overflow-hidden">
          <div className="grid grid-cols-3 text-xs font-medium text-zinc-500 border-b border-zinc-100">
            <div className="px-4 py-3"></div>
            <div className="px-4 py-3 text-center border-l border-zinc-100">Competition</div>
            <div className="px-4 py-3 text-center border-l border-zinc-100">Deployment</div>
          </div>
          {[
            { dim: 'Training compute', comp: 'Limited (fairness)', real: 'Unlimited' },
            { dim: 'Inference compute', comp: 'Effectively unlimited*', real: 'Limited (economics)' },
            { dim: 'Inference hardware', comp: '8\u00d7 H100, 640 GB', real: '1 GPU or CPU' },
            { dim: 'Inference time', comp: '600 s for 62M tokens', real: '<200 ms per request' },
            { dim: 'Eval-time memory', comp: 'Unconstrained', real: 'Shared with users' },
            { dim: 'Corpus structure', comp: 'Fixed, repetitive', real: 'Independent queries' },
          ].map((r, i) => (
            <div key={i} className={`grid grid-cols-3 text-xs ${i % 2 === 0 ? '' : 'bg-white'}`}>
              <div className="px-4 py-2.5 font-medium text-zinc-700">{r.dim}</div>
              <div className="px-4 py-2.5 text-center text-zinc-500 border-l border-zinc-100">{r.comp}</div>
              <div className="px-4 py-2.5 text-center text-zinc-500 border-l border-zinc-100">{r.real}</div>
            </div>
          ))}
          <div className="px-4 py-2 text-[10px] text-zinc-400 border-t border-zinc-100">
            *10-minute wall clock, but 8&times;&thinsp;H100 with 640&thinsp;GB VRAM is effectively unconstrained for a 16&thinsp;MB model.
          </div>
        </div>
        <p className="text-sm leading-relaxed text-zinc-600 mt-6 mb-6">
          With valid distributions and preserved causality, someone could still
          train a second, larger model during eval via self-distillation, ensemble
          8 copies via divergent TTT, or store 63&thinsp;GB of hidden states as
          a neural cache. All valid. All causal. All far beyond 16&thinsp;MB.
          The eval-time state spectrum shows the scale:
        </p>
        <figure className="my-8">
          <SpectrumChart />
          <figcaption className="text-xs text-zinc-400 mt-3 leading-relaxed">
            Eval-time state growth across techniques.
            Dashed line marks the 16&thinsp;MB artifact limit.
          </figcaption>
        </figure>
      </section>

      {/* ─── Proposals ─── */}
      <section className="mb-16">
        <h2 className="text-lg font-semibold text-zinc-900 mb-6">
          Proposed fixes.
        </h2>

        <div className="space-y-6">
          <div>
            <div className="flex items-baseline gap-2 mb-2">
              <h3 className="text-sm font-semibold text-zinc-900">
                1. Verify the distribution sums to 1.
              </h3>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                fixing the measurement
              </span>
            </div>
            <p className="text-sm leading-relaxed text-zinc-600 mb-3">
              Require the model to produce a full probability vector over
              all 1024 tokens at every scored position. The eval script
              verifies <code>sum(probs) &asymp; 1.0</code> before
              scoring. One <code>torch.sum</code> per position. Cost: 1&ndash;2
              seconds for 62M tokens. Negligible.
            </p>
            <div className="my-4 bg-zinc-900 rounded-lg px-5 py-4 overflow-x-auto">
              <pre className="text-[13px] text-zinc-300 font-mono leading-relaxed">
{`probs = model.predict(context)       # [vocab_size]
assert abs(probs.sum() - 1.0) < 1e-4 # verify
nll = -torch.log(probs[correct_token])`}
              </pre>
            </div>
            <p className="text-sm leading-relaxed text-zinc-600">
              Catches every invalid distribution. Passes everything valid:
              softmax outputs, linear interpolation of valid distributions,
              Dirichlet-Multinomial, TTT, LoRA, GPTQ. Not n-gram specific.
            </p>
          </div>

          <div>
            <div className="flex items-baseline gap-2 mb-2">
              <h3 className="text-sm font-semibold text-zinc-900">
                2. Make causality an explicit rule.
              </h3>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                aligning with reality
              </span>
            </div>
            <p className="text-sm leading-relaxed text-zinc-600">
              The FAQ says you can only train on tokens &ldquo;you&apos;ve
              already evaluated your model on.&rdquo; Two-pass rescoring
              (PRs #846, #853, #868, #870, #881, #888) violates this: pass 2
              rescores token #100 using a cache built from tokens #101
              through #62M. Making this a stated rule would clarify the
              intent.
            </p>
          </div>

          <div>
            <div className="flex items-baseline gap-2 mb-2">
              <h3 className="text-sm font-semibold text-zinc-900">
                3. Cap auxiliary eval-time state.
              </h3>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                aligning with reality
              </span>
            </div>
            <p className="text-sm leading-relaxed text-zinc-600">
              Constrain <strong className="text-zinc-900">auxiliary
              state</strong>: tensors that accumulate during eval and
              are not derivable from the artifact alone. Not model weights,
              not KV cache, not activations.
              A cap of &le; 32&thinsp;MB preserves everything currently
              approved (TTT LoRA at ~2&thinsp;MB).
            </p>
          </div>

          <div>
            <div className="flex items-baseline gap-2 mb-2">
              <h3 className="text-sm font-semibold text-zinc-900">
                4. Cap per-token overhead.
              </h3>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
                aligning with reality
              </span>
            </div>
            <p className="text-sm leading-relaxed text-zinc-600">
              Eval-time techniques must not increase per-token latency by
              more than 50% over the base model forward pass. Base LM
              on 8&times;&thinsp;H100 takes 110&thinsp;s. A 1.5&times; cap
              means 165&thinsp;s max. The n-gram cache takes 401&thinsp;s
              (3.6&times;).
            </p>
          </div>
        </div>
      </section>

      {/* ═══════ Full results (appendix) ═══════ */}
      <hr className="border-zinc-200 mb-12 mt-4" />
      <p className="text-xs tracking-widest uppercase text-zinc-400 mb-10">
        Full Results
      </p>

      <p className="text-sm leading-relaxed text-zinc-600 mb-6">
        All BPB numbers below are from an invalid distribution. They measure
        how much <code>P(cache_bin)</code> inflates the correct token&apos;s
        probability, not how well the model compresses language.
      </p>

      {/* ─── Single-GPU results ─── */}
      <section className="mb-16">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">
          Single-GPU configurations.
        </h2>
        <p className="text-sm leading-relaxed text-zinc-600 mb-6">
          Base model: <a href="https://github.com/openai/parameter-golf/pull/728"
            className="underline decoration-zinc-300" target="_blank" rel="noopener noreferrer">
            PR #728</a> (~1.12&thinsp;BPB, 16&thinsp;MB artifact).
          Single GPU, stride=64, FineWeb val (62M tokens).
        </p>
        <figure className="my-8">
          <BpbChart />
          <figcaption className="text-xs text-zinc-400 mt-3 leading-relaxed">
            Reported BPB across configurations. These numbers are from an
            invalid distribution.
          </figcaption>
        </figure>
      </section>

      {/* ─── Other findings ─── */}
      <section className="mb-16">
        <h2 className="text-lg font-semibold text-zinc-900 mb-6">
          Other observations.
        </h2>

        {[
          {
            title: 'Logistic mixing inflates less than linear',
            body: 'PAQ-style logistic mixing gives 0.75 (reported) vs linear\u2019s 0.65. The logistic transform compresses the inflated ratio, reducing the artifact magnitude.',
          },
          {
            title: 'Entropy-adaptive alpha reduces the artifact',
            body: 'The sigmoid-gated alpha from PR #727 gives 0.65 vs fixed \u03b1=0.40 at 0.49. The entropy gate reduces \u03b1 when the model is confident, which partially corrects the inflation.',
          },
          {
            title: 'Three match categories',
            body: 'The cache matches (a) deterministic BPE subword completion (orders 2-4), (b) common English collocations (orders 4-6), and (c) verbatim document repetition (orders 6+). With valid distributions, the genuine contribution of these matches appears small (256M-bucket result: 1.1123 vs 1.1109 baseline).',
          },
        ].map((d, i) => (
          <div key={i} className="flex gap-4 mb-6 pb-6 border-b border-zinc-100 last:border-0">
            <div className="text-2xl font-bold text-zinc-200 flex-shrink-0 w-8 text-right pt-0.5">
              {i + 1}
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900 mb-1">{d.title}</p>
              <p className="text-sm leading-relaxed text-zinc-500">{d.body}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-zinc-100 pt-8 text-xs text-zinc-400 space-y-2">
        <p>
          Base model:{' '}
          <a href="https://github.com/openai/parameter-golf/pull/728"
            className="underline decoration-zinc-300" target="_blank" rel="noopener noreferrer">
            PR #728
          </a>{' '}
          (val_bpb 1.1142). N-gram cache concept:{' '}
          <a href="https://github.com/openai/parameter-golf/pull/727"
            className="underline decoration-zinc-300" target="_blank" rel="noopener noreferrer">
            PR #727
          </a>,{' '}
          <a href="https://github.com/openai/parameter-golf/pull/779"
            className="underline decoration-zinc-300" target="_blank" rel="noopener noreferrer">
            #779
          </a>,{' '}
          <a href="https://github.com/openai/parameter-golf/pull/788"
            className="underline decoration-zinc-300" target="_blank" rel="noopener noreferrer">
            #788
          </a>.
        </p>
        <p>
          Code:{' '}
          <code className="font-mono text-zinc-500">experiments/eval_time_mixing/</code>
        </p>
      </footer>

      <Comments />
    </div>
  )
}
