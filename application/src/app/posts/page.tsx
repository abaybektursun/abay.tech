// src/app/posts/page.tsx
import Link from "next/link";
import Container from "@/components/container";
import distanceToNow from "@/lib/dateRelative";
import { getAllPosts } from "@/lib/getPost"; // Ensure this matches your export

export default async function NotePage() {
  const allPosts = getAllPosts(["slug", "title", "excerpt", "date"]);

  return (
    <Container>
      {allPosts.length ? (
        allPosts.map((post) => (
          <article key={post.slug} className="mb-10">
            <Link href={`/posts/${post.slug}`} className="text-lg leading-6 font-bold">
              {post.title}
            </Link>
            <p>{post.excerpt}</p>
            <div className="text-gray-400">
              <time>{post.date ? distanceToNow(new Date(post.date)) : "!Broken date! src/app/posts/page.tsx"}</time>
            </div>
          </article>
        ))
      ) : (
        <p>No blog posted yet :/</p>
      )}
    </Container>
  );
}
