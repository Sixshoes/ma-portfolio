import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { CHALKBOARDS_CACHE_TAG, PUBLICATIONS_CACHE_TAG } from '@/lib/constants';
import { verifyAdminFirebaseToken } from '@/lib/firebaseServer';

/**
 * 後台儲存論文後呼叫此端點，經 Google 驗證 Firebase ID Token 與管理者白名單後，
 * 立即清除根路由 /、/main 與 /api/publications 的 ISR 快取，讓正式官網秒級生效。
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization') ?? '';
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match || !match[1]) {
    return NextResponse.json({ error: 'Missing Authorization Bearer token.' }, { status: 401 });
  }

  const verified = await verifyAdminFirebaseToken(match[1].trim());
  if (!verified.ok) {
    return NextResponse.json({ error: verified.error }, { status: verified.status });
  }

  revalidateTag(PUBLICATIONS_CACHE_TAG);
  revalidateTag(CHALKBOARDS_CACHE_TAG);
  revalidatePath('/');
  revalidatePath('/main');
  revalidatePath('/api/publications');
  revalidatePath('/api/papers.json');
  revalidatePath('/api/chalkboards');

  return NextResponse.json({
    revalidated: true,
    by: verified.email,
    at: new Date().toISOString(),
  });
}
