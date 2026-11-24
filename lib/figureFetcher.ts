import { createHash } from 'crypto';
import { lookup as dnsLookup } from 'dns/promises';
import { isIP } from 'net';
import sharp from 'sharp';
import { STORAGE_COVERS_PREFIX } from '@/lib/constants';
import { extractDoiIdentifier } from '@/lib/publications';
import { getSiteUrl } from '@/lib/site-url';

export const MIN_FIGURE_WIDTH = 240;
export const MIN_FIGURE_HEIGHT = 150;
export const MAX_FIGURE_DIMENSION = 1400;
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const MAX_HTML_BYTES = 2 * 1024 * 1024;
const MAX_REDIRECT_HOPS = 3;

const DEFAULT_USER_AGENT = `Mozilla/5.0 (compatible; MaPortfolioBot/1.0; +${getSiteUrl()}; mailto:yrma@gm.fgu.edu.tw)`;

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

/** 將 DOI 轉換為安全的 Firebase Storage 檔名 slug（非 DOI 長網址附加 SHA-256 雜湊避免碰撞） */
export function doiToSlug(doiOrId: string): string {
  const extracted = extractDoiIdentifier(doiOrId);
  const raw = (extracted ?? doiOrId).trim();
  const baseSlug = raw
    .toLowerCase()
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!baseSlug) return `figure-${Date.now()}`;
  if (extracted) {
    return baseSlug.slice(0, 96);
  }
  const hash = createHash('sha256').update(raw).digest('hex').slice(0, 12);
  return `${baseSlug.slice(0, 80)}-${hash}`;
}

/** 判斷網址是否屬於本專案的 Firebase Storage（已落盤自家空間） */
export function isProjectStorageUrl(url: string, projectId?: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:') return false;
    const host = parsed.hostname.toLowerCase();
    const pid = projectId?.trim().toLowerCase();

    if (host === 'firebasestorage.googleapis.com') {
      if (!pid) return parsed.pathname.startsWith('/v0/b/');
      const match = parsed.pathname.match(/^\/v0\/b\/([^/]+)\//i);
      const bucket = match?.[1] ? decodeURIComponent(match[1]).toLowerCase() : '';
      return bucket === `${pid}.appspot.com` || bucket === `${pid}.firebasestorage.app` || bucket === pid;
    }

    if (host.endsWith('.firebasestorage.app')) {
      return !pid || host === `${pid}.firebasestorage.app`;
    }

    return false;
  } catch {
    return false;
  }
}

function isPrivateOrReservedIpv4(ip: string): boolean {
  const parts = ip.split('.').map((n) => Number(n));
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) {
    return true;
  }
  const [a, b] = parts;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 192 && b === 0) return true;
  if (a === 198 && (b === 18 || b === 19)) return true;
  if (a >= 224) return true;
  return false;
}

function isPrivateOrReservedIp(ip: string): boolean {
  const lower = ip.toLowerCase().replace(/^\[|\]$/g, '');
  const version = isIP(lower);
  if (version === 4) return isPrivateOrReservedIpv4(lower);
  if (version === 6) {
    if (lower === '::' || lower === '::1') return true;
    const v4Mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
    if (v4Mapped?.[1]) return isPrivateOrReservedIpv4(v4Mapped[1]);
    if (/^(?:fc|fd|fe[89ab]|ff)/i.test(lower)) return true;
    return false;
  }
  return true;
}

/** 嚴格驗證目標為公開網際網路 HTTP(S) 網址（封鎖內網 IP、Metadata 端點、非標準埠與帳密資訊，防止 SSRF） */
export async function assertSafePublicHttpUrl(rawUrl: string): Promise<URL | null> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    return null;
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
  if (parsed.username || parsed.password) return null;
  if (parsed.port && parsed.port !== '80' && parsed.port !== '443') return null;

  const host = parsed.hostname.toLowerCase().replace(/\.$/, '');
  if (
    !host ||
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host.endsWith('.local') ||
    host.endsWith('.internal')
  ) {
    return null;
  }

  const hostIpVer = isIP(host.replace(/^\[|\]$/g, ''));
  if (hostIpVer > 0) {
    return isPrivateOrReservedIp(host) ? null : parsed;
  }

  try {
    const records = await dnsLookup(host, { all: true, verbatim: true });
    if (records.length === 0) return null;
    if (records.some((r) => isPrivateOrReservedIp(r.address))) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function isTrustedElsevierHost(rawUrl: string): boolean {
  try {
    const u = new URL(rawUrl);
    return (
      u.protocol === 'https:' &&
      (u.hostname.toLowerCase() === 'api.elsevier.com' ||
        u.hostname.toLowerCase().endsWith('.elsevier.com'))
    );
  } catch {
    return false;
  }
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
    const meta = await sharp(input, {
      failOn: 'none',
      pages: 1,
      limitInputPixels: 50_000_000,
    }).metadata();
    const rawW = meta.width ?? 0;
    const rawH = meta.height ?? 0;
    const rotated = Boolean(meta.orientation && meta.orientation >= 5 && meta.orientation <= 8);
    const width = rotated ? rawH : rawW;
    const height = rotated ? rawW : rawH;

    if (width < MIN_FIGURE_WIDTH || height < MIN_FIGURE_HEIGHT) {
      return null;
    }

    // 過濾極端狹長網站頁首橫幅或側欄裝飾條
    const ratio = width / height;
    if (ratio > 6 || ratio < 0.16) {
      return null;
    }

    const pipeline = sharp(input, {
      failOn: 'none',
      pages: 1,
      limitInputPixels: 50_000_000,
    }).rotate();
    if (width > MAX_FIGURE_DIMENSION || height > MAX_FIGURE_DIMENSION) {
      pipeline.resize({
        width: MAX_FIGURE_DIMENSION,
        height: MAX_FIGURE_DIMENSION,
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    const { data: webp, info } = await pipeline
      .webp({ quality: 84, effort: 4 })
      .toBuffer({ resolveWithObject: true });
    if (info.width < MIN_FIGURE_WIDTH || info.height < MIN_FIGURE_HEIGHT) {
      return null;
    }

    return {
      webp,
      width: info.width,
      height: info.height,
    };
  } catch {
    return null;
  }
}

/** 串流讀取回應位元組並於超過上限時立刻中止，避免 OOM 與無上限緩衝 */
async function readResponseBufferWithLimit(
  res: Response,
  maxBytes: number,
): Promise<Buffer | null> {
  const clHeader = res.headers.get('content-length');
  if (clHeader) {
    const declared = Number(clHeader);
    if (Number.isFinite(declared) && declared > maxBytes) {
      await res.body?.cancel().catch(() => undefined);
      return null;
    }
  }

  if (!res.body) {
    try {
      const arr = await res.arrayBuffer();
      if (arr.byteLength > maxBytes) return null;
      return Buffer.from(arr);
    } catch {
      return null;
    }
  }

  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        total += value.byteLength;
        if (total > maxBytes) {
          await reader.cancel().catch(() => undefined);
          return null;
        }
        chunks.push(value);
      }
    }
    return Buffer.concat(chunks, total);
  } catch {
    await reader.cancel().catch(() => undefined);
    return null;
  }
}

/**
 * 具備 SSRF 防護、手動轉址追蹤（跨網域自動剝離 X-ELS-APIKey）與全程超時控管的 HTTP 抓取器
 */
async function safeFetchBuffer(
  rawUrl: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: BodyInit;
    timeoutMs?: number;
    maxBytes?: number;
    skipSsrfCheck?: boolean;
  } = {},
): Promise<{
  ok: boolean;
  status: number;
  finalUrl: string;
  contentType: string;
  buffer: Buffer | null;
} | null> {
  const {
    method = 'GET',
    headers = {},
    body,
    timeoutMs = 8000,
    maxBytes = MAX_IMAGE_BYTES,
    skipSsrfCheck = false,
  } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let currentUrl = rawUrl;
    let currentHeaders: Record<string, string> = { ...headers };

    for (let hop = 0; hop <= MAX_REDIRECT_HOPS; hop += 1) {
      if (!skipSsrfCheck) {
        const safe = await assertSafePublicHttpUrl(currentUrl);
        if (!safe) return null;
        currentUrl = safe.toString();
      }

      // 確保 X-ELS-APIKey 絕不會送到非 *.elsevier.com 主機
      if ('X-ELS-APIKey' in currentHeaders && !isTrustedElsevierHost(currentUrl)) {
        const stripped = { ...currentHeaders };
        delete stripped['X-ELS-APIKey'];
        currentHeaders = stripped;
      }

      const res = await fetch(currentUrl, {
        method,
        headers: currentHeaders,
        body: hop === 0 ? body : undefined,
        cache: 'no-store',
        redirect: 'manual',
        signal: controller.signal,
      });

      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get('location');
        await res.body?.cancel().catch(() => undefined);
        if (!location || hop === MAX_REDIRECT_HOPS) return null;

        let nextUrl: string;
        try {
          nextUrl = new URL(location, currentUrl).toString();
        } catch {
          return null;
        }

        // 跨來源轉址一律剝離認證與自訂金鑰標頭
        try {
          if (new URL(nextUrl).origin !== new URL(currentUrl).origin) {
            const stripped = { ...currentHeaders };
            delete stripped['X-ELS-APIKey'];
            delete stripped['Authorization'];
            delete stripped['authorization'];
            currentHeaders = stripped;
          }
        } catch {
          return null;
        }
        currentUrl = nextUrl;
        continue;
      }

      const contentType = (res.headers.get('content-type') ?? '').toLowerCase();
      if (!res.ok) {
        const errBuf = await readResponseBufferWithLimit(res, 16 * 1024);
        return { ok: false, status: res.status, finalUrl: currentUrl, contentType, buffer: errBuf };
      }

      const buf = await readResponseBufferWithLimit(res, maxBytes);
      return { ok: true, status: res.status, finalUrl: currentUrl, contentType, buffer: buf };
    }

    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** 下載單一圖片網址並通過 SSRF 安檢、大小上限、sharp 尺寸驗證與 WebP 轉檔 */
export async function fetchAndValidateImageUrl(
  url: string,
  extraHeaders: Record<string, string> = {},
  timeoutMs = 8000,
): Promise<ValidatedWebpFigure | null> {
  if (!/^https?:\/\//i.test(url)) return null;

  const fetched = await safeFetchBuffer(url, {
    headers: {
      'User-Agent': DEFAULT_USER_AGENT,
      Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
      ...extraHeaders,
    },
    timeoutMs,
    maxBytes: MAX_IMAGE_BYTES,
  });
  if (!fetched || !fetched.ok || !fetched.buffer) return null;

  if (
    fetched.contentType.includes('text/html') ||
    fetched.contentType.includes('application/json') ||
    fetched.contentType.includes('text/plain') ||
    fetched.contentType.includes('image/svg')
  ) {
    return null;
  }

  return validateAndConvertToWebp(fetched.buffer);
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
    // 優先取延遲載入真實圖址（data-src / data-original），再退回 src
    const dataSrcMatch = tag.match(/\b(?:data-src|data-original)\s*=\s*["']([^"']+)["']/i);
    const plainSrcMatch = tag.match(/\bsrc\s*=\s*["']([^"']+)["']/i);
    const src = dataSrcMatch?.[1] || plainSrcMatch?.[1];
    if (!src) continue;
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
  const fetched = await safeFetchBuffer(metaUrl, {
    headers: {
      'X-ELS-APIKey': apiKey,
      Accept: 'application/json',
      'User-Agent': DEFAULT_USER_AGENT,
    },
    timeoutMs: 10000,
    maxBytes: MAX_HTML_BYTES,
  });
  if (!fetched || !fetched.ok || !fetched.buffer) return null;

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
    const json = JSON.parse(fetched.buffer.toString('utf8')) as {
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
      if (!/_lrg\.(jpg|jpeg|png|gif)$/i.test(fileName)) {
        const lrgName = fileName.replace(/\.(jpg|jpeg|png|gif)$/i, '_lrg.$1');
        if (lrgName !== fileName) {
          pushCandidate(`https://ars.els-cdn.com/content/image/${lrgName}`, {});
        }
      }
      pushCandidate(`https://ars.els-cdn.com/content/image/${fileName}`, {});
    }
    // 僅對驗證為 https://*.elsevier.com 的網址才附加 X-ELS-APIKey
    if (isTrustedElsevierHost(item.href)) {
      pushCandidate(item.href, { 'X-ELS-APIKey': apiKey });
    }
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
  deadlineMs: number,
): Promise<FetchedFigureResult | null> {
  const visitedPages = new Set<string>();
  const triedImages = new Set<string>();

  for (const { url, source } of pages) {
    if (Date.now() >= deadlineMs) break;
    if (!url || visitedPages.has(url)) continue;
    visitedPages.add(url);

    const remaining = Math.min(7500, Math.max(1500, deadlineMs - Date.now()));
    const fetched = await safeFetchBuffer(url, {
      headers: {
        'User-Agent': DEFAULT_USER_AGENT,
        Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
      },
      timeoutMs: remaining,
      maxBytes: MAX_HTML_BYTES,
    });
    if (!fetched || !fetched.ok || !fetched.buffer) continue;
    if (!fetched.contentType.includes('text/html') && !fetched.contentType.includes('application/xhtml')) {
      continue;
    }

    const html = fetched.buffer.toString('utf8');
    const candidates = extractCandidateImagesFromHtml(html, fetched.finalUrl || url);
    for (const imgUrl of candidates) {
      if (Date.now() >= deadlineMs) break;
      if (triedImages.has(imgUrl)) continue;
      triedImages.add(imgUrl);
      const imgTimeout = Math.min(7500, Math.max(1500, deadlineMs - Date.now()));
      const validated = await fetchAndValidateImageUrl(imgUrl, {}, imgTimeout);
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
 * 1. 若 DOI 為 10.1016/* 且提供 ELSEVIER_API_KEY → 呼叫 Elsevier Object API 抓取 ga1/fx1
 * 2. 否則（或失敗時）並行查詢免金鑰公開 API：Unpaywall、OpenAlex（含 PMC）、Crossref
 * 3. 所有圖片一律經 SSRF 安檢、大小上限與 sharp 檢驗寬 ≥ 240 且高 ≥ 150 並轉 WebP
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

  const deadlineMs = Date.now() + 45000;
  const trimmedKey = elsevierApiKey?.trim();
  if (trimmedKey && bareDoi.toLowerCase().startsWith('10.1016/')) {
    tried.push('elsevier-api');
    const elsevierFig = await tryFetchElsevierFigure(bareDoi, trimmedKey);
    if (elsevierFig) {
      return { result: elsevierFig, tried };
    }
  }

  // 並行查詢三大公開學術中繼站，大幅縮短等待時間
  tried.push('unpaywall', 'openalex', 'crossref');
  const [unpaywallFetched, openAlexFetched, crossrefFetched] = await Promise.all([
    safeFetchBuffer(
      `https://api.unpaywall.org/v2/${encodeURIComponent(bareDoi)}?email=yrma@gm.fgu.edu.tw`,
      {
        headers: { 'User-Agent': DEFAULT_USER_AGENT, Accept: 'application/json' },
        timeoutMs: 6000,
        maxBytes: MAX_HTML_BYTES,
      },
    ),
    safeFetchBuffer(
      `https://api.openalex.org/works/https://doi.org/${encodeURIComponent(bareDoi)}`,
      {
        headers: { 'User-Agent': DEFAULT_USER_AGENT, Accept: 'application/json' },
        timeoutMs: 6000,
        maxBytes: MAX_HTML_BYTES,
      },
    ),
    safeFetchBuffer(
      `https://api.crossref.org/works/${encodeURIComponent(bareDoi)}`,
      {
        headers: { 'User-Agent': DEFAULT_USER_AGENT, Accept: 'application/json' },
        timeoutMs: 6000,
        maxBytes: MAX_HTML_BYTES,
      },
    ),
  ]);

  const landingPages: Array<{ url: string; source: 'unpaywall' | 'openalex' | 'crossref' }> = [];

  if (unpaywallFetched?.ok && unpaywallFetched.buffer) {
    try {
      const data = JSON.parse(unpaywallFetched.buffer.toString('utf8')) as {
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

  if (openAlexFetched?.ok && openAlexFetched.buffer) {
    try {
      const data = JSON.parse(openAlexFetched.buffer.toString('utf8')) as {
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

  if (crossrefFetched?.ok && crossrefFetched.buffer) {
    try {
      const data = JSON.parse(crossrefFetched.buffer.toString('utf8')) as {
        message?: { URL?: string };
      };
      if (data.message?.URL) {
        landingPages.push({ url: data.message.URL, source: 'crossref' });
      }
    } catch {
      /* ignore malformed JSON */
    }
  }

  const scraped = await tryScrapeLandingPages(landingPages.slice(0, 5), deadlineMs);
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

  const fetched = await safeFetchBuffer(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'image/webp',
    },
    body: new Uint8Array(webp),
    timeoutMs: 15000,
    maxBytes: 1024 * 1024,
    skipSsrfCheck: true,
  });

  if (!fetched || !fetched.ok) {
    const errText = fetched?.buffer?.toString('utf8') ?? 'Network error';
    throw new Error(`Firebase Storage 上傳失敗（HTTP ${fetched?.status ?? 0}）：${errText.slice(0, 200)}`);
  }

  let json: { name?: string; downloadTokens?: string } = {};
  try {
    json = JSON.parse(fetched.buffer?.toString('utf8') ?? '{}') as typeof json;
  } catch {
    throw new Error('Firebase Storage 上傳回傳非 JSON 回應，請稍後重試。');
  }
  const name = json.name ?? objectPath;
  const token = json.downloadTokens?.split(',')[0]?.trim();
  const base = `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(
    bucket,
  )}/o/${encodeURIComponent(name)}?alt=media`;
  const downloadUrl = token ? `${base}&token=${encodeURIComponent(token)}` : base;

  return { downloadUrl, objectPath: name };
}
