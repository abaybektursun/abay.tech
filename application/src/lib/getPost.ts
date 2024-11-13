// src/lib/getPost.ts
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { Post } from "@/interfaces";

const postsDirectory = path.join(process.cwd(), "src/_posts");

export function getPostSlugs(): string[] {
  return fs.readdirSync(postsDirectory);
}

export function getAllPosts(fields: string[] = []): Post[] {
  const slugs = getPostSlugs();
  const posts = slugs.map((slug) => getPostBySlug(slug, fields));
  return posts;
}

export function getPostBySlug(slug: string, fields: string[] = []): Post {
  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = path.join(postsDirectory, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  // Use gray-matter to parse the frontmatter
  const { data, content } = matter(fileContents);

  const post: Post = {
    slug: realSlug,
    content,
  };

  fields.forEach((field) => {
    if (field === "content") post.content = content;
    if (field === "date") post.date = data.date ? new Date(data.date) : undefined;
    if (field === "title") post.title = data.title;
    if (field === "excerpt") post.excerpt = data.excerpt;
  });

  return post;
}
