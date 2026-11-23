'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ImagePlus, Loader2, Star, Trash2, Upload, X } from 'lucide-react';
import { extractDoiIdentifier, type Publication } from '@/lib/publications';
import { isFirebaseStorageConfigured, uploadPublicationImage } from '@/lib/firebase';

type PublicationEditorModalProps = {
  initial: Publication | null;
  isSaving: boolean;
  onClose: () => void;
  onSave: (pub: Publication) => Promise<void>;
};

function createEmptyDraft(): Publication {
  return {
    id: crypto.randomUUID(),
    title: '',
    year: new Date().getFullYear(),
    journal: '',
    doi: '',
    citations: 0,
    is_star: '否',
    highlight: '📄 一般論文',
    cover_url: '',
    file_img: '',
    authors: '',
    takeaway: '',
    abstract_excerpt: '',
  };
}

export function PublicationEditorModal({
  initial,
  isSaving,
  onClose,
  onSave,
}: PublicationEditorModalProps) {
  const [draft, setDraft] = useState<Publication>(() =>
    initial
      ? {
          ...initial,
          id: initial.id?.trim() || crypto.randomUUID(),
          authors: initial.authors ?? '',
          takeaway: initial.takeaway ?? '',
          abstract_excerpt: initial.abstract_excerpt ?? '',
        }
      : createEmptyDraft(),
  );
  const [error, setError] = useState<string | null>(null);
  const [uploadingSlot, setUploadingSlot] = useState<'cover_url' | 'file_img' | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const journalInputRef = useRef<HTMLInputElement>(null);
  const storageReady = isFirebaseStorageConfigured();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSaving) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isSaving, onClose]);

  const handleImageUpload = async (file: File | undefined, slot: 'cover_url' | 'file_img') => {
    if (!file) return;
    setError(null);
    setUploadingSlot(slot);
    try {
      const folder = slot === 'cover_url' ? 'covers' : 'journals';
      const downloadUrl = await uploadPublicationImage(file, folder);
      setDraft((prev) => ({ ...prev, [slot]: downloadUrl }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : '圖片上傳失敗';
      setError(`圖片上傳失敗（請確認 Firebase Storage 與 storage.rules 已啟用）：${msg}`);
    } finally {
      setUploadingSlot(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!draft.title.trim()) {
      setError('請填寫論文標題。');
      return;
    }
    if (!draft.journal.trim()) {
      setError('請填寫發表期刊名稱。');
      return;
    }
    if (!Number.isFinite(draft.year) || draft.year < 1900 || draft.year > 2100) {
      setError('請輸入有效的西元年份（1900–2100）。');
      return;
    }

    const doiTrimmed = draft.doi.trim();
    if (doiTrimmed && !/^https?:\/\//i.test(doiTrimmed)) {
      setError('DOI / 文獻連結請以 https:// 開頭（例如 https://doi.org/10.xxxx/...）。');
      return;
    }

    const citations = Math.max(0, Math.floor(Number(draft.citations) || 0));
    const prepared: Publication = {
      id: draft.id?.trim() || crypto.randomUUID(),
      title: draft.title.trim(),
      year: Math.trunc(draft.year),
      journal: draft.journal.trim(),
      doi: doiTrimmed,
      citations,
      is_star: draft.is_star === '是' ? '是' : '否',
      highlight:
        citations >= 100
          ? '🔥 國際標竿'
          : citations >= 50
            ? '⭐ 重點關注'
            : '📄 一般論文',
      cover_url: draft.cover_url.trim(),
      file_img: draft.file_img.trim(),
      ...(draft.authors?.trim() ? { authors: draft.authors.trim() } : {}),
      ...(draft.takeaway?.trim() ? { takeaway: draft.takeaway.trim() } : {}),
      ...(draft.abstract_excerpt?.trim() ? { abstract_excerpt: draft.abstract_excerpt.trim() } : {}),
      ...(extractDoiIdentifier(doiTrimmed) ? { altmetric_id: extractDoiIdentifier(doiTrimmed) } : {}),
    };

    try {
      await onSave(prepared);
    } catch (err) {
      setError(err instanceof Error ? err.message : '儲存失敗，請稍後再試。');
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={initial ? '編輯論文' : '新增論文'}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={() => {
        if (!isSaving) onClose();
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-stone-700/70 bg-[#191715] shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-stone-800 px-6 py-4">
          <h2 className="font-heading-serif text-xl font-semibold text-stone-100">
            {initial ? '編輯論文資料' : '新增論文'}
          </h2>
          <button
            type="button"
            disabled={isSaving}
            onClick={onClose}
            aria-label="關閉視窗"
            className="rounded-full p-2 text-stone-400 transition-colors hover:bg-stone-800 hover:text-stone-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            {error ? (
              <div className="rounded-xl border border-red-500/40 bg-red-950/50 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <div>
              <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-stone-300">
                論文標題 *
              </label>
              <input
                type="text"
                required
                value={draft.title}
                onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
                placeholder="例如：Alloy engineering of PbS1-xSex nanostructures..."
                className="w-full rounded-xl border border-stone-700/80 bg-[#121110] px-4 py-2.5 text-sm text-stone-100 placeholder:text-stone-500 focus:border-[#d4af37] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-stone-300">
                  發表年份 *
                </label>
                <input
                  type="number"
                  required
                  min={1900}
                  max={2100}
                  value={draft.year || ''}
                  onChange={(e) =>
                    setDraft((p) => ({ ...p, year: Number.parseInt(e.target.value, 10) || 0 }))
                  }
                  className="w-full rounded-xl border border-stone-700/80 bg-[#121110] px-4 py-2.5 font-mono text-sm text-stone-100 focus:border-[#d4af37] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-stone-300">
                  引用次數
                </label>
                <input
                  type="number"
                  min={0}
                  value={draft.citations}
                  onChange={(e) =>
                    setDraft((p) => ({
                      ...p,
                      citations: Math.max(0, Number.parseInt(e.target.value, 10) || 0),
                    }))
                  }
                  className="w-full rounded-xl border border-stone-700/80 bg-[#121110] px-4 py-2.5 font-mono text-sm text-stone-100 focus:border-[#d4af37] focus:outline-none"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() =>
                    setDraft((p) => ({ ...p, is_star: p.is_star === '是' ? '否' : '是' }))
                  }
                  className={`flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                    draft.is_star === '是'
                      ? 'border-[#d4af37]/70 bg-[#332a1d] text-[#f0e4cc]'
                      : 'border-stone-700/80 bg-[#121110] text-stone-300 hover:border-stone-600'
                  }`}
                >
                  <Star
                    className={`h-4 w-4 ${
                      draft.is_star === '是' ? 'fill-[#d4af37] text-[#d4af37]' : 'text-stone-400'
                    }`}
                  />
                  {draft.is_star === '是' ? '通訊作者（打星號）' : '共同作者（一般）'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-stone-300">
                  發表期刊 *
                </label>
                <input
                  type="text"
                  required
                  value={draft.journal}
                  onChange={(e) => setDraft((p) => ({ ...p, journal: e.target.value }))}
                  placeholder="例如：Advanced Functional Materials"
                  className="w-full rounded-xl border border-stone-700/80 bg-[#121110] px-4 py-2.5 text-sm text-stone-100 placeholder:text-stone-500 focus:border-[#d4af37] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-stone-300">
                  DOI / 文獻連結
                </label>
                <input
                  type="url"
                  value={draft.doi}
                  onChange={(e) => setDraft((p) => ({ ...p, doi: e.target.value }))}
                  placeholder="https://doi.org/10.xxxx/..."
                  className="w-full rounded-xl border border-stone-700/80 bg-[#121110] px-4 py-2.5 font-mono text-sm text-stone-100 placeholder:text-stone-500 focus:border-[#d4af37] focus:outline-none"
                />
              </div>
            </div>

            {/* 圖片上傳與網址區 */}
            <div className="grid grid-cols-1 gap-4 rounded-2xl border border-stone-800 bg-[#141210] p-4 sm:grid-cols-2">
              {([
                {
                  slot: 'cover_url' as const,
                  label: '圖文摘要主圖（Graphical Abstract）',
                  inputRef: coverInputRef,
                },
                {
                  slot: 'file_img' as const,
                  label: '期刊封面圖（備援／附圖）',
                  inputRef: journalInputRef,
                },
              ]).map(({ slot, label, inputRef }) => {
                const value = draft[slot];
                const isUploading = uploadingSlot === slot;
                return (
                  <div key={slot} className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="font-mono text-xs text-stone-300">{label}</label>
                      {value ? (
                        <button
                          type="button"
                          onClick={() => setDraft((p) => ({ ...p, [slot]: '' }))}
                          className="inline-flex items-center gap-1 text-xs text-stone-400 hover:text-red-300"
                        >
                          <Trash2 className="h-3 w-3" /> 清除
                        </button>
                      ) : null}
                    </div>

                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        if (file) void handleImageUpload(file, slot);
                      }}
                      className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-stone-700 bg-[#1b1917]"
                    >
                      {value ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={value}
                          alt={label}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-contain p-1.5"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-1.5 px-4 text-center text-xs text-stone-400">
                          <ImagePlus className="h-6 w-6 text-stone-500" />
                          <span>拖曳圖片到此，或點擊下方上傳</span>
                        </div>
                      )}
                      {isUploading ? (
                        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/75 text-xs text-[#e8dcc4]">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          壓縮並上傳至 Firebase Storage...
                        </div>
                      ) : null}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={value}
                        onChange={(e) => setDraft((p) => ({ ...p, [slot]: e.target.value }))}
                        placeholder="貼上外部圖片網址或上傳..."
                        className="min-w-0 flex-1 rounded-lg border border-stone-700/80 bg-[#121110] px-3 py-1.5 font-mono text-xs text-stone-200 placeholder:text-stone-500 focus:border-[#d4af37] focus:outline-none"
                      />
                      <input
                        ref={inputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void handleImageUpload(file, slot);
                          e.target.value = '';
                        }}
                      />
                      <button
                        type="button"
                        disabled={!storageReady || isUploading}
                        onClick={() => inputRef.current?.click()}
                        title={storageReady ? '上傳圖片到 Firebase Storage（自動轉 WebP）' : '尚未設定 Storage Bucket'}
                        className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-[#c4a77d]/45 bg-[#2a241c]/60 px-3 py-1.5 font-mono text-xs text-[#f0e4cc] transition-colors hover:bg-[#3a3125] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        上傳
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 選填進階導讀欄位（解鎖官網作者高亮／亮點列點／展開摘要） */}
            <div className="space-y-4 rounded-2xl border border-stone-800/80 bg-[#141210]/70 p-4">
              <div className="font-mono text-xs uppercase tracking-wider text-[#d4af37]">
                選填：深度導讀欄位（填入即自動顯示於官網卡片）
              </div>
              <div>
                <label className="mb-1 block text-xs text-stone-300">
                  作者名單（以英文逗號分隔，含 Yuan-Ron Ma 或 馬遠榮 將自動高亮）
                </label>
                <input
                  type="text"
                  value={draft.authors ?? ''}
                  onChange={(e) => setDraft((p) => ({ ...p, authors: e.target.value }))}
                  placeholder="例如：Yuan-Ron Ma*, A. B. Author, C. D. Author"
                  className="w-full rounded-xl border border-stone-700/80 bg-[#121110] px-3.5 py-2 text-sm text-stone-100 placeholder:text-stone-500 focus:border-[#d4af37] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-stone-300">
                  研究亮點列點（多句請以 <code className="text-[#e8dcc4]">|</code> 分隔）
                </label>
                <input
                  type="text"
                  value={draft.takeaway ?? ''}
                  onChange={(e) => setDraft((p) => ({ ...p, takeaway: e.target.value }))}
                  placeholder="例如：室溫下高靈敏度偵測 H2S | 建立異質接面感測機制"
                  className="w-full rounded-xl border border-stone-700/80 bg-[#121110] px-3.5 py-2 text-sm text-stone-100 placeholder:text-stone-500 focus:border-[#d4af37] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-stone-300">摘要／白話導讀（可於官網展開閱讀）</label>
                <textarea
                  rows={3}
                  value={draft.abstract_excerpt ?? ''}
                  onChange={(e) => setDraft((p) => ({ ...p, abstract_excerpt: e.target.value }))}
                  placeholder="簡述研究核心發現與應用價值..."
                  className="w-full rounded-xl border border-stone-700/80 bg-[#121110] px-3.5 py-2 text-sm text-stone-100 placeholder:text-stone-500 focus:border-[#d4af37] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-stone-800 px-6 py-4">
            <button
              type="button"
              disabled={isSaving}
              onClick={onClose}
              className="rounded-full border border-stone-700 px-5 py-2 text-sm text-stone-300 transition-colors hover:bg-stone-800 hover:text-stone-100"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSaving || uploadingSlot !== null}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#dcc08e] to-[#c4a265] px-6 py-2 text-sm font-semibold text-stone-950 transition-all hover:brightness-105 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              儲存並即時發布至官網
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
