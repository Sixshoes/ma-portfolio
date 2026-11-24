import { PUBLICATIONS_CACHE_TAG } from '@/lib/constants';
import { fetchPublicationsFromFirestoreServer } from '@/lib/firebaseServer';
import { LEGACY_PORTAL_PAPERS_URL } from '@/lib/papersCache';
import {
  computeHIndex,
  normalizePublicationsFromJson,
  type Publication,
} from '@/lib/publications';

export const PUBLIC_API_REVALIDATE = 3600;

export const PUBLIC_CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export const PUBLIC_JSON_CACHE_HEADERS: Record<string, string> = {
  ...PUBLIC_CORS_HEADERS,
  'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
};

export type PublicPublicationsMeta = {
  totalPapers: number;
  totalCitations: number;
  hIndex: number;
  starredCount: number;
  withCoverCount: number;
};

export type PublicPublicationsPayload = {
  source: 'firebase' | 'portal';
  updatedAt: string | null;
  meta: PublicPublicationsMeta;
  items: Publication[];
};

export function computePublicationsMeta(items: Publication[]): PublicPublicationsMeta {
  let totalCitations = 0;
  let starredCount = 0;
  let withCoverCount = 0;

  for (const item of items) {
    totalCitations += item.citations;
    if (item.is_star === '是') starredCount += 1;
    if (item.cover_url?.trim()) withCoverCount += 1;
  }

  return {
    totalPapers: items.length,
    totalCitations,
    hIndex: computeHIndex(items),
    starredCount,
    withCoverCount,
  };
}

/**
 * 統一公開論文資料載入器（供 /api/publications 與 /api/papers.json 共用）：
 * 1. 優先讀取 Firestore 單一彙總文件 siteData/publications（ISR 1 小時快取 + revalidateTag 即時失效）
 * 2. 若尚未設定 Firebase，無縫退回舊 B 站 papers.json
 */
export async function loadPublicPublications(
  revalidateSeconds = PUBLIC_API_REVALIDATE,
): Promise<PublicPublicationsPayload | null> {
  const firestoreData = await fetchPublicationsFromFirestoreServer(revalidateSeconds);
  if (firestoreData && firestoreData.items.length > 0) {
    return {
      source: 'firebase',
      updatedAt: firestoreData.updatedAt ?? null,
      meta: computePublicationsMeta(firestoreData.items),
      items: firestoreData.items,
    };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    try {
      const res = await fetch(LEGACY_PORTAL_PAPERS_URL, {
        next: { revalidate: revalidateSeconds, tags: [PUBLICATIONS_CACHE_TAG] },
        signal: controller.signal,
      });
      if (res.ok) {
        const raw: unknown = await res.json();
        const items = normalizePublicationsFromJson(raw);
        if (items.length > 0) {
          return {
            source: 'portal',
            updatedAt: null,
            meta: computePublicationsMeta(items),
            items,
          };
        }
      }
    } finally {
      clearTimeout(timer);
    }
  } catch {
    /* fallback failed */
  }

  return null;
}
