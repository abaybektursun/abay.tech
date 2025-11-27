import { experimental_transcribe as transcribe } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
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

  return Response.json({ text: result.text });
}
