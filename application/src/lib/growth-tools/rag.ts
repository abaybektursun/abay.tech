/**
 * Unified RAG utility for Growth Tools
 *
 * Loads pre-computed embeddings from any configured RAG folder
 * and provides semantic search over documents.
 */

import { openai } from '@ai-sdk/openai';
import { embed, cosineSimilarity } from 'ai';
import fs from 'fs';
import path from 'path';

interface EmbeddedChunk {
  content: string;
  source: string;
  embedding: number[];
}

export interface SearchResult {
  content: string;
  source: string;
  score: number;
}

// Cache embeddings per folder
const embeddingsCache: Record<string, EmbeddedChunk[]> = {};

/**
 * Load embeddings for a specific RAG folder
 */
function loadEmbeddings(ragFolder: string): EmbeddedChunk[] {
  if (embeddingsCache[ragFolder]) {
    return embeddingsCache[ragFolder];
  }

  const embeddingsPath = path.join(
    process.cwd(),
    'public/rag',
    ragFolder,
    'embeddings.json'
  );

  if (!fs.existsSync(embeddingsPath)) {
    console.warn(`[RAG] Embeddings not found: ${embeddingsPath}`);
    return [];
  }

  const data = fs.readFileSync(embeddingsPath, 'utf-8');
  const chunks = JSON.parse(data);
  embeddingsCache[ragFolder] = chunks;

  console.log(`[RAG] Loaded ${chunks.length} chunks from ${ragFolder}`);
  return chunks;
}

/**
 * Find the most relevant chunks for a given query
 */
export async function findRelevantChunks(
  ragFolder: string,
  query: string,
  limit: number = 4
): Promise<SearchResult[]> {
  const allChunks = loadEmbeddings(ragFolder);

  if (allChunks.length === 0) {
    return [];
  }

  // Embed the query
  const { embedding: queryEmbedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: query,
  });

  // Calculate similarity for each chunk
  const scored = allChunks.map(chunk => ({
    content: chunk.content,
    source: chunk.source,
    score: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));

  // Sort by score descending and take top results
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
