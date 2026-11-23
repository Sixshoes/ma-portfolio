import { NextResponse } from 'next/server';
import { fetchPublicationsFromFirestoreServer } from '@/lib/firebaseServer';
import { LEGACY_PORTAL_PAPERS_URL } from '@/lib/papersCache';
import { normalizePublicationsFromJson } from '@/lib/publications';

export const revalidate = 3600;

/**
 * 統一論文公開 API：
 * 1. 優先從 Firebase Firestore 單一彙總文件讀取（經由 Next.js 快取，全站每小時僅 1 次 Firestore 讀取）
 * 2. 若尚未設定 Firebase 或尚未匯入，無縫退回 B 站 papers.json
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
      {
        headers: {
          'Cache-Control': 'no-cache',
        },
      },
    );
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    try {
      const res = await fetch(LEGACY_PORTAL_PAPERS_URL, {
        next: { revalidate, tags: ['publications'] },
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
            {
              headers: {
                'Cache-Control': 'no-cache',
              },
            },
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
