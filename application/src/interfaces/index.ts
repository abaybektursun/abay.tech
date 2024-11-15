// src/interfaces/index.ts
export type Post = {
  slug?: string;
  title?: string;
  author?: string;
  date?: Date;
  content?: string;
  excerpt?: string;
  [key: string]: unknown;
};
