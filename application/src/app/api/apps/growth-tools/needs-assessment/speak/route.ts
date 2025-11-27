import { experimental_generateSpeech as generateSpeech } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  const { text } = await req.json();

  if (!text) {
    return Response.json({ error: 'No text provided' }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return Response.json({ error: 'OpenAI API key not configured' }, { status: 500 });
  }

  const { audio } = await generateSpeech({
    model: openai.speech('tts-1'),
    text,
    voice: 'nova', // Energetic, friendly voice for Tony Robbins persona
  });

  // Use base64 decoding to get binary data
  const binaryData = Buffer.from(audio.base64, 'base64');

  return new Response(binaryData, {
    headers: {
      'Content-Type': audio.mediaType,
    },
  });
}
