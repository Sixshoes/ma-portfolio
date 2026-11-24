import { NextResponse } from 'next/server';
import { verifyAdminFirebaseToken } from '@/lib/firebaseServer';
import {
  doiToSlug,
  fetchAndValidateImageUrl,
  fetchFigureCandidateByDoi,
  isGenericCoverOrLogoUrl,
  uploadWebpToFirebaseStorage,
} from '@/lib/figureFetcher';

export const runtime = 'nodejs';

/**
 * 後台雙軌取圖・軌道 A：依 DOI 自動抓取單篇圖解摘要（Graphical Abstract）
 * 1. 驗證管理員 Firebase ID Token 與 ADMIN_EMAILS 白名單
 * 2. 若 DOI 為 10.1016/* 且伺服器有設定 ELSEVIER_API_KEY → 優先呼叫 Elsevier Object API 取 fx1 原圖
 * 3. 否則降級查詢 Unpaywall / OpenAlex / Crossref 公開來源（未填 Key 不報錯）
 * 4. 全數經 sharp 驗證寬 ≥ 240px 且高 ≥ 150px 並轉 WebP 存入 Firebase Storage publications/covers/{doiSlug}.webp
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization') ?? '';
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match || !match[1]) {
    return NextResponse.json(
      { ok: false, error: 'Missing Authorization Bearer token.' },
      { status: 401 },
    );
  }

  const idToken = match[1].trim();
  const verified = await verifyAdminFirebaseToken(idToken);
  if (!verified.ok) {
    return NextResponse.json(
      { ok: false, error: verified.error },
      { status: verified.status },
    );
  }

  const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim();
  if (!bucket) {
    return NextResponse.json(
      { ok: false, error: '尚未設定 NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET，無法轉存至自家 Storage。' },
      { status: 500 },
    );
  }

  let body: { doi?: unknown; imageUrl?: unknown; title?: unknown };
  try {
    body = (await request.json()) as { doi?: unknown; imageUrl?: unknown; title?: unknown };
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 });
  }

  const doi = typeof body.doi === 'string' ? body.doi.trim() : '';
  const imageUrl = typeof body.imageUrl === 'string' ? body.imageUrl.trim() : '';

  if (!doi && !imageUrl) {
    return NextResponse.json(
      { ok: false, error: '請先填入論文 DOI（例如 https://doi.org/10.xxxx/...）或外部圖片網址。' },
      { status: 400 },
    );
  }

  const slug = doiToSlug(doi || imageUrl);
  const tried: string[] = [];
  let figure: {
    webp: Buffer;
    width: number;
    height: number;
    source: string;
    sourceUrl: string;
  } | null = null;

  // 若呼叫端明確指定外部圖片網址，先檢驗並鏡像轉存
  if (imageUrl && !isGenericCoverOrLogoUrl(imageUrl)) {
    tried.push('direct-url');
    const validated = await fetchAndValidateImageUrl(imageUrl);
    if (validated) {
      figure = { ...validated, source: 'direct-url', sourceUrl: imageUrl };
    }
  }

  // 透過 DOI 走 Elsevier API（選填）+ Unpaywall / OpenAlex / Crossref 公開來源
  if (!figure && doi) {
    const elsevierKey = process.env.ELSEVIER_API_KEY?.trim();
    const fetched = await fetchFigureCandidateByDoi(doi, elsevierKey);
    tried.push(...fetched.tried);
    if (fetched.result) {
      figure = fetched.result;
    }
  }

  if (!figure) {
    return NextResponse.json(
      {
        ok: false,
        tried,
        error:
          '無法自動取得符合規格（寬 ≥ 240px、高 ≥ 150px）的單篇圖解摘要；出版社可能啟用防爬蟲封鎖，建議直接拖入論文 PDF 抽圖或手動上傳截圖。',
      },
      { status: 404 },
    );
  }

  try {
    const uploaded = await uploadWebpToFirebaseStorage({
      bucket,
      slug,
      webp: figure.webp,
      authHeader: `Firebase ${idToken}`,
    });

    return NextResponse.json({
      ok: true,
      url: uploaded.downloadUrl,
      objectPath: uploaded.objectPath,
      width: figure.width,
      height: figure.height,
      source: figure.source,
      tried,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error:
          err instanceof Error
            ? err.message
            : '已抓到圖片但上傳 Firebase Storage 失敗，請確認 storage.rules 已部署。',
      },
      { status: 502 },
    );
  }
}
