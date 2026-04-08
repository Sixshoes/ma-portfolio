import type { Publication } from '@/lib/publications';

export const PAPERS_JSON_URL =
  'https://sixshoes.github.io/Ma-Research-Portal/papers.json';

const STORAGE_KEY = 'yrma_papers_json_v1';

export function readCachedPapers(): Publication[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data) || data.length === 0) return null;
    return data as Publication[];
  } catch {
    return null;
  }
}

export function writeCachedPapers(papers: Publication[]): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(papers));
  } catch {
    /* 配額或私密模式 */
  }
}

/**
 * 在首頁等非 /main 頁面先拉取論文 JSON，之後進入專頁可從 sessionStorage 同步還原，
 * 避免手機端「進頁後才打 API → 版面一格格跳出」的體感卡頓。
 */
export function prefetchPapersJson(): void {
  if (typeof window === 'undefined') return;
  fetch(PAPERS_JSON_URL, { cache: 'default' })
    .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
    .then((data: unknown) => {
      if (Array.isArray(data) && data.length > 0) {
        writeCachedPapers(data as Publication[]);
      }
    })
    .catch(() => {
      /* 靜默失敗，進 /main 時仍會再請求 */
    });
}
