import { experimental_generateSpeech as generateSpeech } from 'ai';
import { openai } from '@ai-sdk/openai';
import { checkTokenLimit, recordTokenUsage } from '@/lib/rate-limit';

// Token-equivalent for TTS
// OpenAI TTS-1: $0.015/1K chars, GPT-4o-mini: ~$0.00015/1K tokens
// 1K characters ≈ 100K token-equivalents in cost
const TOKENS_PER_1K_CHARS = 100_000;

export async function POST(req: Request) {
  const limit = await checkTokenLimit();
  if (!limit.success) {
    return Response.json(
      { error: `Token limit exceeded (${limit.limit}). Please try again later.` },
      { status: 429 }
    );
  }

  const { text } = await req.json();

  if (!text) {
    return Response.json({ error: 'No text provided' }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ error: 'OpenAI API key not configured' }, { status: 500 });
  }

  const { audio } = await generateSpeech({
    model: openai.speech('gpt-4o-mini-tts'),
    text,
    voice: 'coral', // Fast, warm voice
    outputFormat: 'opus', // Smaller file size than mp3
    speed: 1.15, // Slightly faster speech
  });

  // Record usage based on text length
  const tokenEquivalent = Math.ceil((text.length / 1000) * TOKENS_PER_1K_CHARS);
  recordTokenUsage(tokenEquivalent);

  const binaryData = Buffer.from(audio.base64, 'base64');

  return new Response(binaryData, {
    headers: {
      'Content-Type': audio.mediaType,
    },
  });
}
