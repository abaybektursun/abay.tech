// src/lib/markdownToHtml.ts
import { remark } from 'remark';
import html from 'remark-html';
import gfm from 'remark-gfm';       // GitHub Flavored Markdown (tables, strikethrough, etc)
import breaks from 'remark-breaks'; // Line breaks
import math from 'remark-math';     // Math expressions
import katex from 'rehype-katex';   // KaTeX rendering for math

export default async function markdownToHtml(markdown: string) {
  const result = await remark()
    .use(breaks)    // Converts single line breaks to <br>
    .use(gfm)       // Adds tables, strikethrough, task lists, URLs, etc
    .use(math)      // Math support
    .use(katex)     // Renders math expressions
    .use(html, {    // HTML conversion with options
      sanitize: false  // Allow raw HTML
    })
    .process(markdown);
  return result.toString();
}