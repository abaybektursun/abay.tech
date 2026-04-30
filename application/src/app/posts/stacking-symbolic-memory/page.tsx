'use client'

import React from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import Comments from '@/components/comments'
import { Group } from '@visx/group'
import { scaleBand, scaleLinear, scaleLog } from '@visx/scale'
import { Bar, Line, Circle, LinePath } from '@visx/shape'
import { AxisBottom, AxisLeft } from '@visx/axis'
import { GridRows, GridColumns } from '@visx/grid'
import { ParentSize } from '@visx/responsive'

// ─── Math render helper (KaTeX) ──────────────────────────────────────
function M({ expr, block = false }: { expr: string; block?: boolean }) {
  const html = katex.renderToString(expr, {
    displayMode: block,
    throwOnError: false,
    output: 'html',
  })
  if (block) {
    return (
      <div
        className="my-2 text-center"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
  }
  return <span dangerouslySetInnerHTML={{ __html: html }} />
}

// ─── Design tokens ───────────────────────────────────────────────────
const CHART_FONT = 'Inter, system-ui, -apple-system, sans-serif'
const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace'

const PAL = {
  data: '#27272a',
  muted: '#71717a',
  grid: '#f4f4f5',
  border: '#e4e4e7',
  accent: '#991b1b',
  blue: '#1e40af',
  amber: '#92400e',
} as const

const tickLabel = { fontSize: 11, fill: PAL.muted, fontFamily: CHART_FONT, fontWeight: 400 as const }
const axisLabelStyle = { fontSize: 11, fill: PAL.muted, fontFamily: CHART_FONT, fontWeight: 500 as const }

// ─── Data ────────────────────────────────────────────────────────────

// Each row adds a gap pattern on top of the previous stack. Pre-TTT BPB on a
// PR1797-style 4xH100 substrate, seed 42.
const DEPTH_CURVE = [
  { depth: 1, label: '(1, 2, 3)',       delta: -0.000557, marginal: -0.000557 },
  { depth: 2, label: '+ (1, 2, 3, 4)',  delta: -0.000679, marginal: -0.000122 },
  { depth: 3, label: '+ (1, 3, 5)',     delta: -0.000744, marginal: -0.000065 },
  { depth: 4, label: '+ (1, 2)',        delta: -0.000841, marginal: -0.000097 },
  { depth: 5, label: '+ (1, 3, 5, 7)',  delta: -0.000865, marginal: -0.000024 },
] as const

// Histogram of per-fire CE deltas across 4 chunks (26,369 fires).
const DELTA_HIST = [
  { lo: -12,    hi: -8,     count:    2 },
  { lo:  -8,    hi: -4,     count:   93 },
  { lo:  -4,    hi: -2,     count:  168 },
  { lo:  -2,    hi: -1,     count:  184 },
  { lo:  -1,    hi: -0.5,   count:  233 },
  { lo:  -0.5,  hi: -0.1,   count:  807 },
  { lo:  -0.1,  hi: -0.01,  count: 1450 },
  { lo:  -0.01, hi:  0.0,   count: 2560 },
  { lo:   0.0,  hi:  0.01,  count: 6221 },
  { lo:   0.01, hi:  0.1,   count: 14274 },
  { lo:   0.1,  hi:  0.2,   count:  377 },
] as const

const FIRE_TOTAL  = 26369
const FIRE_HELPED = 5491
const FIRE_HURT   = 20872

// Anatomy steps are built inside AnatomyDiagram so cells can mix prose +
// inline KaTeX math. (Module-level const can't return JSX without a wrapper.)

type CaseTopK = { piece: string; logp: number }
type CaseEvidence = { context: string; cont: string }
type CaseRecord = {
  prefix: string
  target: string
  delta: number
  nllBefore: number
  nllAfter: number
  modelTop5: CaseTopK[]
  stackTop5: CaseTopK[]
  patternsFired: number
  patterns: { gap: string; bucket: number; uniq: number; top1Share: number; topCands: { piece: string; q: number }[] }[]
  evidence: CaseEvidence[]
  blurb: string
}

const CASES: CaseRecord[] = [
  {
    prefix: '…regarding the electronic transmission of data. 6 no re-distribution of registry.j',
    target: 'ockey',
    delta: -10.284,
    nllBefore: 12.396,
    nllAfter: 2.111,
    modelTop5: [
      { piece: 'son',  logp: -1.83 },
      { piece: 'pg',   logp: -1.96 },
      { piece: 's',    logp: -2.08 },
      { piece: 'ava',  logp: -2.27 },
      { piece: 'p',    logp: -2.65 },
    ],
    stackTop5: [
      { piece: 'son',   logp: -1.97 },
      { piece: 'pg',    logp: -2.10 },
      { piece: 'ockey', logp: -2.11 },
      { piece: 's',     logp: -2.22 },
      { piece: 'ava',   logp: -2.41 },
    ],
    patternsFired: 4,
    patterns: [
      { gap: '(1, 2, 3)',     bucket:  6, uniq:  1, top1Share: 1.00, topCands: [{ piece: 'ockey', q: 1.00 }] },
      { gap: '(1, 2, 3, 4)',  bucket:  6, uniq:  1, top1Share: 1.00, topCands: [{ piece: 'ockey', q: 1.00 }] },
      { gap: '(1, 3, 5)',     bucket:  6, uniq:  1, top1Share: 1.00, topCands: [{ piece: 'ockey', q: 1.00 }] },
      { gap: '(1, 2)',        bucket: 13, uniq:  4, top1Share: 0.44, topCands: [{ piece: 'ockey', q: 0.44 }, { piece: ' ', q: 0.25 }, { piece: '.', q: 0.25 }] },
    ],
    evidence: [
      { context: '…use for registry.jockey…',     cont: 'ockey' },
      { context: '…or using registry.jockey…',    cont: 'ockey' },
      { context: '…or using registry.jockey…',    cont: 'ockey' },
    ],
    blurb: '',
  },
  {
    prefix: '…joint opinion of stewart, powell, and ',
    target: 'steven',
    delta: -5.645,
    nllBefore: 8.169,
    nllAfter: 2.524,
    modelTop5: [
      { piece: 'j',  logp: -3.54 },
      { piece: 'w',  logp: -3.61 },
      { piece: 's',  logp: -3.61 },
      { piece: 'r',  logp: -3.81 },
      { piece: 'b',  logp: -3.95 },
    ],
    stackTop5: [
      { piece: 'steven', logp: -2.52 },
      { piece: 'j',      logp: -3.65 },
      { piece: 's',      logp: -3.71 },
      { piece: 'w',      logp: -3.73 },
      { piece: 'r',      logp: -3.92 },
    ],
    patternsFired: 4,
    patterns: [
      { gap: '(1, 2, 3)',    bucket: 11, uniq: 9, top1Share: 0.23, topCands: [{ piece: 'steven', q: 0.23 }, { piece: 'i', q: 0.23 }, { piece: 'ken', q: 0.08 }] },
      { gap: '(1, 2, 3, 4)', bucket:  2, uniq: 1, top1Share: 1.00, topCands: [{ piece: 'steven', q: 1.00 }] },
      { gap: '(1, 3, 5)',    bucket:  2, uniq: 1, top1Share: 1.00, topCands: [{ piece: 'steven', q: 1.00 }] },
      { gap: '(1, 2)',       bucket: 72, uniq: 20, top1Share: 0.30, topCands: [{ piece: 'g', q: 0.30 }, { piece: 'south', q: 0.12 }, { piece: 'justice', q: 0.11 }] },
    ],
    evidence: [
      { context: '…stewart, powell, and stevens…',  cont: 'steven' },
      { context: '…powell, and stevens, jj…',       cont: 'steven' },
    ],
    blurb: 'A US Supreme Court opinion that names justices in order. The two narrow patterns ((1,2,3,4) and (1,3,5)) place all their mass on "steven" because their longer keys are unambiguous. The wider gap-(1,2,3) bucket is noisier (q=0.23, tied with "i"). The widest gap-(1,2) bucket is dominated by irrelevant continuations from other contexts. Narrower keys are higher precision; wider keys cast bigger nets but vote for noise. The four matchers compose because their fire confidences are negatively correlated.',
  },
  {
    prefix: '…habitats need to be protected. — ks god declared the creation ‘good’',
    target: '_',
    delta: 0.163,
    nllBefore: 1.250,
    nllAfter: 1.413,
    modelTop5: [
      { piece: '_',         logp: -1.25 },
      { piece: '_the',      logp: -1.25 },
      { piece: '_it',       logp: -2.50 },
      { piece: ',',         logp: -2.80 },
      { piece: '.',         logp: -3.10 },
    ],
    stackTop5: [
      { piece: '_',         logp: -1.41 },
      { piece: '_the',      logp: -1.41 },
      { piece: 'including', logp: -2.78 },
      { piece: '_it',       logp: -2.66 },
      { piece: ',',         logp: -2.96 },
    ],
    patternsFired: 4,
    patterns: [
      { gap: '(1, 2, 3)',    bucket: 3, uniq: 1, top1Share: 1.00, topCands: [{ piece: 'including', q: 1.00 }] },
      { gap: '(1, 2, 3, 4)', bucket: 3, uniq: 1, top1Share: 1.00, topCands: [{ piece: 'including', q: 1.00 }] },
      { gap: '(1, 3, 5)',    bucket: 3, uniq: 1, top1Share: 1.00, topCands: [{ piece: 'including', q: 1.00 }] },
      { gap: '(1, 2)',       bucket: 4, uniq: 1, top1Share: 1.00, topCands: [{ piece: 'including', q: 1.00 }] },
    ],
    evidence: [
      { context: "…created good intentions including…",  cont: 'including' },
      { context: "…of all good intentions including…",   cont: 'including' },
    ],
    blurb: 'The worst case across all 26,369 fires. Earlier in the document the phrase "good intentions including X" appeared a few times. Every R8 pattern confidently votes for "including" with q=1.00. But here the sentence ends differently and the target is whitespace. R8 wastes ≈0.04 of mass on the wrong continuation, costing 0.16 nats. The cost ceiling is set by w_base · top1_share — the matcher cannot blow up.',
  },
]

// ─── Charts ──────────────────────────────────────────────────────────

function DepthCurveChart() {
  const margin = { top: 20, right: 80, bottom: 70, left: 56 }
  return (
    <ParentSize debounceTime={0}>
      {({ width }) => {
        const w = Math.min(width, 580)
        const h = 280
        const xMax = w - margin.left - margin.right
        const yMax = h - margin.top - margin.bottom
        const xScale = scaleLinear({ domain: [0.5, 5.5], range: [0, xMax] })
        const yScale = scaleLinear({ domain: [0, -0.001], range: [yMax, 0] })
        return (
          <svg width={w} height={h} style={{ fontFamily: CHART_FONT, overflow: 'visible' }}>
            <Group left={margin.left} top={margin.top}>
              <GridRows scale={yScale} width={xMax} stroke={PAL.grid} numTicks={5} />
              <LinePath
                data={DEPTH_CURVE.map(d => ({ x: xScale(d.depth), y: yScale(d.delta) }))}
                x={d => d.x}
                y={d => d.y}
                stroke={PAL.data}
                strokeWidth={1.5}
                strokeOpacity={0.35}
              />
              {DEPTH_CURVE.map(d => {
                const isPeak = d.depth === 4
                return (
                  <g key={d.depth}>
                    <Circle
                      cx={xScale(d.depth)}
                      cy={yScale(d.delta)}
                      r={isPeak ? 5 : 4}
                      fill={isPeak ? PAL.accent : PAL.data}
                      fillOpacity={isPeak ? 0.85 : 0.7}
                    />
                    <text
                      x={xScale(d.depth)}
                      y={yScale(d.delta) - 12}
                      textAnchor="middle"
                      fontSize={10}
                      fill={isPeak ? PAL.accent : PAL.data}
                      fontFamily={MONO}
                      fontWeight={isPeak ? 700 : 500}
                    >
                      {d.delta.toFixed(6)}
                    </text>
                    <text
                      x={xScale(d.depth)}
                      y={yMax + 22}
                      textAnchor="middle"
                      fontSize={10}
                      fill={PAL.muted}
                      fontFamily={MONO}
                    >
                      {d.label}
                    </text>
                  </g>
                )
              })}
              <AxisLeft
                scale={yScale}
                numTicks={5}
                stroke={PAL.border}
                tickStroke={PAL.border}
                tickFormat={v => Number(v).toFixed(4)}
                tickLabelProps={tickLabel}
              />
              <text transform={`translate(-44, ${yMax / 2}) rotate(-90)`}
                textAnchor="middle" {...axisLabelStyle}>
                Δ BPB (cumulative, pre-TTT)
              </text>
              <Line from={{ x: 0, y: yMax }} to={{ x: xMax, y: yMax }} stroke={PAL.border} />
              <text x={xMax / 2} y={yMax + 56} textAnchor="middle" {...axisLabelStyle}>
                Stack depth (pattern added at each step)
              </text>
            </Group>
          </svg>
        )
      }}
    </ParentSize>
  )
}

function DeltaHistChart() {
  const margin = { top: 28, right: 16, bottom: 52, left: 60 }
  // Explicit tick values for log scale (otherwise d3 emits 1,2,...,9 per decade).
  const yTicks = [1, 10, 100, 1000, 10000]
  return (
    <ParentSize debounceTime={0}>
      {({ width }) => {
        const w = Math.min(width, 580)
        const h = 260
        const xMax = w - margin.left - margin.right
        const yMax = h - margin.top - margin.bottom
        const labels = DELTA_HIST.map((d) => `${d.lo}…${d.hi}`)
        const xScale = scaleBand({ domain: labels, range: [0, xMax], padding: 0.18 })
        const yScale = scaleLog({ domain: [1, 20000], range: [yMax, 0], base: 10 })
        const helpedCount = DELTA_HIST.filter(d => d.hi <= 0).reduce((s, d) => s + d.count, 0)
        const hurtCount = DELTA_HIST.filter(d => d.lo >= 0).reduce((s, d) => s + d.count, 0)
        return (
          <svg width={w} height={h} style={{ fontFamily: CHART_FONT, overflow: 'visible' }}>
            {/* Legend at top, left-aligned, ABOVE the chart area */}
            <g transform={`translate(${margin.left}, 10)`}>
              <Bar x={0} y={-6} width={10} height={10} fill={PAL.blue} fillOpacity={0.5} rx={1.5} />
              <text x={14} y={3} fontSize={10} fill={PAL.muted} fontFamily={CHART_FONT}>
                helped ({helpedCount.toLocaleString()})
              </text>
              <Bar x={104} y={-6} width={10} height={10} fill={PAL.amber} fillOpacity={0.5} rx={1.5} />
              <text x={118} y={3} fontSize={10} fill={PAL.muted} fontFamily={CHART_FONT}>
                hurt ({hurtCount.toLocaleString()})
              </text>
            </g>
            <Group left={margin.left} top={margin.top}>
              {/* Manual gridlines at decade ticks only */}
              {yTicks.map(t => (
                <Line
                  key={t}
                  from={{ x: 0, y: yScale(t) }}
                  to={{ x: xMax, y: yScale(t) }}
                  stroke={PAL.grid}
                  strokeWidth={1}
                />
              ))}
              {DELTA_HIST.map((d, i) => {
                const isHelp = d.hi <= 0
                const isHurt = d.lo >= 0
                const x = xScale(labels[i])!
                const bw = xScale.bandwidth()
                const yT = yScale(Math.max(1, d.count))
                return (
                  <g key={i}>
                    <Bar
                      x={x}
                      y={yT}
                      width={bw}
                      height={yMax - yT}
                      rx={1.5}
                      fill={isHurt ? PAL.amber : (isHelp ? PAL.blue : PAL.muted)}
                      fillOpacity={0.5}
                    />
                    <text
                      x={x + bw / 2}
                      y={yT - 4}
                      textAnchor="middle"
                      fontSize={9}
                      fill={isHurt ? PAL.amber : (isHelp ? PAL.blue : PAL.data)}
                      fontFamily={MONO}
                      fontWeight={500}
                    >
                      {d.count.toLocaleString()}
                    </text>
                    <text
                      x={x + bw / 2}
                      y={yMax + 14}
                      textAnchor="middle"
                      fontSize={9}
                      fill={PAL.muted}
                      fontFamily={MONO}
                    >
                      {d.lo}
                    </text>
                  </g>
                )
              })}
              {/* Manual y-axis with explicit ticks */}
              <Line from={{ x: 0, y: 0 }} to={{ x: 0, y: yMax }} stroke={PAL.border} strokeWidth={1} />
              {yTicks.map(t => (
                <g key={`tick-${t}`}>
                  <Line
                    from={{ x: -3, y: yScale(t) }}
                    to={{ x: 0, y: yScale(t) }}
                    stroke={PAL.border}
                  />
                  <text
                    x={-7}
                    y={yScale(t) + 3}
                    textAnchor="end"
                    fontSize={10}
                    fill={PAL.muted}
                    fontFamily={MONO}
                  >
                    {t.toLocaleString()}
                  </text>
                </g>
              ))}
              <text transform={`translate(-46, ${yMax / 2}) rotate(-90)`}
                textAnchor="middle" {...axisLabelStyle}>
                Fires (log scale)
              </text>
              <Line from={{ x: 0, y: yMax }} to={{ x: xMax, y: yMax }} stroke={PAL.border} />
              <text x={xMax / 2} y={yMax + 36} textAnchor="middle" {...axisLabelStyle}>
                Per-fire CE delta (nats; left = helped, right = hurt)
              </text>
            </Group>
          </svg>
        )
      }}
    </ParentSize>
  )
}

// ─── Anatomy table ─────────────────────────────────────────────────

function AnatomyDiagram() {
  type Step = { n: number; name: React.ReactNode; v6: React.ReactNode; r8: React.ReactNode }
  const steps: Step[] = [
    {
      n: 1,
      name: 'Build a key',
      v6: <>longest contiguous suffix of <M expr="\text{ids}[..p{-}1]" /></>,
      r8: 'tokens at fixed gap offsets, packed via bit-shift',
    },
    {
      n: 2,
      name: 'Look up in lost prefix',
      v6: <>find any <M expr="q" /> with matching contiguous suffix</>,
      r8: <>find any <M expr="q" /> with matching gap-offset hash</>,
    },
    {
      n: 3,
      name: 'Read out (cont, count)',
      v6: 'longest match → single best continuation',
      r8: <>top-<M expr="K" /> vote-weighted distribution</>,
    },
    {
      n: 4,
      name: <>Convex mix into <M expr="P_{\text{model}}" /></>,
      v6: <M expr="(1 - w)\, P_{\text{old}} + w\, \delta(\text{hint})" />,
      r8: <M expr="(1 - w)\, P_{\text{old}} + w\, Q_{\text{topK}}" />,
    },
  ]
  return (
    <div className="my-6 border border-zinc-100 rounded-lg overflow-hidden">
      <div className="grid grid-cols-[40px_1fr_1fr_1fr] text-xs font-medium text-zinc-500 border-b border-zinc-100 bg-zinc-50">
        <div className="px-3 py-2.5 border-r border-zinc-100">#</div>
        <div className="px-4 py-2.5 border-r border-zinc-100">Step</div>
        <div className="px-4 py-2.5 border-r border-zinc-100">Tap-In V6</div>
        <div className="px-4 py-2.5">R8 (this post)</div>
      </div>
      {steps.map((s, i) => (
        <div
          key={s.n}
          className={`grid grid-cols-[40px_1fr_1fr_1fr] text-xs ${i % 2 === 0 ? 'bg-white' : 'bg-zinc-50'} ${i < steps.length - 1 ? 'border-b border-zinc-100' : ''}`}
        >
          <div className="px-3 py-3 border-r border-zinc-100 font-mono text-zinc-500">{s.n}</div>
          <div className="px-4 py-3 border-r border-zinc-100 font-medium text-zinc-800">{s.name}</div>
          <div className="px-4 py-3 border-r border-zinc-100 text-zinc-600 leading-relaxed">{s.v6}</div>
          <div className="px-4 py-3 text-zinc-600 leading-relaxed">{s.r8}</div>
        </div>
      ))}
    </div>
  )
}

// ─── R9H grid (token-class hybrid screen) ───────────────────────────
// 30-chunk screen of (E, C) configs: solo Δ BPB and stacked-on-R8 Δ BPB.
// Color-coded cells; winner cell highlighted.
function R9hGrid() {
  type Cell = { e: number; c: number; solo: number | null; stack: number | null }
  // From LOGBOOK 2026-04-30T15:30 R9H grid n=30 screen.
  const data: Cell[] = [
    { e: 1, c: 2, solo: -0.000449, stack: -0.000821 },
    { e: 1, c: 3, solo: -0.000467, stack: -0.000832 },
    { e: 2, c: 2, solo: -0.000707, stack: -0.000912 },
    { e: 2, c: 3, solo: -0.000644, stack: -0.000891 },
    { e: 2, c: 4, solo: -0.000567, stack: null },
    { e: 2, c: 5, solo: -0.000500, stack: -0.000849 },
    { e: 3, c: 1, solo: -0.000627, stack: null },
    { e: 3, c: 2, solo: -0.000568, stack: -0.000864 },
    { e: 3, c: 3, solo: -0.000501, stack: -0.000847 },
    { e: 4, c: 1, solo: -0.000488, stack: null },
    { e: 4, c: 2, solo: -0.000444, stack: -0.000849 },
  ]
  // Find best in each column for highlight
  const bestSolo = data.reduce((b, d) => (d.solo !== null && (b.solo === null || d.solo < b.solo) ? d : b))
  const bestStack = data.reduce((b, d) => (d.stack !== null && (b.stack === null || d.stack < b.stack) ? d : b))

  const cols = 'grid-cols-[88px_1fr_1fr]'
  return (
    <div className="my-6 border border-zinc-100 rounded-lg overflow-hidden">
      <div className={`grid ${cols} text-xs font-medium text-zinc-500 border-b border-zinc-100 bg-zinc-50`}>
        <div className="px-3 py-2.5 border-r border-zinc-100 whitespace-nowrap">(E, C)</div>
        <div className="px-4 py-2.5 border-r border-zinc-100 text-right whitespace-nowrap">solo Δ BPB</div>
        <div className="px-4 py-2.5 text-right whitespace-nowrap">+ R8 4-way Δ BPB</div>
      </div>
      {data.map((d, i) => {
        const winSolo = d === bestSolo
        const winStack = d === bestStack
        return (
          <div
            key={`${d.e}_${d.c}`}
            className={`grid ${cols} text-xs ${i % 2 === 0 ? 'bg-white' : 'bg-zinc-50'} ${i < data.length - 1 ? 'border-b border-zinc-100' : ''}`}
          >
            <div className="px-3 py-2 border-r border-zinc-100 font-mono text-zinc-700 whitespace-nowrap">
              ({d.e}, {d.c})
            </div>
            <div
              className={`px-4 py-2 border-r border-zinc-100 text-right font-mono whitespace-nowrap ${winSolo ? 'font-bold' : ''}`}
              style={{ color: winSolo ? PAL.blue : PAL.muted }}
            >
              {d.solo !== null ? d.solo.toFixed(6) : '—'}
            </div>
            <div
              className={`px-4 py-2 text-right font-mono whitespace-nowrap ${winStack ? 'font-bold' : ''}`}
              style={{ color: winStack ? PAL.blue : PAL.muted }}
            >
              {d.stack !== null ? d.stack.toFixed(6) : '—'}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Case study card (compact, story-first) ─────────────────────────

// Small horizontal viz: target token's logp shifts from `before` to `after`
// on a fixed [-13, 0] axis. The shift magnitude is the visual punch line.
function LogpShift({ before, after, label }: { before: number; after: number; label: string }) {
  const w = 540
  const h = 56
  const margin = { left: 64, right: 14, top: 14, bottom: 28 }
  const xMax = w - margin.left - margin.right
  const ticks = [-12, -10, -8, -6, -4, -2, 0]
  const helpful = after > before
  const dotColor = helpful ? PAL.blue : PAL.amber
  return (
    <ParentSize debounceTime={0}>
      {({ width }) => {
        const ww = Math.min(width, w)
        const innerXMax = ww - margin.left - margin.right
        const xs = scaleLinear({ domain: [-13, 0], range: [0, innerXMax] })
        const yMid = 0
        return (
          <svg width={ww} height={h} style={{ fontFamily: CHART_FONT, overflow: 'visible' }}>
            {/* Token label, vertically centered on the axis line */}
            <text x={margin.left - 8} y={margin.top + 4} textAnchor="end"
              fontSize={10} fontFamily={MONO} fill={PAL.muted}>
              {label}
            </text>
            <Group left={margin.left} top={margin.top}>
              <Line from={{ x: 0, y: yMid }} to={{ x: innerXMax, y: yMid }}
                stroke={PAL.border} strokeWidth={1} />
              {ticks.map(t => (
                <g key={t}>
                  <Line from={{ x: xs(t), y: yMid - 2 }} to={{ x: xs(t), y: yMid + 2 }}
                    stroke={PAL.border} />
                  <text x={xs(t)} y={yMid + 14} textAnchor="middle"
                    fontSize={9} fontFamily={MONO} fill={PAL.muted}>{t}</text>
                </g>
              ))}
              {/* Connector line */}
              <Line from={{ x: xs(before), y: yMid }} to={{ x: xs(after), y: yMid }}
                stroke={dotColor} strokeWidth={2} strokeOpacity={0.6} />
              <Circle cx={xs(before)} cy={yMid} r={3.5} fill={PAL.muted} />
              <Circle cx={xs(after)} cy={yMid} r={4.5} fill={dotColor} />
              {/* "after" label ABOVE axis, prominent (the result) */}
              <text x={xs(after)} y={yMid - 7} textAnchor="middle"
                fontSize={10} fontFamily={MONO} fill={dotColor} fontWeight={700}>
                {after.toFixed(2)}
              </text>
              {/* "before" label BELOW the tick row, small gray (the starting point) */}
              <text x={xs(before)} y={yMid + 26} textAnchor="middle"
                fontSize={9} fontFamily={MONO} fill={PAL.muted}>
                {before.toFixed(2)}
              </text>
            </Group>
          </svg>
        )
      }}
    </ParentSize>
  )
}

// Render a token piece for display. Whitespace gets a visible glyph.
function renderPiece(piece: string): string {
  if (piece === '_' || piece === ' ') return '␣'
  return piece.replace(/^_/, '·')
}

// One chip per pattern. Each chip is a small rect labeled with the gap pattern.
// Fill encodes: blue = confident & correct, gray = correct but noisy, amber = wrong.
// Visual priority: the chip + label are paired, easy to read at a glance.
function PatternVotes({ patterns, target }: { patterns: CaseRecord['patterns']; target: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
      <span className="text-zinc-400 uppercase tracking-widest text-[10px] font-medium">patterns</span>
      {patterns.map((p, i) => {
        const top = p.topCands[0]
        const matches = top && top.piece === target
        const confident = top && top.q >= 0.5
        let bg: string, fg: string, tooltip: string
        if (matches && confident) {
          bg = '#dbeafe'  // blue-100
          fg = PAL.blue
          tooltip = `${p.gap}: top-1 = ${renderPiece(target)} (q=${top.q.toFixed(2)})`
        } else if (matches) {
          bg = '#f4f4f5'  // zinc-100
          fg = PAL.muted
          tooltip = `${p.gap}: ${renderPiece(target)} in top-1 but noisy (q=${top.q.toFixed(2)})`
        } else {
          bg = '#fef3c7'  // amber-100
          fg = PAL.amber
          tooltip = `${p.gap}: top-1 = ${top ? renderPiece(top.piece) : '?'} (q=${top?.q.toFixed(2)}) — wrong`
        }
        return (
          <span
            key={i}
            title={tooltip}
            className="inline-flex items-center px-2 py-0.5 rounded font-medium"
            style={{ backgroundColor: bg, color: fg }}
          >
            {p.gap}
          </span>
        )
      })}
    </div>
  )
}

function CaseStudyCard({
  idx,
  c,
  story,
}: {
  idx: number
  c: CaseRecord
  story: React.ReactNode
}) {
  const helpful = c.delta < 0
  const accentColor = helpful ? PAL.blue : PAL.amber
  // logp_target_before = -nllBefore; logp_target_after = -nllAfter
  const before = -c.nllBefore
  const after = -c.nllAfter

  // R8's collective verdict: tally top-1 across patterns.
  const voteCounts = new Map<string, number>()
  for (const p of c.patterns) {
    const top = p.topCands[0]?.piece
    if (!top) continue
    voteCounts.set(top, (voteCounts.get(top) ?? 0) + 1)
  }
  const consensusEntries = Array.from(voteCounts.entries()).sort((a, b) => b[1] - a[1])
  const matcherBetPiece = consensusEntries[0]?.[0] ?? ''
  const matcherBetCount = consensusEntries[0]?.[1] ?? 0
  const matcherCorrect = matcherBetPiece === c.target
  const renderedTarget = renderPiece(c.target)
  const renderedBet = renderPiece(matcherBetPiece)

  return (
    <div className="my-6 border border-zinc-100 rounded-lg overflow-hidden">
      {/* Header: case # + delta */}
      <div className="px-4 py-2 bg-zinc-50 border-b border-zinc-100 flex items-baseline justify-between">
        <span className="text-[10px] tracking-widest uppercase text-zinc-400 font-medium">
          Case {idx + 1}
        </span>
        <span className="text-xs font-mono font-semibold" style={{ color: accentColor }}>
          Δ {c.delta >= 0 ? '+' : ''}{c.delta.toFixed(2)} nats
        </span>
      </div>

      <div className="px-4 py-4">
        {/* Prefix — single line, target highlighted */}
        <div className="text-[13px] font-mono text-zinc-700 leading-relaxed mb-3 break-words">
          {c.prefix}
          <span className="text-zinc-400">[</span>
          <span className="font-bold" style={{ color: accentColor }}>{renderedTarget}</span>
          <span className="text-zinc-400">]</span>
        </div>

        {/* Verdict: one-line story of "matcher said X, target was Y" */}
        <div className="text-[12px] font-mono mb-4 leading-relaxed">
          <span
            className="px-2 py-1 rounded"
            style={{
              backgroundColor: matcherCorrect ? '#dbeafe' : '#fef3c7',
              color: matcherCorrect ? PAL.blue : PAL.amber,
            }}
          >
            <span className="font-bold">{matcherCorrect ? '✓' : '✗'}</span>
            {' matcher said '}
            <span className="font-bold">{renderedBet}</span>
            <span className="text-[10px] opacity-70">
              {' '}({matcherBetCount}/{c.patterns.length} patterns)
            </span>
          </span>
          {!matcherCorrect && (
            <span className="text-zinc-500 ml-3">
              <span className="text-zinc-400">→ </span>
              target was{' '}
              <span className="font-bold text-zinc-800">{renderedTarget}</span>
            </span>
          )}
        </div>

        {/* Story — 1–2 sentences in plain prose */}
        <p className="text-sm text-zinc-600 leading-relaxed mb-4">{story}</p>

        {/* Logp shift visual — the punch line */}
        <div className="mb-3 -ml-1">
          <LogpShift before={before} after={after} label={renderedTarget} />
        </div>

        {/* Pattern votes — chips paired with labels */}
        <div className="mt-3 mb-1">
          <PatternVotes patterns={c.patterns} target={c.target} />
        </div>

        {/* Evidence — inline, compact */}
        <div className="mt-3 text-xs font-mono text-zinc-500 leading-relaxed">
          <span className="text-zinc-400 uppercase tracking-widest text-[10px] font-medium mr-2">earlier in doc</span>
          <span className="block mt-1 space-y-0.5">
            {c.evidence.slice(0, 3).map((e, i) => (
              <span key={i} className="block">
                {e.context}{' '}
                <span style={{ color: accentColor }}>→ {renderPiece(e.cont)}</span>
              </span>
            ))}
          </span>
        </div>

        {/* Optional: pattern details collapsed */}
        <details className="mt-3 text-xs text-zinc-500">
          <summary className="cursor-pointer hover:text-zinc-700 select-none">
            pattern details
          </summary>
          <div className="mt-2 font-mono space-y-0.5 text-zinc-500">
            {c.patterns.map((p, i) => (
              <div key={i}>
                <span className="text-zinc-700">{p.gap}</span>{' '}
                bucket={p.bucket}, uniq={p.uniq}, q₁={p.top1Share.toFixed(2)} →{' '}
                {p.topCands.slice(0, 3).map(t => `${renderPiece(t.piece)}@${t.q.toFixed(2)}`).join(', ')}
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────

export default function StackingSymbolicMemoryPage() {
  return (
    <div className="max-w-[600px] mx-auto px-5 pt-6 pb-20 text-zinc-800">

      {/* ─── Header ─── */}
      <header className="mb-10">
        <p className="text-xs tracking-widest uppercase text-zinc-400 mb-4">
          Study &middot; April 2026
        </p>
        <h1 className="text-[24px] md:text-[28px] font-semibold leading-snug tracking-tight text-zinc-900 mb-5">
          Stacking Memory at Eval Time
        </h1>
        <p className="text-[15px] text-zinc-500 leading-relaxed">
          A 36M-parameter LM under <a href="https://github.com/openai/parameter-golf"
            className="underline decoration-zinc-300 hover:text-zinc-700">Parameter Golf</a> rules
          can&apos;t see past its 2,048-token attention window. <a href="https://github.com/openai/parameter-golf/pull/1518"
            className="underline decoration-zinc-300 hover:text-zinc-700">Tap-In V6</a> reads
          the lost prefix and recovers some of that signal. We add two more matchers with
          different match criteria. All three follow the same four-step recipe; together
          they lower BPB by <M expr="\sim 0.001" /> pre-TTT, validated across two seeds.
          The load-bearing principle: <em>orthogonal</em> match criteria stack additively;
          same-axis variants cannibalize.
        </p>
      </header>

      <hr className="border-zinc-100 mb-12" />

      {/* ─── 1. The recipe ─── */}
      <section className="mb-16">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">
          The recipe both V6 and R8 follow.
        </h2>
        <p className="text-sm leading-relaxed text-zinc-600 mb-4">
          At each scored position <M expr="p" />, both rules build a small probability
          distribution <M expr="Q_{\text{rule}}(v)" /> from the lost prefix and convex-mix it
          with the model&apos;s output. Four steps. Same contract on both sides:
          causal, normalized, per-document, built only from already-scored tokens.
        </p>

        <AnatomyDiagram />

        <p className="text-sm leading-relaxed text-zinc-600">
          Every <M expr="Q" /> is normalized. Every <M expr="w" /> is in{' '}
          <M expr="[0, 1]" />. The mix preserves{' '}
          <M expr="\sum_v P_{\text{new}}(v) = 1" /> by construction. All four conditions
          of <a className="underline decoration-zinc-300 hover:text-zinc-700"
            href="https://github.com/openai/parameter-golf/issues/1017"
            target="_blank" rel="noopener noreferrer">Issue&nbsp;#1017</a> hold. The only
          thing the two rules disagree on is <strong>step&nbsp;1</strong>: what counts as a
          match. V6 matches contiguous suffixes. R8 matches tokens at fixed gap offsets
          packed into a hash &mdash; <code>(1, 2, 3)</code>, <code>(1, 2, 3, 4)</code>,
          <code> (1, 3, 5)</code>, <code>(1, 2)</code>. Different keys see different
          historical positions. That difference is where the additivity comes from.
        </p>
      </section>

      {/* ─── 2. Mechanism on one position ─── */}
      <section className="mb-16">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">
          The recipe on one real position.
        </h2>
        <p className="text-sm leading-relaxed text-zinc-600 mb-4">
          A position from FineWeb val. The document is some legal text about
          &ldquo;registry,&rdquo; with the phrase <code>registry.jockey</code> appearing
          several times earlier &mdash; all <em>before</em> the model&apos;s 2,048-token
          window. Below is the position itself, what every R8 pattern sees, and what
          the mix does to the model&apos;s top-5.
        </p>

        <CaseStudyCard
          idx={0}
          c={CASES[0]}
          story={
            <>
              The model put <code>ockey</code> at logp <code>&minus;12.4</code>,
              outside its top-5 (top guess: <code>son</code>). R8&apos;s
              gap-<code>(1,2,3)</code> hash over the last three tokens hit
              <strong> 6 historical positions</strong>, every one followed by
              <code> ockey</code>. The mix moves <code>ockey</code> to logp
              <code> &minus;2.11</code> &mdash; new rank&nbsp;3.
            </>
          }
        />

        <p className="text-sm leading-relaxed text-zinc-600 mb-4">
          What each step of the recipe is doing here:
        </p>
        <ol className="text-sm leading-relaxed text-zinc-600 space-y-3 list-none ml-0 mb-4">
          <li>
            <strong>1. Build a key.</strong> R8 with gap <code>(1, 2, 3)</code> reads
            the tokens at <M expr="p-1,\ p-2,\ p-3" /> &mdash; <code>[&quot;j&quot;,
            &quot;registry.&quot;, &quot;.&quot;]</code> &mdash; and packs them into one
            integer hash via bit-shift. Pure causal, target token never read.
          </li>
          <li>
            <strong>2. Look up.</strong> One pass over the lost prefix has built a
            table mapping each gap-offset hash to all observed continuations.
            This key has <strong>6 hits</strong>; every one was followed by
            <code> ockey</code>.
          </li>
          <li>
            <strong>3. Read out.</strong> Top-<M expr="K" /> vote: 100% mass on
            <code> ockey</code>, so <M expr="Q_{\text{rule}}" /> is a Dirac on
            <code> ockey</code>. Confidence-scaling sets{' '}
            <M expr="w = w_{\text{base}} \cdot q_1 = 0.04 \cdot 1.00 = 0.04" />.
          </li>
          <li>
            <strong>4. Mix.</strong>{' '}
            <M expr="P_{\text{new}}(\text{ockey}) = 0.96 \cdot P_{\text{old}}(\text{ockey}) + 0.04 \cdot 1.00 \approx 0.041 + 0.121 = 0.121" />.
            Log-prob shifts from <M expr="-12.4" /> to <M expr="-2.11" />. Ten nats of
            cross-entropy disappear because the matcher remembered what the model
            couldn&apos;t see.
          </li>
        </ol>
        <p className="text-sm leading-relaxed text-zinc-600">
          Three other patterns ((1,2,3,4), (1,3,5), (1,2)) fire on the same
          position with their own keys. They each contribute a smaller, redundant
          push toward <code>ockey</code>. The cumulative shift is what shows in
          the case card above.
        </p>
      </section>

      {/* ─── 3. Why they stack ─── */}
      <section className="mb-16">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">
          Why different keys stack.
        </h2>
        <p className="text-sm leading-relaxed text-zinc-600 mb-4">
          Different gap patterns see different historical positions. If their fire sets
          overlapped completely, adding a second pattern would do nothing. We add four
          patterns one at a time and watch the marginal:
        </p>
        <figure className="my-8">
          <DepthCurveChart />
          <figcaption className="text-xs text-zinc-400 mt-3 leading-relaxed">
            Cumulative <M expr="\Delta\,\text{BPB}" /> (pre-TTT, seed 42) as gap patterns are added.
            Each new pattern adds at least <M expr="6.5 \times 10^{-5}" /> on top of the previous stack.
            Saturation only starts at depth 5.
          </figcaption>
        </figure>
        <p className="text-sm leading-relaxed text-zinc-600">
          Two things to notice. First, the marginals don&apos;t collapse: every added
          pattern brings new fires the earlier patterns missed. Second, the depth-4
          contribution comes from gap <code>(1, 2)</code> &mdash; whose stand-alone
          delta is <em>weaker</em> than gap <code>(1, 2, 3)</code> at depth 1. Patterns
          aren&apos;t ranked by solo strength; they&apos;re ranked by the
          <em> complement</em> they bring to the running stack.
        </p>
      </section>

      {/* ─── 4. Compositional case + failure case ─── */}
      <section className="mb-16">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">
          Two more positions: composition and failure.
        </h2>
        <p className="text-sm leading-relaxed text-zinc-600 mb-2">
          A second case where stacking mattered visibly: Supreme Court justices
          named in order. Two narrow patterns are confident; two wider ones are noisy.
          Mass adds because their confidences correlate negatively.
        </p>
        <CaseStudyCard
          idx={1}
          c={CASES[1]}
          story={
            <>
              Model&apos;s top guess was <code>j</code> (probably the start of
              &ldquo;Justice&rdquo;), with the target <code>steven</code> at logp
              <code> &minus;8.17</code>. The two narrow patterns
              <code> (1,2,3,4)</code> and <code>(1,3,5)</code> each had a bucket
              of just 2, both followed by <code>steven</code>. The wider
              <code> (1,2)</code> bucket of 72 votes was diluted by irrelevant
              continuations and didn&apos;t even put <code>steven</code> in its
              top-3. <strong>Narrower keys are higher precision; wider keys are
              broader nets.</strong> Stacked together they push <code>steven</code> to
              logp <code>&minus;2.52</code>.
            </>
          }
        />

        <p className="text-sm leading-relaxed text-zinc-600 mt-8 mb-2">
          And the worst position across all 26,369 fires &mdash; where R8 is wrong
          with high confidence:
        </p>
        <CaseStudyCard
          idx={2}
          c={CASES[2]}
          story={
            <>
              Earlier in the document, the phrase &ldquo;good intentions including X&rdquo;
              appeared a few times. Every R8 pattern confidently votes for
              <code> including</code> with <M expr="q = 1" />. But here
              the sentence ends differently and the target is whitespace.
              <strong> R8 wastes <M expr="\approx 0.04" /> of mass on a wrong continuation,
              costing 0.16 nats.</strong> The hurt ceiling is structural &mdash;
              {' '}<M expr="w_{\text{base}} \cdot q_1 \le 0.04" />{' '}&mdash;
              so the matcher can&apos;t blow up.
            </>
          }
        />
      </section>

      {/* ─── 4b. Another axis: token-class hybrid keys ─── */}
      <section className="mb-16">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">
          Another axis: token-class hybrid keys.
        </h2>
        <p className="text-sm leading-relaxed text-zinc-600 mb-4">
          Gap patterns vary <em>which positions</em> the key reads. There&apos;s
          a second knob the gap variants don&apos;t touch: <em>what each slot in
          the key actually holds</em>. R8&apos;s slots are exact token IDs
          (13&nbsp;bits each, full 8,192-vocab). What if some slots were token
          <em> classes</em> instead &mdash; small buckets of similar tokens?
        </p>
        <p className="text-sm leading-relaxed text-zinc-600 mb-4">
          Build a hybrid key with <M expr="E" /> exact slots (anchor positions)
          plus <M expr="C" /> 5-bit token-class slots (context). Call it
          <code> r9h_E_C</code>. Exact slots demand specific tokens; class slots
          generalize across tokens of the same class. The recipe&apos;s steps
          stay identical &mdash; only step&nbsp;1 changes.
        </p>
        <p className="text-sm leading-relaxed text-zinc-600 mb-4">
          A 30-chunk screen across the <M expr="(E, C)" /> grid (single-rule
          alone, then stacked on R8&apos;s 4-way):
        </p>

        <R9hGrid />

        <p className="text-sm leading-relaxed text-zinc-600 mb-4">
          <code>r9h_2_2</code> wins both columns. We validated it on full val
          across two seeds:
        </p>

        <div className="my-6 border border-zinc-100 rounded-lg overflow-hidden">
          <div className="grid grid-cols-[1.4fr_1fr_1fr_70px] text-xs font-medium text-zinc-500 border-b border-zinc-100 bg-zinc-50">
            <div className="px-3 py-2.5 border-r border-zinc-100 whitespace-nowrap">configuration</div>
            <div className="px-3 py-2.5 border-r border-zinc-100 text-right whitespace-nowrap">seed 42</div>
            <div className="px-3 py-2.5 border-r border-zinc-100 text-right whitespace-nowrap">seed 314</div>
            <div className="px-3 py-2.5 text-right whitespace-nowrap">range</div>
          </div>
          {[
            { name: 'r9h_2_2 alone',           s42: -0.000729, s314: -0.000734 },
            { name: 'R8 4-way alone',          s42: -0.000841, s314: -0.000847 },
            { name: 'R8 4-way + r9h_2_2',      s42: -0.001046, s314: -0.001051, win: true },
          ].map((r, i, a) => (
            <div
              key={r.name}
              className={`grid grid-cols-[1.4fr_1fr_1fr_70px] text-xs ${i % 2 === 0 ? 'bg-white' : 'bg-zinc-50'} ${i < a.length - 1 ? 'border-b border-zinc-100' : ''}`}
            >
              <div className={`px-3 py-2.5 border-r border-zinc-100 whitespace-nowrap ${r.win ? 'font-semibold text-zinc-900' : 'text-zinc-700'}`}>{r.name}</div>
              <div className="px-3 py-2.5 border-r border-zinc-100 text-right font-mono text-zinc-600 whitespace-nowrap">{r.s42.toFixed(6)}</div>
              <div className="px-3 py-2.5 border-r border-zinc-100 text-right font-mono text-zinc-600 whitespace-nowrap">{r.s314.toFixed(6)}</div>
              <div className="px-3 py-2.5 text-right font-mono text-zinc-500 whitespace-nowrap">
                {(Math.abs(r.s42 - r.s314) * 1e6).toFixed(0)}e-6
              </div>
            </div>
          ))}
        </div>

        <p className="text-sm leading-relaxed text-zinc-600 mb-4">
          The mean is <M expr="-0.001049" />, range under <M expr="5 \times 10^{-6}" />.
          That&apos;s a 24% bump over R8 alone &mdash; from one new matcher operating
          on a different axis of the recipe.
        </p>
        <p className="text-sm leading-relaxed text-zinc-600">
          The two-axis structure has a sharper rule than the gap-only stacking did.
          <strong> Same-axis variants cannibalize:</strong> R8&nbsp;+&nbsp;<code>r9h_2_2</code>
          plus <code>r9h_2_3</code> (both share <M expr="C=2" /> context depth) is barely
          better than R8&nbsp;+&nbsp;<code>r9h_2_2</code> alone. <strong>Diagonal pairs
          stack:</strong> R8&nbsp;+&nbsp;<code>r9h_2_2</code>&nbsp;+&nbsp;<code>r9h_3_1</code>
          (anchor depth 2&nbsp;then&nbsp;3, context 2&nbsp;then&nbsp;1) is the best
          three-rule combo we&apos;ve seen on the screen substrate. Moves along the
          <em> diagonal</em> of the <M expr="(E, C)" /> grid compose; moves on the same
          row or column don&apos;t. The choice of &ldquo;what fills the key&rdquo; is
          a grid, not a list.
        </p>
      </section>

      {/* ─── 5. Cost asymmetry ─── */}
      <section className="mb-16">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">
          Why a 79% loss rate still helps in aggregate.
        </h2>
        <p className="text-sm leading-relaxed text-zinc-600 mb-4">
          Most fires hurt slightly. A long left tail helps a lot. The aggregate is
          dominated by the tail.
        </p>
        <figure className="my-8">
          <DeltaHistChart />
          <figcaption className="text-xs text-zinc-400 mt-3 leading-relaxed">
            Per-fire CE delta (log scale). 21% of fires lower CE; 79% raise it
            slightly. The negative tail reaches &minus;10 nats; the positive
            ceiling is +0.16 nats. The matcher cannot blow up because the worst
            it can do is move <M expr="w_{\text{base}} \cdot q_1" /> of
            mass &mdash; capped at 4% &mdash; onto a wrong continuation.
          </figcaption>
        </figure>
        <p className="text-sm leading-relaxed text-zinc-600">
          The asymmetry is structural. The hurt ceiling is set by{' '}
          <M expr="w_{\text{base}} \cdot \text{top1\_share} \le 0.04" />. The help floor
          isn&apos;t bounded the same way: when the lost prefix repeats verbatim, the
          matcher can route up to <M expr="w_{\text{base}}" /> of mass onto a token
          the model missed entirely. R8 is a small cheap bet with bounded downside
          and an unbounded right tail.
        </p>
      </section>

      {/* ─── 5b. Engineering note ─── */}
      <section className="mb-16">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">
          Aside: how we measured all of this on CPUs.
        </h2>
        <p className="text-sm leading-relaxed text-zinc-600 mb-4">
          Live inference on the 25M-token val set takes a 4&times;H100&thinsp;hour per
          rule variant. We tried over a hundred variants. The trick is to dump
          logits <em>once</em>, then re-mix from cache:
        </p>
        <div className="my-6 bg-zinc-50 border border-zinc-100 rounded-lg px-5 py-4 text-[12px] font-mono leading-relaxed text-zinc-700 overflow-x-auto">
          <div className="text-zinc-400 mb-1">research</div>
          <div>GPU forward &rarr; cache (W,T,V) bf16 &rarr; CPU mix &rarr; CE &rarr; Δ BPB</div>
          <div className="text-zinc-400 ml-[7.5ch]">  one time, ~ $5      thousands of variants, ~ $0.05 each</div>
          <div className="mt-3 text-zinc-400 mb-1">submission</div>
          <div>GPU forward &rarr; CPU C++ matcher &rarr; GPU scatter_add_ &rarr; CE &rarr; BPB</div>
          <div className="text-zinc-400 ml-[7.5ch]">  live, end-to-end on 8&times;H100 within 600&thinsp;s</div>
        </div>
        <p className="text-sm leading-relaxed text-zinc-600 mb-4">
          Logits at the same input tokens are deterministic, so caching them and
          replaying thousands of mixers is mathematically equivalent to live
          inference within bf16 precision (about <M expr="1 \times 10^{-5}" /> BPB).
          Every <M expr="\Delta" /> in this post is measured against the same cache;
          any constant offset from bf16 chunking cancels in the difference.
        </p>
        <p className="text-sm leading-relaxed text-zinc-600">
          The submission doesn&apos;t use a cache. Its <code>eval_val_sliding_tapin</code>
          path runs <code>model.forward_logits</code> live on GPU, calls the
          <code> tapin_match_v8_gapped</code> C++ matcher on CPU (one thread per
          window batch via <code>ThreadPoolExecutor</code>), and mixes via
          <code> scatter_add_</code> on GPU. End-to-end inside the 600&thinsp;s eval
          budget. The cache is a research optimization, not a submission shortcut
          &mdash; and it&apos;s why we could iterate on a hundred match-criterion
          variants for less than the cost of one full re-eval.
        </p>
      </section>

      {/* ─── 6. Math ─── */}
      <section className="mb-16">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">
          Why the recipe stays causal.
        </h2>
        <div className="my-6 bg-zinc-50 border border-zinc-100 rounded-lg px-5 py-5">
          <M block expr="P_{\text{new}}(v) \;=\; (1 - w)\, P_{\text{old}}(v) \;+\; w\, Q_{\text{rule}}(v)" />
        </div>
        <p className="text-sm leading-relaxed text-zinc-600">
          With <M expr="\sum_v Q_{\text{rule}}(v) = 1" /> and{' '}
          <M expr="0 \le w \le 1" />, then{' '}
          <M expr="\sum_v P_{\text{new}}(v) = 1" />.
          Sequential application of <M expr="N" /> rules is <M expr="N" /> convex combinations stacked,
          each preserving normalization on its own &mdash; no joint calibration, no shared
          parameter, no order-dependence. The strict-prefix property is structural:
          the lookup table is built from <code>tokens[doc_start : window_start]</code>
          only, which is strictly earlier than the model&apos;s window. There is no
          path by which a matcher reads the target at scoring time.
        </p>
      </section>

      {/* ─── 7. Limits ─── */}
      <section className="mb-16">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">
          What this post does not show.
        </h2>
        <ul className="text-sm leading-relaxed text-zinc-600 space-y-3 list-none">
          <li>
            <strong>Pre-TTT only.</strong> Test-time training shifts the model&apos;s
            distribution toward each evaluated chunk; the matchers will have less
            surprise to capture afterwards. The actual post-TTT delta is unmeasured.
          </li>
          <li>
            <strong>One substrate.</strong> A 4&times;H100 reproduction of a PR1797-style
            model. The deployment substrate (PR&nbsp;#1855 + Tap-In V6) hasn&apos;t been
            run end-to-end with R8 + r9h yet.
          </li>
          <li>
            <strong>Two seeds, not three.</strong> Validated cross-seed at 42 and 314
            within <M expr="5 \times 10^{-6}" /> for both R8 alone and the stacked
            R8&nbsp;+&nbsp;<code>r9h_2_2</code> combo. Seed 1234 cached logits aren&apos;t
            ready; we don&apos;t yet have a Bonferroni-significant 3-seed claim.
          </li>
          <li>
            <strong>Diagonal pair predicted, not measured at full val.</strong> The
            R8&nbsp;+&nbsp;<code>r9h_2_2</code>&nbsp;+&nbsp;<code>r9h_3_1</code> diagonal
            extrapolates from the screen substrate to roughly <M expr="-0.00107" />,
            but we haven&apos;t paid for the full-val run.
          </li>
          <li>
            <strong>Gap patterns hand-picked.</strong> The R8 gap selection is four
            from a dozen tried; the <M expr="(E, C)" /> grid for r9h was systematic.
          </li>
        </ul>
      </section>

      {/* ─── 8. Code + closing ─── */}
      <section className="mb-16">
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">
          Code &amp; what&apos;s next.
        </h2>
        <p className="text-sm leading-relaxed text-zinc-600 mb-4">
          Both matchers are C++ extensions in the existing <code>tapin_cpp.py</code>.
          R8 (gap patterns) and r9h (token-class hybrids) are independent &mdash;
          either can run on its own, and stacking is just sequential application of
          the convex mix.
        </p>
        <div className="my-6 bg-zinc-50 border border-zinc-100 rounded-lg px-5 py-4 text-[13px] text-zinc-700 font-mono leading-relaxed overflow-x-auto">
          <div>TAPIN_V8_ENABLED=1</div>
          <div>TAPIN_V8_GAP_PATTERNS=&quot;1,2,3|1,2,3,4|1,3,5|1,2&quot;</div>
          <div>TAPIN_V8_W_BASES=&quot;0.04,0.04,0.04,0.04&quot;</div>
          <div>TAPIN_V9H=&quot;2_2&quot;     <span className="text-zinc-400"># 2 exact + 2 class slots</span></div>
        </div>
        <p className="text-sm leading-relaxed text-zinc-600 mb-4">
          What we now know that we didn&apos;t when this post started:{' '}
          <strong>cross-axis composition is the load-bearing principle.</strong>{' '}
          One axis (R8 gap patterns) gives <M expr="-0.000841" />. A different
          axis (r9h key shape) gives an additional <M expr="-0.000205" /> on top
          for a total of <M expr="-0.001049" /> mean across two seeds. Same-axis
          variants saturate; orthogonal axes compound.
        </p>
        <p className="text-sm leading-relaxed text-zinc-600">
          What we still don&apos;t know: how much of this survives TTT, how much
          transfers to the actual deployment substrate (PR&nbsp;#1855 + Tap-In V6),
          and how much further the recipe&apos;s remaining axes &mdash; mass source,
          search domain, mix weight &mdash; can push the curve. Three more axes
          to map before we&apos;ve seen the design space.
        </p>
      </section>

      <Comments />
    </div>
  )
}
