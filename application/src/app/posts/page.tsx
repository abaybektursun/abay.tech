import { Metadata } from 'next'
import { readdir, readFile } from 'fs/promises'
import path from 'path'
import Link from 'next/link'
import matter from 'gray-matter'
import Container from '@/components/container'
import AnimatedPostsList, { AnimatedPostCard } from '@/components/AnimatedPostsList'

export const metadata: Metadata = {
  title: 'Blog Posts',
  description: 'All blog posts'
}

interface Post {
  slug: string
  title: string
  subtitle: string
  image?: string
  date: string
}

async function getPosts(): Promise<Post[]> {
  const postsDirectory = path.join(process.cwd(), 'src/app/posts')
  const files = await readdir(postsDirectory, { withFileTypes: true })
  
  const posts = await Promise.all(
    files
      .filter(dirent => 
        dirent.isDirectory() && 
        !dirent.name.startsWith('[') &&
        !dirent.name.startsWith('.')
      )
      .map(async (dirent) => {
        const postPath = path.join(postsDirectory, dirent.name, 'index.mdx')
        const fileContent = await readFile(postPath, 'utf8')
        const { data } = matter(fileContent)
        
        return {
          slug: dirent.name,
          title: data.title,
          subtitle: data.subtitle,
          image: data.image,
          date: data.date
        }
      })
  )
  
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

function PostCard({ post }: { post: Post }) {
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
          <h2 className="font-semibold text-xl text-gray-900">
            {post.title}
          </h2>
          
          <p className="text-base text-gray-600">
            {post.subtitle}
          </p>

          <time 
            dateTime={post.date}
            className="block text-sm text-gray-500"
          >
            {new Date(post.date + 'T00:00:00').toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric', 
              year: 'numeric'
            })}
          </time>
        </div>
      </article>
    </Link>
  )
}

export default async function PostsPage() {
  const posts = await getPosts()
  
  return (
    <Container>
      <AnimatedPostsList>
        <div>
          {posts.map((post) => (
            <AnimatedPostCard key={post.slug}>
              <div className="border-b border-gray-200 last:border-b-0">
                <PostCard post={post} />
              </div>
            </AnimatedPostCard>
          ))}
        </div>
      </AnimatedPostsList>
    </Container>
  )
}