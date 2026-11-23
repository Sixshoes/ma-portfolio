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
    return 'border-[#d6be8d] bg-[#f7f0e0] text-[#785519] font-semibold';
  }
  if (highlight === pubsText.keyFocus) {
    return 'border-[#d5cfc4] bg-[#f3efe7] text-[#292622] font-medium';
  }
  return 'border-[#e7e1d7] bg-[#faf8f4] text-[#6b655d]';
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

function CitationCountUpAnimated({
  value,
  large,
  locale,
}: {
  value: number;
  large?: boolean;
  locale: string;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let raf = 0;
    let cancelled = false;
    const t0 = performance.now();
    const d = 850;
    const step = (now: number) => {
      if (cancelled) return;
      const p = Math.min(1, (now - t0) / d);
      const e = 1 - (1 - p) ** 3;
      setDisplay(Math.round(value * e));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [value]);

  const cls = large
    ? 'font-heading-serif text-4xl font-semibold tracking-tight text-[#8a6522] md:text-5xl'
    : 'font-mono text-sm font-semibold text-[#141311]';
  return <span className={cls}>{display.toLocaleString(locale)}</span>;
}

function CitationCountUp({
  value,
  litePub,
  large,
  locale,
}: {
  value: number;
  litePub: boolean;
  large?: boolean;
  locale: string;
}) {
  const animate = !litePub && value >= 100;
  const cls = large
    ? 'font-heading-serif text-4xl font-semibold tracking-tight text-[#8a6522] md:text-5xl'
    : 'font-mono text-sm font-semibold text-[#141311]';

  if (!animate) {
    return <span className={cls}>{value.toLocaleString(locale)}</span>;
  }

  return <CitationCountUpAnimated key={value} value={value} large={large} locale={locale} />;
}

type PublicationCardProps = {
  pub: Publication;
  pubKey: string;
  pubsText: PublicationsText;
  isMobile: boolean;
  litePub: boolean;
  variant: 'featured' | 'list';
  index: number;
  locale: string;
  expandedKey: string | null;
  copiedKey: string | null;
  onToggleAbstract: (key: string) => void;
  onCopyCitation: (key: string, pub: Publication) => void;
  onOpenLightbox: (payload: NonNullable<LightboxState>) => void;
};

const PublicationCard = memo(function PublicationCard({
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
}: PublicationCardProps) {
  const highlightLabel = getHighlightText(pub.citations, pubsText);
  const { mainImg, fallbackImg, mainLabel, secondaryImg, showFigurePlaceholder } = resolvePublicationMedia(
    pub,
    pubsText,
  );
  const eagerMainCount = isMobile ? 1 : 2;
  const eagerMain = index < eagerMainCount;
  const isFeatured = variant === 'featured';
  const takeawayLines = parseTakeawayLines(pub.takeaway);
  const expanded = expandedKey === pubKey;
  const isCopied = copiedKey === pubKey;
  const hasAbstractBody = !!pub.abstract_excerpt?.trim();
  const showBigCitations = pub.citations >= 100;
  const altmetricHref = pub.altmetric_id
    ? `https://www.altmetric.com/details.php?doi=${encodeURIComponent(pub.altmetric_id)}`
    : null;

  const cardStaggerDelay = (i: number) => (litePub ? 0 : Math.min(i, 8) * 0.03);

  const surface = `${uiTokens.surfaceCard} ${
    isFeatured ? 'border-[#dfd5c4] shadow-[0_6px_26px_rgba(20,19,17,0.06)]' : ''
  } ${uiTokens.surfaceCardHover}`;

  const titleCls = isFeatured
    ? 'font-heading-serif mb-3.5 text-xl font-semibold leading-snug text-[#141311] transition-colors group-hover:text-[#7f5d1e] md:text-[1.35rem]'
    : 'font-heading-serif mb-4 text-xl font-semibold leading-snug text-[#141311] transition-colors group-hover:text-[#7f5d1e] md:text-2xl';

  const layoutCls = isFeatured
    ? 'group flex h-full flex-col gap-5 p-6'
    : 'group flex flex-col gap-6 p-6 md:flex-row md:gap-8 md:p-7 lg:gap-9';

  const imgColCls = isFeatured
    ? 'flex w-full shrink-0 flex-col gap-3'
    : 'flex w-full shrink-0 flex-col gap-3 md:w-5/12 lg:w-1/3';

  const bodyCls = isFeatured
    ? 'flex min-h-0 min-w-0 flex-1 flex-col'
    : 'flex min-w-0 flex-1 flex-col';

  return (
    <motion.div
      layout={!litePub}
      initial={litePub ? false : { opacity: 0, y: 14 }}
      whileInView={litePub ? undefined : { opacity: 1, y: 0 }}
      viewport={litePub ? undefined : { once: true, margin: '0px 0px -30px 0px', amount: 'some' }}
      transition={{ delay: cardStaggerDelay(index), duration: litePub ? 0 : 0.28 }}
      style={{
        transform: 'translateZ(0)',
        ...(variant === 'list'
          ? {
              contentVisibility: 'auto',
              containIntrinsicSize: isMobile ? '360px' : '420px',
            }
          : {}),
      }}
      className={`${layoutCls} ${surface}`}
    >
      <div className={imgColCls}>
        <div
          className={`group/img relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl p-2 ${uiTokens.pubFigureSurface}`}
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
                priority={index === 0 && isFeatured}
                sizes={isMobile ? '100vw' : '(max-width: 1024px) 42vw, 33vw'}
                className="object-contain p-2 transition-transform duration-500 group-hover/img:scale-[1.02]"
                referrerPolicy="no-referrer"
                fetchPriority={index === 0 ? 'high' : eagerMain ? 'auto' : 'low'}
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
                className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-[#dfd7c9] bg-white/95 text-[#292622] opacity-85 shadow-sm transition-all hover:border-[#9a742e] hover:bg-[#181614] hover:text-[#faf8f4] group-hover/img:opacity-100 md:opacity-0"
              >
                <ZoomIn className="h-4 w-4" aria-hidden />
              </button>
            </>
          ) : null}
          <div className={`absolute left-2 top-2 px-2 py-0.5 text-[10px] ${uiTokens.pubBadgeOverlay}`}>
            {mainLabel}
          </div>
        </div>

        {secondaryImg && !isFeatured && (
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
            aria-label={pubsText.zoomFigure}
            title={pubsText.zoomFigure}
            className={`group/img relative flex aspect-[3/4] w-20 items-center justify-center overflow-hidden rounded-lg p-1 text-left transition-colors hover:border-[#9a742e] ${uiTokens.pubFigureSurface}`}
          >
            <PublicationLazyImage
              key={`sec-${secondaryImg}`}
              eager={false}
              src={secondaryImg}
              alt={pubsText.cover || 'Journal Cover'}
              fill
              sizes="80px"
              className="object-contain p-1 transition-transform duration-500 group-hover/img:scale-[1.03]"
              referrerPolicy="no-referrer"
              fetchPriority="low"
            />
            <div className={`absolute left-1 top-1 px-1.5 py-0.5 text-[9px] ${uiTokens.pubBadgeOverlay}`}>
              {pubsText.cover}
            </div>
          </button>
        )}
      </div>

      <div className={bodyCls}>
        <div className="mb-3.5 flex flex-wrap items-center gap-x-3.5 gap-y-2 border-b border-[#efeae0] pb-3.5">
          <span
            className={`rounded-full border px-3 py-0.5 font-mono text-[11px] ${getHighlightBadgeClass(highlightLabel, pubsText)}`}
          >
            {highlightLabel}
          </span>
          {pub.is_star === '是' ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-[#7f5d1e]">
              <Star className="h-3.5 w-3.5 fill-[#9a742e] text-[#9a742e]" aria-hidden />
              {pubsText.corresponding}
            </span>
          ) : (
            <span className="text-xs text-[#6b655d]">{pubsText.coauthor}</span>
          )}
          <span className="ml-auto font-mono text-xs font-semibold text-[#57524b]">
            {pub.year > 0 ? pub.year : '-'}
          </span>
        </div>

        <h3 className={titleCls}>{pub.title}</h3>

        {pub.authors?.trim() ? (
          <p className="mb-3.5 text-xs leading-relaxed text-[#57524b] md:text-sm">
            {splitAuthorsHighlighted(pub.authors)}
          </p>
        ) : null}

        {takeawayLines.length > 0 ? (
          <div className="mb-4 rounded-xl border border-[#ece6dc] bg-[#faf8f4] p-3.5">
            <div className={`${uiTokens.metaMono} mb-1.5 text-[#8a6522]`}>{pubsText.takeawayLabel}</div>
            <ul className="list-inside list-disc space-y-1 text-xs leading-relaxed text-[#3f3b36] md:text-sm">
              {takeawayLines.map((line, li) => (
                <li key={li}>{line}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {isFeatured && showBigCitations ? (
          <div className="mb-4 rounded-xl border border-[#e5dac5] bg-[#faf6ec] px-4 py-3.5">
            <div className={`${uiTokens.metaMono} mb-1 text-[#7f5d1e]`}>{pubsText.citations}</div>
            <div className="flex flex-wrap items-end gap-2">
              <CitationCountUp value={pub.citations} litePub={litePub} large locale={locale} />
              <Quote className="mb-2 h-4 w-4 text-[#9a742e]/65" aria-hidden />
            </div>
          </div>
        ) : null}

        <div className="mt-auto flex flex-col gap-3 border-t border-[#efeae0] pt-4">
          {!isFeatured || !showBigCitations ? (
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div>
                <div className={`${uiTokens.metaMono} mb-0.5`}>{pubsText.journal}</div>
                <div className="text-sm font-medium italic text-[#1f1d1a]">{pub.journal}</div>
              </div>
              <div>
                <div className={`${uiTokens.metaMono} mb-0.5`}>{pubsText.citations}</div>
                <div className="flex items-center gap-1.5">
                  {!isFeatured && showBigCitations ? (
                    <CitationCountUp value={pub.citations} litePub={litePub} locale={locale} />
                  ) : (
                    <div className="flex items-center gap-1.5 font-mono text-sm font-semibold text-[#141311]">
                      <Quote className="h-3.5 w-3.5 text-[#8a6522]" aria-hidden />
                      {pub.citations.toLocaleString(locale)}
                    </div>
                  )}
                </div>
              </div>
              {pub.doi ? (
                <div className="sm:col-span-2">
                  <div className={`${uiTokens.metaMono} mb-0.5`}>{pubsText.doi}</div>
                  <a
                    href={pub.doi}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 break-all font-mono text-xs text-[#57524b] underline-offset-4 transition-colors hover:text-[#7f5d1e] hover:underline md:text-sm"
                  >
                    {getLinkDisplay(pub.doi, pubsText)}{' '}
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  </a>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              <div>
                <div className={`${uiTokens.metaMono} mb-0.5`}>{pubsText.journal}</div>
                <div className="text-sm font-medium italic text-[#1f1d1a]">{pub.journal}</div>
              </div>
              {pub.doi ? (
                <div>
                  <div className={`${uiTokens.metaMono} mb-0.5`}>{pubsText.doi}</div>
                  <a
                    href={pub.doi}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 break-all font-mono text-xs text-[#57524b] underline-offset-4 transition-colors hover:text-[#7f5d1e] hover:underline"
                  >
                    {getLinkDisplay(pub.doi, pubsText)}{' '}
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  </a>
                </div>
              ) : null}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
            <div className="flex flex-wrap items-center gap-3">
              {altmetricHref ? (
                <a
                  href={altmetricHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#8a6522] underline-offset-4 hover:text-[#141311] hover:underline"
                >
                  {pubsText.altmetricLink}
                  <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
                </a>
              ) : null}

              <button
                type="button"
                onClick={() => onCopyCitation(pubKey, pub)}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#dcd4c7] bg-[#faf8f4] px-3 py-1 font-mono text-xs text-[#3f3b36] transition-colors hover:border-[#9a742e] hover:text-[#7f5d1e]"
              >
                {isCopied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[#8a6522]" aria-hidden />
                    {pubsText.copiedCitation}
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" aria-hidden />
                    {pubsText.copyCitation}
                  </>
                )}
              </button>
            </div>

            {hasAbstractBody ? (
              <button
                type="button"
                onClick={() => onToggleAbstract(pubKey)}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#d5cbb9] bg-white px-3.5 py-1.5 font-mono text-xs font-medium text-[#292622] transition-colors hover:border-[#9a742e] hover:text-[#7f5d1e]"
                aria-expanded={expanded}
              >
                {expanded ? (
                  <>
                    {pubsText.collapseAbstract}
                    <ChevronUp className="h-3.5 w-3.5" aria-hidden />
                  </>
                ) : (
                  <>
                    {pubsText.readAbstract}
                    <ChevronDown className="h-3.5 w-3.5" aria-hidden />
                  </>
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
              transition={{ duration: litePub ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <p className="mt-4 border-t border-[#efeae0] pt-4 text-sm leading-relaxed text-[#3f3b36]">
                {pub.abstract_excerpt}
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
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
  const highlightLabel = getHighlightText(pub.citations, pubsText);
  const isCopied = copiedKey === pubKey;
  const altmetricHref = pub.altmetric_id
    ? `https://www.altmetric.com/details.php?doi=${encodeURIComponent(pub.altmetric_id)}`
    : null;

  return (
    <article className="group flex flex-col gap-3 rounded-xl border border-[#e5dfd5] bg-white px-5 py-4 transition-colors hover:border-[#9a742e] md:flex-row md:items-center md:justify-between md:gap-6">
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded bg-[#181614] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#faf8f4]">
            {pub.year > 0 ? pub.year : '-'}
          </span>
          <span
            className={`rounded-full border px-2.5 py-0.5 font-mono text-[11px] ${getHighlightBadgeClass(highlightLabel, pubsText)}`}
          >
            {highlightLabel}
          </span>
          {pub.is_star === '是' ? (
            <span className="inline-flex items-center gap-1 font-medium text-[#7f5d1e]">
              <Star className="h-3 w-3 fill-[#9a742e] text-[#9a742e]" aria-hidden />
              {pubsText.corresponding}
            </span>
          ) : null}
        </div>
        <h3 className="font-heading-serif text-base font-semibold leading-snug text-[#141311] transition-colors group-hover:text-[#7f5d1e] md:text-lg">
          {pub.title}
        </h3>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#57524b]">
          <span className="font-medium italic text-[#3f3b36]">{pub.journal}</span>
          <span className="inline-flex items-center gap-1 font-mono font-medium text-[#141311]">
            <Quote className="h-3 w-3 text-[#8a6522]" aria-hidden />
            {pub.citations.toLocaleString(locale)} {pubsText.citations}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onCopyCitation(pubKey, pub)}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#dcd4c7] bg-[#faf8f4] px-3 py-1.5 font-mono text-xs text-[#292622] transition-colors hover:border-[#9a742e] hover:text-[#7f5d1e]"
        >
          {isCopied ? (
            <>
              <Check className="h-3.5 w-3.5 text-[#8a6522]" aria-hidden />
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
            className="inline-flex items-center gap-1 rounded-full border border-[#dfd5c4] bg-[#f7f2e7] px-3 py-1.5 font-mono text-xs font-medium text-[#7f5d1e] transition-colors hover:border-[#9a742e]"
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
            className="inline-flex items-center gap-1 rounded-full border border-[#181614] bg-[#181614] px-3 py-1.5 font-mono text-xs text-[#faf8f4] transition-colors hover:border-[#8a6522] hover:bg-[#8a6522]"
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
      className="flex flex-col gap-5"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={pubsText.loadingPublications}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`flex flex-col gap-5 rounded-2xl border border-[#e5dfd5] bg-white p-6 md:flex-row md:gap-8 md:p-7 ${pulse}`}
        >
          <div className="w-full shrink-0 md:w-5/12 lg:w-1/3">
            <div className="aspect-video w-full rounded-xl bg-[#f3efe7]" />
          </div>
          <div className="flex flex-1 flex-col gap-4 pt-2 md:pt-0">
            <div className="flex flex-wrap gap-2">
              <div className="h-6 w-24 rounded-full bg-[#f3efe7]" />
              <div className="h-6 w-28 rounded-full bg-[#f3efe7]" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-[92%] rounded bg-[#ede8df]" />
              <div className="h-4 w-[76%] rounded bg-[#ede8df]" />
            </div>
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

  return (
    <section
      id="publications"
      className="relative scroll-mt-24 border-y border-[#e5dfd5] bg-[#f7f4ee] py-20 md:py-28"
    >
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="mb-10 border-b border-[#e2dacd] pb-8 md:mb-12">
          <div className={`${uiTokens.sectionKicker} mb-3`}>02 / PUBLICATIONS</div>
          <h2 className={`${uiTokens.sectionTitle} mb-3`}>
            <span className={uiTokens.titleLight}>{pubsText.title}</span>{' '}
            <span className={uiTokens.titleBold}>{pubsText.subtitle}</span>
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-[#57524b] md:text-base">
            {pubsText.desc}
          </p>
        </div>

        {/* 1993–2026 歷年發表與引用互動圖表（點擊年份長條直接連動篩選） */}
        {!isLoading && allPublications.length > 0 ? (
          <PublicationTimelineChart
            publications={allPublications}
            selectedFilter={pubFilter}
            lang={lang}
            onSelectYear={onFilterChange}
          />
        ) : null}

        {/* 篩選、排序與搜尋工具列 */}
        <div className="mb-8 rounded-2xl border border-[#e5dfd5] bg-white p-4 shadow-[0_2px_12px_rgba(20,19,17,0.03)] md:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label htmlFor="pub-filter-select" className={uiTokens.metaMono}>
                  {pubsText.filterBy}:
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
                    className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b655d]"
                    aria-hidden
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="pub-sort-select" className={uiTokens.metaMono}>
                  {pubsText.sortLabel}:
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
                    className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b655d]"
                    aria-hidden
                  />
                </div>
              </div>
            </div>

            <div className="relative w-full lg:w-80">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#787168]"
                aria-hidden
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={pubsText.searchPlaceholder}
                aria-label={pubsText.searchAriaLabel}
                className="w-full rounded-full border border-[#dcd4c7] bg-[#faf8f4] py-2.5 pl-11 pr-10 text-sm text-[#141311] placeholder:text-[#787168] transition-all focus:border-[#9a742e] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9a742e]/15"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  aria-label={pubsText.clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#6b655d] transition-colors hover:text-[#141311]"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#efeae0] pt-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onCorrespondingToggle}
                aria-pressed={correspondingOnly}
                className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 font-mono text-xs font-medium transition-colors ${
                  correspondingOnly
                    ? 'border-[#181614] bg-[#181614] text-[#faf8f4]'
                    : 'border-[#dcd4c7] bg-[#faf8f4] text-[#3f3b36] hover:border-[#9a742e] hover:text-[#7f5d1e]'
                }`}
              >
                <Star
                  className={`h-3.5 w-3.5 ${
                    correspondingOnly ? 'fill-[#dcc08e] text-[#dcc08e]' : 'text-[#8a6522]'
                  }`}
                  aria-hidden
                />
                {pubsText.correspondingOnly}
              </button>

              <div
                role="group"
                aria-label="View mode"
                className="inline-flex rounded-full border border-[#dcd4c7] bg-[#f5f1e9] p-0.5"
              >
                <button
                  type="button"
                  onClick={() => onViewModeChange('card')}
                  aria-pressed={viewMode === 'card'}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 font-mono text-xs transition-colors ${
                    viewMode === 'card'
                      ? 'bg-[#181614] font-semibold text-[#faf8f4]'
                      : 'text-[#57524b] hover:text-[#141311]'
                  }`}
                >
                  <LayoutGrid className="h-3.5 w-3.5" aria-hidden />
                  {pubsText.viewCard}
                </button>
                <button
                  type="button"
                  onClick={() => onViewModeChange('compact')}
                  aria-pressed={viewMode === 'compact'}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 font-mono text-xs transition-colors ${
                    viewMode === 'compact'
                      ? 'bg-[#181614] font-semibold text-[#faf8f4]'
                      : 'text-[#57524b] hover:text-[#141311]'
                  }`}
                >
                  <List className="h-3.5 w-3.5" aria-hidden />
                  {pubsText.viewCompact}
                </button>
              </div>
            </div>

            {!isLoading ? (
              <span className="font-mono text-xs font-semibold text-[#3f3b36]" aria-live="polite">
                {pubsText.resultCount.replace('{count}', String(filteredCount))}
              </span>
            ) : null}
          </div>

          {isUsingFallback ? (
            <p className="mt-4 rounded-xl border border-[#dfd5c4] bg-[#faf6ec] px-4 py-3 text-xs text-[#785519]">
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
              transition={{ duration: 0.25 }}
            >
              <PublicationsListSkeleton prefersReducedMotion={prefersReducedMotion} pubsText={pubsText} />
            </motion.div>
          ) : filteredCount === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center rounded-2xl border border-[#e5dfd5] bg-white px-6 py-16 text-center md:py-20"
              role="status"
              aria-live="polite"
            >
              <FolderOpen className="mb-4 h-11 w-11 text-[#9a9287]" aria-hidden />
              <p className="max-w-md text-sm leading-relaxed text-[#57524b] md:text-base">
                {pubsText.emptyPublications}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col gap-6"
            >
              {showFeaturedStrip ? (
                <div className="mb-2">
                  <div className="mb-4 flex items-center gap-3">
                    <p className={`${uiTokens.sectionKicker}`}>{pubsText.featuredSpotlight}</p>
                    <div className="h-px flex-1 bg-[#e2dacd]" aria-hidden />
                  </div>
                  <div className="rounded-3xl border border-[#e2dacd] bg-[#efeae0]/70 p-4 md:p-6">
                    <div className="grid gap-6 lg:grid-cols-3">
                      {featuredPublications.map((pub, fi) => {
                        const key = getPublicationKey(pub, fi);
                        return (
                          <PublicationCard
                            key={key}
                            pubKey={key}
                            pub={pub}
                            pubsText={pubsText}
                            isMobile={isMobile}
                            litePub={litePub}
                            variant="featured"
                            index={fi}
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
                </div>
              ) : null}

              {listAllInFeatured ? (
                <p className="rounded-2xl border border-[#e5dfd5] bg-white px-5 py-6 text-center text-sm leading-relaxed text-[#57524b]">
                  {pubsText.allInFeaturedNote}
                </p>
              ) : null}

              {viewMode === 'compact' ? (
                <div className="flex flex-col gap-3">
                  {visiblePublications.map((pub, i) => {
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
                  })}
                </div>
              ) : (
                visiblePublications.map((pub, i) => {
                  const key = getPublicationKey(pub, i);
                  return (
                    <PublicationCard
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
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!isLoading && filteredCount > 0 && visiblePublications.length < listRowCount && (
          <div className="mt-12 flex justify-center">
            <button
              type="button"
              onClick={onLoadMore}
              className={`${uiTokens.buttonGhost} inline-flex items-center gap-2 rounded-full px-8 py-3 font-mono text-sm font-medium shadow-[0_4px_16px_rgba(20,19,17,0.06)]`}
            >
              {pubsText.loadMore}
              <ChevronDown className="h-4 w-4" aria-hidden />
            </button>
          </div>
        )}
      </div>

      {/* 科學圖文摘要／期刊封面放大預覽燈箱 */}
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
            className="fixed inset-0 z-[100000] flex items-center justify-center bg-[#141311]/75 p-4 backdrop-blur-sm md:p-8"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#e5dfd5] bg-white shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4 border-b border-[#efeae0] bg-[#faf8f4] px-6 py-4">
                <div className="min-w-0">
                  <div className="font-mono text-xs font-medium uppercase tracking-wider text-[#8a6522]">
                    {lightbox.journal}
                  </div>
                  <h4 className="mt-1 line-clamp-2 font-heading-serif text-base font-semibold text-[#141311] md:text-lg">
                    {lightbox.title}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setLightbox(null)}
                  aria-label={pubsText.closeLightbox}
                  className="shrink-0 rounded-full border border-[#dcd4c7] bg-white p-2 text-[#3f3b36] transition-colors hover:border-[#9a742e] hover:text-[#141311]"
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>
              </div>
              <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-white p-4 md:p-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={lightbox.src}
                  alt={lightbox.alt}
                  referrerPolicy="no-referrer"
                  className="max-h-[70vh] max-w-full rounded-lg object-contain"
                />
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

export const PublicationsSection = memo(PublicationsSectionComponent);
