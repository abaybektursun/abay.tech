export type AiExecutionTier = 'manual' | 'assisted' | 'conducted' | 'orchestrated'
export type AiProseTier = 'human' | 'polished' | 'coauthored' | 'synthesized'

export interface AiProvenance {
  execution: AiExecutionTier
  prose: AiProseTier
  summary: string
  humanRole: string
}

export const EXECUTION_TIERS: Record<AiExecutionTier, { label: string; description: string }> = {
  manual: {
    label: 'Hand-coded',
    description: 'I wrote and ran the code, experiments, and analysis by hand.',
  },
  assisted: {
    label: 'AI-assisted',
    description: 'AI coding assistants helped with scaffolding, charts, and debugging.',
  },
  conducted: {
    label: 'Agent-conducted',
    description: 'Coding agents built the harness, ran the sweeps, and extracted the data.',
  },
  orchestrated: {
    label: 'Multi-agent',
    description: 'Several agents ran experiments, ablations, and synthesis in parallel.',
  },
}

export const PROSE_TIERS: Record<AiProseTier, { label: string; description: string }> = {
  human: {
    label: 'Human-written',
    description: 'I wrote every sentence; no LLM-generated prose.',
  },
  polished: {
    label: 'AI-edited',
    description: 'I wrote it; LLMs helped copy-edit and tighten.',
  },
  coauthored: {
    label: 'Co-authored',
    description: 'Drafted back and forth: my structure and voice, LLM drafting.',
  },
  synthesized: {
    label: 'AI-drafted',
    description: 'An LLM drafted it from my research logs; I verified it.',
  },
}

export function provenanceLabel(ai: AiProvenance): string {
  return `${EXECUTION_TIERS[ai.execution].label} / ${PROSE_TIERS[ai.prose].label}`
}

export const AI_PROVENANCE: Record<string, AiProvenance> = {
  'stacking-symbolic-memory': {
    execution: 'orchestrated',
    prose: 'coauthored',
    summary:
      'A multi-agent harness ran the 30-chunk (E, C) hybrid screen and the gap-pattern depth sweeps; the narrative was drafted from lab logbooks and edited by me.',
    humanRole:
      'Designed the orthogonal match-criteria hypothesis, directed the ablation sweeps, and verified all mathematical bounds.',
  },
  'borrowed-geometry': {
    execution: 'conducted',
    prose: 'coauthored',
    summary:
      'Coding agents ran the Gemma 4 31B frozen-slice sweeps across CA Rule 90, Cube, and Walker2d; the prose was co-authored with me.',
    humanRole:
      'Originated the exaptation framing, designed the cross-domain tasks, and curated the visual language.',
  },
  'pgolf-meta': {
    execution: 'orchestrated',
    prose: 'coauthored',
    summary:
      'Agents scraped, parsed, and classified 975 Parameter Golf H100 training runs and 409 PRs; the interactive atlas was co-built with AI.',
    humanRole:
      'Defined the validity taxonomy, audited rule violations, and directed the statistical synthesis.',
  },
  'pr-1420-model-autopsy': {
    execution: 'conducted',
    prose: 'synthesized',
    summary:
      'An automated autopsy pipeline ran rate-distortion, loop-amplification, and U-Net skip-gate ablations on the PR #1420 checkpoint.',
    humanRole:
      'Designed the mechanistic autopsy suite and reviewed the diagnostic interpretations.',
  },
  'pr-1105-model-autopsy': {
    execution: 'conducted',
    prose: 'synthesized',
    summary:
      'Agents ran the SVD spectrum, mixed int5/int6 sensitivity, and calibration diagnostics on PR #1105.',
    humanRole:
      'Directed the MLP expansion analysis and verified the quantization sensitivity curves.',
  },
  'pr-1019-model-autopsy': {
    execution: 'conducted',
    prose: 'coauthored',
    summary:
      'Condition-number sweeps and layer-wise quantization autopsies were run with coding agents on my #1 leaderboard GPT.',
    humanRole:
      'Trained the #1 leaderboard submission and designed the mechanistic post-mortem protocol.',
  },
  'eval-time-model-growth': {
    execution: 'assisted',
    prose: 'coauthored',
    summary:
      'The exact distribution-summation and n-gram cache verification scripts were built with AI coding assistance.',
    humanRole:
      'Proved the unnormalized-distribution flaw (summing to 277) and wrote the mathematical critique.',
  },
  'data-ordering': {
    execution: 'conducted',
    prose: 'polished',
    summary:
      '5 experiments across 244,080 FineWeb chunks (1×H100 and 8×H100) ran on agent-assisted harnesses; I wrote the prose and it was lightly polished.',
    humanRole:
      'Formulated the shard-vs-chunk variance hypothesis, ran the 8×H100 curriculum seeds, and wrote the post.',
  },
  'why-does-batch': {
    execution: 'manual',
    prose: 'human',
    summary:
      'Written and coded entirely by hand in 2019, before modern LLM coding assistants existed.',
    humanRole: 'Everything: the prose, the math, and the interactive simulations.',
  },
}
