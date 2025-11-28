import { experimental_transcribe as transcribe } from 'ai';
import { openai } from '@ai-sdk/openai';
import { checkTokenLimit, recordTokenUsage } from '@/lib/rate-limit';

// Token-equivalent for audio transcription
// OpenAI Whisper: $0.006/min, GPT-4o-mini: ~$0.00015/1K tokens
// 1 minute ≈ 40K token-equivalents in cost
const TOKENS_PER_MINUTE_AUDIO = 40_000;

export async function POST(req: Request) {
  const limit = await checkTokenLimit();
  if (!limit.success) {
    return Response.json(
      { error: `Token limit exceeded (${limit.limit}). Please try again later.` },
      { status: 429 }
    );
  }

  const formData = await req.formData();
  const audioFile = formData.get('audio') as File;

  if (!audioFile) {
    return Response.json({ error: 'No audio file provided' }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ error: 'OpenAI API key not configured' }, { status: 500 });
  }

  const arrayBuffer = await audioFile.arrayBuffer();

  const result = await transcribe({
    model: openai.transcription('gpt-4o-mini-transcribe'),
    audio: new Uint8Array(arrayBuffer),
  });

  // Record usage based on audio duration
  if (result.durationInSeconds) {
    const tokenEquivalent = Math.ceil((result.durationInSeconds / 60) * TOKENS_PER_MINUTE_AUDIO);
    recordTokenUsage(tokenEquivalent);
  }

  return Response.json({ text: result.text });
}
