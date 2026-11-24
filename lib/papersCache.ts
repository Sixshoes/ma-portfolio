import { PUBLICATIONS_CACHE_TAG } from '@/lib/constants';
import { normalizePublicationsFromJson, type Publication } from '@/lib/publications';
import { fetchPublicationsFromFirestoreServer } from '@/lib/firebaseServer';

/**
 * 舊 B 站（Ma-Research-Portal）靜態資料端點：
 * 在 Firebase 尚未填入環境變數或尚未匯入前自動作為備援；
 * 正式啟用 Firebase 後可於 /admin 一鍵匯入並停用 B 站。
 */
export const LEGACY_PORTAL_PAPERS_URL =
  'https://sixshoes.github.io/Ma-Research-Portal/papers.json';
export const PAPERS_JSON_URL = LEGACY_PORTAL_PAPERS_URL;

const CACHE_SCHEMA_VERSION = 4;
const STORAGE_KEY = `yrma_papers_cache_v${CACHE_SCHEMA_VERSION}`;
const LEGACY_STORAGE_KEYS = [
  'yrma_papers_json_2026-04-14',
  'yrma_papers_cache_v2',
  'yrma_papers_cache_v3',
];
const PAPERS_CACHE_TTL_MS = 1000 * 60 * 60 * 24;

type CachedPapersPayload = {
  schemaVersion: number;
  fetchedAt: number;
  data: Publication[];
};

export function readCachedPapers(): Publication[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as unknown;
    const payload = parsed as Partial<CachedPapersPayload>;
    if (
      !payload ||
      payload.schemaVersion !== CACHE_SCHEMA_VERSION ||
      !Array.isArray(payload.data) ||
      payload.data.length === 0
    ) {
      return null;
    }

    if (typeof payload.fetchedAt !== 'number') return null;
    const ageMs = Date.now() - payload.fetchedAt;
    if (ageMs > PAPERS_CACHE_TTL_MS * 7) return null;

    return normalizePublicationsFromJson(payload.data);
  } catch {
    return null;
  }
}

export function writeCachedPapers(papers: Publication[]): void {
  if (typeof window === 'undefined' || papers.length === 0) return;
  const payload: CachedPapersPayload = {
    schemaVersion: CACHE_SCHEMA_VERSION,
    fetchedAt: Date.now(),
    data: papers,
  };
  const serialized = JSON.stringify(payload);

  try {
    for (const legacyKey of LEGACY_STORAGE_KEYS) {
      localStorage.removeItem(legacyKey);
      sessionStorage.removeItem(legacyKey);
    }
    localStorage.setItem(STORAGE_KEY, serialized);
    sessionStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    try {
      sessionStorage.setItem(STORAGE_KEY, serialized);
    } catch {
      /* ignore */
    }
  }
}

/**
 * 瀏覽器端拉取最新論文資料：
 * 優先走同源 /api/publications（由伺服器統一從 Firestore 快取提供，零直接 Firestore 讀取量），
 * 若同源端點失敗再退回 B 站靜態 JSON。
 */
export async function fetchPapersFromRemote(signal?: AbortSignal): Promise<Publication[]> {
  try {
    const apiRes = await fetch('/api/publications', {
      signal,
    });
    if (apiRes.ok) {
      const payload = (await apiRes.json()) as { items?: unknown };
      const normalized = normalizePublicationsFromJson(payload.items ?? payload);
      if (normalized.length > 0) return normalized;
    }
  } catch (err) {
    if (signal?.aborted) throw err;
  }

  const res = await fetch(LEGACY_PORTAL_PAPERS_URL, {
    signal,
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const data: unknown = await res.json();
  const normalized = normalizePublicationsFromJson(data);
  if (normalized.length === 0) {
    throw new Error('Empty publications dataset');
  }
  return normalized;
}

/**
 * 伺服器端（Next.js Server Component / ISR）拉取論文資料：
 * 1. 優先讀 Firebase Firestore 單一彙總文件 siteData/publications（1 次讀取）
 * 2. 若未設定或尚未匯入，無縫退回 B 站 papers.json
 */
export async function fetchPapersServerSide(revalidateSeconds = 3600): Promise<Publication[] | null> {
  const fromFirestore = await fetchPublicationsFromFirestoreServer(revalidateSeconds);
  if (fromFirestore && fromFirestore.items.length > 0) {
    return fromFirestore.items;
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    try {
      const res = await fetch(LEGACY_PORTAL_PAPERS_URL, {
        next: { revalidate: revalidateSeconds, tags: [PUBLICATIONS_CACHE_TAG] },
        signal: controller.signal,
      });
      if (!res.ok) return null;
      const data: unknown = await res.json();
      const normalized = normalizePublicationsFromJson(data);
      return normalized.length > 0 ? normalized : null;
    } finally {
      clearTimeout(timer);
    }
  } catch {
    return null;
  }
}

export function prefetchPapersJson(): void {
  if (typeof window === 'undefined') return;
  void fetchPapersFromRemote()
    .then((normalized) => {
      writeCachedPapers(normalized);
    })
    .catch(() => {
      /* 靜默失敗 */
    });
}
