// src/lib/getPost.ts
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { Post } from "@/interfaces";


export function getPostSlugs(dir_path: string): string[] {
  const postsDirectory = path.join(process.cwd(), dir_path);
  return fs.readdirSync(postsDirectory);
}

export function getAllPosts(dir_path: string, fields: string[] = []): Post[] {
  const slugs = getPostSlugs(dir_path);
  const posts = slugs.map((slug) => getPostBySlug(slug, dir_path, fields));
  return posts;
}

export function getPostBySlug(slug: string, dir_path: string, fields: string[] = []): Post {
  const postsDirectory = path.join(process.cwd(), dir_path);
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
    if (field === "image") post.image = data.image;
    if (field === "video") post.video = data.video;
  });

  return post;
}
