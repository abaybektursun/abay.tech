import { Metadata } from 'next'
import Container from '@/components/container'
import { AnimatedSection } from '@/components/AnimatedPageWrapper'
import { getPosts } from '@/lib/posts-data'
import { buildSeriesTree, type Post, type SeriesNode } from '@/lib/posts-types'
import PostCard from '@/components/PostCard'
import SeriesStackCard from '@/components/SeriesStackCard'

export const metadata: Metadata = {
  title: 'Blog Posts',
  description: 'All blog posts',
}

type FeedItem =
  | { kind: 'post'; date: string; post: Post }
  | { kind: 'series'; date: string; node: SeriesNode }

export default async function PostsPage() {
  const posts = await getPosts()
  const { topLevel, standalone } = buildSeriesTree(posts)

  const feed: FeedItem[] = []
  for (const p of standalone) feed.push({ kind: 'post', date: p.date, post: p })
  for (const n of topLevel) feed.push({ kind: 'series', date: n.latestDate, node: n })
  feed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <Container>
      <AnimatedSection className="max-w-2xl mx-auto px-4" variant="softFadeUp">
        <div>
          {feed.map((item, i) => (
            <div
              key={item.kind === 'post' ? item.post.slug : item.node.id}
              className={i < feed.length - 1 ? 'border-b border-gray-200' : ''}
            >
              {item.kind === 'post' ? (
                <PostCard post={item.post} />
              ) : (
                <SeriesStackCard node={item.node} />
              )}
            </div>
          ))}
        </div>
      </AnimatedSection>
    </Container>
  )
}
