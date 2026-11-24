'use client';

import React, { memo, useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'motion/react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Search,
  X,
  ZoomIn,
} from 'lucide-react';
import { Publication, getPublicationKey } from '@/lib/publications';
import type { PublicationsText } from '@/lib/i18n';
import type { PubSort, PubViewMode } from '@/hooks/usePublications';
import { parseTakeawayLines, splitAuthorsHighlighted } from '@/lib/publicationDisplay';
import { EDITORIAL_EASE, InkRule } from '@/app/components/EditorialMotion';
import {
  FigureLightboxModal,
  type FigureLightboxPayload,
} from '@/app/components/FigureLightboxModal';
import { useRenderProfiler } from './useRenderProfiler';
import { uiTokens } from './uiTokens';
import { PublicationLazyImage } from './PublicationLazyImage';
import { PublicationTimelineChart } from './PublicationTimelineChart';

type Lang = 'en' | 'zh';

type LightboxState = FigureLightboxPayload | null;

type PublicationsSectionProps = {
  pubsText: PublicationsText;
  lang: Lang;
  allPublications: Publication[];
  pubFilter: string;
  pubSort: PubSort;
  correspondingOnly: boolean;
  viewMode: PubViewMode;
  searchQuery: string;
  uniqueYears: string[];
  isLoading: boolean;
  isUsingFallback: boolean;
  featuredPublications: Publication[];
  visiblePublications: Publication[];
  filteredCount: number;
  listRowCount: number;
  listAllInFeatured: boolean;
  isMobile: boolean;
  prefersReducedMotion: boolean | null;
  onFilterChange: (value: string) => void;
  onSortChange: (value: PubSort) => void;
  onCorrespondingToggle: () => void;
  onViewModeChange: (mode: PubViewMode) => void;
  onSearchChange: (value: string) => void;
  onLoadMore: () => void;
};

function formatCitationString(pub: Publication): string {
  const parts: string[] = [];
  if (pub.authors?.trim()) parts.push(`${pub.authors.trim()}.`);
  if (pub.year > 0) parts.push(`(${pub.year}).`);
  parts.push(`${pub.title}.`);
  if (pub.journal && pub.journal !== 'Unknown') parts.push(`${pub.journal}.`);
  if (pub.doi) parts.push(pub.doi);
  return parts.join(' ');
}

function getLinkDisplay(url: string, pubsText: PublicationsText): string {
  if (!url) return '';
  if (url.includes('doi.org/')) return url.split('doi.org/')[1];
  if (url.includes('scholar.google')) return pubsText.scholar;
  if (url.includes('researchgate.net')) return pubsText.researchGate;
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return pubsText.linkFallback;
  }
}

/**
 * 僅讀取單篇專屬圖解摘要 cover_url；自動過濾與 file_img 重複之通用期刊封面
 */
function resolveGraphicalAbstractUrl(pub: Publication): string {
  const cover = pub.cover_url?.trim() ?? '';
  if (!cover) return '';
  const journalCover = pub.file_img?.trim() ?? '';
  if (journalCover && cover === journalCover) {
    if (
      /(?:cov\d+h|largecover|CoverIssue|\/X\d{7,8}\.(?:jpg|gif|png)|cover\.gif|cover-image|_cover|SiteBuilderAssets\/Live\/Images)/i.test(
        cover,
      )
    ) {
      return '';
    }
  }
  return cover;
}

type PublicationRowProps = {
  pub: Publication;
  pubKey: string;
  pubsText: PublicationsText;
  isMobile: boolean;
  litePub: boolean;
  featuredRank?: number;
  index: number;
  locale: string;
  currentYear: number;
  expandedKey: string | null;
  copiedKey: string | null;
  onToggleAbstract: (key: string) => void;
  onCopyCitation: (key: string, pub: Publication) => void;
  onOpenLightbox: (payload: NonNullable<LightboxState>) => void;
};

/** 單欄全寬水平尺規學報書目列：左欄年份與通訊標記、中欄書目與摘要、右欄僅於有單篇摘要圖時顯示直角白底縮圖 */
const PublicationJournalRow = memo(function PublicationJournalRow({
  pub,
  pubKey,
  pubsText,
  isMobile,
  litePub,
  featuredRank,
  index,
  locale,
  currentYear,
  expandedKey,
  copiedKey,
  onToggleAbstract,
  onCopyCitation,
  onOpenLightbox,
}: PublicationRowProps) {
  const figureUrl = resolveGraphicalAbstractUrl(pub);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showFigure = Boolean(figureUrl) && failedUrl !== figureUrl;

  const takeawayLines = parseTakeawayLines(pub.takeaway);
  const expanded = expandedKey === pubKey;
  const isCopied = copiedKey === pubKey;
  const hasAbstractBody = !!pub.abstract_excerpt?.trim();
  const isInPress = pub.year > currentYear;
  const eagerMain = index < (isMobile ? 1 : 3);
  const altmetricHref = pub.altmetric_id
    ? `https://www.altmetric.com/details.php?doi=${encodeURIComponent(pub.altmetric_id)}`
    : null;

  const handleUnavailable = useCallback(() => {
    setFailedUrl(figureUrl);
  }, [figureUrl]);

  const figLayoutId = `pub-fig-${featuredRank !== undefined ? `feat-${featuredRank}-` : ''}${pubKey}`;

  const openFigure = useCallback(() => {
    onOpenLightbox({
      layoutId: figLayoutId,
      src: figureUrl,
      alt: pub.title,
      title: pub.title,
      journal: pub.journal,
      year: pub.year,
    });
  }, [onOpenLightbox, figLayoutId, figureUrl, pub.title, pub.journal, pub.year]);

  return (
    <article
      style={
        featuredRank === undefined
          ? { contentVisibility: 'auto', containIntrinsicSize: showFigure ? '210px' : '148px' }
          : undefined
      }
      className="group relative border-b border-[#D4D1C8] py-7 pl-0 transition-[opacity,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#EFECE6]/55 md:pl-3 md:group-hover/list:opacity-60 md:hover:!opacity-100"
    >
      {/* 當前閱讀行左側 3px 牛津深海藍書籤線 */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 top-0 hidden w-[3px] origin-top scale-y-0 bg-[#1B365D] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100 motion-reduce:transition-none md:block"
      />
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:gap-8">
        {/* 左欄：年份、預刊、通訊星號與代表作小標 */}
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 md:w-28 md:shrink-0 md:flex-col md:gap-1.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-medium text-[#141413] [font-variant-numeric:tabular-nums]">
              {pub.year > 0 ? pub.year : '—'}
            </span>
            {isInPress ? (
              <span className="border border-[#1B365D] px-1.5 py-0.5 text-[10px] font-medium text-[#1B365D]">
                {pubsText.inPress}
              </span>
            ) : null}
          </div>

          {featuredRank !== undefined ? (
            <span className="text-xs font-medium text-[#1B365D]">
              {pubsText.featuredSpotlight} {String(featuredRank).padStart(2, '0')}
            </span>
          ) : null}

          {pub.is_star === '是' ? (
            <span className="text-xs font-medium text-[#1B365D]">
              ★ {pubsText.corresponding}
            </span>
          ) : (
            <span className="text-xs text-[#5C5953]">{pubsText.coauthor}</span>
          )}
        </div>

        {/* 中欄：書目主內容（無圖時自然全寬延伸） */}
        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="font-editorial mb-2 text-lg font-semibold leading-[1.35] text-[#141413] transition-colors group-hover:text-[#1B365D] md:text-[1.2rem]">
            {pub.title}
          </h3>

          {pub.authors?.trim() ? (
            <p className="mb-2.5 text-sm leading-relaxed text-[#5C5953]">
              {splitAuthorsHighlighted(pub.authors)}
            </p>
          ) : null}

          {takeawayLines.length > 0 ? (
            <ul className="mb-3 space-y-1 border-l border-[#141413] pl-3.5 text-sm leading-relaxed text-[#2D2C29]">
              {takeawayLines.map((line, li) => (
                <li key={li}>{line}</li>
              ))}
            </ul>
          ) : null}

          <div className="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm">
            <span className="font-journal-italic text-[15px] text-[#2D2C29]">
              {pub.journal}
            </span>
            <span className="font-mono text-xs text-[#141413] [font-variant-numeric:tabular-nums]">
              {pub.citations.toLocaleString(locale)} {pubsText.citations}
            </span>
            {pub.doi ? (
              <a
                href={pub.doi}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 break-all font-mono text-xs text-[#5C5953] underline decoration-[#D4D1C8] underline-offset-4 transition-colors hover:text-[#1B365D] hover:decoration-[#1B365D]"
              >
                {getLinkDisplay(pub.doi, pubsText)}
                <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
              </a>
            ) : null}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#5C5953]">
            <button
              type="button"
              onClick={() => onCopyCitation(pubKey, pub)}
              className="inline-flex h-5 items-center overflow-hidden transition-colors hover:text-[#141413]"
            >
              <AnimatePresence mode="wait" initial={false}>
                {isCopied ? (
                  <motion.span
                    key="copied"
                    initial={litePub ? { opacity: 1 } : { y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={litePub ? { opacity: 0 } : { y: -8, opacity: 0 }}
                    transition={{ duration: litePub ? 0 : 0.2, ease: EDITORIAL_EASE }}
                    className="inline-flex items-center gap-1 font-medium text-[#1B365D]"
                  >
                    <Check className="h-3.5 w-3.5 text-[#1B365D]" aria-hidden />
                    <span>{pubsText.copiedCitation}</span>
                  </motion.span>
                ) : (
                  <motion.span
                    key="copy"
                    initial={litePub ? { opacity: 1 } : { y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={litePub ? { opacity: 0 } : { y: -8, opacity: 0 }}
                    transition={{ duration: litePub ? 0 : 0.2, ease: EDITORIAL_EASE }}
                    className="inline-flex items-center gap-1"
                  >
                    <Copy className="h-3.5 w-3.5" aria-hidden />
                    <span>{pubsText.copyCitation}</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {altmetricHref ? (
              <a
                href={altmetricHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 transition-colors hover:text-[#1B365D] hover:underline"
              >
                Altmetric
                <ExternalLink className="h-3 w-3" aria-hidden />
              </a>
            ) : null}

            {hasAbstractBody ? (
              <button
                type="button"
                onClick={() => onToggleAbstract(pubKey)}
                aria-expanded={expanded}
                className="inline-flex items-center gap-1 font-medium text-[#141413] transition-colors hover:text-[#1B365D]"
              >
                {expanded ? pubsText.collapseAbstract : pubsText.readAbstract}
                {expanded ? (
                  <ChevronUp className="h-3.5 w-3.5" aria-hidden />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" aria-hidden />
                )}
              </button>
            ) : null}
          </div>

          <AnimatePresence initial={false}>
            {expanded && hasAbstractBody ? (
              <motion.div
                key="abstract"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: litePub ? 0 : 0.15 }}
                className="overflow-hidden"
              >
                <p className="mt-4 border-t border-[#D4D1C8] pt-3.5 text-sm leading-relaxed text-[#2D2C29]">
                  {pub.abstract_excerpt}
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* 右欄：僅於具備有效單篇摘要圖時顯示直角白底縮圖（點擊縮圖以 layoutId 絲滑展開紙白暗房燈箱） */}
        {showFigure ? (
          <div className="w-full shrink-0 md:w-[230px] lg:w-[252px]">
            <motion.div
              layoutId={litePub ? undefined : figLayoutId}
              transition={{ duration: 0.36, ease: EDITORIAL_EASE }}
              onClick={openFigure}
              className="group/img relative flex aspect-[16/10] w-full cursor-zoom-in items-center justify-center overflow-hidden border border-[#D4D1C8] bg-white p-2 transition-colors hover:border-[#141413]"
            >
              <PublicationLazyImage
                key={figureUrl}
                src={figureUrl}
                alt={pub.title}
                eager={eagerMain}
                onUnavailable={handleUnavailable}
                className="h-full w-full object-contain transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/img:scale-[1.03]"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openFigure();
                }}
                aria-label={pubsText.zoomFigure}
                title={pubsText.zoomFigure}
                className="absolute right-1.5 top-1.5 z-10 flex h-7 w-7 items-center justify-center border border-[#D4D1C8] bg-[#F7F6F2]/95 text-[#141413] opacity-85 transition-colors hover:border-[#141413] hover:bg-[#141413] hover:text-[#F7F6F2] group-hover/img:opacity-100 md:opacity-0"
              >
                <ZoomIn className="h-3.5 w-3.5" aria-hidden />
              </button>
            </motion.div>
          </div>
        ) : null}
      </div>
    </article>
  );
}, (prev, next) => {
  return (
    prev.pubKey === next.pubKey &&
    prev.pub.title === next.pub.title &&
    prev.pub.journal === next.pub.journal &&
    prev.pub.year === next.pub.year &&
    prev.pub.doi === next.pub.doi &&
    prev.pub.citations === next.pub.citations &&
    prev.pub.is_star === next.pub.is_star &&
    prev.pub.cover_url === next.pub.cover_url &&
    prev.pub.file_img === next.pub.file_img &&
    prev.pub.authors === next.pub.authors &&
    prev.pub.takeaway === next.pub.takeaway &&
    prev.pub.abstract_excerpt === next.pub.abstract_excerpt &&
    prev.pub.altmetric_id === next.pub.altmetric_id &&
    prev.pubsText === next.pubsText &&
    prev.featuredRank === next.featuredRank &&
    prev.index === next.index &&
    prev.isMobile === next.isMobile &&
    prev.litePub === next.litePub &&
    prev.locale === next.locale &&
    prev.currentYear === next.currentYear &&
    prev.onToggleAbstract === next.onToggleAbstract &&
    prev.onCopyCitation === next.onCopyCitation &&
    prev.onOpenLightbox === next.onOpenLightbox &&
    (prev.expandedKey === prev.pubKey) === (next.expandedKey === next.pubKey) &&
    (prev.copiedKey === prev.pubKey) === (next.copiedKey === next.pubKey)
  );
});

const PublicationCompactRow = memo(function PublicationCompactRow({
  pub,
  pubKey,
  pubsText,
  locale,
  currentYear,
  copiedKey,
  onCopyCitation,
}: {
  pub: Publication;
  pubKey: string;
  pubsText: PublicationsText;
  locale: string;
  currentYear: number;
  copiedKey: string | null;
  onCopyCitation: (key: string, pub: Publication) => void;
}) {
  const isCopied = copiedKey === pubKey;
  const isInPress = pub.year > currentYear;

  return (
    <article className="group relative flex flex-col gap-2 border-b border-[#D4D1C8] py-4 pl-0 transition-[opacity,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#EFECE6]/55 md:flex-row md:items-baseline md:gap-6 md:pl-3 md:group-hover/list:opacity-60 md:hover:!opacity-100">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 top-0 hidden w-[3px] origin-top scale-y-0 bg-[#1B365D] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100 motion-reduce:transition-none md:block"
      />
      <div className="flex items-center gap-2 md:w-28 md:shrink-0">
        <span className="font-mono text-sm font-medium text-[#141413] [font-variant-numeric:tabular-nums]">
          {pub.year > 0 ? pub.year : '—'}
        </span>
        {isInPress ? (
          <span className="border border-[#1B365D] px-1 py-0.5 text-[10px] text-[#1B365D]">
            {pubsText.inPress}
          </span>
        ) : null}
        {pub.is_star === '是' ? (
          <span className="text-xs text-[#1B365D]" aria-label={pubsText.corresponding}>
            ★
          </span>
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="font-editorial text-base font-medium leading-snug text-[#141413] transition-colors group-hover:text-[#1B365D]">
          {pub.title}
        </h3>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-0.5 text-xs text-[#5C5953]">
          <span className="font-journal-italic text-sm text-[#2D2C29]">{pub.journal}</span>
          <span className="font-mono text-[#141413]">
            {pub.citations.toLocaleString(locale)} {pubsText.citations}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3 text-xs">
        <button
          type="button"
          onClick={() => onCopyCitation(pubKey, pub)}
          className="text-[#5C5953] transition-colors hover:text-[#141413]"
        >
          {isCopied ? pubsText.copiedCitation : pubsText.copyCitation}
        </button>
        {pub.doi ? (
          <a
            href={pub.doi}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-[#141413] underline decoration-[#D4D1C8] underline-offset-4 transition-colors hover:text-[#1B365D] hover:decoration-[#1B365D]"
          >
            DOI
            <ExternalLink className="h-3 w-3" aria-hidden />
          </a>
        ) : null}
      </div>
    </article>
  );
});

function PublicationsListSkeleton({
  prefersReducedMotion,
  pubsText,
}: {
  prefersReducedMotion: boolean | null;
  pubsText: PublicationsText;
}) {
  const pulse = prefersReducedMotion ? '' : 'animate-pulse';
  return (
    <div
      className="divide-y divide-[#D4D1C8]"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={pubsText.loadingPublications}
    >
      {[0, 1, 2].map((i) => (
        <div key={i} className={`flex flex-col gap-3 py-6 ${pulse}`}>
          <div className="h-3.5 w-24 bg-[#E6E4DD]" />
          <div className="h-5 w-[78%] bg-[#E6E4DD]" />
          <div className="h-4 w-[48%] bg-[#EFECE6]" />
        </div>
      ))}
    </div>
  );
}

function PublicationsSectionComponent({
  pubsText,
  lang,
  allPublications,
  pubFilter,
  pubSort,
  correspondingOnly,
  viewMode,
  searchQuery,
  uniqueYears,
  isLoading,
  isUsingFallback,
  featuredPublications,
  visiblePublications,
  filteredCount,
  listRowCount,
  listAllInFeatured,
  isMobile,
  prefersReducedMotion,
  onFilterChange,
  onSortChange,
  onCorrespondingToggle,
  onViewModeChange,
  onSearchChange,
  onLoadMore,
}: PublicationsSectionProps) {
  useRenderProfiler('PublicationsSection');
  const litePub = Boolean(prefersReducedMotion) || isMobile;
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<LightboxState>(null);
  const locale = lang === 'zh' ? 'zh-TW' : 'en-US';
  const currentYear = new Date().getFullYear();

  const onToggleAbstract = useCallback((key: string) => {
    setExpandedKey((prev) => (prev === key ? null : key));
  }, []);

  const onCopyCitation = useCallback((key: string, pub: Publication) => {
    const citation = formatCitationString(pub);
    if (navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(citation).then(() => setCopiedKey(key));
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = citation;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedKey(key);
    }
  }, []);

  useEffect(() => {
    if (!copiedKey) return;
    const timer = window.setTimeout(() => setCopiedKey(null), 2000);
    return () => window.clearTimeout(timer);
  }, [copiedKey]);

  const onOpenLightbox = useCallback((payload: NonNullable<LightboxState>) => {
    setLightbox(payload);
  }, []);

  const onCloseLightbox = useCallback(() => {
    setLightbox(null);
  }, []);

  const showFeaturedStrip = !isLoading && filteredCount > 0 && featuredPublications.length > 0;

  return (
    <section
      id="publications"
      className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20 md:py-24"
    >
      <div className="pb-4">
        <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
          <h2 className={uiTokens.sectionTitle}>
            {pubsText.title}
            {lang === 'en' ? ' ' : ''}
            {pubsText.subtitle}
          </h2>
          <p className="max-w-md text-sm text-[#5C5953] md:text-right">
            {pubsText.desc}
          </p>
        </div>
      </div>
      <InkRule thick />

      {/* 無框時間軸圖表 */}
      {!isLoading && allPublications.length > 0 ? (
        <PublicationTimelineChart
          publications={allPublications}
          selectedFilter={pubFilter}
          lang={lang}
          onSelectYear={onFilterChange}
        />
      ) : null}

      {/* 直角底線檢索工具列（移除所有圓角膠囊與白底表單盒） */}
      <div className="border-y border-[#141413] py-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-2">
              <label htmlFor="pub-filter-select" className="text-xs text-[#5C5953]">
                {pubsText.filterBy}
              </label>
              <div className="relative">
                <select
                  id="pub-filter-select"
                  value={pubFilter}
                  onChange={(e) => onFilterChange(e.target.value)}
                  className={uiTokens.fieldSelect}
                >
                  <option value="All">{pubsText.filterAll}</option>
                  <option value="Selected">{pubsText.filterSelected}</option>
                  <optgroup label={pubsText.filterYearGroup}>
                    {uniqueYears.map((year) => {
                      const isFuture = Number(year) > currentYear;
                      return (
                        <option key={year} value={year}>
                          {isFuture ? `${year} (${pubsText.inPress})` : year}
                        </option>
                      );
                    })}
                  </optgroup>
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-1 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#5C5953]"
                  aria-hidden
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="pub-sort-select" className="text-xs text-[#5C5953]">
                {pubsText.sortLabel}
              </label>
              <div className="relative">
                <select
                  id="pub-sort-select"
                  value={pubSort}
                  onChange={(e) => onSortChange(e.target.value as PubSort)}
                  className={uiTokens.fieldSelect}
                >
                  <option value="newest">{pubsText.sortNewest}</option>
                  <option value="citations">{pubsText.sortCitations}</option>
                  <option value="starred">{pubsText.sortStarred}</option>
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-1 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#5C5953]"
                  aria-hidden
                />
              </div>
            </div>

            <button
              type="button"
              onClick={onCorrespondingToggle}
              aria-pressed={correspondingOnly}
              className={`border-b-2 pb-1 text-sm transition-colors ${
                correspondingOnly
                  ? 'border-[#1B365D] font-semibold text-[#1B365D]'
                  : 'border-transparent text-[#5C5953] hover:text-[#141413]'
              }`}
            >
              ★ {pubsText.correspondingOnly}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <div className="relative min-w-0 flex-1 sm:w-64">
              <Search
                className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5C5953]"
                aria-hidden
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={pubsText.searchPlaceholder}
                aria-label={pubsText.searchAriaLabel}
                className="w-full rounded-none border-0 border-b border-[#141413] bg-transparent py-1.5 pl-6 pr-6 text-sm text-[#141413] placeholder:text-[#5C5953]/70 focus:border-[#1B365D] focus:outline-none"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  aria-label={pubsText.clearSearch}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-0.5 text-[#5C5953] hover:text-[#141413]"
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                </button>
              ) : null}
            </div>

            <div
              role="group"
              aria-label="View mode"
              className="inline-flex items-center gap-3 text-sm"
            >
              <button
                type="button"
                onClick={() => onViewModeChange('card')}
                aria-pressed={viewMode === 'card'}
                className={`border-b-2 pb-0.5 transition-colors ${
                  viewMode === 'card'
                    ? 'border-[#141413] font-semibold text-[#141413]'
                    : 'border-transparent text-[#5C5953] hover:text-[#141413]'
                }`}
              >
                {pubsText.viewCard}
              </button>
              <span aria-hidden className="text-[#D4D1C8]">/</span>
              <button
                type="button"
                onClick={() => onViewModeChange('compact')}
                aria-pressed={viewMode === 'compact'}
                className={`border-b-2 pb-0.5 transition-colors ${
                  viewMode === 'compact'
                    ? 'border-[#141413] font-semibold text-[#141413]'
                    : 'border-transparent text-[#5C5953] hover:text-[#141413]'
                }`}
              >
                {pubsText.viewCompact}
              </button>
            </div>

            {!isLoading ? (
              <span
                className="font-mono text-xs text-[#5C5953] [font-variant-numeric:tabular-nums]"
                aria-live="polite"
              >
                {pubsText.resultCount.replace('{count}', String(filteredCount))}
              </span>
            ) : null}
          </div>
        </div>

        {isUsingFallback ? (
          <p className="mt-3 border-l-2 border-[#1B365D] pl-3 text-xs text-[#1B365D]">
            {pubsText.offlineFallbackNote}
          </p>
        ) : null}
      </div>

      {/* 單欄全寬水平尺規學報書目清單 */}
      {isLoading ? (
        <PublicationsListSkeleton prefersReducedMotion={prefersReducedMotion} pubsText={pubsText} />
      ) : filteredCount === 0 ? (
        <div
          className="border-b border-[#D4D1C8] py-16 text-center text-sm text-[#5C5953]"
          role="status"
          aria-live="polite"
        >
          {pubsText.emptyPublications}
        </div>
      ) : (
        <LayoutGroup id="publications-figures">
          <div className="group/list">
            {showFeaturedStrip
              ? featuredPublications.map((pub, fi) => {
                  const key = getPublicationKey(pub, fi);
                  return (
                    <PublicationJournalRow
                      key={key}
                      pubKey={key}
                      pub={pub}
                      pubsText={pubsText}
                      isMobile={isMobile}
                      litePub={litePub}
                      featuredRank={fi + 1}
                      index={fi}
                      locale={locale}
                      currentYear={currentYear}
                      expandedKey={expandedKey}
                      copiedKey={copiedKey}
                      onToggleAbstract={onToggleAbstract}
                      onCopyCitation={onCopyCitation}
                      onOpenLightbox={onOpenLightbox}
                    />
                  );
                })
              : null}

            {listAllInFeatured ? (
              <p className="border-b border-[#D4D1C8] py-6 text-center text-sm text-[#5C5953]">
                {pubsText.allInFeaturedNote}
              </p>
            ) : null}

            {visiblePublications.length > 0
              ? viewMode === 'compact'
                ? visiblePublications.map((pub, i) => {
                    const key = getPublicationKey(pub, i);
                    return (
                      <PublicationCompactRow
                        key={key}
                        pubKey={key}
                        pub={pub}
                        pubsText={pubsText}
                        locale={locale}
                        currentYear={currentYear}
                        copiedKey={copiedKey}
                        onCopyCitation={onCopyCitation}
                      />
                    );
                  })
                : visiblePublications.map((pub, i) => {
                    const key = getPublicationKey(pub, i);
                    return (
                      <PublicationJournalRow
                        key={key}
                        pubKey={key}
                        pub={pub}
                        pubsText={pubsText}
                        isMobile={isMobile}
                        litePub={litePub}
                        index={i + featuredPublications.length}
                        locale={locale}
                        currentYear={currentYear}
                        expandedKey={expandedKey}
                        copiedKey={copiedKey}
                        onToggleAbstract={onToggleAbstract}
                        onCopyCitation={onCopyCitation}
                        onOpenLightbox={onOpenLightbox}
                      />
                    );
                  })
              : null}
          </div>

          {/* 科學圖解摘要紙白霧化暗房燈箱（支援 layoutId 絲滑展開與 ESC 關閉） */}
          <FigureLightboxModal
            lightbox={lightbox}
            closeLabel={pubsText.closeLightbox}
            onClose={onCloseLightbox}
          />
        </LayoutGroup>
      )}

      {!isLoading && filteredCount > 0 && visiblePublications.length < listRowCount && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={onLoadMore}
            className={`${uiTokens.buttonOutline} inline-flex items-center gap-2 px-7 py-2.5 text-sm`}
          >
            {pubsText.loadMore}
            <ChevronDown className="h-4 w-4" aria-hidden />
          </button>
        </div>
      )}
    </section>
  );
}

export const PublicationsSection = memo(PublicationsSectionComponent);
