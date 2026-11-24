import { NextResponse } from 'next/server';
import { verifyAdminFirebaseToken } from '@/lib/firebaseServer';

/**
 * 供 /admin 前端以 Firebase ID Token 向伺服器確認管理員權限，
 * 完全移除前端暴露的 NEXT_PUBLIC_ADMIN_EMAILS，並避免後台被鎖死。
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization') ?? '';
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  const idToken = match?.[1]?.trim() ?? '';
  if (!idToken) {
    return NextResponse.json(
      { isAdmin: false, error: 'Missing Authorization Bearer token.' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const verified = await verifyAdminFirebaseToken(idToken);
  if (!verified.ok) {
    return NextResponse.json(
      { isAdmin: false, error: verified.error },
      { status: verified.status, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  return NextResponse.json(
    { isAdmin: true, email: verified.email },
    { status: 200, headers: { 'Cache-Control': 'no-store' } },
  );
}
