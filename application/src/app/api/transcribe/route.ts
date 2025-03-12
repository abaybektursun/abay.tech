// app/api/transcribe/route.ts
import { NextRequest } from 'next/server';
import Groq from 'groq-sdk';

// Set response size limit
export const config = {
  api: {
    bodyParser: false,
    responseLimit: '25mb',
  },
};

export async function POST(request: NextRequest): Promise<Response> {
  // Check for API key
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'GROQ_API_KEY is not configured' 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    // Initialize Groq client
    const groq = new Groq({ apiKey });

    // Get the form data
    const formData = await request.formData();
    const audioFile = formData.get('file');

    if (!audioFile || !(audioFile instanceof Blob)) {
      return new Response(
        JSON.stringify({ success: false, error: 'No audio file provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check file size (25MB limit)
    if (audioFile.size > 25 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ success: false, error: 'File size exceeds 25MB limit' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-large-v3',
      response_format: 'json',
      language: 'en',
      temperature: 0.0,
    });

    return new Response(
      JSON.stringify({ text: transcription.text, success: true }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Transcription error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'An error occurred during transcription';
    const isAuthError = errorMessage.toLowerCase().includes('auth') || 
                       errorMessage.toLowerCase().includes('api key');
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: isAuthError ? 'API authentication error' : errorMessage 
      }),
      { 
        status: isAuthError ? 401 : 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}