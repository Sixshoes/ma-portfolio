import { NextResponse } from 'next/server';
import {
  getPublicJsonCacheHeaders,
  loadPublicPublications,
  PUBLIC_API_REVALIDATE,
  PUBLIC_CORS_HEADERS,
  PUBLIC_NO_STORE_HEADERS,
} from '@/lib/publicationsApi';

export const revalidate = 3600;

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: PUBLIC_CORS_HEADERS,
  });
}

/**
 * 零改動相容端點（Drop-in Replacement for Ma-Research-Portal/papers.json）：
 * - 直接回傳頂層 JSON 陣列 [...]，並開啟完整跨站 CORS
 * - 供佛光大學永續辦官網召集人頁（sdgs.fgu.edu.tw）只需替換 DATA_SOURCE 一行即可改吃本站 Firebase 單一資料源
 */
export async function GET() {
  const payload = await loadPublicPublications(PUBLIC_API_REVALIDATE);
  if (!payload) {
    return NextResponse.json(
      { error: 'Unable to load publications from Firestore or fallback source.' },
      { status: 503, headers: PUBLIC_NO_STORE_HEADERS },
    );
  }

  return NextResponse.json(payload.items, {
    headers: getPublicJsonCacheHeaders(payload.source),
  });
}
