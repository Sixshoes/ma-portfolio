import { normalizePublicationsFromJson, type Publication } from '@/lib/publications';

/**
 * B 站（Ma-Research-Portal）GitHub Pages 靜態資料端點。
 * 移除硬編碼 ?v= 版本號與 force-cache，改由 HTTP ETag / no-cache 條件驗證，
 * 確保 B 站自動同步 Notion 後，訪客能立即取得最新論文資料。
 */
export const PAPERS_JSON_URL =
  'https://sixshoes.github.io/Ma-Research-Portal/papers.json';
export const PAPERS_META_URL =
  'https://sixshoes.github.io/Ma-Research-Portal/meta.json';

const CACHE_SCHEMA_VERSION = 2;
const STORAGE_KEY = `yrma_papers_cache_v${CACHE_SCHEMA_VERSION}`;
const LEGACY_STORAGE_KEYS = ['yrma_papers_json_2026-04-14'];
const PAPERS_CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 小時軟過期（仍採 SWR 背景驗證）

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

    // 超過軟 TTL 時依然先回傳舊資料加速首屏渲染，由 SWR 背景請求負責刷新
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
    /* 配額或私密模式 */
    try {
      sessionStorage.setItem(STORAGE_KEY, serialized);
    } catch {
      /* 忽略 */
    }
  }
}

/**
 * 瀏覽器端請求最新論文 JSON：
 * 使用 cache: 'no-cache' 強制與 GitHub Pages 做 ETag / 304 條件驗證，
 * 資料沒變幾乎零傳輸量，資料有變立即更新。
 */
export async function fetchPapersFromRemote(signal?: AbortSignal): Promise<Publication[]> {
  const res = await fetch(PAPERS_JSON_URL, {
    cache: 'no-cache',
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
 * 伺服器端（Next.js Server Component / ISR）拉取論文 JSON：
 * 內建 5 秒逾時與靜默失敗，確保離線或建置環境無法連線時不會中斷 build。
 */
export async function fetchPapersServerSide(revalidateSeconds = 3600): Promise<Publication[] | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    try {
      const res = await fetch(PAPERS_JSON_URL, {
        next: { revalidate: revalidateSeconds },
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

/**
 * 在首頁（/）先於背景預抓並驗證最新 papers.json，
 * 進入 /main 時可立即從 sessionStorage/localStorage 呈現最新資料。
 */
export function prefetchPapersJson(): void {
  if (typeof window === 'undefined') return;
  void fetchPapersFromRemote()
    .then((normalized) => {
      writeCachedPapers(normalized);
    })
    .catch(() => {
      /* 靜默失敗，進 /main 時仍會再請求 */
    });
}
