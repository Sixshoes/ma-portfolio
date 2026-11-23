import React from 'react';
import { fetchPapersServerSide } from '@/lib/papersCache';
import { MainClient } from './MainClient';

/**
 * 每小時向 B 站（Ma-Research-Portal）做一次 ISR 重新驗證，
 * 讓首屏 HTML 直接包含最新著作與統計數據，兼顧 SEO 與零閃爍體驗；
 * 客戶端同時以 cache: 'no-cache'（HTTP ETag）靜默比對確保即時性。
 */
export const revalidate = 3600;

export default async function MainPage() {
  const initialPublications = await fetchPapersServerSide(revalidate);
  return <MainClient initialPublications={initialPublications} />;
}
