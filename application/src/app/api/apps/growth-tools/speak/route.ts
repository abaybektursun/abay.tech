import { experimental_generateSpeech as generateSpeech } from 'ai';
import { elevenlabs } from '@ai-sdk/elevenlabs';
import { checkTokenLimit, recordTokenUsage } from '@/lib/rate-limit';

// Token-equivalent for TTS
// ElevenLabs: ~$0.18/1K chars (Creator tier), normalize to token-equivalent
// 1K characters ≈ 100K token-equivalents in cost
const TOKENS_PER_1K_CHARS = 100_000;

// Default voice ID (Rachel - calm, professional)
const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM';

export async function POST(req: Request) {
  const limit = await checkTokenLimit();
  if (!limit.success) {
    return Response.json(
      { error: `Token limit exceeded (${limit.limit}). Please try again later.` },
      { status: 429 }
    );
  }

  const { text, voice } = await req.json();

  if (!text) {
    return Response.json({ error: 'No text provided' }, { status: 400 });
  }

  if (!process.env.ELEVENLABS_API_KEY) {
    return Response.json({ error: 'ElevenLabs API key not configured' }, { status: 500 });
  }

  const { audio } = await generateSpeech({
    model: elevenlabs.speech('eleven_flash_v2_5'),
    text,
    voice: voice || DEFAULT_VOICE_ID,
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
