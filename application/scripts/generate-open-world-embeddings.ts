/**
 * One-time script to generate embeddings for Open World Mode RAG
 *
 * Usage: npx tsx scripts/generate-open-world-embeddings.ts
 *
 * This reads all markdown files from the scrappy_mindset submodule,
 * chunks them, generates embeddings, and saves to a JSON file.
 */

import { openai } from '@ai-sdk/openai';
import { embedMany } from 'ai';
import fs from 'fs';
import path from 'path';

const DOCS_DIR = path.join(
  process.cwd(),
  'src/app/api/apps/growth-tools/open-world-mode/scrappy_mindset'
);

const OUTPUT_FILE = path.join(
  process.cwd(),
  'src/app/api/apps/growth-tools/open-world-mode/scrappy_mindset/embeddings.json'
);

// Files to process (skip PDFs, Python scripts, etc.)
const MARKDOWN_FILES = [
  'KeyMindset.md',
  'scrappyOS.md',
  'book_plan.md',
  'secret_manual.md',
  'the book/intro.md',
  'the book/level_1_asymmetry_exploit.md',
  'the book/level_2_arbitrage_protocol.md',
  'the book/level_3_leverage_protocol.md',
  'the book/level_4_identity_ui_hack.md',
  'the book/level_5_chaos_algorithm.md',
  'the book/level_6_overclock.md',
  'the book/close_respawn_point.md',
];

interface Chunk {
  content: string;
  source: string;
  embedding?: number[];
}

/**
 * Split text into chunks of roughly targetSize characters,
 * breaking on paragraph boundaries when possible.
 */
function chunkText(text: string, source: string, targetSize = 800): Chunk[] {
  const chunks: Chunk[] = [];

  // Split on double newlines (paragraphs)
  const paragraphs = text.split(/\n\n+/);

  let currentChunk = '';

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    if (!trimmed) continue;

    // If adding this paragraph would exceed target, save current chunk
    if (currentChunk && (currentChunk.length + trimmed.length > targetSize)) {
      chunks.push({ content: currentChunk.trim(), source });
      currentChunk = '';
    }

    // If single paragraph is larger than target, split it further
    if (trimmed.length > targetSize) {
      // Save any accumulated content first
      if (currentChunk) {
        chunks.push({ content: currentChunk.trim(), source });
        currentChunk = '';
      }

      // Split large paragraph on sentences
      const sentences = trimmed.split(/(?<=[.!?])\s+/);
      let sentenceChunk = '';

      for (const sentence of sentences) {
        if (sentenceChunk.length + sentence.length > targetSize) {
          if (sentenceChunk) {
            chunks.push({ content: sentenceChunk.trim(), source });
          }
          sentenceChunk = sentence;
        } else {
          sentenceChunk += (sentenceChunk ? ' ' : '') + sentence;
        }
      }

      if (sentenceChunk) {
        currentChunk = sentenceChunk;
      }
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + trimmed;
    }
  }

  // Don't forget the last chunk
  if (currentChunk.trim()) {
    chunks.push({ content: currentChunk.trim(), source });
  }

  return chunks;
}

async function main() {
  console.log('🔍 Reading markdown files...\n');

  const allChunks: Chunk[] = [];

  for (const file of MARKDOWN_FILES) {
    const filePath = path.join(DOCS_DIR, file);

    if (!fs.existsSync(filePath)) {
      console.log(`  ⚠️  Skipping ${file} (not found)`);
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const chunks = chunkText(content, file);
    allChunks.push(...chunks);

    console.log(`  ✓ ${file}: ${chunks.length} chunks`);
  }

  console.log(`\n📊 Total chunks: ${allChunks.length}`);
  console.log('\n🧠 Generating embeddings (this may take a minute)...\n');

  // Generate embeddings in batches to avoid rate limits
  const BATCH_SIZE = 50;
  const embeddings: number[][] = [];

  for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
    const batch = allChunks.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(allChunks.length / BATCH_SIZE);

    console.log(`  Processing batch ${batchNum}/${totalBatches}...`);

    const { embeddings: batchEmbeddings } = await embedMany({
      model: openai.embedding('text-embedding-3-small'),
      values: batch.map(c => c.content),
    });

    embeddings.push(...batchEmbeddings);
  }

  // Combine chunks with their embeddings
  const result = allChunks.map((chunk, i) => ({
    content: chunk.content,
    source: chunk.source,
    embedding: embeddings[i],
  }));

  // Save to JSON
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));

  console.log(`\n✅ Done! Saved ${result.length} embeddings to:`);
  console.log(`   ${OUTPUT_FILE}`);

  // Show file size
  const stats = fs.statSync(OUTPUT_FILE);
  const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
  console.log(`   File size: ${sizeMB} MB`);
}

main().catch(console.error);
