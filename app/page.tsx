import React from 'react';
import { fetchPapersServerSide } from '@/lib/papersCache';
import { fetchChalkboardsFromFirestoreServer } from '@/lib/firebaseServer';
import { MainClient } from './main/MainClient';

/**
 * 根路由直接承載學術專頁主內容，採 On-Demand ISR（每小時自動再驗證，後台儲存時即時清除快取），
 * 並行載入最新著作目錄與親筆黑板手稿相簿。
 */
export const revalidate = 3600;

export default async function HomePage() {
  const [initialPublications, chalkboardResult] = await Promise.all([
    fetchPapersServerSide(revalidate),
    fetchChalkboardsFromFirestoreServer(revalidate),
  ]);
  return (
    <MainClient
      initialPublications={initialPublications}
      initialChalkboards={chalkboardResult.items}
    />
  );
}
