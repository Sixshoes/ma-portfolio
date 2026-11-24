import sharp from 'sharp';
import { STORAGE_COVERS_PREFIX } from '@/lib/constants';
import { extractDoiIdentifier } from '@/lib/publications';

export const MIN_FIGURE_WIDTH = 240;
export const MIN_FIGURE_HEIGHT = 150;
export const MAX_FIGURE_DIMENSION = 1400;

const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (compatible; MaPortfolioBot/1.0; +https://ma-portfolio-alpha.vercel.app; mailto:yrma@gm.fgu.edu.tw)';

const GENERIC_COVER_OR_LOGO_PATTERNS: RegExp[] = [
  /cov\d+h\./i,
  /largecover/i,
  /coverissue/i,
  /\/X\d{7,8}\.(?:jpg|jpeg|gif|png|webp)$/i,
  /cover\.gif$/i,
  /cover-image\./i,
  /_cover[-.\d]/i,
  /\.cover\./i,
  /sitebuilderassets\/live\/images\//i,
  /showcoverimage/i,
  /cover-hires\/journal/i,
  /journal-logos\//i,
  /(?:^|[/._-])(logo|favicon|sprite|crossmark|orcid|badge|icon|placeholder|avatar|banner|header|footer|social-share|default-og)(?:[/._-]|$)/i,
  /els-cdn\.com\/content\/image\/X\d+/i,
  /wiley\.com\/.*\/cover\//i,
];

export type ValidatedWebpFigure = {
  webp: Buffer;
  width: number;
  height: number;
};

export type FetchedFigureResult = ValidatedWebpFigure & {
  source: 'elsevier-api' | 'unpaywall' | 'openalex' | 'crossref' | 'direct-url';
  sourceUrl: string;
};

/** 將 DOI 轉換為安全的 Firebase Storage 檔名 slug */
export function doiToSlug(doiOrId: string): string {
  const bare = extractDoiIdentifier(doiOrId) ?? doiOrId.trim();
  const slug = bare
    .toLowerCase()
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96);
  return slug || `figure-${Date.now()}`;
}

/** 判斷網址是否屬於本專案的 Firebase Storage（已落盤自家空間） */
export function isProjectStorageUrl(url: string, projectId?: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (!/^https:\/\/firebasestorage\.googleapis\.com\/|^https:\/\/[^/]+\.firebasestorage\.app\//i.test(trimmed)) {
    return false;
  }
  if (!projectId) return true;
  return trimmed.toLowerCase().includes(projectId.trim().toLowerCase());
}

/** 過濾出版社通用期刊封面、Logo、網站 Icon 等非單篇摘要圖網址 */
export function isGenericCoverOrLogoUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return true;
  return GENERIC_COVER_OR_LOGO_PATTERNS.some((pattern) => pattern.test(trimmed));
}

function looksLikeTextOrHtml(buf: Buffer): boolean {
  const head = buf.subarray(0, 256).toString('utf8').trimStart().toLowerCase();
  return (
    head.startsWith('<!doctype') ||
    head.startsWith('<html') ||
    head.startsWith('<head') ||
    head.startsWith('<xml') ||
    head.startsWith('<?xml') ||
    head.startsWith('<svg') ||
    head.startsWith('{') ||
    head.startsWith('[') ||
    head.includes('just a moment') ||
    head.includes('cloudflare')
  );
}

/**
 * 強制以 sharp 檢驗二進位影像檔頭與尺寸：
 * - 攔截 Cloudflare HTML 假 200、1x1 像素追蹤圖與過小商標（寬 ≥ 240 且高 ≥ 150）
 * - 等比縮放至最長邊 ≤ 1400px 並轉為輕量 WebP
 */
export async function validateAndConvertToWebp(
  input: Buffer,
): Promise<ValidatedWebpFigure | null> {
  if (!input || input.length < 512) return null;
  if (looksLikeTextOrHtml(input)) return null;

  try {
    const meta = await sharp(input, { failOn: 'none', pages: 1 }).metadata();
    const width = meta.width ?? 0;
    const height = meta.height ?? 0;

    if (width < MIN_FIGURE_WIDTH || height < MIN_FIGURE_HEIGHT) {
      return null;
    }

    // 過濾極端狹長網站頁首橫幅或側欄裝飾條
    const ratio = width / height;
    if (ratio > 6 || ratio < 0.16) {
      return null;
    }

    const pipeline = sharp(input, { failOn: 'none', pages: 1 }).rotate();
    if (width > MAX_FIGURE_DIMENSION || height > MAX_FIGURE_DIMENSION) {
      pipeline.resize({
        width: MAX_FIGURE_DIMENSION,
        height: MAX_FIGURE_DIMENSION,
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    const webp = await pipeline.webp({ quality: 84, effort: 4 }).toBuffer();
    const outMeta = await sharp(webp).metadata();
    if (!outMeta.width || !outMeta.height) return null;

    return {
      webp,
      width: outMeta.width,
      height: outMeta.height,
    };
  } catch {
    return null;
  }
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs = 8000,
): Promise<Response | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...init,
      redirect: 'follow',
      signal: controller.signal,
    });
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** 下載單一圖片網址並通過 sharp 安檢與 WebP 轉檔 */
export async function fetchAndValidateImageUrl(
  url: string,
  extraHeaders: Record<string, string> = {},
  timeoutMs = 8000,
): Promise<ValidatedWebpFigure | null> {
  if (!/^https?:\/\//i.test(url)) return null;

  const res = await fetchWithTimeout(
    url,
    {
      headers: {
        'User-Agent': DEFAULT_USER_AGENT,
        Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        ...extraHeaders,
      },
      cache: 'no-store',
    },
    timeoutMs,
  );
  if (!res || !res.ok) return null;

  const contentType = (res.headers.get('content-type') ?? '').toLowerCase();
  if (
    contentType.includes('text/html') ||
    contentType.includes('application/json') ||
    contentType.includes('text/plain') ||
    contentType.includes('image/svg')
  ) {
    return null;
  }

  const arr = await res.arrayBuffer();
  if (arr.byteLength > 15 * 1024 * 1024) return null;
  return validateAndConvertToWebp(Buffer.from(arr));
}

function resolveRelativeUrl(candidate: string, baseUrl: string): string | null {
  try {
    const cleaned = candidate.trim().replace(/&amp;/g, '&');
    if (!cleaned || cleaned.startsWith('data:')) return null;
    const resolved = new URL(cleaned, baseUrl).toString();
    return /^https?:\/\//i.test(resolved) ? resolved : null;
  } catch {
    return null;
  }
}

/** 從開放全文或論文頁面 HTML 中提取疑似單篇圖解摘要（排除通用 Logo 與期刊封面） */
function extractCandidateImagesFromHtml(html: string, pageUrl: string): string[] {
  const prioritized: string[] = [];
  const secondary: string[] = [];
  const seen = new Set<string>();

  const pushUnique = (rawUrl: string, bucket: string[]) => {
    const resolved = resolveRelativeUrl(rawUrl, pageUrl);
    if (!resolved || seen.has(resolved) || isGenericCoverOrLogoUrl(resolved)) return;
    seen.add(resolved);
    bucket.push(resolved);
  };

  // 1. 優先尋找明確標示 Graphical Abstract / fx1 / ga1 / TOC 的 <img>
  const imgTagRegex = /<img\b[^>]*>/gi;
  let imgMatch: RegExpExecArray | null;
  while ((imgMatch = imgTagRegex.exec(html)) !== null) {
    const tag = imgMatch[0];
    const srcMatch = tag.match(/\b(?:src|data-src|data-original)\s*=\s*["']([^"']+)["']/i);
    if (!srcMatch?.[1]) continue;
    const src = srcMatch[1];
    const context = tag.toLowerCase();
    const isGa =
      /(?:graphical[\s_-]*abstract|abstract[\s_-]*figure|ga1|fx1|absfig|toc[\s_-]*graphic|ga_thumb)/i.test(
        context,
      ) || /(?:ga1|fx1|graphical|absfig|toc)/i.test(src);
    if (isGa) {
      pushUnique(src, prioritized);
    } else if (/pmc\.ncbi\.nlm\.nih\.gov|ncbi\.nlm\.nih\.gov\/pmc/i.test(pageUrl)) {
      if (/\.(?:jpg|jpeg|png|webp|gif)(?:\?|$)/i.test(src)) {
        pushUnique(src, secondary);
      }
    }
  }

  // 2. 次優先：非通用 Logo 的 og:image / twitter:image / citation_figure
  const metaRegex = /<meta\b[^>]*>/gi;
  let metaMatch: RegExpExecArray | null;
  while ((metaMatch = metaRegex.exec(html)) !== null) {
    const tag = metaMatch[0];
    const propMatch = tag.match(/\b(?:property|name)\s*=\s*["']([^"']+)["']/i);
    const contentMatch = tag.match(/\bcontent\s*=\s*["']([^"']+)["']/i);
    if (!propMatch?.[1] || !contentMatch?.[1]) continue;
    const prop = propMatch[1].toLowerCase();
    if (prop === 'og:image' || prop === 'twitter:image') {
      pushUnique(contentMatch[1], secondary);
    }
  }

  return [...prioritized, ...secondary].slice(0, 6);
}

/** 軌道 1：Elsevier Object Retrieval API（需伺服器端 ELSEVIER_API_KEY），優先抓取 ga1 / fx1 Graphical Abstract */
async function tryFetchElsevierFigure(
  bareDoi: string,
  apiKey: string,
): Promise<FetchedFigureResult | null> {
  const metaUrl = `https://api.elsevier.com/content/object/doi/${encodeURIComponent(bareDoi)}?view=META`;
  const res = await fetchWithTimeout(
    metaUrl,
    {
      headers: {
        'X-ELS-APIKey': apiKey,
        Accept: 'application/json',
        'User-Agent': DEFAULT_USER_AGENT,
      },
      cache: 'no-store',
    },
    10000,
  );
  if (!res || !res.ok) return null;

  type ElsevierAttachment = {
    'prism:url'?: string;
    ref?: string;
    type?: string;
    mimetype?: string;
  };
  type ElsevierChoice = {
    $?: string;
    '@ref'?: string;
    '@type'?: string;
    '@mimetype'?: string;
  };

  let articleEid = '';
  const rawItems: Array<{ href: string; ref: string; type: string; mime: string }> = [];

  try {
    const json = (await res.json()) as {
      'attachment-metadata-response'?: {
        coredata?: { 'article-eid'?: string };
        attachment?: ElsevierAttachment | ElsevierAttachment[];
      };
      choices?: { choice?: ElsevierChoice | ElsevierChoice[] };
    };

    const metaResp = json['attachment-metadata-response'];
    if (metaResp) {
      articleEid = metaResp.coredata?.['article-eid']?.trim() ?? '';
      const atts = metaResp.attachment;
      const list = Array.isArray(atts) ? atts : atts ? [atts] : [];
      for (const a of list) {
        const href = a['prism:url']?.trim() ?? '';
        if (!href) continue;
        // 若 ref 欄位為空，從 /eid/1-s2.0-...-ga1.jpg 推斷 ref（ga1 / fx1 / gr1）
        const fileMatch = href.match(/-(ga\d+|fx\d+|gr\d+)(?:_lrg)?\./i);
        const inferredRef = (a.ref ?? fileMatch?.[1] ?? '').toLowerCase();
        rawItems.push({
          href,
          ref: inferredRef,
          type: (a.type ?? '').toUpperCase(),
          mime: (a.mimetype ?? '').toLowerCase(),
        });
      }
    }

    const rawChoice = json.choices?.choice;
    const choiceList = Array.isArray(rawChoice) ? rawChoice : rawChoice ? [rawChoice] : [];
    for (const c of choiceList) {
      if (!c.$) continue;
      rawItems.push({
        href: c.$,
        ref: (c['@ref'] ?? '').toLowerCase(),
        type: (c['@type'] ?? '').toUpperCase(),
        mime: (c['@mimetype'] ?? '').toLowerCase(),
      });
    }
  } catch {
    return null;
  }

  // 建立候選清單：優先順序 ga1（正式 Graphical Abstract）> fx1 > gr1（主圖），並同時組出 ars.els-cdn.com 高解析 _lrg 備援網址
  const scoreItem = (item: { ref: string; type: string; mime: string }): number => {
    if (item.mime && !item.mime.startsWith('image/')) return -1;
    if (item.type.includes('THUMBNAIL')) return -1;
    let score = 0;
    if (item.ref === 'ga1' || item.ref.startsWith('ga')) score += 200;
    else if (item.ref === 'fx1') score += 120;
    else if (item.ref === 'gr1') score += 70;
    else return -1;

    if (item.type === 'IMAGE-HIGH-RES') score += 30;
    else if (item.type === 'IMAGE-DOWNSAMPLED' || item.type === 'IMAGE-WEB-STATUS') score += 15;
    return score;
  };

  const ranked = rawItems
    .map((item) => ({ item, score: scoreItem(item) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  const candidateUrls: Array<{ url: string; headers: Record<string, string> }> = [];
  const seen = new Set<string>();
  const pushCandidate = (url: string, headers: Record<string, string>) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    candidateUrls.push({ url, headers });
  };

  for (const { item } of ranked.slice(0, 6)) {
    // 優先對應至 Elsevier 公開影像 CDN（支援 _lrg 高解析且不受 API binary 401 限制）
    const eidFileMatch = item.href.match(/\/eid\/([^/?#]+)/i);
    if (eidFileMatch?.[1]) {
      const fileName = eidFileMatch[1];
      const lrgName = fileName.replace(/\.(jpg|jpeg|png|gif)$/i, '_lrg.$1');
      if (lrgName !== fileName) {
        pushCandidate(`https://ars.els-cdn.com/content/image/${lrgName}`, {});
      }
      pushCandidate(`https://ars.els-cdn.com/content/image/${fileName}`, {});
    }
    // 同時保留直接 API 帶 Key 下載（OA 論文或具備 InstToken 時直接命中）
    pushCandidate(item.href, { 'X-ELS-APIKey': apiKey });
  }

  // 若 META 有回傳 article-eid 但未列出 ga1，額外探測一次標準 ga1_lrg.jpg / ga1.jpg
  if (articleEid) {
    pushCandidate(`https://ars.els-cdn.com/content/image/${articleEid}-ga1_lrg.jpg`, {});
    pushCandidate(`https://ars.els-cdn.com/content/image/${articleEid}-ga1.jpg`, {});
  }

  for (const cand of candidateUrls.slice(0, 8)) {
    const validated = await fetchAndValidateImageUrl(cand.url, cand.headers, 9000);
    if (validated) {
      return {
        ...validated,
        source: 'elsevier-api',
        sourceUrl: cand.url,
      };
    }
  }

  return null;
}

async function tryScrapeLandingPages(
  pages: Array<{ url: string; source: 'unpaywall' | 'openalex' | 'crossref' }>,
): Promise<FetchedFigureResult | null> {
  const visitedPages = new Set<string>();
  const triedImages = new Set<string>();

  for (const { url, source } of pages) {
    if (!url || visitedPages.has(url)) continue;
    visitedPages.add(url);

    const res = await fetchWithTimeout(
      url,
      {
        headers: {
          'User-Agent': DEFAULT_USER_AGENT,
          Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
        },
        cache: 'no-store',
      },
      7500,
    );
    if (!res || !res.ok) continue;

    const ct = (res.headers.get('content-type') ?? '').toLowerCase();
    if (!ct.includes('text/html') && !ct.includes('application/xhtml')) continue;

    const html = await res.text();
    const candidates = extractCandidateImagesFromHtml(html, res.url || url);
    for (const imgUrl of candidates) {
      if (triedImages.has(imgUrl)) continue;
      triedImages.add(imgUrl);
      const validated = await fetchAndValidateImageUrl(imgUrl, {}, 7500);
      if (validated) {
        return {
          ...validated,
          source,
          sourceUrl: imgUrl,
        };
      }
    }
  }

  return null;
}

/**
 * 依 DOI 自動分流查詢單篇圖解摘要：
 * 1. 若 DOI 為 10.1016/* 且提供 ELSEVIER_API_KEY → 呼叫 Elsevier Object API 抓取 fx1
 * 2. 否則（或失敗時）降級查詢免金鑰公開 API：Unpaywall、OpenAlex（含 PMC）、Crossref
 * 3. 所有圖片一律經 sharp 檢驗寬 ≥ 240 且高 ≥ 150 並轉 WebP
 */
export async function fetchFigureCandidateByDoi(
  doiInput: string,
  elsevierApiKey?: string,
): Promise<{ result: FetchedFigureResult | null; tried: string[] }> {
  const tried: string[] = [];
  const bareDoi = extractDoiIdentifier(doiInput);
  if (!bareDoi) {
    return { result: null, tried };
  }

  const trimmedKey = elsevierApiKey?.trim();
  if (trimmedKey && bareDoi.toLowerCase().startsWith('10.1016/')) {
    tried.push('elsevier-api');
    const elsevierFig = await tryFetchElsevierFigure(bareDoi, trimmedKey);
    if (elsevierFig) {
      return { result: elsevierFig, tried };
    }
  }

  const landingPages: Array<{ url: string; source: 'unpaywall' | 'openalex' | 'crossref' }> = [];

  // 公開來源 1：Unpaywall（尋找開放取用頁面）
  tried.push('unpaywall');
  const unpaywallRes = await fetchWithTimeout(
    `https://api.unpaywall.org/v2/${encodeURIComponent(bareDoi)}?email=yrma@gm.fgu.edu.tw`,
    { headers: { 'User-Agent': DEFAULT_USER_AGENT, Accept: 'application/json' }, cache: 'no-store' },
    6000,
  );
  if (unpaywallRes?.ok) {
    try {
      const data = (await unpaywallRes.json()) as {
        best_oa_location?: { url_for_landing_page?: string };
        oa_locations?: Array<{ url_for_landing_page?: string }>;
      };
      if (data.best_oa_location?.url_for_landing_page) {
        landingPages.push({ url: data.best_oa_location.url_for_landing_page, source: 'unpaywall' });
      }
      for (const loc of data.oa_locations ?? []) {
        if (loc.url_for_landing_page) {
          landingPages.push({ url: loc.url_for_landing_page, source: 'unpaywall' });
        }
      }
    } catch {
      /* ignore malformed JSON */
    }
  }

  // 公開來源 2：OpenAlex（優先取得 PMC 開放全文頁與主要落地頁）
  tried.push('openalex');
  const openAlexRes = await fetchWithTimeout(
    `https://api.openalex.org/works/https://doi.org/${encodeURIComponent(bareDoi)}`,
    { headers: { 'User-Agent': DEFAULT_USER_AGENT, Accept: 'application/json' }, cache: 'no-store' },
    6000,
  );
  if (openAlexRes?.ok) {
    try {
      const data = (await openAlexRes.json()) as {
        ids?: { pmcid?: string };
        best_oa_location?: { landing_page_url?: string };
        primary_location?: { landing_page_url?: string };
      };
      const pmcidRaw = data.ids?.pmcid;
      if (pmcidRaw) {
        const pmcId = pmcidRaw.replace(/^https?:\/\/[^/]+\/articles\//i, '').replace(/\/+$/, '');
        if (/^PMC\d+$/i.test(pmcId)) {
          landingPages.unshift({
            url: `https://pmc.ncbi.nlm.nih.gov/articles/${pmcId}/`,
            source: 'openalex',
          });
        }
      }
      if (data.best_oa_location?.landing_page_url) {
        landingPages.push({ url: data.best_oa_location.landing_page_url, source: 'openalex' });
      }
      if (data.primary_location?.landing_page_url) {
        landingPages.push({ url: data.primary_location.landing_page_url, source: 'openalex' });
      }
    } catch {
      /* ignore malformed JSON */
    }
  }

  // 公開來源 3：Crossref（取得官方 DOI 落地頁）
  tried.push('crossref');
  const crossrefRes = await fetchWithTimeout(
    `https://api.crossref.org/works/${encodeURIComponent(bareDoi)}`,
    { headers: { 'User-Agent': DEFAULT_USER_AGENT, Accept: 'application/json' }, cache: 'no-store' },
    6000,
  );
  if (crossrefRes?.ok) {
    try {
      const data = (await crossrefRes.json()) as { message?: { URL?: string } };
      if (data.message?.URL) {
        landingPages.push({ url: data.message.URL, source: 'crossref' });
      }
    } catch {
      /* ignore malformed JSON */
    }
  }

  const scraped = await tryScrapeLandingPages(landingPages.slice(0, 5));
  return { result: scraped, tried };
}

/**
 * 透過管理員 Firebase ID Token（或 OAuth Bearer Token）將已轉檔 WebP 上傳至 Firebase Storage
 * 路徑統一為 publications/covers/{slug}.webp（完全相容既有 storage.rules，免額外設定私鑰）
 */
export async function uploadWebpToFirebaseStorage(params: {
  bucket: string;
  slug: string;
  webp: Buffer;
  authHeader: string;
}): Promise<{ downloadUrl: string; objectPath: string }> {
  const { bucket, slug, webp, authHeader } = params;
  const objectPath = `${STORAGE_COVERS_PREFIX}/${slug}.webp`;
  const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(
    bucket,
  )}/o?uploadType=media&name=${encodeURIComponent(objectPath)}`;

  const res = await fetchWithTimeout(
    uploadUrl,
    {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
      body: new Uint8Array(webp),
      cache: 'no-store',
    },
    15000,
  );

  if (!res || !res.ok) {
    const errText = res ? await res.text().catch(() => '') : 'Network error';
    throw new Error(`Firebase Storage 上傳失敗（HTTP ${res?.status ?? 0}）：${errText.slice(0, 200)}`);
  }

  const json = (await res.json()) as { name?: string; downloadTokens?: string };
  const name = json.name ?? objectPath;
  const token = json.downloadTokens?.split(',')[0]?.trim();
  const base = `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(
    bucket,
  )}/o/${encodeURIComponent(name)}?alt=media`;
  const downloadUrl = token ? `${base}&token=${encodeURIComponent(token)}` : base;

  return { downloadUrl, objectPath: name };
}
