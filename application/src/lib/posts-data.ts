import 'server-only'
import { readdir, readFile } from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'
import { SERIES_ASSIGNMENT, type Post } from './posts-types'
import { AI_PROVENANCE } from './ai-provenance'

export async function getPosts(opts: { includeDrafts?: boolean } = {}): Promise<Post[]> {
  const dir = path.join(process.cwd(), 'src/app/posts')
  const files = await readdir(dir, { withFileTypes: true })
  const posts = await Promise.all(
    files
      .filter(d => d.isDirectory() && !d.name.startsWith('[') && !d.name.startsWith('.'))
      .map(async (d) => {
        const mdx = path.join(dir, d.name, 'index.mdx')
        const content = await readFile(mdx, 'utf8').catch(() => null)
        if (!content) return null
        const { data } = matter(content)
        if (data.draft && !opts.includeDrafts) return null
        const tags = SERIES_ASSIGNMENT[d.name] ?? []
        return {
          slug: d.name,
          title: data.title ?? d.name,
          subtitle: data.subtitle ?? '',
          image: data.image,
          date: data.date ?? '',
          draft: !!data.draft,
          series: tags[0],
          tags,
          ai: AI_PROVENANCE[d.name],
        } as Post
      })
  )
  return (posts.filter(Boolean) as Post[]).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

export * from './posts-types'
