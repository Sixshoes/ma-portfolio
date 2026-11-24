'use client';

import React, { memo, useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  FolderOpen,
  LayoutGrid,
  List,
  Search,
  Star,
  X,
  ZoomIn,
} from 'lucide-react';
import { Publication, getPublicationKey } from '@/lib/publications';
import type { PublicationsText } from '@/lib/i18n';
import type { PubSort, PubViewMode } from '@/hooks/usePublications';
import { parseTakeawayLines, splitAuthorsHighlighted } from '@/lib/publicationDisplay';
import { useRenderProfiler } from './useRenderProfiler';
import { uiTokens } from './uiTokens';
import { PublicationLazyImage } from './PublicationLazyImage';
import { PublicationTimelineChart } from './PublicationTimelineChart';

type Lang = 'en' | 'zh';

type LightboxState = {
  src: string;
  alt: string;
  title: string;
  journal: string;
} | null;

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
 * 判斷此論文是否具備「單篇專屬圖解摘要」：
 * - 僅讀取 cover_url，不拿期刊封面 file_img 填塞列表
 * - 排除歷史資料中與 file_img 完全相同的重複通用期刊封面圖
 */
function resolveGraphicalAbstractUrl(pub: Publication): string {
  const cover = pub.cover_url?.trim() ?? '';
  if (!cover) return '';
  const journalCover = pub.file_img?.trim() ?? '';
  if (journalCover && cover === journalCover) {
    // 常見通用期刊封面網址特徵（與 file_img 重複時視為期刊封面而非單篇摘要圖）
    if (/(?:cov\d+h|largecover|CoverIssue|\/X\d{7,8}\.(?:jpg|gif|png)|cover\.gif)/i.test(cover)) {
      return '';
    }
  }
  return cover;
}

type PublicationItemProps = {
  pub: Publication;
  pubKey: string;
  pubsText: PublicationsText;
  isMobile: boolean;
  litePub: boolean;
  variant: 'landmark' | 'featured-sub' | 'list';
  index: number;
  locale: string;
  currentYear: number;
  expandedKey: string | null;
  copiedKey: string | null;
  onToggleAbstract: (key: string) => void;
  onCopyCitation: (key: string, pub: Publication) => void;
  onOpenLightbox: (payload: NonNullable<LightboxState>) => void;
};

const PublicationEditorialItem = memo(function PublicationEditorialItem({
  pub,
  pubKey,
  pubsText,
  isMobile,
  litePub,
  variant,
  index,
  locale,
  currentYear,
  expandedKey,
  copiedKey,
  onToggleAbstract,
  onCopyCitation,
  onOpenLightbox,
}: PublicationItemProps) {
  const figureUrl = resolveGraphicalAbstractUrl(pub);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showFigure = Boolean(figureUrl) && failedUrl !== figureUrl;

  const takeawayLines = parseTakeawayLines(pub.takeaway);
  const expanded = expandedKey === pubKey;
  const isCopied = copiedKey === pubKey;
  const hasAbstractBody = !!pub.abstract_excerpt?.trim();
  const isInPress = pub.year > currentYear;
  const altmetricHref = pub.altmetric_id
    ? `https://www.altmetric.com/details.php?doi=${encodeURIComponent(pub.altmetric_id)}`
    : null;

  const isLandmark = variant === 'landmark';
  const isSubFeatured = variant === 'featured-sub';
  const eagerMain = index < (isMobile ? 1 : 2);

  const handleUnavailable = useCallback(() => {
    setFailedUrl(figureUrl);
  }, [figureUrl]);

  const figureBlock = showFigure ? (
    <div className="flex flex-col gap-1.5">
      <div className="group/img relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-md border border-[#E2E8F0] bg-white p-2">
        <PublicationLazyImage
          key={figureUrl}
          src={figureUrl}
          alt={`${pub.title} — ${pubsText.abstract}`}
          eager={eagerMain}
          onUnavailable={handleUnavailable}
          className="h-full w-full object-contain transition-transform duration-200 group-hover/img:scale-[1.02]"
        />
        <button
          type="button"
          onClick={() =>
            onOpenLightbox({
              src: figureUrl,
              alt: pubsText.abstract,
              title: pub.title,
              journal: pub.journal,
            })
          }
          aria-label={pubsText.zoomFigure}
          title={pubsText.zoomFigure}
          className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded border border-[#DCE2E8] bg-white/95 text-[#2B3642] opacity-85 shadow-sm transition-all hover:border-[#0F4C81] hover:bg-[#0F4C81] hover:text-white group-hover/img:opacity-100 md:opacity-0"
        >
          <ZoomIn className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#64748B]">
        {pubsText.abstract}
      </span>
    </div>
  ) : null;

  // 1. 領銜代表作：有圖時 5/7 分欄；無圖或壞圖自動收合為全寬緊湊排版
  if (isLandmark) {
    return (
      <article
        className={`group rounded-lg border border-[#DCE2E8] border-l-[3px] border-l-[#0F4C81] bg-white p-6 md:p-8 ${
          showFigure ? 'grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center' : 'flex flex-col'
        }`}
      >
        {showFigure ? <div className="lg:col-span-5">{figureBlock}</div> : null}

        <div className={`flex min-w-0 flex-col ${showFigure ? 'lg:col-span-7' : 'w-full'}`}>
          <div className="mb-3 flex flex-wrap items-center gap-2.5 text-xs">
            <span className="font-mono font-semibold text-[#0F4C81] [font-variant-numeric:tabular-nums]">
              {pub.year > 0 ? pub.year : '-'}
            </span>
            {isInPress ? (
              <span className="rounded border border-[#0F4C81]/30 bg-[#EBF2F8] px-1.5 py-0.5 font-mono text-[10px] font-medium text-[#0F4C81]">
                {pubsText.inPress}
              </span>
            ) : null}
            <span className="h-3 w-px bg-[#DCE2E8]" aria-hidden />
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#5A6775]">
              {pubsText.featuredSpotlight} · 01
            </span>
            {pub.is_star === '是' ? (
              <>
                <span className="h-3 w-px bg-[#DCE2E8]" aria-hidden />
                <span className="inline-flex items-center gap-1 font-medium text-[#0F4C81]">
                  <Star className="h-3 w-3 fill-[#0F4C81] text-[#0F4C81]" aria-hidden />
                  {pubsText.corresponding}
                </span>
              </>
            ) : null}
          </div>

          <h3 className="mb-3 text-xl font-semibold leading-[1.3] tracking-[-0.015em] text-[#11161C] transition-colors group-hover:text-[#0F4C81] md:text-2xl">
            {pub.title}
          </h3>

          {pub.authors?.trim() ? (
            <p className="mb-3.5 text-sm leading-relaxed text-[#5A6775]">
              {splitAuthorsHighlighted(pub.authors)}
            </p>
          ) : null}

          {takeawayLines.length > 0 ? (
            <ul className="mb-4 space-y-1 border-l-2 border-[#0F4C81]/35 pl-3.5 text-sm leading-relaxed text-[#2B3642]">
              {takeawayLines.map((line, li) => (
                <li key={li}>{line}</li>
              ))}
            </ul>
          ) : null}

          <div className="mt-2 flex flex-wrap items-end justify-between gap-4 border-t border-[#DCE2E8] pt-4">
            <div className="min-w-0">
              <div className="text-base font-medium text-[#11161C]">{pub.journal}</div>
              {pub.doi ? (
                <a
                  href={pub.doi}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1.5 break-all font-mono text-xs text-[#0F4C81] hover:underline"
                >
                  {getLinkDisplay(pub.doi, pubsText)}
                  <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
                </a>
              ) : null}
            </div>

            <div className="shrink-0 text-left sm:text-right">
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#5A6775]">
                {pubsText.citations}
              </div>
              <div className="font-mono text-3xl font-semibold leading-none tracking-tight text-[#0F4C81] [font-variant-numeric:tabular-nums]">
                {pub.citations.toLocaleString(locale)}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onCopyCitation(pubKey, pub)}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#DCE2E8] bg-[#F6F7F8] px-3 py-1.5 font-mono text-xs text-[#2B3642] transition-colors hover:border-[#0F4C81] hover:text-[#0F4C81]"
            >
              {isCopied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#0F4C81]" aria-hidden />
                  {pubsText.copiedCitation}
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" aria-hidden />
                  {pubsText.copyCitation}
                </>
              )}
            </button>
            {altmetricHref ? (
              <a
                href={altmetricHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-[#0F4C81]/25 bg-[#EBF2F8] px-3 py-1.5 font-mono text-xs text-[#0F4C81] transition-colors hover:bg-[#0F4C81] hover:text-white"
              >
                {pubsText.altmetricLink}
                <ExternalLink className="h-3 w-3" aria-hidden />
              </a>
            ) : null}
            {hasAbstractBody ? (
              <button
                type="button"
                onClick={() => onToggleAbstract(pubKey)}
                aria-expanded={expanded}
                className="ml-auto inline-flex items-center gap-1 font-mono text-xs font-medium text-[#0F4C81] hover:underline"
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
                <p className="mt-4 border-t border-[#DCE2E8] pt-3.5 text-sm leading-relaxed text-[#475569]">
                  {pub.abstract_excerpt}
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </article>
    );
  }

  // 2. 次代表作（#2 & #3）或一般清單列：無圖時完全收合為全寬緊湊純文字學術書目
  const containerCls = isSubFeatured
    ? 'group flex h-full flex-col gap-4 bg-white p-6 transition-colors duration-150 hover:bg-[#FAFBFC]'
    : showFigure
      ? 'group flex flex-col gap-5 bg-white p-5 transition-colors duration-150 hover:bg-[#FAFBFC] md:flex-row md:items-start md:gap-7 md:p-6'
      : 'group flex flex-col bg-white px-5 py-4.5 transition-colors duration-150 hover:bg-[#FAFBFC] md:px-6 md:py-5';

  return (
    <article
      style={
        variant === 'list'
          ? { contentVisibility: 'auto', containIntrinsicSize: showFigure ? '240px' : '148px' }
          : undefined
      }
      className={containerCls}
    >
      {showFigure ? (
        <div className={isSubFeatured ? 'w-full' : 'w-full shrink-0 md:w-[240px] lg:w-[268px]'}>
          {figureBlock}
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="mb-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs">
          <span className="font-mono font-semibold text-[#0F4C81] [font-variant-numeric:tabular-nums]">
            {pub.year > 0 ? pub.year : '-'}
          </span>
          {isInPress ? (
            <span className="rounded border border-[#0F4C81]/30 bg-[#EBF2F8] px-1.5 py-0.5 font-mono text-[10px] font-medium text-[#0F4C81]">
              {pubsText.inPress}
            </span>
          ) : null}
          <span className="h-3 w-px bg-[#DCE2E8]" aria-hidden />
          {pub.is_star === '是' ? (
            <span className="inline-flex items-center gap-1 font-medium text-[#0F4C81]">
              <Star className="h-3 w-3 fill-[#0F4C81] text-[#0F4C81]" aria-hidden />
              {pubsText.corresponding}
            </span>
          ) : (
            <span className="text-[#64748B]">{pubsText.coauthor}</span>
          )}
          <span className="ml-auto font-mono text-xs font-semibold text-[#11161C] [font-variant-numeric:tabular-nums]">
            {pub.citations.toLocaleString(locale)}{' '}
            <span className="font-normal text-[#64748B]">{pubsText.citations}</span>
          </span>
        </div>

        <h3 className="mb-2 text-[1.0625rem] font-semibold leading-snug tracking-[-0.01em] text-[#11161C] transition-colors group-hover:text-[#0F4C81] md:text-lg">
          {pub.title}
        </h3>

        {pub.authors?.trim() ? (
          <p className="mb-2.5 text-xs leading-relaxed text-[#5A6775] md:text-sm">
            {splitAuthorsHighlighted(pub.authors)}
          </p>
        ) : null}

        {takeawayLines.length > 0 ? (
          <ul className="mb-3 space-y-1 border-l-2 border-[#0F4C81]/30 pl-3 text-xs leading-relaxed text-[#2B3642] md:text-sm">
            {takeawayLines.map((line, li) => (
              <li key={li}>{line}</li>
            ))}
          </ul>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-[#EEF1F5] pt-3">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-sm font-medium text-[#2B3642]">{pub.journal}</span>
            {pub.doi ? (
              <a
                href={pub.doi}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 break-all font-mono text-xs text-[#0F4C81] hover:underline"
              >
                {getLinkDisplay(pub.doi, pubsText)}
                <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
              </a>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onCopyCitation(pubKey, pub)}
              className="inline-flex items-center gap-1 font-mono text-xs text-[#5A6775] transition-colors hover:text-[#0F4C81]"
            >
              {isCopied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#0F4C81]" aria-hidden />
                  {pubsText.copiedCitation}
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" aria-hidden />
                  {pubsText.copyCitation}
                </>
              )}
            </button>
            {altmetricHref ? (
              <a
                href={altmetricHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono text-xs text-[#0F4C81] hover:underline"
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
                className="inline-flex items-center gap-1 font-mono text-xs font-medium text-[#0F4C81] hover:underline"
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
              <p className="mt-3 border-t border-[#EEF1F5] pt-3 text-sm leading-relaxed text-[#475569]">
                {pub.abstract_excerpt}
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>
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
    prev.variant === next.variant &&
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
  const altmetricHref = pub.altmetric_id
    ? `https://www.altmetric.com/details.php?doi=${encodeURIComponent(pub.altmetric_id)}`
    : null;

  return (
    <article className="group flex flex-col gap-2.5 bg-white px-5 py-3.5 transition-colors hover:bg-[#FAFBFC] md:flex-row md:items-center md:gap-5">
      <div className="flex items-center gap-2 md:w-28 md:shrink-0">
        <span className="font-mono text-sm font-semibold text-[#0F4C81] [font-variant-numeric:tabular-nums]">
          {pub.year > 0 ? pub.year : '-'}
        </span>
        {isInPress ? (
          <span className="rounded border border-[#0F4C81]/30 bg-[#EBF2F8] px-1 py-0.5 font-mono text-[9px] font-medium text-[#0F4C81]">
            {pubsText.inPress}
          </span>
        ) : null}
        {pub.is_star === '是' ? (
          <Star
            className="h-3.5 w-3.5 shrink-0 fill-[#0F4C81] text-[#0F4C81]"
            aria-label={pubsText.corresponding}
          />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="text-[15px] font-medium leading-snug text-[#11161C] transition-colors group-hover:text-[#0F4C81]">
          {pub.title}
        </h3>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-[#5A6775]">
          <span className="text-[#2B3642]">{pub.journal}</span>
          <span className="font-mono font-medium text-[#0F4C81]">
            {pub.citations.toLocaleString(locale)} {pubsText.citations}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onCopyCitation(pubKey, pub)}
          className="inline-flex items-center gap-1 rounded border border-[#DCE2E8] bg-[#F6F7F8] px-2.5 py-1 font-mono text-[11px] text-[#2B3642] transition-colors hover:border-[#0F4C81] hover:text-[#0F4C81]"
        >
          {isCopied ? (
            <>
              <Check className="h-3 w-3 text-[#0F4C81]" aria-hidden />
              {pubsText.copiedCitation}
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" aria-hidden />
              {pubsText.copyCitation}
            </>
          )}
        </button>

        {altmetricHref ? (
          <a
            href={altmetricHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded border border-[#0F4C81]/25 bg-[#EBF2F8] px-2.5 py-1 font-mono text-[11px] text-[#0F4C81] transition-colors hover:bg-[#0F4C81] hover:text-white"
          >
            Altmetric
            <ExternalLink className="h-3 w-3" aria-hidden />
          </a>
        ) : null}

        {pub.doi ? (
          <a
            href={pub.doi}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded border border-[#0F4C81] bg-[#0F4C81] px-2.5 py-1 font-mono text-[11px] font-semibold text-white transition-colors hover:bg-[#0B3A63]"
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
      className="divide-y divide-[#DCE2E8] overflow-hidden rounded-lg border border-[#DCE2E8] bg-white"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={pubsText.loadingPublications}
    >
      {[0, 1, 2].map((i) => (
        <div key={i} className={`flex flex-col gap-3 p-6 ${pulse}`}>
          <div className="h-3.5 w-28 rounded bg-[#EEF1F5]" />
          <div className="h-5 w-[80%] rounded bg-[#E2E8F0]" />
          <div className="h-4 w-[50%] rounded bg-[#EEF1F5]" />
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
  const sectionKicker = lang === 'zh' ? '學術著作檔案' : 'PUBLICATION ARCHIVE';

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

  useEffect(() => {
    if (!lightbox) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightbox]);

  const showFeaturedStrip = !isLoading && filteredCount > 0 && featuredPublications.length > 0;
  const landmarkPub = showFeaturedStrip ? featuredPublications[0] : null;
  const subFeaturedPubs = showFeaturedStrip ? featuredPublications.slice(1) : [];

  return (
    <section
      id="publications"
      className="scroll-mt-20 border-t border-[#DCE2E8] bg-[#F6F7F8] py-20 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 md:mb-12 md:flex-row md:items-end">
          <div>
            <div className="mb-2.5 flex items-center gap-2.5">
              <span className="h-[2px] w-5 bg-[#0F4C81]" aria-hidden />
              <span className={uiTokens.sectionKicker}>{sectionKicker}</span>
            </div>
            <h2 className={uiTokens.sectionTitle}>
              {pubsText.title}
              {lang === 'en' ? ' ' : ''}
              {pubsText.subtitle}
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-[#5A6775] md:text-right">
            {pubsText.desc}
          </p>
        </div>

        {/* 互動發表與引用長條圖 */}
        {!isLoading && allPublications.length > 0 ? (
          <PublicationTimelineChart
            publications={allPublications}
            selectedFilter={pubFilter}
            lang={lang}
            onSelectYear={onFilterChange}
          />
        ) : null}

        {/* 檢索與篩選工具列 */}
        <div className="mb-8 rounded-lg border border-[#DCE2E8] bg-white p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-2">
                <label htmlFor="pub-filter-select" className={uiTokens.metaMono}>
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
                    className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#64748B]"
                    aria-hidden
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="pub-sort-select" className={uiTokens.metaMono}>
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
                    className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#64748B]"
                    aria-hidden
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={onCorrespondingToggle}
                aria-pressed={correspondingOnly}
                className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-2 font-mono text-xs transition-colors ${
                  correspondingOnly
                    ? 'border-[#0F4C81] bg-[#EBF2F8] font-medium text-[#0F4C81]'
                    : 'border-[#DCE2E8] bg-white text-[#2B3642] hover:border-[#9AA8B8]'
                }`}
              >
                <Star
                  className={`h-3.5 w-3.5 ${
                    correspondingOnly ? 'fill-[#0F4C81] text-[#0F4C81]' : 'text-[#64748B]'
                  }`}
                  aria-hidden
                />
                {pubsText.correspondingOnly}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative min-w-0 flex-1 sm:w-64 lg:w-72">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#64748B]"
                  aria-hidden
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={pubsText.searchPlaceholder}
                  aria-label={pubsText.searchAriaLabel}
                  className="w-full rounded-md border border-[#DCE2E8] bg-[#F6F7F8] py-2 pl-8 pr-7 text-xs text-[#11161C] placeholder:text-[#64748B] transition-colors focus:border-[#0F4C81] focus:bg-white focus:outline-none"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => onSearchChange('')}
                    aria-label={pubsText.clearSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-[#64748B] hover:text-[#11161C]"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden />
                  </button>
                ) : null}
              </div>

              <div
                role="group"
                aria-label="View mode"
                className="inline-flex rounded-md border border-[#DCE2E8] bg-[#F6F7F8] p-0.5"
              >
                <button
                  type="button"
                  onClick={() => onViewModeChange('card')}
                  aria-pressed={viewMode === 'card'}
                  className={`inline-flex items-center gap-1.5 rounded-[5px] px-2.5 py-1.5 font-mono text-xs transition-colors ${
                    viewMode === 'card'
                      ? 'bg-[#0F4C81] font-semibold text-white'
                      : 'text-[#5A6775] hover:text-[#11161C]'
                  }`}
                >
                  <LayoutGrid className="h-3.5 w-3.5" aria-hidden />
                  <span className="hidden sm:inline">{pubsText.viewCard}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onViewModeChange('compact')}
                  aria-pressed={viewMode === 'compact'}
                  className={`inline-flex items-center gap-1.5 rounded-[5px] px-2.5 py-1.5 font-mono text-xs transition-colors ${
                    viewMode === 'compact'
                      ? 'bg-[#0F4C81] font-semibold text-white'
                      : 'text-[#5A6775] hover:text-[#11161C]'
                  }`}
                >
                  <List className="h-3.5 w-3.5" aria-hidden />
                  <span className="hidden sm:inline">{pubsText.viewCompact}</span>
                </button>
              </div>

              {!isLoading ? (
                <span
                  className="font-mono text-xs text-[#5A6775] [font-variant-numeric:tabular-nums]"
                  aria-live="polite"
                >
                  {pubsText.resultCount.replace('{count}', String(filteredCount))}
                </span>
              ) : null}
            </div>
          </div>

          {isUsingFallback ? (
            <p className="mt-3 rounded-md border border-[#0F4C81]/25 bg-[#EBF2F8] px-3.5 py-2 text-xs text-[#0F4C81]">
              {pubsText.offlineFallbackNote}
            </p>
          ) : null}
        </div>

        {isLoading ? (
          <PublicationsListSkeleton prefersReducedMotion={prefersReducedMotion} pubsText={pubsText} />
        ) : filteredCount === 0 ? (
          <div
            className="flex flex-col items-center justify-center rounded-lg border border-[#DCE2E8] bg-white px-6 py-16 text-center"
            role="status"
            aria-live="polite"
          >
            <FolderOpen className="mb-3 h-9 w-9 text-[#94A3B8]" aria-hidden />
            <p className="max-w-md text-sm leading-relaxed text-[#5A6775]">
              {pubsText.emptyPublications}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* 代表性著作（無圖自動收合，絕不留空白欄） */}
            {showFeaturedStrip && landmarkPub ? (
              <div className="space-y-4">
                <PublicationEditorialItem
                  key={getPublicationKey(landmarkPub, 0)}
                  pubKey={getPublicationKey(landmarkPub, 0)}
                  pub={landmarkPub}
                  pubsText={pubsText}
                  isMobile={isMobile}
                  litePub={litePub}
                  variant="landmark"
                  index={0}
                  locale={locale}
                  currentYear={currentYear}
                  expandedKey={expandedKey}
                  copiedKey={copiedKey}
                  onToggleAbstract={onToggleAbstract}
                  onCopyCitation={onCopyCitation}
                  onOpenLightbox={onOpenLightbox}
                />

                {subFeaturedPubs.length > 0 ? (
                  <div className="overflow-hidden rounded-lg border border-[#DCE2E8] bg-[#DCE2E8]">
                    <div className="grid grid-cols-1 gap-px lg:grid-cols-2">
                      {subFeaturedPubs.map((pub, si) => {
                        const key = getPublicationKey(pub, si + 1);
                        return (
                          <PublicationEditorialItem
                            key={key}
                            pubKey={key}
                            pub={pub}
                            pubsText={pubsText}
                            isMobile={isMobile}
                            litePub={litePub}
                            variant="featured-sub"
                            index={si + 1}
                            locale={locale}
                            currentYear={currentYear}
                            expandedKey={expandedKey}
                            copiedKey={copiedKey}
                            onToggleAbstract={onToggleAbstract}
                            onCopyCitation={onCopyCitation}
                            onOpenLightbox={onOpenLightbox}
                          />
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {listAllInFeatured ? (
              <p className="rounded-lg border border-[#DCE2E8] bg-white px-5 py-6 text-center text-sm text-[#5A6775]">
                {pubsText.allInFeaturedNote}
              </p>
            ) : null}

            {/* 主書目清單 */}
            {visiblePublications.length > 0 ? (
              <div className="divide-y divide-[#DCE2E8] overflow-hidden rounded-lg border border-[#DCE2E8] bg-white">
                {viewMode === 'compact'
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
                        <PublicationEditorialItem
                          key={key}
                          pubKey={key}
                          pub={pub}
                          pubsText={pubsText}
                          isMobile={isMobile}
                          litePub={litePub}
                          variant="list"
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
                    })}
              </div>
            ) : null}
          </div>
        )}

        {!isLoading && filteredCount > 0 && visiblePublications.length < listRowCount && (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={onLoadMore}
              className={`${uiTokens.buttonGhost} inline-flex items-center gap-2 rounded-md px-7 py-2.5 font-mono text-xs font-medium uppercase tracking-[0.14em]`}
            >
              {pubsText.loadMore}
              <ChevronDown className="h-4 w-4" aria-hidden />
            </button>
          </div>
        )}
      </div>

      {/* 科學圖解摘要燈箱預覽 */}
      <AnimatePresence>
        {lightbox ? (
          <motion.div
            key="pub-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={lightbox.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[100000] flex items-center justify-center bg-[#11161C]/75 p-4 backdrop-blur-sm md:p-8"
          >
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg border border-[#DCE2E8] bg-white shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4 border-b border-[#DCE2E8] px-5 py-4">
                <div className="min-w-0">
                  <div className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[#0F4C81]">
                    {lightbox.journal}
                  </div>
                  <h4 className="mt-1 line-clamp-2 text-base font-semibold text-[#11161C]">
                    {lightbox.title}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setLightbox(null)}
                  aria-label={pubsText.closeLightbox}
                  className="shrink-0 rounded-md border border-[#DCE2E8] p-1.5 text-[#5A6775] transition-colors hover:border-[#0F4C81] hover:text-[#11161C]"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
              <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-[#F6F7F8] p-5 md:p-8">
                <div className="rounded-md border border-[#DCE2E8] bg-white p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={lightbox.src}
                    alt={lightbox.alt}
                    referrerPolicy="no-referrer"
                    className="max-h-[66vh] max-w-full object-contain"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

export const PublicationsSection = memo(PublicationsSectionComponent);
