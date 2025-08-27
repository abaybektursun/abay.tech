import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { gzip } from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(gzip);

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'upwork-data.json');
    const jsonData = fs.readFileSync(filePath, 'utf8');
    const fullData = JSON.parse(jsonData);
    
    // Optimize data by keeping only essential fields for visualizations
    const optimizedData = fullData.map((item: any) => ({
      classification: item.classification,
      hourly_int: item.hourly_int,
      client_spendings_int: item.client_spendings_int,
      '2d_embeddings': item['2d_embeddings'],
      Problem: item.Problem
    }));
    
    // Compress the optimized JSON data
    const jsonString = JSON.stringify(optimizedData);
    const compressed = await gzipAsync(jsonString);
    
    return new NextResponse(compressed, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error reading upwork data:', error);
    return NextResponse.json({ error: 'Failed to load data' }, { status: 500 });
  }
}
