'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import {
  AlertTriangle,
  CheckCircle2,
  CloudDownload,
  Download,
  ExternalLink,
  ImageOff,
  Loader2,
  LogIn,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Star,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  computeHIndex,
  getPublicationKey,
  normalizePublicationsFromJson,
  type Publication,
} from '@/lib/publications';
import { LEGACY_PORTAL_PAPERS_URL } from '@/lib/papersCache';
import {
  getFirebaseServices,
  isFirebaseConfigured,
  loadPublicationsBundleFromFirestore,
  savePublicationsBundleToFirestore,
  type PublicationsBundleDoc,
} from '@/lib/firebase';
import { PublicationEditorModal } from './PublicationEditorModal';
import { ChalkboardManagerTab } from './ChalkboardManagerTab';

type AdminFilter = 'all' | 'starred' | 'highCited' | 'missingCover';
type AdminSort = 'newest' | 'citations' | 'title';
type AdminSectionTab = 'publications' | 'chalkboards';

const PAGE_SIZE = 25;

export function AdminDashboard() {
  const configured = isFirebaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(!configured);
  const [adminStatus, setAdminStatus] = useState<'idle' | 'checking' | 'allowed' | 'denied'>('idle');
  const [adminDenyReason, setAdminDenyReason] = useState<string | null>(null);
  const [bundle, setBundle] = useState<PublicationsBundleDoc | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<AdminFilter>('all');
  const [sort, setSort] = useState<AdminSort>('newest');
  const [page, setPage] = useState(1);
  const [sectionTab, setSectionTab] = useState<AdminSectionTab>('publications');

  const [editorTarget, setEditorTarget] = useState<{ open: boolean; pub: Publication | null }>({
    open: false,
    pub: null,
  });

  const fileImportRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((type: 'ok' | 'err', text: string) => {
    setToast({ type, text });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // 監聽 Firebase Auth 登入狀態
  useEffect(() => {
    if (!configured) return;
    const { auth } = getFirebaseServices();
    const unsub = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
    });
    return () => unsub();
  }, [configured]);

  // 透過伺服器端 GET /api/admin/verify 驗證 Firebase ID Token 與 ADMIN_EMAILS 白名單
  const verifyServerAdmin = useCallback(async (currentUser: User, signal?: AbortSignal) => {
    setAdminStatus('checking');
    setAdminDenyReason(null);
    try {
      const token = await currentUser.getIdToken();
      if (signal?.aborted) return;
      const res = await fetch('/api/admin/verify', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
        signal,
      });
      if (signal?.aborted) return;
      const body = (await res.json().catch(() => ({}))) as {
        isAdmin?: boolean;
        error?: string;
      };
      if (res.ok && body.isAdmin === true) {
        setAdminStatus('allowed');
      } else {
        setAdminStatus('denied');
        setAdminDenyReason(body.error ?? `驗證失敗（HTTP ${res.status}）`);
      }
    } catch (err) {
      if (signal?.aborted) return;
      setAdminStatus('denied');
      setAdminDenyReason(err instanceof Error ? err.message : '無法連線至權限驗證端點');
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setAdminStatus('idle');
      setAdminDenyReason(null);
      return;
    }
    const controller = new AbortController();
    void verifyServerAdmin(user, controller.signal);
    return () => controller.abort();
  }, [user, verifyServerAdmin]);

  const fetchFirestoreData = useCallback(async () => {
    setLoadingData(true);
    try {
      const doc = await loadPublicationsBundleFromFirestore();
      setBundle(doc);
    } catch (err) {
      showToast(
        'err',
        `讀取 Firestore 失敗：${err instanceof Error ? err.message : '未知錯誤'}`,
      );
    } finally {
      setLoadingData(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (user && adminStatus === 'allowed') {
      void fetchFirestoreData();
    }
  }, [user, adminStatus, fetchFirestoreData]);

  const triggerRevalidate = useCallback(async (currentUser: User) => {
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch('/api/revalidate', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        return { ok: false, error: body.error ?? `HTTP ${res.status}` };
      }
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : '網路錯誤' };
    }
  }, []);

  const persistAndPublish = useCallback(
    async (nextItems: Publication[], successLabel: string) => {
      if (!user?.email) throw new Error('尚未登入管理者帳號');
      setBusyAction('saving');
      try {
        const saved = await savePublicationsBundleToFirestore(nextItems, user.email);
        setBundle(saved);
        const rev = await triggerRevalidate(user);
        if (rev.ok) {
          showToast('ok', `${successLabel}，已同步刷新正式官網快取。`);
        } else {
          showToast(
            'err',
            `${successLabel}（Firestore 已存檔，但即時刷新快取失敗：${rev.error}，官網將於 ISR 週期自動更新）`,
          );
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : '寫入失敗';
        if (msg.includes('permission-denied') || msg.includes('PERMISSION_DENIED')) {
          throw new Error(
            '權限不足（permission-denied）：請確認已在 Firebase Console 部署 firestore.rules 且包含您的管理員信箱。',
          );
        }
        throw err;
      } finally {
        setBusyAction(null);
      }
    },
    [user, triggerRevalidate, showToast],
  );

  const handleSignIn = async () => {
    setBusyAction('auth');
    try {
      const { auth, googleProvider } = getFirebaseServices();
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      showToast('err', `Google 登入失敗：${err instanceof Error ? err.message : '已取消'}`);
    } finally {
      setBusyAction(null);
    }
  };

  const handleSignOut = async () => {
    const { auth } = getFirebaseServices();
    await signOut(auth);
    setBundle(null);
  };

  const handleImportFromPortal = async () => {
    if (
      bundle &&
      bundle.items.length > 0 &&
      !window.confirm(
        `Firestore 目前已有 ${bundle.items.length} 筆資料。確定要從 B 站 papers.json 重新匯入並覆蓋嗎？（建議先按「匯出備份 JSON」）`,
      )
    ) {
      return;
    }

    setBusyAction('importing');
    try {
      const res = await fetch(LEGACY_PORTAL_PAPERS_URL, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw: unknown = await res.json();
      const parsed = normalizePublicationsFromJson(raw).map((p) => ({
        ...p,
        id: p.id?.trim() || crypto.randomUUID(),
      }));
      if (parsed.length === 0) throw new Error('B 站資料為空');

      await persistAndPublish(parsed, `已成功匯入 ${parsed.length} 篇論文`);
    } catch (err) {
      showToast('err', `匯入失敗：${err instanceof Error ? err.message : '未知錯誤'}`);
    } finally {
      setBusyAction(null);
    }
  };

  const handleImportLocalJson = async (file: File | undefined) => {
    if (!file) return;
    setBusyAction('importing');
    try {
      const text = await file.text();
      const raw = JSON.parse(text) as unknown;
      const list = Array.isArray(raw)
        ? raw
        : raw && typeof raw === 'object' && Array.isArray((raw as { items?: unknown }).items)
          ? (raw as { items: unknown[] }).items
          : null;
      if (!list) throw new Error('JSON 格式錯誤，需為論文陣列或含 items 陣列的備份檔。');

      const parsed = normalizePublicationsFromJson(list).map((p) => ({
        ...p,
        id: p.id?.trim() || crypto.randomUUID(),
      }));
      if (parsed.length === 0) throw new Error('檔案中找不到有效論文資料。');

      if (
        bundle &&
        bundle.items.length > 0 &&
        !window.confirm(`即將匯入 ${parsed.length} 篇論文並覆蓋現有 ${bundle.items.length} 篇，確定嗎？`)
      ) {
        return;
      }

      await persistAndPublish(parsed, `已匯入 ${parsed.length} 篇論文`);
    } catch (err) {
      showToast('err', `匯入 JSON 失敗：${err instanceof Error ? err.message : '格式錯誤'}`);
    } finally {
      setBusyAction(null);
    }
  };

  const handleExportJson = () => {
    const items = bundle?.items ?? [];
    const blob = new Blob([JSON.stringify(items, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ma-publications-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveOne = async (savedPub: Publication) => {
    const current = bundle?.items ?? [];
    const targetKey = getPublicationKey(savedPub);
    const existsIndex = current.findIndex(
      (item) => (savedPub.id && item.id === savedPub.id) || getPublicationKey(item) === targetKey,
    );

    const nextItems =
      existsIndex >= 0
        ? current.map((item, idx) => (idx === existsIndex ? savedPub : item))
        : [savedPub, ...current];

    await persistAndPublish(nextItems, existsIndex >= 0 ? '已更新論文資料' : '已新增論文');
    setEditorTarget({ open: false, pub: null });
  };

  const handleDeleteOne = async (pub: Publication) => {
    if (!window.confirm(`確定要刪除論文？\n\n「${pub.title}」`)) return;
    const current = bundle?.items ?? [];
    const targetKey = getPublicationKey(pub);
    const nextItems = current.filter(
      (item) => !((pub.id && item.id === pub.id) || getPublicationKey(item) === targetKey),
    );
    try {
      await persistAndPublish(nextItems, '已刪除該篇論文');
    } catch (err) {
      showToast('err', err instanceof Error ? err.message : '刪除失敗');
    }
  };

  const handleManualRevalidate = async () => {
    if (!user) return;
    setBusyAction('revalidating');
    const rev = await triggerRevalidate(user);
    setBusyAction(null);
    if (rev.ok) {
      showToast('ok', '正式官網快取已即時刷新！');
    } else {
      showToast('err', `刷新失敗：${rev.error}`);
    }
  };

  const handleSyncMetadata = async () => {
    if (!user || !bundle || bundle.items.length === 0) return;
    setBusyAction('syncing');
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/sync-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: bundle.items,
          citationPolicy: 'crossref-floor',
          fillAuthors: true,
          fixKnownAnomalies: true,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        items?: Publication[];
        report?: {
          totalBefore: number;
          totalAfter: number;
          dedupedCount: number;
          doiRecoveredCount: number;
          titlesFixedCount: number;
          authorsFilledCount: number;
          citationsUpdatedCount: number;
          localTotalCitations: number;
          updatedTotalCitations: number;
          localHIndex: number;
          updatedHIndex: number;
        };
        error?: string;
      };
      if (!res.ok || !data.ok || !data.items || !data.report) {
        showToast('err', `比對更新失敗：${data.error ?? `HTTP ${res.status}`}`);
        return;
      }

      const r = data.report;
      const totalChanges =
        r.dedupedCount +
        r.doiRecoveredCount +
        r.titlesFixedCount +
        r.authorsFilledCount +
        r.citationsUpdatedCount;
      if (totalChanges === 0) {
        showToast('ok', '已完成 Crossref / OpenAlex 比對，目前所有引用數與作者名單皆已是最新！');
        return;
      }

      const confirmMsg = [
        '已完成 Crossref（最保守引用下限）與 OpenAlex 全量比對：',
        `• 引用數更新：${r.citationsUpdatedCount} 篇（總引用 ${r.localTotalCitations} → ${r.updatedTotalCitations}，H-index ${r.localHIndex} → ${r.updatedHIndex}）`,
        `• 自動補齊作者名單：${r.authorsFilledCount} 篇`,
        `• 合併重複 / 補回 DOI / 修缺字標題：${r.dedupedCount} / ${r.doiRecoveredCount} / ${r.titlesFixedCount} 筆`,
        '',
        '確定寫入 Firestore 並立即刷新正式官網嗎？',
      ].join('\n');

      if (!window.confirm(confirmMsg)) {
        return;
      }

      await persistAndPublish(
        data.items,
        `已同步更新 ${r.citationsUpdatedCount} 篇引用與 ${r.authorsFilledCount} 篇作者名單`,
      );
    } catch (err) {
      showToast('err', `比對更新失敗：${err instanceof Error ? err.message : '網路錯誤'}`);
    } finally {
      setBusyAction(null);
    }
  };

  const getIdToken = useCallback(async () => {
    if (!user) throw new Error('尚未登入管理者帳號');
    return user.getIdToken();
  }, [user]);

  const items = useMemo(() => bundle?.items ?? [], [bundle]);
  const missingCoverCount = useMemo(
    () => items.filter((p) => !p.cover_url?.trim()).length,
    [items],
  );
  const totalCitations = useMemo(() => items.reduce((s, p) => s + p.citations, 0), [items]);
  const hIndex = useMemo(() => computeHIndex(items), [items]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = items;
    if (filter === 'starred') list = list.filter((p) => p.is_star === '是');
    else if (filter === 'highCited') list = list.filter((p) => p.citations >= 50);
    else if (filter === 'missingCover') list = list.filter((p) => !p.cover_url?.trim());

    if (q) {
      list = list.filter((p) =>
        `${p.title} ${p.journal} ${p.year} ${p.doi} ${p.authors ?? ''}`.toLowerCase().includes(q),
      );
    }

    return [...list].sort((a, b) => {
      if (sort === 'citations') return b.citations - a.citations || b.year - a.year;
      if (sort === 'title') return a.title.localeCompare(b.title);
      return b.year - a.year || b.citations - a.citations;
    });
  }, [items, filter, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filteredItems.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // 狀態 1：尚未設定 Firebase 環境變數
  if (!configured) {
    return (
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 py-16">
        <div className="w-full rounded-lg border border-[#DCE2E8] bg-white p-8 shadow-sm">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-[#0F4C81]/25 bg-[#EBF2F8] text-[#0F4C81]">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h1 className="mb-3 text-xl font-semibold text-[#11161C]">
            Firebase 尚未設定環境變數
          </h1>
          <p className="mb-5 text-sm leading-relaxed text-[#475569]">
            目前官網仍正常使用 B 站備援資料運作。請依專案根目錄的{' '}
            <code className="rounded bg-[#EEF1F5] px-1.5 py-0.5 text-[#0F4C81]">FIREBASE_SETUP.md</code>{' '}
            步驟，於 <code className="rounded bg-[#EEF1F5] px-1.5 py-0.5 text-[#0F4C81]">.env.local</code> 與 Vercel
            填入以下環境變數後重新整理：
          </p>
          <ul className="mb-6 space-y-1.5 rounded-md border border-[#DCE2E8] bg-[#F6F7F8] p-4 font-mono text-xs text-[#2B3642]">
            <li>NEXT_PUBLIC_FIREBASE_API_KEY</li>
            <li>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN</li>
            <li>NEXT_PUBLIC_FIREBASE_PROJECT_ID</li>
            <li>NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET</li>
            <li>NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID</li>
            <li>NEXT_PUBLIC_FIREBASE_APP_ID</li>
            <li>ADMIN_EMAILS（純伺服器端變數）</li>
            <li>ELSEVIER_API_KEY（選填，伺服器端自動抓摘要圖）</li>
          </ul>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md border border-[#C5CFD8] bg-white px-4 py-2 text-sm font-medium text-[#11161C] transition-colors hover:border-[#0F4C81] hover:text-[#0F4C81]"
          >
            返回正式官網
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  // 載入 Auth 狀態中
  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 text-[#5A6775]">
        <Loader2 className="h-5 w-5 animate-spin text-[#0F4C81]" />
        正在確認登入狀態...
      </div>
    );
  }

  // 狀態 2：未登入
  if (!user) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6">
        <div className="w-full rounded-lg border border-[#DCE2E8] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-lg border border-[#0F4C81]/25 bg-[#EBF2F8] text-[#0F4C81]">
            <LogIn className="h-5 w-5" />
          </div>
          <h1 className="mb-2 text-xl font-semibold text-[#11161C]">著作管理後台</h1>
          <p className="mb-7 text-sm text-[#5A6775]">
            請使用已授權的管理者 Google 帳號登入，即可管理論文清單、抓取或抽取圖解摘要並即時更新官網。
          </p>
          {toast ? (
            <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700">
              {toast.text}
            </div>
          ) : null}
          <button
            type="button"
            disabled={busyAction === 'auth'}
            onClick={handleSignIn}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#0F4C81] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0B3A63] disabled:opacity-50"
          >
            {busyAction === 'auth' ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            使用 Google 帳號登入
          </button>
          <Link
            href="/"
            className="mt-4 inline-block text-xs text-[#5A6775] transition-colors hover:text-[#0F4C81]"
          >
            ← 返回正式官網
          </Link>
        </div>
      </div>
    );
  }

  // 狀態 3：向伺服器端驗證管理員資格中
  if (adminStatus === 'idle' || adminStatus === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 text-[#5A6775]">
        <Loader2 className="h-5 w-5 animate-spin text-[#0F4C81]" />
        正在向伺服器驗證管理員權限...
      </div>
    );
  }

  // 狀態 4：已登入但非白名單帳號或驗證失敗
  if (adminStatus !== 'allowed') {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6">
        <div className="w-full rounded-lg border border-red-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h1 className="mb-2 text-xl font-semibold text-[#11161C]">無管理權限</h1>
          <p className="mb-3 text-sm text-[#475569]">
            目前登入帳號 <span className="font-mono font-medium text-[#11161C]">{user.email}</span> 無法通過伺服器端管理員驗證。
          </p>
          {adminDenyReason ? (
            <p className="mb-6 rounded-md border border-[#DCE2E8] bg-[#F6F7F8] px-3 py-2 font-mono text-xs text-[#5A6775]">
              {adminDenyReason}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => void verifyServerAdmin(user)}
              className="inline-flex items-center gap-2 rounded-md border border-[#C5CFD8] bg-white px-4 py-2 text-sm text-[#11161C] hover:border-[#0F4C81] hover:text-[#0F4C81]"
            >
              <RefreshCw className="h-4 w-4" />
              重新驗證
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 rounded-md border border-[#C5CFD8] bg-white px-4 py-2 text-sm text-[#11161C] hover:border-red-300 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
              切換其他帳號
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 狀態 5：管理後台主介面
  return (
    <div className="mx-auto max-w-7xl px-6 py-8 md:py-10">
      <header className="mb-8 flex flex-col gap-4 border-b border-[#DCE2E8] pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="font-mono text-xs font-medium uppercase tracking-[0.16em] text-[#0F4C81]">
            Firebase CMS · Firestore + Storage
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#11161C] md:text-3xl">
            馬遠榮副校長 著作管理後台
          </h1>
          <p className="mt-1 text-xs text-[#5A6775]">
            登入帳號：<span className="font-mono text-[#11161C]">{user.email}</span>
            {bundle?.updatedAt ? (
              <>
                {' '}
                · 最後發布：
                <span className="font-mono text-[#2B3642]">
                  {new Date(bundle.updatedAt).toLocaleString('zh-TW')}
                </span>
              </>
            ) : null}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-md border border-[#C5CFD8] bg-white px-3.5 py-2 text-xs font-medium text-[#11161C] transition-colors hover:border-[#0F4C81] hover:text-[#0F4C81]"
          >
            查看正式官網
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            disabled={busyAction !== null}
            onClick={handleManualRevalidate}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#C5CFD8] bg-white px-3.5 py-2 text-xs font-medium text-[#11161C] transition-colors hover:border-[#0F4C81] hover:text-[#0F4C81] disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${busyAction === 'revalidating' ? 'animate-spin' : ''}`} />
            刷新官網快取
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#DCE2E8] bg-white px-3.5 py-2 text-xs text-[#5A6775] transition-colors hover:border-red-300 hover:text-red-600"
          >
            <LogOut className="h-3.5 w-3.5" />
            登出
          </button>
        </div>
      </header>

      {toast ? (
        <div
          role="status"
          className={`mb-6 flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm ${
            toast.type === 'ok'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {toast.type === 'ok' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertTriangle className="h-4 w-4 shrink-0" />
          )}
          <span>{toast.text}</span>
        </div>
      ) : null}

      {/* 後台主功能頁籤：論文著作管理 ⇄ 親筆黑板手稿相簿 */}
      <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-[#DCE2E8] pb-4">
        <button
          type="button"
          onClick={() => setSectionTab('publications')}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
            sectionTab === 'publications'
              ? 'bg-[#0F4C81] text-white'
              : 'border border-[#DCE2E8] bg-white text-[#5A6775] hover:border-[#0F4C81] hover:text-[#0F4C81]'
          }`}
        >
          論文著作管理（{items.length}）
        </button>
        <button
          type="button"
          onClick={() => setSectionTab('chalkboards')}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
            sectionTab === 'chalkboards'
              ? 'bg-[#1B3329] text-[#F3DF87]'
              : 'border border-[#DCE2E8] bg-white text-[#5A6775] hover:border-[#1B3329] hover:text-[#1B3329]'
          }`}
        >
          黑板手稿相簿（Chalkboards）
        </button>
      </div>

      {sectionTab === 'chalkboards' ? (
        <ChalkboardManagerTab
          user={user}
          onTriggerRevalidate={triggerRevalidate}
          onToast={showToast}
        />
      ) : (
        <>
          {/* 統計總覽 */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: '總論文數', value: items.length.toLocaleString('en-US'), accent: false },
          { label: '總引用次數', value: totalCitations.toLocaleString('en-US'), accent: false },
          { label: '即時 H-Index', value: String(hIndex), accent: true },
          { label: '無摘要圖篇數', value: String(missingCoverCount), accent: false },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-[#DCE2E8] bg-white px-5 py-4"
          >
            <div className="font-mono text-xs text-[#5A6775]">{card.label}</div>
            <div
              className={`mt-1.5 font-mono text-3xl font-semibold [font-variant-numeric:tabular-nums] ${
                card.accent ? 'text-[#0F4C81]' : 'text-[#11161C]'
              }`}
            >
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* 首次啟用導引 */}
      {!loadingData && items.length === 0 ? (
        <div className="mb-8 rounded-lg border border-[#0F4C81]/30 bg-[#EBF2F8] p-6">
          <h2 className="mb-2 text-lg font-semibold text-[#11161C]">
            Firestore 尚未建立論文資料 — 一鍵匯入資料
          </h2>
          <p className="mb-4 max-w-2xl text-sm leading-relaxed text-[#2B3642]">
            點擊下方按鈕即可自動抓取現有 218 篇論文並寫入 Firebase Firestore（單一彙總文件，全站讀取極省額度），或匯入清洗後的本機 JSON。
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={busyAction !== null}
              onClick={handleImportFromPortal}
              className="inline-flex items-center gap-2 rounded-md bg-[#0F4C81] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0B3A63] disabled:opacity-50"
            >
              {busyAction === 'importing' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CloudDownload className="h-4 w-4" />
              )}
              一鍵從 B 站匯入現有論文
            </button>
            <button
              type="button"
              disabled={busyAction !== null}
              onClick={() => fileImportRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-md border border-[#C5CFD8] bg-white px-4 py-2.5 text-sm font-medium text-[#11161C] hover:border-[#0F4C81] hover:text-[#0F4C81]"
            >
              <Upload className="h-4 w-4" />
              從本機上傳 JSON
            </button>
          </div>
        </div>
      ) : null}

      {/* 操作列與篩選 */}
      <div className="mb-6 flex flex-col gap-4 rounded-lg border border-[#DCE2E8] bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setEditorTarget({ open: true, pub: null })}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#0F4C81] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0B3A63]"
            >
              <Plus className="h-4 w-4" />
              新增論文
            </button>

            <input
              ref={fileImportRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                void handleImportLocalJson(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
            <button
              type="button"
              disabled={busyAction !== null}
              onClick={() => fileImportRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#C5CFD8] bg-white px-3.5 py-2 text-xs font-medium text-[#2B3642] hover:border-[#0F4C81] hover:text-[#0F4C81]"
            >
              <Upload className="h-3.5 w-3.5" />
              匯入 JSON
            </button>
            <button
              type="button"
              disabled={items.length === 0 || busyAction !== null}
              onClick={() => void handleSyncMetadata()}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#0F4C81]/35 bg-[#EBF2F8] px-3.5 py-2 text-xs font-medium text-[#0F4C81] transition-colors hover:bg-[#0F4C81] hover:text-white disabled:opacity-40"
            >
              {busyAction === 'syncing' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              比對更新引用與作者（Crossref / OpenAlex）
            </button>
            <button
              type="button"
              disabled={items.length === 0}
              onClick={handleExportJson}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#C5CFD8] bg-white px-3.5 py-2 text-xs font-medium text-[#2B3642] hover:border-[#0F4C81] hover:text-[#0F4C81] disabled:opacity-40"
            >
              <Download className="h-3.5 w-3.5" />
              匯出備份 JSON
            </button>
            {items.length > 0 ? (
              <button
                type="button"
                disabled={busyAction !== null}
                onClick={handleImportFromPortal}
                className="inline-flex items-center gap-1.5 rounded-md border border-[#DCE2E8] bg-[#F6F7F8] px-3.5 py-2 text-xs text-[#5A6775] hover:border-[#94A3B8] hover:text-[#11161C]"
              >
                <CloudDownload className="h-3.5 w-3.5" />
                從 B 站重同步
              </button>
            ) : null}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="搜尋標題、期刊、年份、DOI..."
              className="w-full rounded-md border border-[#DCE2E8] bg-[#F6F7F8] py-2 pl-9 pr-3 text-sm text-[#11161C] placeholder:text-[#94A3B8] focus:border-[#0F4C81] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EEF1F5] pt-3">
          <div className="flex flex-wrap gap-2">
            {(
              [
                ['all', `全部 (${items.length})`],
                ['starred', '通訊作者'],
                ['highCited', '高引用 (≥50)'],
                ['missingCover', `無摘要圖 (${missingCoverCount})`],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setFilter(key);
                  setPage(1);
                }}
                className={`rounded-md border px-3 py-1 font-mono text-xs transition-colors ${
                  filter === key
                    ? 'border-[#0F4C81] bg-[#EBF2F8] font-semibold text-[#0F4C81]'
                    : 'border-[#DCE2E8] bg-[#F6F7F8] text-[#5A6775] hover:border-[#94A3B8] hover:text-[#11161C]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as AdminSort)}
              aria-label="排序方式"
              className="rounded-md border border-[#DCE2E8] bg-[#F6F7F8] px-3 py-1.5 font-mono text-xs text-[#11161C] focus:border-[#0F4C81] focus:outline-none"
            >
              <option value="newest">最新年份優先</option>
              <option value="citations">引用次數高到低</option>
              <option value="title">標題 A–Z</option>
            </select>
            <span className="font-mono text-xs text-[#5A6775]">
              符合 {filteredItems.length} 篇
            </span>
          </div>
        </div>
      </div>

      {/* 論文清單 */}
      {loadingData ? (
        <div className="flex items-center justify-center gap-2 py-20 text-[#5A6775]">
          <Loader2 className="h-5 w-5 animate-spin text-[#0F4C81]" />
          正在讀取 Firestore 資料...
        </div>
      ) : (
        <div className="divide-y divide-[#DCE2E8] overflow-hidden rounded-lg border border-[#DCE2E8] bg-white">
          {pageItems.map((pub, idx) => {
            const key = getPublicationKey(pub, idx);
            const thumb = pub.cover_url?.trim() || '';
            return (
              <div
                key={key}
                className="flex flex-col gap-4 p-4 transition-colors hover:bg-[#FAFBFC] sm:flex-row sm:items-center"
              >
                <div className="flex h-14 w-24 shrink-0 items-center justify-center overflow-hidden rounded border border-[#DCE2E8] bg-[#F6F7F8]">
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumb}
                      alt=""
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-contain bg-white p-1"
                    />
                  ) : (
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] text-[#94A3B8]">
                      <ImageOff className="h-3.5 w-3.5" /> 純文字
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded bg-[#EBF2F8] px-2 py-0.5 font-mono font-semibold text-[#0F4C81]">
                      {pub.year || '-'}
                    </span>
                    {pub.is_star === '是' ? (
                      <span className="inline-flex items-center gap-1 font-medium text-[#0F4C81]">
                        <Star className="h-3 w-3 fill-[#0F4C81] text-[#0F4C81]" />
                        通訊作者
                      </span>
                    ) : null}
                    <span className="font-mono text-[#2B3642]">引用：{pub.citations}</span>
                    <span className="truncate text-[#5A6775]">· {pub.journal}</span>
                  </div>
                  <h3 className="line-clamp-2 text-sm font-medium text-[#11161C]">{pub.title}</h3>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditorTarget({ open: true, pub })}
                    className="inline-flex items-center gap-1.5 rounded-md border border-[#C5CFD8] bg-white px-3 py-1.5 text-xs font-medium text-[#11161C] transition-colors hover:border-[#0F4C81] hover:text-[#0F4C81]"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    編輯
                  </button>
                  <button
                    type="button"
                    disabled={busyAction !== null}
                    onClick={() => handleDeleteOne(pub)}
                    className="inline-flex items-center gap-1 rounded-md border border-[#DCE2E8] bg-white px-3 py-1.5 text-xs text-[#5A6775] transition-colors hover:border-red-300 hover:text-red-600 disabled:opacity-40"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    刪除
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 分頁控制 */}
      {totalPages > 1 ? (
        <div className="mt-8 flex items-center justify-center gap-3 font-mono text-xs">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-md border border-[#C5CFD8] bg-white px-4 py-2 text-[#11161C] hover:border-[#0F4C81] disabled:opacity-40"
          >
            上一頁
          </button>
          <span className="text-[#5A6775]">
            第 {safePage} / {totalPages} 頁
          </span>
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-md border border-[#C5CFD8] bg-white px-4 py-2 text-[#11161C] hover:border-[#0F4C81] disabled:opacity-40"
          >
            下一頁
          </button>
        </div>
      ) : null}

      {/* 新增／編輯論文視窗 */}
      {editorTarget.open ? (
        <PublicationEditorModal
          initial={editorTarget.pub}
          isSaving={busyAction === 'saving'}
          getIdToken={getIdToken}
          onClose={() => setEditorTarget({ open: false, pub: null })}
          onSave={handleSaveOne}
        />
      ) : null}
        </>
      )}
    </div>
  );
}
