// src/app/api/lowres/route.ts
import { ImageResponse } from 'next/server';
import sharp from 'sharp';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const src = searchParams.get('src');

  if (!src) {
    return new Response('Missing src parameter', { status: 400 });
  }

  const image = await sharp(`public${src}`)
    .resize(40)  // Very small size for quick loading
    .toBuffer();

  return new Response(new Uint8Array(image), {
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}