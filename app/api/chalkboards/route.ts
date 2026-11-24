import { NextResponse } from 'next/server';
import { fetchChalkboardsFromFirestoreServer } from '@/lib/firebaseServer';

export const revalidate = 3600;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  const result = await fetchChalkboardsFromFirestoreServer(revalidate);
  return NextResponse.json(
    {
      source: result.source,
      count: result.items.length,
      updatedAt: result.updatedAt ?? null,
      items: result.items,
    },
    {
      headers: {
        ...CORS_HEADERS,
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    },
  );
}
