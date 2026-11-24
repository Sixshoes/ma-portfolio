import { NextResponse } from 'next/server';
import { PUBLICATIONS_CACHE_TAG } from '@/lib/constants';
import { fetchPublicationsFromFirestoreServer } from '@/lib/firebaseServer';
import { LEGACY_PORTAL_PAPERS_URL } from '@/lib/papersCache';
import { normalizePublicationsFromJson } from '@/lib/publications';

export const revalidate = 3600;

const PUBLIC_CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
};

/**
 * 統一論文公開 API：
 * 1. 優先從 Firebase Firestore 單一彙總文件讀取（經由 Next.js 快取，全站每小時僅 1 次 Firestore 讀取）
 * 2. 若尚未設定 Firebase 或尚未匯入，無縫退回 B 站 papers.json
 * 3. 搭配 POST /api/revalidate 精準失效，CDN 邊緣快取 1 小時並支援 SWR 24 小時
 */
export async function GET() {
  const firestoreData = await fetchPublicationsFromFirestoreServer(revalidate);
  if (firestoreData && firestoreData.items.length > 0) {
    return NextResponse.json(
      {
        source: 'firebase',
        updatedAt: firestoreData.updatedAt ?? null,
        items: firestoreData.items,
      },
      { headers: PUBLIC_CACHE_HEADERS },
    );
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    try {
      const res = await fetch(LEGACY_PORTAL_PAPERS_URL, {
        next: { revalidate, tags: [PUBLICATIONS_CACHE_TAG] },
        signal: controller.signal,
      });
      if (res.ok) {
        const raw: unknown = await res.json();
        const items = normalizePublicationsFromJson(raw);
        if (items.length > 0) {
          return NextResponse.json(
            {
              source: 'portal',
              updatedAt: null,
              items,
            },
            { headers: PUBLIC_CACHE_HEADERS },
          );
        }
      }
    } finally {
      clearTimeout(timer);
    }
  } catch {
    /* fallback below */
  }

  return NextResponse.json(
    { error: 'Unable to load publications from Firestore or fallback source.' },
    { status: 503 },
  );
}
