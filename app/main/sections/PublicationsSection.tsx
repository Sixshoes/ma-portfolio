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
  Quote,
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
import { PublicationFigurePlaceholder } from './PublicationFigurePlaceholder';
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

function getHighlightText(citations: number, pubsText: PublicationsText): string {
  if (citations >= 100) return pubsText.benchmark;
  if (citations >= 50) return pubsText.keyFocus;
  return pubsText.general;
}

function getHighlightBadgeClass(highlight: string, pubsText: PublicationsText): string {
  if (highlight === pubsText.benchmark) {
    return 'border-[#c8a464]/45 bg-[#c8a464]/12 text-[#e5cea0]';
  }
  if (highlight === pubsText.keyFocus) {
    return 'border-white/[0.16] bg-white/[0.06] text-[#e8e4dc]';
  }
  return 'border-white/[0.08] bg-transparent text-[#8f8980]';
}

function resolvePublicationMedia(pub: Publication, pubsText: PublicationsText) {
  const abstractImg = pub.cover_url;
  const journalImg = pub.file_img;
  const hasAbstract = !!abstractImg;
  const hasJournal = !!journalImg;
  const isSameImg = abstractImg === journalImg;
  let mainImg: string | undefined = abstractImg || undefined;
  let mainLabel = pubsText.abstract;
  const fallbackImg = !isSameImg && hasAbstract && hasJournal ? journalImg : undefined;
  const secondaryImg = !isSameImg && hasJournal ? journalImg : null;

  if (!hasAbstract && hasJournal) {
    mainImg = journalImg || undefined;
    mainLabel = pubsText.cover;
  } else if (!hasAbstract && !hasJournal) {
    mainImg = undefined;
    mainLabel = pubsText.quantum;
  }

  const showFigurePlaceholder = !mainImg;
  return { mainImg, fallbackImg, mainLabel, secondaryImg, showFigurePlaceholder };
}

/** 美術館裝裱圖版框：有圖時以深色外斜角＋溫潤象牙紙襯框托出科學圖；無圖時呈現深色建築製圖佔位 */
function PublicationFigurePlate({
  pub,
  pubsText,
  eagerMain,
  priority,
  isMobile,
  compactSize,
  onOpenLightbox,
}: {
  pub: Publication;
  pubsText: PublicationsText;
  eagerMain: boolean;
  priority: boolean;
  isMobile: boolean;
  compactSize?: boolean;
  onOpenLightbox: (payload: NonNullable<LightboxState>) => void;
}) {
  const { mainImg, fallbackImg, mainLabel, secondaryImg, showFigurePlaceholder } =
    resolvePublicationMedia(pub, pubsText);

  return (
    <div className="flex flex-col gap-2.5">
      <div className={uiTokens.pubPlateOuter}>
        <div
          className={`group/img relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden ${
            showFigurePlaceholder ? 'rounded-[5px] bg-[#12110f]' : uiTokens.pubFigureSurface
          }`}
        >
          {showFigurePlaceholder ? (
            <PublicationFigurePlaceholder />
          ) : mainImg ? (
            <>
              <PublicationLazyImage
                key={`main-${mainImg}-${fallbackImg ?? ''}`}
                eager={eagerMain}
                src={mainImg}
                fallbackSrc={fallbackImg}
                alt={mainLabel || 'Publication Image'}
                fill
                priority={priority}
                sizes={
                  isMobile
                    ? '100vw'
                    : compactSize
                      ? '320px'
                      : '(max-width: 1024px) 44vw, 38vw'
                }
                className="object-contain p-2.5 transition-transform duration-500 group-hover/img:scale-[1.02]"
                referrerPolicy="no-referrer"
                fetchPriority={priority ? 'high' : eagerMain ? 'auto' : 'low'}
              />
              <button
                type="button"
                onClick={() =>
                  onOpenLightbox({
                    src: mainImg,
                    alt: mainLabel,
                    title: pub.title,
                    journal: pub.journal,
                  })
                }
                aria-label={pubsText.zoomFigure}
                title={pubsText.zoomFigure}
                className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-md border border-black/15 bg-[#141311]/85 text-[#f5f3ef] opacity-85 transition-all hover:bg-[#c8a464] hover:text-[#080807] group-hover/img:opacity-100 md:opacity-0"
              >
                <ZoomIn className="h-3.5 w-3.5" aria-hidden />
              </button>
            </>
          ) : null}
        </div>
        <div className="mt-2 flex items-center justify-between px-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#8f8980]">
            {mainLabel}
          </span>
          {secondaryImg && compactSize ? (
            <button
              type="button"
              onClick={() =>
                onOpenLightbox({
                  src: secondaryImg,
                  alt: pubsText.cover,
                  title: pub.title,
                  journal: pub.journal,
                })
              }
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#c8a464] underline-offset-4 hover:underline"
            >
              + {pubsText.cover}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
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
  expandedKey,
  copiedKey,
  onToggleAbstract,
  onCopyCitation,
  onOpenLightbox,
}: PublicationItemProps) {
  const highlightLabel = getHighlightText(pub.citations, pubsText);
  const takeawayLines = parseTakeawayLines(pub.takeaway);
  const expanded = expandedKey === pubKey;
  const isCopied = copiedKey === pubKey;
  const hasAbstractBody = !!pub.abstract_excerpt?.trim();
  const altmetricHref = pub.altmetric_id
    ? `https://www.altmetric.com/details.php?doi=${encodeURIComponent(pub.altmetric_id)}`
    : null;

  const isLandmark = variant === 'landmark';
  const isSubFeatured = variant === 'featured-sub';
  const eagerMain = index < (isMobile ? 1 : 2);

  // 1. 領銜代表作：全寬不對稱跨頁（左圖版 5 欄 + 右編排 7 欄）
  if (isLandmark) {
    return (
      <article className="group grid grid-cols-1 gap-8 rounded-xl border border-[#c8a464]/30 bg-gradient-to-br from-[#131210] via-[#0f0e0d] to-[#0b0a09] p-6 shadow-[inset_0_1px_0_rgba(229,206,160,0.12),0_24px_60px_rgba(0,0,0,0.5)] md:p-9 lg:grid-cols-12 lg:items-center lg:gap-10">
        <div className="lg:col-span-5">
          <PublicationFigurePlate
            pub={pub}
            pubsText={pubsText}
            eagerMain
            priority
            isMobile={isMobile}
            onOpenLightbox={onOpenLightbox}
          />
        </div>

        <div className="flex min-w-0 flex-col lg:col-span-7">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#e2c992]">
              ★ {pubsText.featuredSpotlight} · #1
            </span>
            <span className="h-3 w-px bg-white/[0.12]" aria-hidden />
            <span
              className={`rounded-sm border px-2.5 py-0.5 font-mono text-[11px] ${getHighlightBadgeClass(highlightLabel, pubsText)}`}
            >
              {highlightLabel}
            </span>
            <span className="ml-auto font-mono text-xs text-[#9b958c]">
              {pub.year > 0 ? pub.year : '-'}
            </span>
          </div>

          <h3 className="font-heading-serif mb-4 text-2xl font-semibold leading-[1.2] tracking-tight text-[#f5f3ef] transition-colors group-hover:text-[#e5cea0] md:text-3xl">
            {pub.title}
          </h3>

          {pub.authors?.trim() ? (
            <p className="mb-4 text-sm leading-relaxed text-[#a39e95]">
              {splitAuthorsHighlighted(pub.authors)}
            </p>
          ) : null}

          {takeawayLines.length > 0 ? (
            <ul className="mb-5 space-y-1.5 border-l border-[#c8a464]/45 pl-4 text-sm leading-relaxed text-[#c8c3ba]">
              {takeawayLines.map((line, li) => (
                <li key={li}>{line}</li>
              ))}
            </ul>
          ) : null}

          <div className="mt-2 flex flex-wrap items-end justify-between gap-6 border-t border-white/[0.08] pt-5">
            <div className="min-w-0">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#7d7870]">
                {pubsText.journal}
              </div>
              <div className="mt-1 font-heading-serif text-lg italic text-[#e8e4dc]">
                {pub.journal}
              </div>
              {pub.doi ? (
                <a
                  href={pub.doi}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1.5 break-all font-mono text-xs text-[#9b958c] transition-colors hover:text-[#e5cea0]"
                >
                  {getLinkDisplay(pub.doi, pubsText)}
                  <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
                </a>
              ) : null}
            </div>

            <div className="shrink-0 text-left sm:text-right">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#c8a464]">
                {pubsText.citations}
              </div>
              <div className="text-gold-sheen font-heading-serif text-5xl font-semibold leading-none tracking-tight [font-variant-numeric:lining-nums]">
                {pub.citations.toLocaleString(locale)}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onCopyCitation(pubKey, pub)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.12] bg-white/[0.03] px-3.5 py-1.5 font-mono text-xs text-[#d6d1c9] transition-colors hover:border-[#c8a464]/60 hover:text-[#e5cea0]"
            >
              {isCopied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#c8a464]" aria-hidden />
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
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#c8a464]/30 bg-[#c8a464]/10 px-3.5 py-1.5 font-mono text-xs text-[#e5cea0] transition-colors hover:bg-[#c8a464]/20"
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
                className="ml-auto inline-flex items-center gap-1.5 font-mono text-xs text-[#b8b3aa] transition-colors hover:text-[#e5cea0]"
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
                transition={{ duration: litePub ? 0 : 0.25 }}
                className="overflow-hidden"
              >
                <p className="mt-4 border-t border-white/[0.08] pt-4 text-sm leading-relaxed text-[#b3ada4]">
                  {pub.abstract_excerpt}
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </article>
    );
  }

  // 2. 次代表作（#2 & #3，無縫 2 欄細線網格）或一般列表列（無縫橫式建築書目列）
  const containerCls = isSubFeatured
    ? 'group flex h-full flex-col gap-5 bg-[#0e0d0c] p-6 transition-colors duration-300 hover:bg-[#12110f] md:p-7'
    : 'group flex flex-col gap-6 bg-[#0b0a09] p-6 transition-colors duration-300 hover:bg-[#100f0d] md:flex-row md:items-start md:gap-8 md:p-7';

  return (
    <article
      style={
        variant === 'list'
          ? { contentVisibility: 'auto', containIntrinsicSize: isMobile ? '340px' : '270px' }
          : undefined
      }
      className={containerCls}
    >
      <div className={isSubFeatured ? 'w-full' : 'w-full shrink-0 md:w-[260px] lg:w-[300px]'}>
        <PublicationFigurePlate
          pub={pub}
          pubsText={pubsText}
          eagerMain={eagerMain}
          priority={false}
          isMobile={isMobile}
          compactSize={!isSubFeatured}
          onOpenLightbox={onOpenLightbox}
        />
      </div>

      {/* 使用 min-w-0 flex-1，永遠不會因為 gap 與寬度百分比疊加造成右側標題裁切 */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="font-mono text-xs font-semibold text-[#e2c992] [font-variant-numeric:tabular-nums]">
            {pub.year > 0 ? pub.year : '-'}
          </span>
          <span className="h-3 w-px bg-white/[0.12]" aria-hidden />
          <span
            className={`rounded-sm border px-2 py-0.5 font-mono text-[11px] ${getHighlightBadgeClass(highlightLabel, pubsText)}`}
          >
            {highlightLabel}
          </span>
          {pub.is_star === '是' ? (
            <span className="inline-flex items-center gap-1 text-xs text-[#e2c992]">
              <Star className="h-3 w-3 fill-[#c8a464] text-[#c8a464]" aria-hidden />
              {pubsText.corresponding}
            </span>
          ) : (
            <span className="text-xs text-[#7d7870]">{pubsText.coauthor}</span>
          )}
        </div>

        <h3 className="font-heading-serif mb-3 text-xl font-medium leading-snug text-[#f5f3ef] transition-colors group-hover:text-[#e5cea0] md:text-[1.35rem]">
          {pub.title}
        </h3>

        {pub.authors?.trim() ? (
          <p className="mb-3 text-xs leading-relaxed text-[#9b958c] md:text-sm">
            {splitAuthorsHighlighted(pub.authors)}
          </p>
        ) : null}

        {takeawayLines.length > 0 ? (
          <ul className="mb-3.5 space-y-1 border-l border-[#c8a464]/35 pl-3.5 text-xs leading-relaxed text-[#b8b3aa] md:text-sm">
            {takeawayLines.map((line, li) => (
              <li key={li}>{line}</li>
            ))}
          </ul>
        ) : null}

        <div className="mt-auto flex flex-col gap-3 border-t border-white/[0.07] pt-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <div className="min-w-0">
              <span className="font-heading-serif text-base italic text-[#d6d1c9]">{pub.journal}</span>
              {pub.doi ? (
                <a
                  href={pub.doi}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 flex items-center gap-1.5 break-all font-mono text-xs text-[#8f8980] transition-colors hover:text-[#e5cea0]"
                >
                  {getLinkDisplay(pub.doi, pubsText)}
                  <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
                </a>
              ) : null}
            </div>

            <div className="flex shrink-0 items-center gap-1.5 font-mono text-sm font-semibold text-[#f5f3ef] [font-variant-numeric:tabular-nums]">
              <Quote className="h-3.5 w-3.5 text-[#c8a464]" aria-hidden />
              <span>{pub.citations.toLocaleString(locale)}</span>
              <span className="text-[11px] font-normal text-[#7d7870]">{pubsText.citations}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onCopyCitation(pubKey, pub)}
                className="inline-flex items-center gap-1.5 font-mono text-xs text-[#9b958c] transition-colors hover:text-[#e5cea0]"
              >
                {isCopied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[#c8a464]" aria-hidden />
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
                  className="inline-flex items-center gap-1 font-mono text-xs text-[#c8a464] transition-colors hover:text-[#e5cea0]"
                >
                  {pubsText.altmetricLink}
                  <ExternalLink className="h-3 w-3" aria-hidden />
                </a>
              ) : null}
            </div>

            {hasAbstractBody ? (
              <button
                type="button"
                onClick={() => onToggleAbstract(pubKey)}
                aria-expanded={expanded}
                className="inline-flex items-center gap-1 font-mono text-xs text-[#b8b3aa] transition-colors hover:text-[#e5cea0]"
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
              transition={{ duration: litePub ? 0 : 0.25 }}
              className="overflow-hidden"
            >
              <p className="mt-4 border-t border-white/[0.07] pt-4 text-sm leading-relaxed text-[#a39e95]">
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
  copiedKey,
  onCopyCitation,
}: {
  pub: Publication;
  pubKey: string;
  pubsText: PublicationsText;
  locale: string;
  copiedKey: string | null;
  onCopyCitation: (key: string, pub: Publication) => void;
}) {
  const isCopied = copiedKey === pubKey;
  const altmetricHref = pub.altmetric_id
    ? `https://www.altmetric.com/details.php?doi=${encodeURIComponent(pub.altmetric_id)}`
    : null;

  return (
    <article className="group flex flex-col gap-3 bg-[#0b0a09] px-5 py-4 transition-colors hover:bg-[#11100e] md:flex-row md:items-center md:gap-6">
      <div className="flex items-center gap-3 md:w-20 md:shrink-0">
        <span className="font-mono text-sm font-semibold text-[#e2c992] [font-variant-numeric:tabular-nums]">
          {pub.year > 0 ? pub.year : '-'}
        </span>
        {pub.is_star === '是' ? (
          <Star
            className="h-3.5 w-3.5 shrink-0 fill-[#c8a464] text-[#c8a464]"
            aria-label={pubsText.corresponding}
          />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="font-heading-serif text-base font-medium leading-snug text-[#f5f3ef] transition-colors group-hover:text-[#e5cea0] md:text-lg">
          {pub.title}
        </h3>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#9b958c]">
          <span className="italic text-[#c8c3ba]">{pub.journal}</span>
          <span className="font-mono text-[#e2c992]">
            {pub.citations.toLocaleString(locale)} {pubsText.citations}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onCopyCitation(pubKey, pub)}
          className="inline-flex items-center gap-1 rounded-md border border-white/[0.1] bg-white/[0.02] px-2.5 py-1 font-mono text-[11px] text-[#c8c3ba] transition-colors hover:border-[#c8a464]/60 hover:text-[#e5cea0]"
        >
          {isCopied ? (
            <>
              <Check className="h-3 w-3 text-[#c8a464]" aria-hidden />
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
            className="inline-flex items-center gap-1 rounded-md border border-[#c8a464]/30 px-2.5 py-1 font-mono text-[11px] text-[#e2c992] transition-colors hover:bg-[#c8a464]/15"
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
            className="inline-flex items-center gap-1 rounded-md border border-white/[0.14] bg-[#f5f3ef] px-2.5 py-1 font-mono text-[11px] font-semibold text-[#080807] transition-colors hover:bg-[#e5cea0]"
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
      className="divide-y divide-white/[0.07] overflow-hidden rounded-xl border border-white/[0.09] bg-[#0d0c0b]"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={pubsText.loadingPublications}
    >
      {[0, 1, 2].map((i) => (
        <div key={i} className={`flex flex-col gap-6 p-7 md:flex-row ${pulse}`}>
          <div className="aspect-[16/10] w-full rounded-lg bg-white/[0.05] md:w-[280px]" />
          <div className="flex flex-1 flex-col gap-3">
            <div className="h-4 w-32 rounded bg-white/[0.06]" />
            <div className="h-6 w-[85%] rounded bg-white/[0.07]" />
            <div className="h-4 w-[60%] rounded bg-white/[0.05]" />
          </div>
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
  const litePub = prefersReducedMotion || isMobile;
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<LightboxState>(null);
  const locale = lang === 'zh' ? 'zh-TW' : 'en-US';
  const sectionKicker = lang === 'zh' ? '學術著作檔案' : 'SCHOLARLY ARCHIVE';

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
      className="relative scroll-mt-24 border-t border-white/[0.08] bg-[#0a0a09] py-24 md:py-32"
    >
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="mb-12 flex flex-col items-start justify-between gap-4 md:mb-14 md:flex-row md:items-end">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="h-px w-6 bg-[#c8a464]" aria-hidden />
              <span className={uiTokens.sectionKicker}>{sectionKicker}</span>
            </div>
            <h2 className={uiTokens.sectionTitle}>
              <span className={uiTokens.titleLight}>{pubsText.title}</span>{' '}
              <span className={uiTokens.titleBold}>{pubsText.subtitle}</span>
            </h2>
          </div>
          <p className="max-w-md text-sm font-light leading-relaxed text-[#9e988f] md:text-right">
            {pubsText.desc}
          </p>
        </div>

        {/* 1993–2027 黑底精品互動發表與引用長條圖 */}
        {!isLoading && allPublications.length > 0 ? (
          <PublicationTimelineChart
            publications={allPublications}
            selectedFilter={pubFilter}
            lang={lang}
            onSelectYear={onFilterChange}
          />
        ) : null}

        {/* 精簡建築工具列（篩選、排序、搜尋、僅通訊作者、檢視模式） */}
        <div className="mb-10 border-y border-white/[0.08] py-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
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
                      {uniqueYears.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8f8980]"
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
                    className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8f8980]"
                    aria-hidden
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={onCorrespondingToggle}
                aria-pressed={correspondingOnly}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 font-mono text-xs transition-colors ${
                  correspondingOnly
                    ? 'border-[#c8a464]/70 bg-[#c8a464]/15 text-[#e5cea0]'
                    : 'border-white/[0.12] bg-[#0d0c0b] text-[#b8b3aa] hover:border-white/[0.25] hover:text-[#f5f3ef]'
                }`}
              >
                <Star
                  className={`h-3.5 w-3.5 ${
                    correspondingOnly ? 'fill-[#c8a464] text-[#c8a464]' : 'text-[#8f8980]'
                  }`}
                  aria-hidden
                />
                {pubsText.correspondingOnly}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-0 flex-1 sm:w-64 lg:w-72">
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#7d7870]"
                  aria-hidden
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={pubsText.searchPlaceholder}
                  aria-label={pubsText.searchAriaLabel}
                  className="w-full rounded-lg border border-white/[0.12] bg-[#0d0c0b] py-2 pl-9 pr-8 text-xs text-[#f5f3ef] placeholder:text-[#7d7870] transition-colors focus:border-[#c8a464]/70 focus:outline-none"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => onSearchChange('')}
                    aria-label={pubsText.clearSearch}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-[#8f8980] hover:text-[#f5f3ef]"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden />
                  </button>
                ) : null}
              </div>

              <div
                role="group"
                aria-label="View mode"
                className="inline-flex rounded-lg border border-white/[0.12] bg-[#0d0c0b] p-0.5"
              >
                <button
                  type="button"
                  onClick={() => onViewModeChange('card')}
                  aria-pressed={viewMode === 'card'}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-xs transition-colors ${
                    viewMode === 'card'
                      ? 'bg-[#f5f3ef] font-semibold text-[#080807]'
                      : 'text-[#8f8980] hover:text-[#f5f3ef]'
                  }`}
                >
                  <LayoutGrid className="h-3.5 w-3.5" aria-hidden />
                  <span className="hidden sm:inline">{pubsText.viewCard}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onViewModeChange('compact')}
                  aria-pressed={viewMode === 'compact'}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-xs transition-colors ${
                    viewMode === 'compact'
                      ? 'bg-[#f5f3ef] font-semibold text-[#080807]'
                      : 'text-[#8f8980] hover:text-[#f5f3ef]'
                  }`}
                >
                  <List className="h-3.5 w-3.5" aria-hidden />
                  <span className="hidden sm:inline">{pubsText.viewCompact}</span>
                </button>
              </div>

              {!isLoading ? (
                <span
                  className="font-mono text-xs text-[#9b958c] [font-variant-numeric:tabular-nums]"
                  aria-live="polite"
                >
                  {pubsText.resultCount.replace('{count}', String(filteredCount))}
                </span>
              ) : null}
            </div>
          </div>

          {isUsingFallback ? (
            <p className="mt-4 rounded-lg border border-[#c8a464]/30 bg-[#c8a464]/10 px-4 py-2.5 text-xs text-[#e5cea0]">
              {pubsText.offlineFallbackNote}
            </p>
          ) : null}
        </div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <PublicationsListSkeleton prefersReducedMotion={prefersReducedMotion} pubsText={pubsText} />
            </motion.div>
          ) : filteredCount === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center rounded-xl border border-white/[0.08] bg-[#0e0d0c] px-6 py-16 text-center"
              role="status"
              aria-live="polite"
            >
              <FolderOpen className="mb-4 h-10 w-10 text-[#6d6860]" aria-hidden />
              <p className="max-w-md text-sm leading-relaxed text-[#9b958c]">
                {pubsText.emptyPublications}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-10"
            >
              {/* 不對稱代表作雜誌跨頁 Bento：#1 領銜全寬跨頁 + #2/#3 無縫細線雙欄 */}
              {showFeaturedStrip && landmarkPub ? (
                <div className="space-y-5">
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
                    expandedKey={expandedKey}
                    copiedKey={copiedKey}
                    onToggleAbstract={onToggleAbstract}
                    onCopyCitation={onCopyCitation}
                    onOpenLightbox={onOpenLightbox}
                  />

                  {subFeaturedPubs.length > 0 ? (
                    <div className="overflow-hidden rounded-xl border border-white/[0.09] bg-white/[0.08]">
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
                <p className="rounded-xl border border-white/[0.08] bg-[#0e0d0c] px-5 py-6 text-center text-sm text-[#9b958c]">
                  {pubsText.allInFeaturedNote}
                </p>
              ) : null}

              {/* 主列表：建築細線分隔清單（不再疊 10 個獨立厚圓角盒子） */}
              {visiblePublications.length > 0 ? (
                <div className="overflow-hidden rounded-xl border border-white/[0.09] bg-[#0b0a09] divide-y divide-white/[0.07]">
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
            </motion.div>
          )}
        </AnimatePresence>

        {!isLoading && filteredCount > 0 && visiblePublications.length < listRowCount && (
          <div className="mt-12 flex justify-center">
            <button
              type="button"
              onClick={onLoadMore}
              className={`${uiTokens.buttonGhost} inline-flex items-center gap-2 rounded-lg px-8 py-3 font-mono text-xs uppercase tracking-[0.18em]`}
            >
              {pubsText.loadMore}
              <ChevronDown className="h-4 w-4" aria-hidden />
            </button>
          </div>
        )}
      </div>

      {/* 暗房燈箱預覽：科學圖版在象牙白畫面上清晰展開 */}
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
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/88 p-4 backdrop-blur-md md:p-8"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-white/[0.12] bg-[#12110f] shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] px-6 py-4">
                <div className="min-w-0">
                  <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#c8a464]">
                    {lightbox.journal}
                  </div>
                  <h4 className="mt-1 line-clamp-2 font-heading-serif text-base font-medium text-[#f5f3ef] md:text-lg">
                    {lightbox.title}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setLightbox(null)}
                  aria-label={pubsText.closeLightbox}
                  className="shrink-0 rounded-lg border border-white/[0.12] p-2 text-[#b8b3aa] transition-colors hover:border-[#c8a464]/60 hover:text-[#f5f3ef]"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
              <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-[#0b0a09] p-5 md:p-8">
                <div className="rounded-lg bg-[#f7f5f0] p-3 shadow-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={lightbox.src}
                    alt={lightbox.alt}
                    referrerPolicy="no-referrer"
                    className="max-h-[66vh] max-w-full rounded object-contain"
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
