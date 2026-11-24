import { NextResponse } from 'next/server';
import { vcardData } from '@/lib/impactData';
import { PUBLIC_CORS_HEADERS } from '@/lib/publicationsApi';

export const revalidate = 86400;

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: PUBLIC_CORS_HEADERS,
  });
}

/**
 * 單一來源電子名片下載端點：供外部官網（如永續辦召集人頁）直接串接最新 vCard，無須各站重複上傳 ma.vcf
 */
export function GET() {
  return new NextResponse(vcardData, {
    status: 200,
    headers: {
      ...PUBLIC_CORS_HEADERS,
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': 'attachment; filename="Yuan-Ron_Ma.vcf"',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
