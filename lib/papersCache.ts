import { normalizePublicationsFromJson, type Publication } from '@/lib/publications';

/**
 * 資料版本：更新 papers.json 內容時同步更新此值，
 * 可強制讓舊快取失效，避免使用者看到過期內容。
 */
export const PAPERS_CACHE_VERSION = '2026-04-14';
export const PAPERS_JSON_URL =
  `https://sixshoes.github.io/Ma-Research-Portal/papers.json?v=${PAPERS_CACHE_VERSION}`;

const STORAGE_KEY = `yrma_papers_json_${PAPERS_CACHE_VERSION}`;
const PAPERS_CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 小時

type CachedPapersPayload = {
  version: string;
  fetchedAt: number;
  data: Publication[];
};

export function readCachedPapers(): Publication[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as unknown;

    // 向下相容舊格式（純陣列）
    if (Array.isArray(parsed)) {
      if (parsed.length === 0) return null;
      const normalized = normalizePublicationsFromJson(parsed);
      writeCachedPapers(normalized);
      return normalized;
    }

    const payload = parsed as Partial<CachedPapersPayload>;
    if (!payload || !Array.isArray(payload.data) || payload.data.length === 0) return null;
    if (payload.version !== PAPERS_CACHE_VERSION) return null;
    if (typeof payload.fetchedAt !== 'number') return null;
    if (Date.now() - payload.fetchedAt > PAPERS_CACHE_TTL_MS) return null;

    return normalizePublicationsFromJson(payload.data);
  } catch {
    return null;
  }
}

export function writeCachedPapers(papers: Publication[]): void {
  if (typeof window === 'undefined') return;
  const payload: CachedPapersPayload = {
    version: PAPERS_CACHE_VERSION,
    fetchedAt: Date.now(),
    data: papers,
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    // 讓同分頁切換可立即命中，不用等 localStorage 事件
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* 配額或私密模式 */
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      /* 忽略 */
    }
  }
}

/**
 * 在首頁等非 /main 頁面先拉取論文 JSON，之後進入專頁可從 localStorage/sessionStorage 同步還原，
 * 避免手機端「進頁後才打 API → 版面一格格跳出」的體感卡頓。
 */
export function prefetchPapersJson(): void {
  if (typeof window === 'undefined') return;
  fetch(PAPERS_JSON_URL, { cache: 'force-cache' })
    .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
    .then((data: unknown) => {
      if (Array.isArray(data) && data.length > 0) {
        writeCachedPapers(normalizePublicationsFromJson(data));
      }
    })
    .catch(() => {
      /* 靜默失敗，進 /main 時仍會再請求 */
    });
}
