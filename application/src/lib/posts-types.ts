import type { AiProvenance } from './ai-provenance'

export interface Post {
  slug: string
  title: string
  subtitle: string
  image?: string
  date: string
  draft?: boolean
  series?: string
  tags: string[]
  ai?: AiProvenance
}

export interface Series {
  id: string
  label: string
  description: string
  blurb: string
  parent?: string
}

export const SERIES_META: Record<string, Series> = {
  'parameter-golf': {
    id: 'parameter-golf',
    label: 'Parameter Golf',
    description: 'Notes and experiments from a parameter-efficient LM pre-training competition.',
    blurb: 'Data selection, proxy systems, submission cleanup — written around the competition.',
  },
  'model-autopsy': {
    id: 'model-autopsy',
    label: 'Model Autopsies',
    description: 'Post-mortems of specific SOTA Parameter-Golf GPT runs.',
    blurb: 'Condition numbers, quant sensitivity, loop-layer amplification.',
    parent: 'parameter-golf',
  },
}

export interface SeriesNode {
  id: string
  meta: Series
  directPosts: Post[]
  subSeries: SeriesNode[]
  totalCount: number
  latestDate: string
  earliestDate: string
}

export function buildSeriesTree(posts: Post[]): {
  topLevel: SeriesNode[]
  standalone: Post[]
} {
  const childrenOf: Record<string, string[]> = {}
  for (const id of Object.keys(SERIES_META)) {
    const p = SERIES_META[id].parent
    if (p) {
      childrenOf[p] = childrenOf[p] ?? []
      childrenOf[p].push(id)
    }
  }

  const collectDescendantIds = (seriesId: string, acc: Set<string>) => {
    const kids = childrenOf[seriesId] ?? []
    for (const k of kids) {
      acc.add(k)
      collectDescendantIds(k, acc)
    }
  }

  const buildNode = (seriesId: string): SeriesNode => {
    const descendants = new Set<string>()
    collectDescendantIds(seriesId, descendants)
    const directPosts = posts
      .filter(p => p.tags.includes(seriesId) && !p.tags.some(t => descendants.has(t)))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const subSeries = (childrenOf[seriesId] ?? []).map(buildNode)
    const totalCount =
      directPosts.length + subSeries.reduce((s, n) => s + n.totalCount, 0)
    const allDates = [
      ...directPosts.map(p => p.date),
      ...subSeries.flatMap(n => [n.latestDate, n.earliestDate]),
    ].filter(Boolean)
    const sorted = allDates.slice().sort()
    return {
      id: seriesId,
      meta: SERIES_META[seriesId],
      directPosts,
      subSeries,
      totalCount,
      latestDate: sorted[sorted.length - 1] ?? '',
      earliestDate: sorted[0] ?? '',
    }
  }

  const topLevelIds = Object.keys(SERIES_META).filter(id => !SERIES_META[id].parent)
  const topLevel = topLevelIds.map(buildNode).filter(n => n.totalCount > 0)
  const standalone = posts.filter(p => p.tags.length === 0)
  return { topLevel, standalone }
}

export const SERIES_ASSIGNMENT: Record<string, string[]> = {
  'data-ordering': ['parameter-golf'],
  'eval-time-model-growth': ['parameter-golf'],
  'pgolf-meta': ['parameter-golf'],
  'pr-1019-model-autopsy': ['model-autopsy', 'parameter-golf'],
  'pr-1105-model-autopsy': ['model-autopsy', 'parameter-golf'],
  'pr-1420-model-autopsy': ['model-autopsy', 'parameter-golf'],
  'stacking-symbolic-memory': ['parameter-golf'],
  'the-3-dollar-oracle': ['parameter-golf'],
}

export function groupBySeries(posts: Post[]): {
  grouped: Record<string, Post[]>
  standalone: Post[]
} {
  const grouped: Record<string, Post[]> = {}
  const standalone: Post[] = []
  for (const p of posts) {
    if (p.series) {
      grouped[p.series] = grouped[p.series] ?? []
      grouped[p.series].push(p)
    } else {
      standalone.push(p)
    }
  }
  return { grouped, standalone }
}

export function formatDate(date: string): string {
  if (!date) return ''
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatDateShort(date: string): string {
  if (!date) return ''
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
}
