# Firebase 後台啟用與退 Notion 搬家指南

本專案已內建 `/admin` 著作管理後台（支援 Google 登入、論文增刪修、拖曳上傳圖片自動壓縮 WebP、一鍵匯入 218 篇與即時更新官網）。

> **無縫過渡設計**：在完成以下設定並於 `/admin` 匯入資料前，官網仍會自動沿用 B 站 `papers.json` 運作，完全不會中斷服務。

---

## 步驟 1：在 Firebase Console 開啟三項服務

進入 [Firebase Console](https://console.firebase.google.com/) 選擇你的專案：

1. **Authentication（驗證）**：
   - 啟用 **Sign-in method → Google**。
   - 到 **Settings → Authorized domains**，把你的正式網域（例如 `your-app.vercel.app`）加進授權網域（`localhost` 預設已包含）。
2. **Firestore Database**：
   - 建立資料庫（建議選 `asia-east1 (Taiwan)` 或 `asia-northeast1`）。
   - 到 **Rules（規則）** 分頁，貼入專案根目錄的 [`firestore.rules`](./firestore.rules)，並把你的 Google 管理員信箱加入 `isAdmin()` 陣列後按「發布」。
3. **Storage（圖檔空間，供上傳自備圖片用）**：
   - 啟用 Storage 後，到 **Rules（規則）** 分頁，貼入專案根目錄的 [`storage.rules`](./storage.rules)（同樣加入管理員信箱）後按「發布」。
   - 若暫時未開通 Storage，仍可於 `/admin` 直接貼上外部出版社圖片網址正常運作。

---

## 步驟 2：填入環境變數（本機 `.env.local` 與 Vercel）

在 Firebase Console 的 **專案設定 → 一般 → 您的應用程式（網頁 `</>`）** 複製設定值，填入本機 `.env.local` 及 Vercel 專案的 **Settings → Environment Variables**：

```env
NEXT_PUBLIC_FIREBASE_API_KEY="AIza..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="123456789"
NEXT_PUBLIC_FIREBASE_APP_ID="1:123456789:web:abcdef"

# 允許登入後台與觸發即時快取刷新的管理者信箱（多個用逗號分隔）
ADMIN_EMAILS="yrma@gm.fgu.edu.tw,你的信箱@gmail.com"
NEXT_PUBLIC_ADMIN_EMAILS="yrma@gm.fgu.edu.tw,你的信箱@gmail.com"
```

> 不需要設定 Service Account 私鑰：後端 `/api/revalidate` 會透過 Google 官方 Identity Toolkit API 直接驗證登入者的 Firebase ID Token 與白名單信箱。

---

## 步驟 3：一鍵從 B 站搬進 Firebase 並正式退 Notion

1. 重新部署 Vercel（或本機執行 `npm run dev`）。
2. 前往 `https://你的網域/admin`（或 `http://localhost:3000/admin`）以管理者 Google 帳號登入。
3. 點擊畫面中的 **「一鍵從 B 站匯入現有論文」**（或上傳本機 `papers.json`）。
4. 匯入完成後，系統會自動把全部 218 篇論文寫入 Firestore 單一彙總文件 `siteData/publications`（官網每小時 ISR 僅耗 **1 次** Firestore 讀取），並立即刷新正式官網快取。
5. 開啟 `/main` 確認論文清單顯示正常後，即可安心取消 Notion 訂閱，並停用 B 站 `Ma-Research-Portal` 的 GitHub Actions 排程！

---

## 日常維護小提醒

- **補圖超方便**：在 `/admin` 點「**缺圖**」篩選即可列出目前缺少圖片的論文，點「編輯」直接把截圖拖進上傳框即可自動轉成輕量 WebP 並上線。
- **定期備份**：隨時可在 `/admin` 點「**匯出備份 JSON**」下載整份資料庫留存。
- **費用安全**：因採用單一彙總文件 + Next.js ISR 快取，公開訪客**不會**直接打 Firestore，全站每日讀取次數通常不到免費額度（50,000 次/天）的 0.1%。
