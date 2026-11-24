import { NextResponse } from 'next/server';
import {
  computePublicationsMeta,
  getPublicJsonCacheHeaders,
  loadPublicPublications,
  PUBLIC_API_REVALIDATE,
  PUBLIC_CORS_HEADERS,
  PUBLIC_NO_STORE_HEADERS,
} from '@/lib/publicationsApi';

export const revalidate = 3600;

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: PUBLIC_CORS_HEADERS,
  });
}

/**
 * 統一論文公開 API（支援跨站 CORS，供永續辦官網與其他外部頁面共用單一資料源）：
 * - 預設回傳結構化物件：{ source, updatedAt, meta, items }
 * - 選用查詢參數：
 *   - ?format=array（回傳純陣列 [...]，完全相容舊版 papers.json）
 *   - ?year=2025（僅取特定年份）
 *   - ?since=2022（取該年份含以後之著作）
 *   - ?starred=1（僅取通訊作者著作）
 *   - ?limit=20（限制回傳筆數）
 */
export async function GET(request: Request) {
  const payload = await loadPublicPublications(PUBLIC_API_REVALIDATE);
  if (!payload) {
    return NextResponse.json(
      { error: 'Unable to load publications from Firestore or fallback source.' },
      { status: 503, headers: PUBLIC_NO_STORE_HEADERS },
    );
  }

  const { searchParams } = new URL(request.url);
  const format = (searchParams.get('format') ?? '').toLowerCase();
  const yearParam = searchParams.get('year');
  const sinceParam = searchParams.get('since');
  const starredParam = (searchParams.get('starred') ?? '').toLowerCase();
  const limitParam = searchParams.get('limit')?.trim() ?? '';

  let items = payload.items;

  if (yearParam && /^\d{4}$/.test(yearParam)) {
    const targetYear = Number.parseInt(yearParam, 10);
    items = items.filter((p) => p.year === targetYear);
  } else if (sinceParam && /^\d{4}$/.test(sinceParam)) {
    const minYear = Number.parseInt(sinceParam, 10);
    items = items.filter((p) => p.year >= minYear);
  }

  if (starredParam === '1' || starredParam === 'true') {
    items = items.filter((p) => p.is_star === '是');
  }

  if (limitParam && /^\d+$/.test(limitParam)) {
    const limit = Number.parseInt(limitParam, 10);
    if (Number.isFinite(limit) && limit > 0) {
      items = items.slice(0, limit);
    }
  }

  const cacheHeaders = getPublicJsonCacheHeaders(payload.source);

  if (format === 'array') {
    return NextResponse.json(items, { headers: cacheHeaders });
  }

  const meta =
    items.length === payload.items.length ? payload.meta : computePublicationsMeta(items);

  return NextResponse.json(
    {
      source: payload.source,
      updatedAt: payload.updatedAt,
      meta,
      items,
    },
    { headers: cacheHeaders },
  );
}
