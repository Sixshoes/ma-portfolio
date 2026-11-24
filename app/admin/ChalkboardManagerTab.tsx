'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ImagePlus,
  Loader2,
  RefreshCw,
  Save,
  Sparkles,
  Star,
  Trash2,
} from 'lucide-react';
import { DEFAULT_CHALKBOARDS, type ChalkboardItem } from '@/lib/chalkboards';
import {
  isFirebaseStorageConfigured,
  loadChalkboardsBundleFromFirestore,
  saveChalkboardsBundleToFirestore,
  uploadChalkboardImage,
} from '@/lib/firebase';

const ALLOWED_CHALKBOARD_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
]);

type ChalkboardManagerTabProps = {
  user: User;
  onTriggerRevalidate: (currentUser: User) => Promise<{ ok: boolean; error?: string }>;
  onToast: (type: 'ok' | 'err', text: string) => void;
  onDirtyChange?: (dirty: boolean) => void;
};

/** /admin 黑板手稿相簿管理分頁：支援多張拖放上傳（自動轉 1800px WebP）、編輯公式註解、排序與首頁輪播開關 */
export function ChalkboardManagerTab({
  user,
  onTriggerRevalidate,
  onToast,
  onDirtyChange,
}: ChalkboardManagerTabProps) {
  const [items, setItems] = useState<ChalkboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dirty, setDirty] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    onDirtyChange?.(dirty);
    return () => {
      onDirtyChange?.(false);
    };
  }, [dirty, onDirtyChange]);

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const doc = await loadChalkboardsBundleFromFirestore();
      if (!mountedRef.current) return;
      if (doc && doc.items.length > 0) {
        setItems(doc.items);
      } else {
        setItems(DEFAULT_CHALKBOARDS);
      }
      setDirty(false);
    } catch (err) {
      if (!mountedRef.current) return;
      const msg = err instanceof Error ? err.message : '未知錯誤';
      setLoadError(msg);
      onToast('err', `讀取黑板相簿失敗：${msg}`);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [onToast]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const isLocked = loading || uploading || saving || Boolean(loadError);

  const handleFilesSelected = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0 || isLocked) return;
      if (!isFirebaseStorageConfigured()) {
        onToast('err', '尚未設定 Firebase Storage（NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET）。');
        return;
      }

      const files = Array.from(fileList).filter((f) =>
        ALLOWED_CHALKBOARD_MIMES.has(f.type.toLowerCase()),
      );
      if (files.length === 0) {
        onToast('err', '請選擇 JPG / PNG / WebP / AVIF 黑板照片檔案（不接受 SVG 或非點陣圖格式）。');
        return;
      }

      setUploading(true);
      const uploaded: ChalkboardItem[] = [];
      const failedNames: string[] = [];
      try {
        for (let i = 0; i < files.length; i += 1) {
          const file = files[i];
          const stem = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
          try {
            const { downloadUrl, id } = await uploadChalkboardImage(file);
            uploaded.push({
              id,
              imageUrl: downloadUrl,
              titleZh: stem || '親筆黑板物理推導手稿',
              titleEn: stem || 'Physics Chalkboard Derivation',
              formulaNote: '',
              courseOrTopic: 'Physics Lecture',
              year: String(new Date().getFullYear()),
              featuredInHero: true,
              order: items.length + uploaded.length + 1,
            });
          } catch (err) {
            failedNames.push(
              `${file.name}（${err instanceof Error ? err.message : '上傳失敗'}）`,
            );
          }
        }
      } finally {
        if (mountedRef.current) {
          if (uploaded.length > 0) {
            setItems((prev) =>
              [...uploaded, ...prev].map((it, idx) => ({ ...it, order: idx + 1 })),
            );
            setDirty(true);
          }
          if (failedNames.length > 0 && uploaded.length > 0) {
            onToast(
              'err',
              `已上傳 ${uploaded.length} 張，但 ${failedNames.length} 張失敗：${failedNames[0]}（請記得按「儲存並發布」保留成功項目）`,
            );
          } else if (failedNames.length > 0) {
            onToast(
              'err',
              `上傳失敗：${failedNames[0]}（請確認 storage.rules 已開通 chalkboards/*）`,
            );
          } else if (uploaded.length > 0) {
            onToast(
              'ok',
              `已轉為 1800px 高清 WebP 上傳 ${uploaded.length} 張黑板照，請填寫公式註解後按「儲存並發布」。`,
            );
          }
          setUploading(false);
        }
      }
    },
    [isLocked, items.length, onToast],
  );

  const updateField = <K extends keyof ChalkboardItem>(
    id: string,
    field: K,
    value: ChalkboardItem[K],
  ) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
    setDirty(true);
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(index, 1);
      next.splice(target, 0, moved);
      return next.map((it, idx) => ({ ...it, order: idx + 1 }));
    });
    setDirty(true);
  };

  const removeItem = (id: string) => {
    if (!window.confirm('確定要從黑板相簿移除這張手稿嗎？（需按「儲存並發布」才會生效）')) return;
    setItems((prev) => prev.filter((it) => it.id !== id).map((it, idx) => ({ ...it, order: idx + 1 })));
    setDirty(true);
  };

  const handleSaveAndPublish = async () => {
    if (isLocked) return;
    if (!user.email) {
      onToast('err', '尚未登入管理者帳號，請重新登入後再儲存。');
      return;
    }
    setSaving(true);
    try {
      const saved = await saveChalkboardsBundleToFirestore(items, user.email);
      if (!mountedRef.current) return;
      setItems(saved.items);
      setDirty(false);
      const rev = await onTriggerRevalidate(user);
      if (!mountedRef.current) return;
      if (rev.ok) {
        onToast('ok', `已儲存 ${saved.items.length} 張黑板手稿並立即刷新官網快取！`);
      } else {
        onToast('err', `黑板相簿已存檔，但刷新快取失敗：${rev.error}`);
      }
    } catch (err) {
      if (!mountedRef.current) return;
      const msg = err instanceof Error ? err.message : '儲存失敗';
      if (msg.includes('permission-denied') || msg.includes('PERMISSION_DENIED')) {
        onToast('err', '權限不足：請確認已將最新 firestore.rules（含 siteData/chalkboards）發布至 Firebase Console。');
      } else {
        onToast('err', `儲存失敗：${msg}`);
      }
    } finally {
      if (mountedRef.current) {
        setSaving(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {loadError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="mb-1.5 flex items-center gap-2 text-base font-semibold text-red-800">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                讀取黑板手稿相簿失敗，已鎖定上傳與儲存以防止覆蓋既有相簿
              </h2>
              <p className="font-mono text-xs text-red-700">{loadError}</p>
            </div>
            <button
              type="button"
              onClick={() => void loadData()}
              className="inline-flex items-center gap-1.5 rounded-full border border-red-300 bg-white px-4 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              重試讀取
            </button>
          </div>
        </div>
      ) : null}

      {/* 拖放上傳區（1800px WebP 高清保留粉筆數學符號） */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!isLocked) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (!isLocked) {
            void handleFilesSelected(e.dataTransfer.files);
          }
        }}
        className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
          isDragging
            ? 'border-[#1B3329] bg-[#E8F1EC]'
            : 'border-[#C5CFD8] bg-white hover:border-[#1B3329]/60'
        }`}
      >
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1B3329] text-[#F3DF87]">
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <ImagePlus className="h-5 w-5" />
          )}
        </div>
        <h2 className="text-base font-semibold text-[#11161C]">
          {uploading ? '正在轉檔 1800px 高清 WebP 並上傳...' : '拖入單張或多張馬副校長親筆黑板照片'}
        </h2>
        <p className="mt-1 max-w-lg text-xs leading-relaxed text-[#5A6775]">
          系統會自動壓縮為最長邊 1800px、品質 86% 之高清 WebP 上傳至 Firebase Storage
          （chalkboards/*），完整保留細小粉筆上下標與物理公式。
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={(e) => {
            void handleFilesSelected(e.target.files);
            e.target.value = '';
          }}
        />
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            disabled={isLocked}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-full bg-[#1B3329] px-5 py-2 text-xs font-semibold text-[#F3DF87] transition-colors hover:bg-[#244336] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ImagePlus className="h-3.5 w-3.5" />
            選擇黑板照片（可多選）
          </button>
          <button
            type="button"
            disabled={isLocked}
            onClick={() => void handleSaveAndPublish()}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              dirty
                ? 'bg-[#0F4C81] hover:bg-[#0B3A63]'
                : 'bg-[#5A6775] hover:bg-[#3F4A56]'
            }`}
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            {dirty ? '儲存變更並即時發布官網' : '儲存並發布黑板相簿'}
          </button>
        </div>
      </div>

      {/* 手稿清單編輯區 */}
      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-[#5A6775]">
          <Loader2 className="h-5 w-5 animate-spin text-[#1B3329]" />
          讀取黑板手稿相簿中...
        </div>
      ) : loadError ? null : items.length === 0 ? (
        <div className="rounded-2xl border border-[#DCE2E8] bg-white p-10 text-center text-sm text-[#5A6775]">
          目前尚未上架任何黑板手稿照片，請直接拖入上方區塊開始上傳。
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="grid grid-cols-1 gap-5 rounded-2xl border border-[#DCE2E8] bg-white p-5 shadow-xs md:grid-cols-12"
            >
              {/* 左 4 欄：預覽縮圖與排序 */}
              <div className="flex flex-col gap-2 md:col-span-4">
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-[#2F5243] bg-[#1B3329]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.titleZh}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute left-2.5 top-2.5 rounded-full bg-[#152820]/85 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-[#F3DF87]">
                    PLATE {String(idx + 1).padStart(2, '0')}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-[#11161C]">
                    <input
                      type="checkbox"
                      checked={Boolean(item.featuredInHero)}
                      onChange={(e) => updateField(item.id, 'featuredInHero', e.target.checked)}
                      className="h-4 w-4 rounded accent-[#1B3329]"
                    />
                    <Star className="h-3.5 w-3.5 text-[#C88A2B]" />
                    設為首頁輪播精選
                  </label>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveItem(idx, -1)}
                      aria-label="上移"
                      className="rounded-lg border border-[#DCE2E8] p-1 text-[#5A6775] hover:border-[#11161C] hover:text-[#11161C] disabled:opacity-30"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === items.length - 1}
                      onClick={() => moveItem(idx, 1)}
                      aria-label="下移"
                      className="rounded-lg border border-[#DCE2E8] p-1 text-[#5A6775] hover:border-[#11161C] hover:text-[#11161C] disabled:opacity-30"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      aria-label="刪除"
                      className="rounded-lg border border-[#DCE2E8] p-1 text-[#5A6775] hover:border-red-300 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* 右 8 欄：手稿中英文標題、公式註解與課程主題 */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:col-span-8">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#5A6775]">
                    中文主題標題
                  </label>
                  <input
                    type="text"
                    value={item.titleZh}
                    onChange={(e) => updateField(item.id, 'titleZh', e.target.value)}
                    className="w-full rounded-xl border border-[#DCE2E8] bg-[#F8F9FA] px-3 py-2 text-sm text-[#11161C] focus:border-[#1B3329] focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#5A6775]">
                    English Title
                  </label>
                  <input
                    type="text"
                    value={item.titleEn}
                    onChange={(e) => updateField(item.id, 'titleEn', e.target.value)}
                    className="w-full rounded-xl border border-[#DCE2E8] bg-[#F8F9FA] px-3 py-2 text-sm text-[#11161C] focus:border-[#1B3329] focus:bg-white focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 inline-flex items-center gap-1 text-xs font-medium text-[#5A6775]">
                    <Sparkles className="h-3 w-3 text-[#C88A2B]" />
                    物理公式或推導重點說明
                  </label>
                  <input
                    type="text"
                    value={item.formulaNote}
                    placeholder="例如：T = |F/A|² = [1 + V₀² sinh²(κL) / 4E(V₀ − E)]⁻¹"
                    onChange={(e) => updateField(item.id, 'formulaNote', e.target.value)}
                    className="w-full rounded-xl border border-[#DCE2E8] bg-[#F8F9FA] px-3 py-2 font-mono text-xs text-[#11161C] focus:border-[#1B3329] focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#5A6775]">
                    課程或物理主題標籤
                  </label>
                  <input
                    type="text"
                    value={item.courseOrTopic ?? ''}
                    placeholder="Quantum Mechanics / STM"
                    onChange={(e) => updateField(item.id, 'courseOrTopic', e.target.value)}
                    className="w-full rounded-xl border border-[#DCE2E8] bg-[#F8F9FA] px-3 py-2 text-xs text-[#11161C] focus:border-[#1B3329] focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[#5A6775]">
                    年份（選填）
                  </label>
                  <input
                    type="text"
                    value={item.year ?? ''}
                    placeholder="2025"
                    onChange={(e) => updateField(item.id, 'year', e.target.value)}
                    className="w-full rounded-xl border border-[#DCE2E8] bg-[#F8F9FA] px-3 py-2 font-mono text-xs text-[#11161C] focus:border-[#1B3329] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
