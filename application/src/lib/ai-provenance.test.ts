import { describe, it, expect } from 'vitest'
import { existsSync, readdirSync, readFileSync } from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { AI_PROVENANCE } from './ai-provenance'

const postsDir = path.join(__dirname, '../app/posts')
const published = readdirSync(postsDir).filter((slug) => {
  const mdx = path.join(postsDir, slug, 'index.mdx')
  return existsSync(mdx) && !matter(readFileSync(mdx, 'utf8')).data.draft
})

describe('AI_PROVENANCE', () => {
  it('has an entry for every published post', () => {
    expect(published.filter((slug) => !AI_PROVENANCE[slug])).toEqual([])
  })

  it('only names posts that exist', () => {
    expect(Object.keys(AI_PROVENANCE).filter((slug) => !published.includes(slug))).toEqual([])
  })
})
