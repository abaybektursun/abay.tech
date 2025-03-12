// src/app/portfolio/[slug]/page.tsx
import { notFound } from "next/navigation";
//import Comment from "@/components/comment";
import Comment from "@/components/comments";
import Container from "@/components/container";
import distanceToNow from "@/lib/dateRelative";
import { getAllPosts, getPostBySlug } from "@/lib/getPost";
import markdownToHtml from "@/lib/markdownToHtml";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

// Async function to fetch post data
export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug, "src/_portfolio", [
    "slug",
    "title",
    "excerpt",
    "date",
    "content",
  ]);

  if (!post) {
    return notFound(); // Automatically renders a 404 page if the post is missing
  }

  const content = await markdownToHtml(post.content || "");

  return (
    <Container>
      <header>
        <h1 className="text-4xl font-bold">{post.title}</h1>
        {post.excerpt && <p className="mt-2 text-xl">{post.excerpt}</p>}
        <time className="flex mt-2 text-gray-400">
          {post.date ? distanceToNow(new Date(post.date)): "!BROKEN DATE! src/app/port../[slug]/page.tsx"}
        </time>
      </header>

      <article className="prose prose-slate max-w-none mt-10" dangerouslySetInnerHTML={{ __html: content }} />
      <Comment />
    </Container>
  );
}

// Generate dynamic metadata based on the post's title
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug, "src/_portfolio", ["title"]);

  return {
    title: post ? `${post.title} | Abay's Portfolio` : "Post not found",
  };
}

// Static generation of paths for all posts
export async function generateStaticParams() {
  const posts = getAllPosts("src/_portfolio", ["slug"]);

  return posts.map((post) => ({
    slug: post.slug,
  }));
}
