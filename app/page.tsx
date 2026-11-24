import React from 'react';
import { fetchPapersServerSide } from '@/lib/papersCache';
import { MainClient } from './main/MainClient';

/**
 * 根路由直接承載學術專頁主內容，採 On-Demand ISR（每小時自動再驗證，後台儲存時即時清除快取），
 * 讓首屏 HTML 直接包含最新著作與統計數據，消除雙層入口門檻與重複拉取。
 */
export const revalidate = 3600;

export default async function HomePage() {
  const initialPublications = await fetchPapersServerSide(revalidate);
  return <MainClient initialPublications={initialPublications} />;
}
