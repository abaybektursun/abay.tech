import Link from 'next/link'
import type { Post } from '@/lib/posts-types'
import { formatDate } from '@/lib/posts-types'
import { provenanceLabel } from '@/lib/ai-provenance'

export default function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/posts/${post.slug}`}>
      <article className="group px-6 py-8 transition-colors hover:bg-gray-50">
        {post.image && (
          <div className="mb-6 overflow-hidden">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-72 object-cover rounded-lg"
            />
          </div>
        )}
        <div className="space-y-3">
          <h2 className="font-semibold text-xl text-gray-900">{post.title}</h2>
          <p className="text-base text-gray-600">{post.subtitle}</p>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500">
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            {post.ai && (
              <>
                <span aria-hidden className="select-none">&middot;</span>
                <span>
                  <span className="sr-only">AI use: </span>
                  {provenanceLabel(post.ai)}
                </span>
              </>
            )}
          </p>
        </div>
      </article>
    </Link>
  )
}
