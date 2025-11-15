// src/app/letters/[slug]/page.tsx
import { notFound } from "next/navigation";
//import Comment from "@/components/comment";
import Container from "@/components/container";
import PersonalizedArticle from "@/components/PersonalizedArticle";
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
  const post = getPostBySlug(slug, "src/app/letters/_content", [
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

      <PersonalizedArticle html={content} className="prose prose-slate max-w-none mt-10" />
    </Container>
  );
}

// Generate dynamic metadata based on the post's title
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug, "src/app/letters/_content", ["title"]);

  return {
    title: post ? `${post.title} | Abay's Letters` : "Post not found",
  };
}

// Static generation of paths for all posts
export async function generateStaticParams() {
  const posts = getAllPosts("src/app/letters/_content", ["slug"]);

  return posts.map((post) => ({
    slug: post.slug,
  }));
}
