import {
  computeHIndex,
  extractDoiIdentifier,
  type Publication,
} from '@/lib/publications';

const POLITE_MAILTO = 'yrma@gm.fgu.edu.tw';
const USER_AGENT = `MaPortfolioMetadataSync/1.0 (https://ma-portfolio-alpha.vercel.app; mailto:${POLITE_MAILTO})`;

export type CitationSyncPolicy = 'crossref-floor' | 'openalex' | 'keep';

export type OutdatedCitationItem = {
  year: number;
  title: string;
  journal: string;
  doi: string;
  localCitations: number;
  crossrefCitations: number | null;
  openalexCitations: number | null;
  updatedCitations: number;
};

export type MetadataAnomalyItem = {
  kind: 'duplicate' | 'missing-doi-recovered' | 'missing-doi-unmatched' | 'title-fixed' | 'preprint-overlap' | 'erratum';
  year: number;
  title: string;
  doi: string;
  detail: string;
};

export type MetadataSyncReport = {
  totalBefore: number;
  totalAfter: number;
  matchedOpenAlex: number;
  matchedCrossref: number;
  dedupedCount: number;
  doiRecoveredCount: number;
  titlesFixedCount: number;
  authorsFilledCount: number;
  citationsUpdatedCount: number;
  localTotalCitations: number;
  updatedTotalCitations: number;
  localHIndex: number;
  updatedHIndex: number;
  openalexTotalCitations: number;
  openalexHIndex: number;
  outdatedVsCrossref: OutdatedCitationItem[];
  anomalies: MetadataAnomalyItem[];
};

export type MetadataSyncOptions = {
  citationPolicy?: CitationSyncPolicy;
  fillAuthors?: boolean;
  fixKnownAnomalies?: boolean;
};

type CrossrefWork = {
  DOI?: string;
  title?: string[];
  'is-referenced-by-count'?: number;
  author?: Array<{ given?: string; family?: string; name?: string }>;
};

type OpenAlexWork = {
  doi?: string;
  title?: string;
  publication_year?: number;
  cited_by_count?: number;
  authorships?: Array<{
    raw_author_name?: string;
    author?: { display_name?: string };
  }>;
};

const KNOWN_RECOVERED_DOIS: Record<string, string> = {
  'tip induced local anodic oxidation on the native sio2 layer of si 111 using an atomic force microscope':
    'https://doi.org/10.1103/physrevb.64.195324',
  'surface magnetic ripples induced by a local stray field from a scanning magnetic tip':
    'https://doi.org/10.1109/intmag.2005.1464017',
};

const KNOWN_TITLE_FIXES: Record<string, string> = {
  '10.1103/physrevb.57.362':
    'C60-terminated Si surfaces: Charge transfer, bonding, and chemical passivation',
};

function normTitle(t: string): string {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function cleanAuthorName(raw: string): string {
  return raw
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/Yuan-\s*Ron\s+Ma/gi, 'Yuan-Ron Ma');
}

function formatCrossrefAuthors(authors?: CrossrefWork['author']): string {
  if (!Array.isArray(authors)) return '';
  return authors
    .map((a) => cleanAuthorName(`${a.given ?? ''} ${a.family ?? ''}`.trim() || a.name || ''))
    .filter(Boolean)
    .join(', ');
}

function formatOpenAlexAuthors(authorships?: OpenAlexWork['authorships']): string {
  if (!Array.isArray(authorships)) return '';
  return authorships
    .map((a) => cleanAuthorName(a.author?.display_name ?? a.raw_author_name ?? ''))
    .filter(Boolean)
    .join(', ');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJsonWithTimeout<T>(
  url: string,
  timeoutMs = 15000,
  retries = 2,
): Promise<T | null> {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
        cache: 'no-store',
        signal: controller.signal,
      });
      if (res.ok) {
        return (await res.json()) as T;
      }
      if ((res.status === 429 || res.status >= 500) && attempt < retries) {
        const retryAfter = Number(res.headers.get('retry-after'));
        const waitMs =
          Number.isFinite(retryAfter) && retryAfter > 0
            ? Math.min(retryAfter * 1000, 3000)
            : 500 * (attempt + 1);
        await sleep(waitMs);
        continue;
      }
      return null;
    } catch {
      if (attempt < retries) {
        await sleep(400 * (attempt + 1));
        continue;
      }
      return null;
    } finally {
      clearTimeout(timer);
    }
  }
  return null;
}

async function fetchOpenAlexMap(dois: string[]): Promise<Map<string, OpenAlexWork>> {
  const map = new Map<string, OpenAlexWork>();
  const batchSize = 40;
  const chunks: string[][] = [];
  for (let i = 0; i < dois.length; i += batchSize) {
    chunks.push(dois.slice(i, i + batchSize));
  }

  await Promise.all(
    chunks.map(async (chunk) => {
      const filter = chunk.map((d) => `https://doi.org/${d}`).join('|');
      const params = new URLSearchParams({
        filter: `doi:${filter}`,
        'per-page': '100',
        select: 'doi,title,publication_year,cited_by_count,authorships',
        mailto: POLITE_MAILTO,
      });
      const data = await fetchJsonWithTimeout<{ results?: OpenAlexWork[] }>(
        `https://api.openalex.org/works?${params.toString()}`,
        18000,
      );
      for (const work of data?.results ?? []) {
        const bare = work.doi ? extractDoiIdentifier(work.doi)?.toLowerCase() : undefined;
        if (bare) map.set(bare, work);
      }
    }),
  );

  return map;
}

async function fetchCrossrefMap(dois: string[]): Promise<Map<string, CrossrefWork>> {
  const map = new Map<string, CrossrefWork>();
  const batchSize = 30;

  // Crossref Polite Pool：循序 30 筆／批＋溫和間隔與 429 自動退避重試，確保接近 100% 命中
  for (let i = 0; i < dois.length; i += batchSize) {
    const chunk = dois.slice(i, i + batchSize);
    const filter = chunk.map((d) => `doi:${d}`).join(',');
    const params = new URLSearchParams({
      filter,
      rows: String(chunk.length),
      select: 'DOI,title,is-referenced-by-count,author',
      mailto: POLITE_MAILTO,
    });
    const data = await fetchJsonWithTimeout<{ message?: { items?: CrossrefWork[] } }>(
      `https://api.crossref.org/works?${params.toString()}`,
      20000,
      2,
    );
    for (const item of data?.message?.items ?? []) {
      const bare = item.DOI?.trim().toLowerCase();
      if (bare) map.set(bare, item);
    }
    if (i + batchSize < dois.length) {
      await sleep(220);
    }
  }

  // 對任何批次遺漏的 DOI 以低併發單筆補查
  const missing = dois.filter((d) => !map.has(d));
  let cursor = 0;
  const workerCount = Math.min(3, missing.length);
  await Promise.all(
    Array.from({ length: workerCount }, async () => {
      while (cursor < missing.length) {
        const doi = missing[cursor++];
        const data = await fetchJsonWithTimeout<{ message?: CrossrefWork }>(
          `https://api.crossref.org/works/${encodeURIComponent(doi)}?mailto=${encodeURIComponent(POLITE_MAILTO)}`,
          12000,
          2,
        );
        if (data?.message) {
          map.set(doi, data.message);
        }
        await sleep(150);
      }
    }),
  );

  return map;
}

/**
 * 以 Crossref（最保守下限）與 OpenAlex（開放學術庫）批次稽核並升級論文書目：
 * - 偵測與合併重複論文、補齊缺失 DOI 與殘缺標題
 * - 找出引用數低於 Crossref 下限的過時篇目，依政策安全更新引用數
 * - 自動補齊完整 authors 欄位（標準化 Yuan-Ron Ma 寫法以利前台高亮）
 */
export async function syncPublicationsMetadata(
  inputItems: Publication[],
  options: MetadataSyncOptions = {},
): Promise<{ items: Publication[]; report: MetadataSyncReport }> {
  const citationPolicy: CitationSyncPolicy = options.citationPolicy ?? 'crossref-floor';
  const fillAuthors = options.fillAuthors !== false;
  const fixKnownAnomalies = options.fixKnownAnomalies !== false;

  // 收集所有待查 DOI（含已知可補回之缺失 DOI）
  const uniqueDoiSet = new Set<string>();
  for (const pub of inputItems) {
    const bare = extractDoiIdentifier(pub.doi)?.toLowerCase();
    if (bare) {
      uniqueDoiSet.add(bare);
    } else if (fixKnownAnomalies) {
      const rec = KNOWN_RECOVERED_DOIS[normTitle(pub.title)];
      const recBare = rec ? extractDoiIdentifier(rec)?.toLowerCase() : undefined;
      if (recBare) uniqueDoiSet.add(recBare);
    }
  }

  const uniqueDois = Array.from(uniqueDoiSet);
  const [oaMap, crMap] = await Promise.all([
    fetchOpenAlexMap(uniqueDois),
    fetchCrossrefMap(uniqueDois),
  ]);

  const anomalies: MetadataAnomalyItem[] = [];
  const outdatedVsCrossref: OutdatedCitationItem[] = [];
  const seenDois = new Set<string>();
  const updatedItems: Publication[] = [];

  let dedupedCount = 0;
  let doiRecoveredCount = 0;
  let titlesFixedCount = 0;
  let authorsFilledCount = 0;
  let citationsUpdatedCount = 0;

  const localTotalCitations = inputItems.reduce((sum, p) => sum + p.citations, 0);
  const localHIndex = computeHIndex(inputItems);
  const openalexCitationsList: number[] = [];

  for (const pub of inputItems) {
    let doiUrl = pub.doi.trim();
    let bareDoi = extractDoiIdentifier(doiUrl)?.toLowerCase() ?? '';
    let title = pub.title.trim();

    // 1. 補齊已知缺失 DOI
    if (!bareDoi) {
      const recovered = KNOWN_RECOVERED_DOIS[normTitle(title)];
      if (recovered && fixKnownAnomalies) {
        doiUrl = recovered;
        bareDoi = extractDoiIdentifier(recovered)?.toLowerCase() ?? '';
        doiRecoveredCount += 1;
        anomalies.push({
          kind: 'missing-doi-recovered',
          year: pub.year,
          title,
          doi: doiUrl,
          detail: '原為 Google Scholar 搜尋連結，已補回正式 DOI。',
        });
      } else {
        anomalies.push({
          kind: 'missing-doi-unmatched',
          year: pub.year,
          title,
          doi: doiUrl,
          detail: '此會議論文集目前無正式 DOI，維持原連結。',
        });
      }
    }

    // 2. 合併已知重複筆（Scopus 匯出殘缺 "(formula presented)" 重複項）
    if (
      fixKnownAnomalies &&
      bareDoi === '10.1103/physrevb.64.195324' &&
      title.toLowerCase().includes('(formula presented)')
    ) {
      dedupedCount += 1;
      anomalies.push({
        kind: 'duplicate',
        year: pub.year,
        title,
        doi: doiUrl,
        detail: '與同篇完整標題 SiO2 條目重複（且誤記為 0 引用），已自動合併去除。',
      });
      continue;
    }

    if (bareDoi && seenDois.has(bareDoi)) {
      dedupedCount += 1;
      anomalies.push({
        kind: 'duplicate',
        year: pub.year,
        title,
        doi: doiUrl,
        detail: '偵測到重複 DOI，已自動去重保留主條目。',
      });
      continue;
    }
    if (bareDoi) seenDois.add(bareDoi);

    // 3. 修復 Scopus 漏轉化學式前綴之殘缺標題
    const fixedTitle = bareDoi ? KNOWN_TITLE_FIXES[bareDoi] : undefined;
    if (fixKnownAnomalies && fixedTitle && title !== fixedTitle) {
      anomalies.push({
        kind: 'title-fixed',
        year: pub.year,
        title,
        doi: doiUrl,
        detail: `原標題遺失開頭化學式，已還原為「${fixedTitle}」。`,
      });
      title = fixedTitle;
      titlesFixedCount += 1;
    }

    // 標註提醒性條目（SSRN 預印本與正式刊登版並列、期刊勘誤 Correction）
    if (bareDoi === '10.2139/ssrn.4263827') {
      anomalies.push({
        kind: 'preprint-overlap',
        year: pub.year,
        title,
        doi: doiUrl,
        detail: '為 2023 Electrochimica Acta（10.1016/j.electacta.2023.141897）之 SSRN 預印本，可視需要於 /admin 決定是否保留。',
      });
    } else if (/^correction:/i.test(title)) {
      anomalies.push({
        kind: 'erratum',
        year: pub.year,
        title,
        doi: doiUrl,
        detail: '此筆為 2016 Nanoscale 論文之勘誤公告（Correction），可視需要決定是否保留。',
      });
    }

    const cr = bareDoi ? crMap.get(bareDoi) : undefined;
    const oa = bareDoi ? oaMap.get(bareDoi) : undefined;
    const crCitations =
      typeof cr?.['is-referenced-by-count'] === 'number' ? cr['is-referenced-by-count'] : null;
    const oaCitations =
      typeof oa?.cited_by_count === 'number' ? oa.cited_by_count : null;

    openalexCitationsList.push(oaCitations ?? pub.citations);

    let nextCitations = pub.citations;
    if (citationPolicy === 'crossref-floor' && crCitations !== null) {
      nextCitations = Math.max(pub.citations, crCitations);
    } else if (citationPolicy === 'openalex' && oaCitations !== null) {
      nextCitations = Math.max(pub.citations, oaCitations);
    }

    if (crCitations !== null && pub.citations < crCitations) {
      outdatedVsCrossref.push({
        year: pub.year,
        title,
        journal: pub.journal,
        doi: doiUrl,
        localCitations: pub.citations,
        crossrefCitations: crCitations,
        openalexCitations: oaCitations,
        updatedCitations: nextCitations,
      });
    }

    if (nextCitations !== pub.citations) {
      citationsUpdatedCount += 1;
    }

    // 4. 補齊作者名單（優先選較完整名單，並標準化 Yuan-Ron Ma）
    let nextAuthors = pub.authors?.trim() ?? '';
    if (fillAuthors && !nextAuthors) {
      const crAuthors = formatCrossrefAuthors(cr?.author);
      const oaAuthors = formatOpenAlexAuthors(oa?.authorships);
      if (crAuthors && oaAuthors) {
        nextAuthors =
          crAuthors.split(',').length >= oaAuthors.split(',').length ? crAuthors : oaAuthors;
      } else {
        nextAuthors = crAuthors || oaAuthors;
      }
      if (nextAuthors) {
        authorsFilledCount += 1;
      }
    }

    updatedItems.push({
      ...pub,
      title,
      doi: doiUrl,
      citations: nextCitations,
      highlight:
        nextCitations >= 100
          ? '🔥 國際標竿'
          : nextCitations >= 50
            ? '⭐ 重點關注'
            : '📄 一般論文',
      ...(nextAuthors ? { authors: nextAuthors } : {}),
      ...(bareDoi ? { altmetric_id: bareDoi } : {}),
    });
  }

  outdatedVsCrossref.sort(
    (a, b) => (b.crossrefCitations ?? 0) - b.localCitations - ((a.crossrefCitations ?? 0) - a.localCitations),
  );

  const updatedTotalCitations = updatedItems.reduce((sum, p) => sum + p.citations, 0);
  const updatedHIndex = computeHIndex(updatedItems);
  const openalexTotalCitations = openalexCitationsList.reduce((sum, c) => sum + c, 0);
  const openalexHIndex = computeHIndex(
    openalexCitationsList.map((citations) => ({
      title: '',
      year: 2000,
      journal: '',
      doi: '',
      citations,
      is_star: '否',
      highlight: '',
      cover_url: '',
      file_img: '',
    })),
  );

  return {
    items: updatedItems,
    report: {
      totalBefore: inputItems.length,
      totalAfter: updatedItems.length,
      matchedOpenAlex: oaMap.size,
      matchedCrossref: crMap.size,
      dedupedCount,
      doiRecoveredCount,
      titlesFixedCount,
      authorsFilledCount,
      citationsUpdatedCount,
      localTotalCitations,
      updatedTotalCitations,
      localHIndex,
      updatedHIndex,
      openalexTotalCitations,
      openalexHIndex,
      outdatedVsCrossref,
      anomalies,
    },
  };
}
