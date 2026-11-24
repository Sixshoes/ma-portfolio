'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Crop,
  FileText,
  ImagePlus,
  Loader2,
  Sparkles,
  Star,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { extractDoiIdentifier, type Publication } from '@/lib/publications';
import { isFirebaseStorageConfigured, uploadPublicationImage } from '@/lib/firebase';

type PublicationEditorModalProps = {
  initial: Publication | null;
  isSaving: boolean;
  getIdToken: () => Promise<string>;
  onClose: () => void;
  onSave: (pub: Publication) => Promise<void>;
};

type RenderedPdfPage = {
  pageNumber: number;
  width: number;
  height: number;
  dataUrl: string;
};

type CropBox = {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
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

function buildDoiSlug(doi: string, fallbackId?: string): string {
  const bare = extractDoiIdentifier(doi) ?? fallbackId ?? '';
  const slug = bare
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96);
  return slug || `figure-${Date.now()}`;
}

export function PublicationEditorModal({
  initial,
  isSaving,
  getIdToken,
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
  const [notice, setNotice] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isFetchingDoi, setIsFetchingDoi] = useState(false);

  // PDF 拖曳抽圖狀態（動態載入 pdfjs-dist，不影響前台 bundle）
  const [isParsingPdf, setIsParsingPdf] = useState(false);
  const [pdfPages, setPdfPages] = useState<RenderedPdfPage[]>([]);
  const [activePdfPageIdx, setActivePdfPageIdx] = useState(0);
  const [cropBox, setCropBox] = useState<CropBox | null>(null);
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const pdfPreviewImgRef = useRef<HTMLImageElement>(null);
  const storageReady = isFirebaseStorageConfigured();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSaving) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isSaving, onClose]);

  const handleImageUpload = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      setError(null);
      setNotice(null);
      setIsUploading(true);
      try {
        const slug = buildDoiSlug(draft.doi, draft.id);
        const downloadUrl = await uploadPublicationImage(file, 'covers', slug);
        setDraft((prev) => ({ ...prev, cover_url: downloadUrl }));
        setNotice('已壓縮轉檔 WebP 並上傳至自家 Firebase Storage。');
      } catch (err) {
        const msg = err instanceof Error ? err.message : '圖片上傳失敗';
        setError(`圖片上傳失敗（請確認 Firebase Storage 與 storage.rules 已啟用）：${msg}`);
      } finally {
        setIsUploading(false);
      }
    },
    [draft.doi, draft.id],
  );

  // 軌道 A：依 DOI 呼叫伺服器端 POST /api/admin/fetch-figure（Elsevier API + OpenAlex/Unpaywall/Crossref）
  const handleAutoFetchByDoi = async () => {
    if (!draft.doi.trim()) {
      setError('請先於上方填入論文 DOI 連結，再執行自動抓取。');
      return;
    }
    setError(null);
    setNotice(null);
    setIsFetchingDoi(true);
    try {
      const token = await getIdToken();
      const res = await fetch('/api/admin/fetch-figure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ doi: draft.doi.trim(), title: draft.title.trim() }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        url?: string;
        width?: number;
        height?: number;
        source?: string;
        error?: string;
      };
      if (!res.ok || !body.ok || !body.url) {
        setError(body.error ?? `自動抓圖失敗（HTTP ${res.status}）`);
        return;
      }
      setDraft((prev) => ({ ...prev, cover_url: body.url! }));
      setNotice(
        `已成功從 ${body.source ?? 'API'} 取得摘要圖（${body.width ?? '?'}×${body.height ?? '?'}px）並轉存自家 Storage WebP。`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : '無法連線至自動取圖 API。');
    } finally {
      setIsFetchingDoi(false);
    }
  };

  // 軌道 B：於瀏覽器端動態載入 pdfjs-dist 渲染 PDF 第 1–2 頁供框選裁切
  const handlePdfFile = async (file: File | undefined) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('請選擇或拖入 PDF 格式的論文檔案。');
      return;
    }

    setError(null);
    setNotice(null);
    setIsParsingPdf(true);
    setPdfPages([]);
    setCropBox(null);
    setActivePdfPageIdx(0);

    try {
      const pdfjs = await import('pdfjs-dist');
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url,
      ).toString();

      const data = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({ data });
      const pdf = await loadingTask.promise;
      const pagesToRender = Math.min(2, pdf.numPages);
      const rendered: RenderedPdfPage[] = [];

      for (let pageNumber = 1; pageNumber <= pagesToRender; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1.8 });
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(viewport.width);
        canvas.height = Math.round(viewport.height);
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({
          canvas,
          canvasContext: ctx,
          viewport,
        }).promise;

        rendered.push({
          pageNumber,
          width: canvas.width,
          height: canvas.height,
          dataUrl: canvas.toDataURL('image/png'),
        });
      }

      if (rendered.length === 0) {
        setError('無法從此 PDF 渲染出頁面影像。');
      } else {
        setPdfPages(rendered);
        setNotice(`已載入 PDF 前 ${rendered.length} 頁：請在下方預覽圖上拖曳框選圖解摘要區域後點擊上傳。`);
      }
    } catch (err) {
      setError(
        `解析 PDF 失敗：${err instanceof Error ? err.message : '檔案損毀或受加密保護'}`,
      );
    } finally {
      setIsParsingPdf(false);
    }
  };

  const getRelativePoint = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    return { x, y };
  };

  const handleCropPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const pt = getRelativePoint(e);
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDraggingCrop(true);
    setCropBox({ startX: pt.x, startY: pt.y, endX: pt.x, endY: pt.y });
  };

  const handleCropPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingCrop) return;
    const pt = getRelativePoint(e);
    setCropBox((prev) => (prev ? { ...prev, endX: pt.x, endY: pt.y } : null));
  };

  const handleCropPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingCrop) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsDraggingCrop(false);
  };

  const normalizedCrop = cropBox
    ? {
        x: Math.min(cropBox.startX, cropBox.endX),
        y: Math.min(cropBox.startY, cropBox.endY),
        w: Math.abs(cropBox.endX - cropBox.startX),
        h: Math.abs(cropBox.endY - cropBox.startY),
      }
    : null;

  const hasValidCrop = Boolean(normalizedCrop && normalizedCrop.w >= 0.05 && normalizedCrop.h >= 0.05);

  const handleExtractPdfRegion = async (useWholePage: boolean) => {
    const activePage = pdfPages[activePdfPageIdx];
    const imgEl = pdfPreviewImgRef.current;
    if (!activePage || !imgEl) return;

    setError(null);
    setNotice(null);

    const sx = useWholePage || !hasValidCrop ? 0 : Math.round(normalizedCrop!.x * activePage.width);
    const sy = useWholePage || !hasValidCrop ? 0 : Math.round(normalizedCrop!.y * activePage.height);
    const sw =
      useWholePage || !hasValidCrop
        ? activePage.width
        : Math.max(240, Math.round(normalizedCrop!.w * activePage.width));
    const sh =
      useWholePage || !hasValidCrop
        ? activePage.height
        : Math.max(150, Math.round(normalizedCrop!.h * activePage.height));

    const clampedW = Math.min(sw, activePage.width - sx);
    const clampedH = Math.min(sh, activePage.height - sy);

    if (clampedW < 240 || clampedH < 150) {
      setError('框選區域過小（需至少 240×150px），請拉大框選範圍後再試。');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = clampedW;
    canvas.height = clampedH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, clampedW, clampedH);
    ctx.drawImage(imgEl, sx, sy, clampedW, clampedH, 0, 0, clampedW, clampedH);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/png'),
    );
    if (!blob) {
      setError('擷取影像失敗，請重新框選。');
      return;
    }

    const file = new File([blob], `pdf-page-${activePage.pageNumber}.png`, {
      type: 'image/png',
    });
    await handleImageUpload(file);
    setPdfPages([]);
    setCropBox(null);
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

  const activePdfPage = pdfPages[activePdfPageIdx] ?? null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={initial ? '編輯論文' : '新增論文'}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#11161C]/70 p-4 backdrop-blur-sm"
      onClick={() => {
        if (!isSaving) onClose();
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-[#DCE2E8] bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-[#DCE2E8] px-6 py-4">
          <h2 className="text-lg font-semibold text-[#11161C]">
            {initial ? '編輯論文資料' : '新增論文'}
          </h2>
          <button
            type="button"
            disabled={isSaving}
            onClick={onClose}
            aria-label="關閉視窗"
            className="rounded-md p-1.5 text-[#5A6775] transition-colors hover:bg-[#F6F7F8] hover:text-[#11161C]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            {error ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}
            {notice ? (
              <div className="rounded-md border border-[#0F4C81]/25 bg-[#EBF2F8] px-4 py-2.5 text-xs text-[#0F4C81]">
                {notice}
              </div>
            ) : null}

            <div>
              <label className="mb-1.5 block font-mono text-xs font-medium uppercase tracking-wider text-[#5A6775]">
                論文標題 *
              </label>
              <input
                type="text"
                required
                value={draft.title}
                onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
                placeholder="例如：Alloy engineering of PbS1-xSex nanostructures..."
                className="w-full rounded-md border border-[#DCE2E8] bg-[#F6F7F8] px-3.5 py-2.5 text-sm text-[#11161C] placeholder:text-[#94A3B8] focus:border-[#0F4C81] focus:bg-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block font-mono text-xs font-medium uppercase tracking-wider text-[#5A6775]">
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
                  className="w-full rounded-md border border-[#DCE2E8] bg-[#F6F7F8] px-3.5 py-2.5 font-mono text-sm text-[#11161C] focus:border-[#0F4C81] focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block font-mono text-xs font-medium uppercase tracking-wider text-[#5A6775]">
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
                  className="w-full rounded-md border border-[#DCE2E8] bg-[#F6F7F8] px-3.5 py-2.5 font-mono text-sm text-[#11161C] focus:border-[#0F4C81] focus:bg-white focus:outline-none"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() =>
                    setDraft((p) => ({ ...p, is_star: p.is_star === '是' ? '否' : '是' }))
                  }
                  className={`flex w-full items-center justify-center gap-2 rounded-md border px-3.5 py-2.5 text-sm font-medium transition-colors ${
                    draft.is_star === '是'
                      ? 'border-[#0F4C81] bg-[#EBF2F8] text-[#0F4C81]'
                      : 'border-[#DCE2E8] bg-[#F6F7F8] text-[#2B3642] hover:border-[#94A3B8]'
                  }`}
                >
                  <Star
                    className={`h-4 w-4 ${
                      draft.is_star === '是' ? 'fill-[#0F4C81] text-[#0F4C81]' : 'text-[#64748B]'
                    }`}
                  />
                  {draft.is_star === '是' ? '通訊作者（*）' : '共同作者'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block font-mono text-xs font-medium uppercase tracking-wider text-[#5A6775]">
                  發表期刊 *
                </label>
                <input
                  type="text"
                  required
                  value={draft.journal}
                  onChange={(e) => setDraft((p) => ({ ...p, journal: e.target.value }))}
                  placeholder="例如：Advanced Functional Materials"
                  className="w-full rounded-md border border-[#DCE2E8] bg-[#F6F7F8] px-3.5 py-2.5 text-sm text-[#11161C] placeholder:text-[#94A3B8] focus:border-[#0F4C81] focus:bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block font-mono text-xs font-medium uppercase tracking-wider text-[#5A6775]">
                  DOI / 文獻連結
                </label>
                <input
                  type="url"
                  value={draft.doi}
                  onChange={(e) => setDraft((p) => ({ ...p, doi: e.target.value }))}
                  placeholder="https://doi.org/10.xxxx/..."
                  className="w-full rounded-md border border-[#DCE2E8] bg-[#F6F7F8] px-3.5 py-2.5 font-mono text-sm text-[#11161C] placeholder:text-[#94A3B8] focus:border-[#0F4C81] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* 單篇專屬圖解摘要（雙軌取圖：軌道 A DOI API + 軌道 B PDF 抽圖 + 手動上傳） */}
            <div className="space-y-4 rounded-lg border border-[#DCE2E8] bg-[#F6F7F8] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-mono text-xs font-semibold uppercase tracking-wider text-[#0F4C81]">
                    單篇圖解摘要（Graphical Abstract）
                  </div>
                  <p className="mt-0.5 text-xs text-[#5A6775]">
                    僅在有單篇專屬摘要圖時前台才展開圖片欄；留空則自動以全寬緊湊純文字書目呈現。
                  </p>
                </div>
                {draft.cover_url ? (
                  <button
                    type="button"
                    onClick={() => setDraft((p) => ({ ...p, cover_url: '' }))}
                    className="inline-flex items-center gap-1 rounded border border-[#DCE2E8] bg-white px-2.5 py-1 text-xs text-[#5A6775] hover:border-red-300 hover:text-red-600"
                  >
                    <Trash2 className="h-3 w-3" /> 清除圖片
                  </button>
                ) : null}
              </div>

              {/* 雙軌快速取圖列 */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={isFetchingDoi || isUploading || !draft.doi.trim()}
                  onClick={() => void handleAutoFetchByDoi()}
                  className="inline-flex items-center gap-1.5 rounded-md border border-[#0F4C81] bg-[#0F4C81] px-3.5 py-2 font-mono text-xs font-medium text-white transition-colors hover:bg-[#0B3A63] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {isFetchingDoi ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  軌道 A：依 DOI 自動抓圖（Elsevier / 公開 API）
                </button>

                <input
                  ref={pdfInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handlePdfFile(file);
                    e.target.value = '';
                  }}
                />
                <button
                  type="button"
                  disabled={!storageReady || isParsingPdf || isUploading}
                  onClick={() => pdfInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-md border border-[#0F4C81]/40 bg-white px-3.5 py-2 font-mono text-xs font-medium text-[#0F4C81] transition-colors hover:bg-[#EBF2F8] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {isParsingPdf ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <FileText className="h-3.5 w-3.5" />
                  )}
                  軌道 B：選擇／拖入 PDF 抽圖
                </button>
              </div>

              {/* 預覽框（同時支援拖曳圖片或拖曳 PDF 檔案） */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (!file) return;
                  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
                    void handlePdfFile(file);
                  } else {
                    void handleImageUpload(file);
                  }
                }}
                className="relative flex aspect-[16/9] max-h-56 w-full items-center justify-center overflow-hidden rounded-md border border-dashed border-[#C5CFD8] bg-white"
              >
                {draft.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={draft.cover_url}
                    alt="Graphical Abstract 預覽"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-contain p-2"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1.5 px-4 text-center text-xs text-[#64748B]">
                    <ImagePlus className="h-6 w-6 text-[#94A3B8]" />
                    <span>拖曳「圖片截圖」或「論文 PDF」至此處，或點上方自動抓圖</span>
                  </div>
                )}
                {isUploading || isFetchingDoi ? (
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-white/90 text-xs font-medium text-[#0F4C81]">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isFetchingDoi ? '正在查詢出版社並經 sharp 驗證轉存...' : '正在壓縮轉 WebP 並上傳 Storage...'}
                  </div>
                ) : null}
              </div>

              {/* PDF 第 1–2 頁互動框選裁切區 */}
              {activePdfPage ? (
                <div className="space-y-3 rounded-md border border-[#0F4C81]/30 bg-white p-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Crop className="h-4 w-4 text-[#0F4C81]" />
                      <span className="text-xs font-semibold text-[#11161C]">
                        PDF 預覽抽圖（在頁面拖曳框選圖解摘要）
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {pdfPages.map((p, idx) => (
                        <button
                          key={p.pageNumber}
                          type="button"
                          onClick={() => {
                            setActivePdfPageIdx(idx);
                            setCropBox(null);
                          }}
                          className={`rounded border px-2.5 py-1 font-mono text-xs ${
                            idx === activePdfPageIdx
                              ? 'border-[#0F4C81] bg-[#0F4C81] text-white'
                              : 'border-[#DCE2E8] bg-[#F6F7F8] text-[#5A6775]'
                          }`}
                        >
                          第 {p.pageNumber} 頁
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setPdfPages([]);
                          setCropBox(null);
                        }}
                        className="rounded border border-[#DCE2E8] px-2 py-1 text-xs text-[#5A6775] hover:text-[#11161C]"
                      >
                        關閉 PDF
                      </button>
                    </div>
                  </div>

                  <div
                    onPointerDown={handleCropPointerDown}
                    onPointerMove={handleCropPointerMove}
                    onPointerUp={handleCropPointerUp}
                    className="relative mx-auto max-h-[380px] w-fit cursor-crosshair select-none overflow-hidden rounded border border-[#DCE2E8] bg-[#EEF1F5]"
                    style={{ touchAction: 'none' }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      ref={pdfPreviewImgRef}
                      src={activePdfPage.dataUrl}
                      alt={`PDF 第 ${activePdfPage.pageNumber} 頁`}
                      draggable={false}
                      className="block max-h-[380px] w-auto"
                    />
                    {normalizedCrop && normalizedCrop.w > 0.01 && normalizedCrop.h > 0.01 ? (
                      <div
                        style={{
                          left: `${normalizedCrop.x * 100}%`,
                          top: `${normalizedCrop.y * 100}%`,
                          width: `${normalizedCrop.w * 100}%`,
                          height: `${normalizedCrop.h * 100}%`,
                        }}
                        className="pointer-events-none absolute border-2 border-[#0F4C81] bg-[#0F4C81]/15"
                      />
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => void handleExtractPdfRegion(true)}
                      className="rounded-md border border-[#DCE2E8] bg-[#F6F7F8] px-3 py-1.5 font-mono text-xs text-[#2B3642] hover:border-[#0F4C81] hover:text-[#0F4C81]"
                    >
                      整頁擷取上傳
                    </button>
                    <button
                      type="button"
                      disabled={isUploading || !hasValidCrop}
                      onClick={() => void handleExtractPdfRegion(false)}
                      className="inline-flex items-center gap-1.5 rounded-md bg-[#0F4C81] px-3.5 py-1.5 font-mono text-xs font-medium text-white hover:bg-[#0B3A63] disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      <Crop className="h-3.5 w-3.5" />
                      裁切框選區並上傳 WebP
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="flex gap-2">
                <input
                  type="url"
                  value={draft.cover_url}
                  onChange={(e) => setDraft((p) => ({ ...p, cover_url: e.target.value }))}
                  placeholder="自家 Firebase Storage 圖片網址（建議使用上方自動抓圖或上傳）..."
                  className="min-w-0 flex-1 rounded-md border border-[#DCE2E8] bg-white px-3 py-1.5 font-mono text-xs text-[#11161C] placeholder:text-[#94A3B8] focus:border-[#0F4C81] focus:outline-none"
                />
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleImageUpload(file);
                    e.target.value = '';
                  }}
                />
                <button
                  type="button"
                  disabled={!storageReady || isUploading}
                  onClick={() => coverInputRef.current?.click()}
                  title={
                    storageReady
                      ? '上傳圖片到 Firebase Storage（自動轉 WebP）'
                      : '尚未設定 Storage Bucket'
                  }
                  className="inline-flex shrink-0 items-center gap-1 rounded-md border border-[#C5CFD8] bg-white px-3 py-1.5 font-mono text-xs font-medium text-[#11161C] transition-colors hover:border-[#0F4C81] hover:text-[#0F4C81] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Upload className="h-3.5 w-3.5" />
                  上傳圖片
                </button>
              </div>
            </div>

            {/* 選填深度導讀欄位 */}
            <div className="space-y-4 rounded-lg border border-[#DCE2E8] bg-[#FAFBFC] p-4">
              <div className="font-mono text-xs font-semibold uppercase tracking-wider text-[#0F4C81]">
                選填：深度導讀欄位（填入即自動顯示於官網書目）
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#5A6775]">
                  作者名單（以英文逗號分隔，含 Yuan-Ron Ma 或 馬遠榮 將自動高亮）
                </label>
                <input
                  type="text"
                  value={draft.authors ?? ''}
                  onChange={(e) => setDraft((p) => ({ ...p, authors: e.target.value }))}
                  placeholder="例如：Yuan-Ron Ma*, A. B. Author, C. D. Author"
                  className="w-full rounded-md border border-[#DCE2E8] bg-white px-3.5 py-2 text-sm text-[#11161C] placeholder:text-[#94A3B8] focus:border-[#0F4C81] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#5A6775]">
                  研究亮點列點（多句請以 <code className="rounded bg-[#EEF1F5] px-1 text-[#0F4C81]">|</code> 分隔）
                </label>
                <input
                  type="text"
                  value={draft.takeaway ?? ''}
                  onChange={(e) => setDraft((p) => ({ ...p, takeaway: e.target.value }))}
                  placeholder="例如：室溫下高靈敏度偵測 H2S | 建立異質接面感測機制"
                  className="w-full rounded-md border border-[#DCE2E8] bg-white px-3.5 py-2 text-sm text-[#11161C] placeholder:text-[#94A3B8] focus:border-[#0F4C81] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#5A6775]">
                  摘要／白話導讀（可於官網展開閱讀）
                </label>
                <textarea
                  rows={3}
                  value={draft.abstract_excerpt ?? ''}
                  onChange={(e) => setDraft((p) => ({ ...p, abstract_excerpt: e.target.value }))}
                  placeholder="簡述研究核心發現與應用價值..."
                  className="w-full rounded-md border border-[#DCE2E8] bg-white px-3.5 py-2 text-sm text-[#11161C] placeholder:text-[#94A3B8] focus:border-[#0F4C81] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-[#DCE2E8] bg-[#F6F7F8] px-6 py-4">
            <button
              type="button"
              disabled={isSaving}
              onClick={onClose}
              className="rounded-md border border-[#C5CFD8] bg-white px-4 py-2 text-sm font-medium text-[#2B3642] transition-colors hover:border-[#0F4C81] hover:text-[#0F4C81]"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploading || isFetchingDoi}
              className="inline-flex items-center gap-2 rounded-md bg-[#0F4C81] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0B3A63] disabled:opacity-50"
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
