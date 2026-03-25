'use client'

import React from 'react'
import { Group } from '@visx/group'
import { scaleBand, scaleLinear, scaleLog } from '@visx/scale'
import { Bar, Line, Circle } from '@visx/shape'
import { AxisBottom, AxisLeft } from '@visx/axis'
import { GridRows } from '@visx/grid'
import { ParentSize } from '@visx/responsive'

// ─── Design tokens ───────────────────────────────────────────────────
// Near-monochrome. One restrained accent. No bright colors.
const CHART_FONT = 'Inter, system-ui, -apple-system, sans-serif'
const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace'

const PAL = {
  data: '#27272a',       // zinc-800 — all primary data
  dataLight: '#27272a',  // same, use opacity to lighten
  muted: '#71717a',      // zinc-500 — axis labels, secondary text
  grid: '#f4f4f5',       // zinc-100 — grid lines
  border: '#e4e4e7',     // zinc-200 — axis lines
  accent: '#991b1b',     // red-800 — restrained, used sparingly
  accentLight: '#991b1b', // same, use opacity
} as const

// ─── Data ────────────────────────────────────────────────────────────

const SHARD_CE = [
  6.0826,6.0839,6.0846,6.0857,6.0864,6.0868,6.0871,6.0872,6.0874,6.0875,
  6.0877,6.0883,6.0884,6.0884,6.0886,6.0887,6.0888,6.0892,6.0892,6.0893,
  6.0895,6.0897,6.0901,6.0903,6.0903,6.0904,6.0905,6.0905,6.0906,6.0907,
  6.0909,6.0910,6.0911,6.0917,6.0919,6.0921,6.0928,6.0928,6.0928,6.0930,
  6.0930,6.0931,6.0933,6.0938,6.0939,6.0940,6.0941,6.0941,6.0942,6.0944,
  6.0944,6.0944,6.0946,6.0947,6.0947,6.0948,6.0948,6.0954,6.0956,6.0964,
  6.0966,6.0968,6.0969,6.0970,6.0970,6.0971,6.0976,6.0978,6.0978,6.0979,
  6.0980,6.0983,6.0988,6.0988,6.0994,6.0995,6.0998,6.1004,6.1006,6.1009,
]

const HIST_BINS = [
  { label: '<5.9', count: 2200, selected: true },
  { label: '5.9–6.0', count: 22000, selected: true },
  { label: '6.0–6.05', count: 39000, selected: true },
  { label: '6.05–6.1', count: 58000, selected: false },
  { label: '6.1–6.15', count: 46000, selected: false },
  { label: '6.15–6.2', count: 30000, selected: false },
  { label: '6.2–6.3', count: 22000, selected: false },
  { label: '6.3–6.5', count: 14000, selected: false },
  { label: '6.5–7.0', count: 7000, selected: false },
  { label: '>7.0', count: 3880, selected: false },
]

const RESULTS = [
  { run: 'Bigram-selected', bpb: 1.3127, delta: +0.0072 },
  { run: 'Neural-selected', bpb: 1.3112, delta: +0.0057 },
  { run: 'Baseline (random)', bpb: 1.3055, delta: 0 },
]

// ─── Shared axis style ───────────────────────────────────────────────
const tickLabel = { fontSize: 11, fill: PAL.muted, fontFamily: CHART_FONT, fontWeight: 400 as const }
const axisLabelStyle = { fontSize: 11, fill: PAL.muted, fontFamily: CHART_FONT, fontWeight: 500 as const }

// ─── Charts ──────────────────────────────────────────────────────────

function ShardFlatlineChart() {
  const margin = { top: 20, right: 40, bottom: 48, left: 58 }
  const mean = SHARD_CE.reduce((a, b) => a + b) / SHARD_CE.length
  return (
    <ParentSize debounceTime={0}>
      {({ width }) => {
        const w = Math.min(width, 540)
        const h = 210
        const xMax = w - margin.left - margin.right
        const yMax = h - margin.top - margin.bottom
        const xScale = scaleLinear({ domain: [0, 79], range: [0, xMax] })
        const yScale = scaleLinear({ domain: [6.078, 6.105], range: [yMax, 0] })
        return (
          <svg width={w} height={h} style={{ fontFamily: CHART_FONT, overflow: 'visible' }}>
            <Group left={margin.left} top={margin.top}>
              <GridRows scale={yScale} width={xMax} stroke={PAL.grid} numTicks={5} />
              <Line from={{ x: 0, y: yScale(mean) }} to={{ x: xMax, y: yScale(mean) }}
                stroke={PAL.data} strokeDasharray="5,4" strokeWidth={1} strokeOpacity={0.3} />
              {SHARD_CE.map((ce, i) => (
                <Circle key={i} cx={xScale(i)} cy={yScale(ce)} r={2.5}
                  fill={PAL.data} fillOpacity={0.55} />
              ))}
              {/* Bracket */}
              <Line from={{ x: xMax + 8, y: yScale(6.101) }} to={{ x: xMax + 8, y: yScale(6.083) }}
                stroke={PAL.muted} strokeWidth={1} />
              <Line from={{ x: xMax + 5, y: yScale(6.101) }} to={{ x: xMax + 11, y: yScale(6.101) }}
                stroke={PAL.muted} strokeWidth={1} />
              <Line from={{ x: xMax + 5, y: yScale(6.083) }} to={{ x: xMax + 11, y: yScale(6.083) }}
                stroke={PAL.muted} strokeWidth={1} />
              <text x={xMax + 16} y={yScale((6.101 + 6.083) / 2)} dominantBaseline="central"
                fontSize={10} fill={PAL.data} fontFamily={MONO} fontWeight={600}>0.018</text>

              <AxisLeft scale={yScale} numTicks={5} stroke={PAL.border} tickStroke={PAL.border}
                tickLabelProps={tickLabel} />
              <text transform={`translate(-46, ${yMax / 2}) rotate(-90)`}
                textAnchor="middle" {...axisLabelStyle}>Cross-entropy (bits)</text>
              <AxisBottom scale={xScale} top={yMax} numTicks={0} stroke={PAL.border} />
              <text x={xMax / 2} y={yMax + 34} textAnchor="middle" {...axisLabelStyle}>
                80 shards, ranked
              </text>
            </Group>
          </svg>
        )
      }}
    </ParentSize>
  )
}

function VarianceChart() {
  const margin = { top: 16, right: 80, bottom: 36, left: 120 }
  const rows = [
    { label: 'Between shards', value: 0.000018 },
    { label: 'Within shards', value: 0.009809 },
  ]
  // Explicit log ticks at powers of 10
  const logTicks = [0.00001, 0.0001, 0.001, 0.01]
  const logLabels: Record<number, string> = { 0.00001: '10⁻⁵', 0.0001: '10⁻⁴', 0.001: '10⁻³', 0.01: '10⁻²' }
  return (
    <ParentSize debounceTime={0}>
      {({ width }) => {
        const w = Math.min(width, 500)
        const h = 120
        const xMax = w - margin.left - margin.right
        const yMax = h - margin.top - margin.bottom
        const xScale = scaleLog({ domain: [0.000006, 0.02], range: [0, xMax] })
        const yScale = scaleBand({ domain: rows.map(d => d.label), range: [0, yMax], padding: 0.35 })
        return (
          <figure className="my-6">
            <svg width={w} height={h} style={{ fontFamily: CHART_FONT, overflow: 'visible' }}>
              <Group left={margin.left} top={margin.top}>
                {/* Vertical grid at powers of 10 — visually signals log scale */}
                {logTicks.map(t => (
                  <Line key={t} from={{ x: xScale(t), y: -4 }} to={{ x: xScale(t), y: yMax + 4 }}
                    stroke={PAL.grid} strokeWidth={1} />
                ))}
                {/* Bars */}
                {rows.map(d => (
                  <g key={d.label}>
                    <Bar x={0} y={yScale(d.label)!} width={xScale(d.value)} height={yScale.bandwidth()}
                      rx={2} fill={PAL.data} fillOpacity={d.value > 0.001 ? 0.75 : 0.3} />
                    <text x={xScale(d.value) + 8} y={yScale(d.label)! + yScale.bandwidth() / 2}
                      dominantBaseline="central" fontSize={10} fill={PAL.data}
                      fontFamily={MONO} fontWeight={d.value > 0.001 ? 600 : 400}>
                      {d.value.toFixed(6)}
                    </text>
                  </g>
                ))}
                <AxisLeft scale={yScale} hideTicks hideAxisLine
                  tickLabelProps={{ fontSize: 11, fill: PAL.muted, fontFamily: CHART_FONT, fontWeight: 500 as const }} />
                {/* Manual x-axis ticks at powers of 10 */}
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
              </Group>
            </svg>
            <figcaption className="text-xs text-zinc-400 mt-1 ml-1">
              Within-shard variance is <span className="font-mono font-semibold text-zinc-700">535&times;</span> larger.
            </figcaption>
          </figure>
        )
      }}
    </ParentSize>
  )
}

function ChunkDistributionChart() {
  const margin = { top: 32, right: 20, bottom: 76, left: 58 }
  return (
    <ParentSize debounceTime={0}>
      {({ width }) => {
        const w = Math.min(width, 540)
        const h = 310
        const xMax = w - margin.left - margin.right
        const yMax = h - margin.top - margin.bottom
        const xScale = scaleBand({ domain: HIST_BINS.map(d => d.label), range: [0, xMax], padding: 0.1 })
        const yScale = scaleLinear({ domain: [0, 62000], range: [yMax, 0] })
        // Position cutoff cleanly between the last selected bar and first discarded bar
        const lastSelected = xScale('6.0–6.05')! + xScale.bandwidth()
        const firstDiscarded = xScale('6.05–6.1')!
        const cutoffX = (lastSelected + firstDiscarded) / 2
        return (
          <svg width={w} height={h} style={{ fontFamily: CHART_FONT, overflow: 'visible' }}>
            <Group left={margin.left} top={margin.top}>
              <GridRows scale={yScale} width={xMax} stroke={PAL.grid} numTicks={4} />
              {HIST_BINS.map(d => (
                <Bar key={d.label} x={xScale(d.label)!} y={yScale(d.count)}
                  width={xScale.bandwidth()} height={yMax - yScale(d.count)} rx={2}
                  fill={PAL.data} fillOpacity={d.selected ? 0.75 : 0.15}
                  stroke={PAL.data} strokeOpacity={d.selected ? 0.4 : 0.12} strokeWidth={1} />
              ))}
              <Line from={{ x: cutoffX, y: -14 }} to={{ x: cutoffX, y: yMax + 4 }}
                stroke={PAL.accent} strokeWidth={1.5} strokeDasharray="6,4" strokeOpacity={0.45} />
              <text x={cutoffX + 8} y={-4} fontSize={10} fill={PAL.accent} opacity={0.7}
                fontFamily={CHART_FONT} fontWeight={600}>selection cutoff</text>
              <text x={cutoffX / 2} y={yScale(60000)} textAnchor="middle"
                fontSize={11} fill={PAL.data} fontFamily={CHART_FONT} fontWeight={600}>selected</text>
              <text x={cutoffX + (xMax - cutoffX) / 2} y={yScale(56000)} textAnchor="middle"
                fontSize={11} fill={PAL.muted} fontFamily={CHART_FONT}>discarded</text>

              <AxisLeft scale={yScale} numTicks={4} stroke={PAL.border} tickStroke={PAL.border}
                tickFormat={v => `${Number(v) / 1000}k`} tickLabelProps={tickLabel} />
              <text transform={`translate(-46, ${yMax / 2}) rotate(-90)`}
                textAnchor="middle" {...axisLabelStyle}>Number of chunks</text>
              <AxisBottom scale={xScale} top={yMax} stroke={PAL.border} tickStroke={PAL.border}
                tickLabelProps={{ ...tickLabel, fontSize: 9, angle: -35, textAnchor: 'end' as const, dy: -2, dx: -4 }} />
              <text x={xMax / 2} y={yMax + 62} textAnchor="middle" {...axisLabelStyle}>
                Cross-entropy under val model (bits)
              </text>
            </Group>
          </svg>
        )
      }}
    </ParentSize>
  )
}

function CurriculumChart() {
  const margin = { top: 20, right: 70, bottom: 36, left: 70 }
  const seeds = [
    { seed: '1337', base: 1.1192, reord: 1.1183 },
    { seed: '42', base: 1.1200, reord: 1.1181 },
    { seed: '2025', base: 1.1189, reord: 1.1198 },
  ]
  return (
    <ParentSize debounceTime={0}>
      {({ width }) => {
        const w = Math.min(width, 480)
        const h = 160
        const xMax = w - margin.left - margin.right
        const yMax = h - margin.top - margin.bottom
        const xScale = scaleLinear({ domain: [1.1170, 1.1210], range: [0, xMax] })
        const yScale = scaleBand({ domain: seeds.map(d => d.seed), range: [0, yMax], padding: 0.4 })
        return (
          <figure className="my-6">
            <figcaption className="text-xs font-medium text-zinc-600 mb-2 ml-1">
              3-seed comparison &mdash; val_bpb (lower is better)
            </figcaption>
            <svg width={w} height={h} style={{ fontFamily: CHART_FONT, overflow: 'visible' }}>
              <Group left={margin.left} top={margin.top}>
                <GridRows scale={yScale} width={xMax} stroke={PAL.grid} />
                {seeds.map(d => {
                  const y = yScale(d.seed)! + yScale.bandwidth() / 2
                  const improved = d.reord < d.base
                  return (
                    <g key={d.seed}>
                      {/* Connector line — ends outside the circles */}
                      {(() => {
                        const x1 = xScale(d.base)
                        const x2 = xScale(d.reord)
                        const r = 6
                        const dir = x2 > x1 ? 1 : -1
                        return (
                          <Line from={{ x: x1 + dir * r, y }} to={{ x: x2 - dir * r, y }}
                            stroke={PAL.data} strokeWidth={1.5} strokeOpacity={0.2} />
                        )
                      })()}
                      {/* Baseline dot */}
                      <Circle cx={xScale(d.base)} cy={y} r={5}
                        fill={PAL.data} fillOpacity={0.4} />
                      {/* Reordered dot */}
                      <Circle cx={xScale(d.reord)} cy={y} r={5}
                        fill={improved ? '#16a34a' : PAL.accent} />
                      {/* Delta label */}
                      <text x={xScale(Math.max(d.base, d.reord)) + 10} y={y}
                        dominantBaseline="central" fontSize={10}
                        fill={improved ? '#16a34a' : PAL.accent}
                        fontFamily={MONO} fontWeight={600}>
                        {improved ? '' : '+'}{(d.reord - d.base).toFixed(4)}
                      </text>
                    </g>
                  )
                })}
                <AxisLeft scale={yScale} hideTicks hideAxisLine
                  tickFormat={v => `seed ${v}`}
                  tickLabelProps={{ fontSize: 10, fill: PAL.muted, fontFamily: CHART_FONT }} />
                <AxisBottom scale={xScale} top={yMax} numTicks={4} stroke={PAL.border}
                  tickStroke={PAL.border}
                  tickLabelProps={{ fontSize: 9, fill: PAL.muted, fontFamily: MONO }} />
              </Group>
            </svg>
            <figcaption className="text-xs text-zinc-400 mt-1 ml-1">
              Faded dots = baseline. Colored dots = hardest-first.
              Mean &Delta;: &minus;0.0006 (95% CI spans zero).
            </figcaption>
          </figure>
        )
      }}
    </ParentSize>
  )
}

function ResultsChart() {
  const margin = { top: 8, right: 76, bottom: 8, left: 160 }
  return (
    <ParentSize debounceTime={0}>
      {({ width }) => {
        const w = Math.min(width, 520)
        const h = 130
        const xMax = w - margin.left - margin.right
        const yMax = h - margin.top - margin.bottom
        const xScale = scaleLinear({ domain: [1.298, 1.320], range: [0, xMax] })
        const yScale = scaleBand({ domain: RESULTS.map(d => d.run), range: [0, yMax], padding: 0.3 })
        return (
          <svg width={w} height={h} style={{ fontFamily: CHART_FONT, overflow: 'visible' }}>
            <Group left={margin.left} top={margin.top}>
              {/* Baseline reference */}
              <Line from={{ x: xScale(1.3055), y: -6 }} to={{ x: xScale(1.3055), y: yMax + 6 }}
                stroke={PAL.data} strokeWidth={1} strokeDasharray="5,4" strokeOpacity={0.4} />
              {RESULTS.map(d => (
                <g key={d.run}>
                  <Bar x={0} y={yScale(d.run)!} width={xScale(d.bpb)} height={yScale.bandwidth()}
                    rx={2} fill={d.delta === 0 ? PAL.data : PAL.accent}
                    fillOpacity={d.delta === 0 ? 0.45 : 0.55} />
                  <text x={xScale(d.bpb) + 8} y={yScale(d.run)! + yScale.bandwidth() / 2}
                    dominantBaseline="central" fontSize={11}
                    fill={d.delta === 0 ? PAL.data : PAL.accent}
                    fontFamily={MONO} fontWeight={600}>
                    {d.bpb.toFixed(4)}
                  </text>
                </g>
              ))}
              <AxisLeft scale={yScale} hideTicks hideAxisLine
                tickLabelProps={{ fontSize: 11, fill: PAL.data, fontFamily: CHART_FONT, fontWeight: 500 as const }} />
            </Group>
          </svg>
        )
      }}
    </ParentSize>
  )
}

// ─── Page ────────────────────────────────────────────────────────────

export default function DataOrderingPage() {
  return (
    <div className="max-w-[600px] mx-auto px-5 pt-6 pb-16 text-zinc-800">

      <header className="mb-8">
        <p className="text-xs tracking-widest uppercase text-zinc-400 mb-3">
          Negative Result &middot; March 2026
        </p>
        <h1 className="text-[24px] md:text-[28px] font-semibold leading-snug tracking-tight text-zinc-900 mb-4">
          Does Training Data Selection Help for LM Pre-training?
        </h1>
        <p className="text-[15px] text-zinc-500 leading-relaxed">
          <a href="https://github.com/openai/parameter-golf" className="underline decoration-slate-300 hover:text-zinc-700">Parameter Golf</a> is
          a competition to train the best small language model in 10 minutes on{' '}
          <a href="https://huggingface.co/datasets/HuggingFaceFW/fineweb" className="underline decoration-slate-300 hover:text-zinc-700">FineWeb</a> (8B
          tokens, 80 shards). The model never sees all of it before the clock
          runs out. Can we pick a better subset of what it trains on?
        </p>
      </header>

      <hr className="border-zinc-100 mb-10" />

      {/* Act 1: Shards are identical */}
      <section className="mb-14">
        <h2 className="text-lg font-semibold text-zinc-900 mb-3">
          The data comes in 80 shards. They all look the same.
        </h2>
        <p className="text-sm leading-relaxed text-zinc-600 mb-4">
          The first question: are some shards more &ldquo;val-like&rdquo; than others?
          To find out, I trained a simple bigram language model on the validation set &mdash;
          it learns which pairs of tokens are common in val &mdash; then measured how well
          it predicts each training shard. A shard with low cross-entropy has token patterns
          that closely match val.
        </p>
        <figure className="my-6">
          <ShardFlatlineChart />
          <figcaption className="text-xs text-zinc-400 mt-2 leading-relaxed">
            Each dot is one shard scored by a val-trained bigram model.
            The total range &mdash; <span className="font-mono font-semibold">0.018 bits</span> &mdash; is
            negligible. All shards look the same.
          </figcaption>
        </figure>
        <p className="text-sm leading-relaxed text-zinc-600">
          Picking &ldquo;better&rdquo; shards at this level is like choosing English
          books by letter frequency. They&apos;re all English.
        </p>
      </section>

      {/* Act 2: Zoom into chunks */}
      <section className="mb-14">
        <h2 className="text-lg font-semibold text-zinc-900 mb-3">
          But zoom in, and the variation explodes.
        </h2>
        <p className="text-sm leading-relaxed text-zinc-600 mb-4">
          Instead of whole shards, I scored every 32K-token chunk &mdash; 244,080 in total.
          The within-shard variance is <strong className="text-zinc-900">535&times;</strong> larger
          than between-shard variance:
        </p>

        <VarianceChart />

        <p className="text-sm leading-relaxed text-zinc-600 mb-4">
          Cross-entropies range from 4.2 to 9.6 bits. The averaging over 100M
          tokens was hiding everything. So I selected the lowest-CE chunks &mdash;
          those most similar to val &mdash; and trained on those instead:
        </p>
        <figure className="my-6">
          <ChunkDistributionChart />
          <figcaption className="text-xs text-zinc-400 mt-2 leading-relaxed">
            Distribution of chunk cross-entropies.
            Dark bars = selected (lowest-CE chunks). Light bars = discarded.
            Selection keeps the easy center and throws away the diverse right tail.
          </figcaption>
        </figure>
      </section>

      {/* Act 3: Result */}
      <section className="mb-14">
        <h2 className="text-lg font-semibold text-zinc-900 mb-3">
          It made things worse.
        </h2>
        <p className="text-sm leading-relaxed text-zinc-600 mb-4">
          Two scorers &mdash; a bigram model and a 17M-parameter transformer &mdash;
          both selected &ldquo;val-like&rdquo; chunks. Both hurt performance.
        </p>
        <figure className="my-6">
          <figcaption className="text-xs font-medium text-zinc-700 mb-2">
            val_bpb after training &mdash; lower is better
          </figcaption>
          <ResultsChart />
          <figcaption className="text-xs text-zinc-400 mt-2">
            Bars show increase in val_bpb over baseline. Both selection methods made it worse.
          </figcaption>
        </figure>
        <p className="text-sm leading-relaxed text-zinc-600">
          The selected data fit faster (lower training loss) but generalized worse.
          The lowest-CE chunks are generically <em>easy</em> text &mdash; common
          patterns, simple syntax. The hard, diverse examples in the discarded tail
          are exactly what the model needs to learn the full distribution.
        </p>
      </section>

      {/* Act 4: Curriculum learning */}
      <section className="mb-14">
        <h2 className="text-lg font-semibold text-zinc-900 mb-3">
          What about curriculum learning?
        </h2>
        <p className="text-sm leading-relaxed text-zinc-600 mb-3">
          The experiments above select data most similar to val. But what if
          instead of matching the validation distribution, we select by
          <em> difficulty</em>? Train a small model briefly, measure its perplexity
          on each piece of training data, then reorder so the highest-perplexity
          data &mdash; what the model finds hardest &mdash; comes first. The idea:
          spend limited training time on what the model has the most to learn from.
        </p>
        <p className="text-sm leading-relaxed text-zinc-600 mb-3">
          On 8&times;H100 (3 seeds), I ranked the training data by perplexity
          under a partially-trained model, reordered hardest-first, and tested
          against our{' '}
          <a href="https://github.com/openai/parameter-golf/pull/549" className="underline decoration-zinc-300" target="_blank" rel="noopener noreferrer">merged
          #1 submission</a>.
        </p>
        <CurriculumChart />

        <p className="text-sm leading-relaxed text-zinc-600">
          The per-seed deltas range from &minus;0.0019 to +0.0009 &mdash; the 95%
          confidence interval spans zero. That&apos;s noise.
          Different selection criterion, same result: whether you pick data
          that matches val or data the model finds hardest, it doesn&apos;t matter.
        </p>
      </section>

      {/* Act 5: Others on this dataset */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold text-zinc-900 mb-3">
          Others found the same on this dataset.
        </h2>
        <p className="text-sm leading-relaxed text-zinc-600">
          <a href="https://github.com/openai/parameter-golf/pull/737" className="underline decoration-zinc-300" target="_blank" rel="noopener noreferrer">PR #737</a> (entropy
          curriculum): +0.021 worse.{' '}
          <a href="https://github.com/openai/parameter-golf/pull/623" className="underline decoration-zinc-300" target="_blank" rel="noopener noreferrer">PR #623</a>: &ldquo;neutral
          or negative.&rdquo;{' '}
          <a href="https://arxiv.org/abs/2409.05816" className="underline decoration-zinc-300" target="_blank" rel="noopener noreferrer">Sachdeva
          et al.</a> (ICLR 2025) showed perplexity-based selection gives{' '}
          <strong>no benefit on already-filtered data</strong> &mdash;
          which is exactly what FineWeb is.
        </p>
      </section>

      {/* Takeaway */}
      <div className="my-10 border-l-[3px] border-zinc-900 pl-5">
        <p className="text-[15px] leading-relaxed text-zinc-800">
          On FineWeb &mdash; a large, already-filtered web corpus &mdash; the model
          needs the weird stuff: the hard examples, the outliers, the text that looks
          nothing like the test set. For this kind of data, diversity beats selection.
          Whether the same holds on noisier, unfiltered corpora is a different question.
        </p>
      </div>

      <footer className="border-t border-zinc-100 pt-6 text-xs text-zinc-400">
        <p>
          5 experiments, 8 scoring methods, 1&times;H100 + 8&times;H100.
          Baseline:{' '}
          <a href="https://github.com/openai/parameter-golf/pull/549"
          className="underline decoration-slate-300" target="_blank" rel="noopener noreferrer">PR #549</a> (val_bpb 1.1194).
          Code: <code className="font-mono text-zinc-500">experiments/data_order/</code>
        </p>
      </footer>
    </div>
  )
}
