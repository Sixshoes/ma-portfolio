import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { CHALKBOARDS_CACHE_TAG, PUBLICATIONS_CACHE_TAG } from '@/lib/constants';
import { verifyAdminFirebaseToken } from '@/lib/firebaseServer';

/**
 * 後台儲存論文後呼叫此端點，經 Google 驗證 Firebase ID Token 與管理者白名單後，
 * 立即清除根路由 /、/main 與 /api/publications 的 ISR 快取，讓正式官網秒級生效。
 */
const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' };

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization') ?? '';
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  const idToken = match?.[1]?.trim() ?? '';
  if (!idToken) {
    return NextResponse.json(
      { error: 'Missing Authorization Bearer token.' },
      { status: 401, headers: NO_STORE_HEADERS },
    );
  }

  const verified = await verifyAdminFirebaseToken(idToken);
  if (!verified.ok) {
    return NextResponse.json(
      { error: verified.error },
      { status: verified.status, headers: NO_STORE_HEADERS },
    );
  }

  revalidateTag(PUBLICATIONS_CACHE_TAG);
  revalidateTag(CHALKBOARDS_CACHE_TAG);
  revalidatePath('/');
  revalidatePath('/main');
  revalidatePath('/api/publications');
  revalidatePath('/api/papers.json');
  revalidatePath('/api/chalkboards');

  return NextResponse.json(
    {
      revalidated: true,
      by: verified.email,
      at: new Date().toISOString(),
    },
    { headers: NO_STORE_HEADERS },
  );
}
