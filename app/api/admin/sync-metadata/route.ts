import { NextResponse } from 'next/server';
import { verifyAdminFirebaseToken } from '@/lib/firebaseServer';
import {
  syncPublicationsMetadata,
  type CitationSyncPolicy,
} from '@/lib/metadataSync';
import { normalizePublicationsFromJson } from '@/lib/publications';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * 後台一鍵比對並更新引用數與作者名單（Crossref 最保守下限 + OpenAlex 開放學術庫）：
 * - 需驗證管理員 Bearer Token
 * - 回傳升級後論文清單與完整差異摘要報告，由管理者確認後再寫入 Firestore
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

  const verified = await verifyAdminFirebaseToken(match[1].trim());
  if (!verified.ok) {
    return NextResponse.json(
      { ok: false, error: verified.error },
      { status: verified.status },
    );
  }

  let body: {
    items?: unknown;
    citationPolicy?: unknown;
    fillAuthors?: unknown;
    fixKnownAnomalies?: unknown;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body.' }, { status: 400 });
  }

  const normalized = normalizePublicationsFromJson(body.items);
  if (normalized.length === 0) {
    return NextResponse.json(
      { ok: false, error: '論文清單為空，無法執行比對更新。' },
      { status: 400 },
    );
  }

  const policyRaw = typeof body.citationPolicy === 'string' ? body.citationPolicy : 'crossref-floor';
  const citationPolicy: CitationSyncPolicy =
    policyRaw === 'openalex' || policyRaw === 'keep' ? policyRaw : 'crossref-floor';

  const result = await syncPublicationsMetadata(normalized, {
    citationPolicy,
    fillAuthors: body.fillAuthors !== false,
    fixKnownAnomalies: body.fixKnownAnomalies !== false,
  });

  return NextResponse.json({
    ok: true,
    items: result.items,
    report: result.report,
  });
}
