'use client';

import React, { memo, useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'motion/react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Code2,
  Copy,
  ExternalLink,
  Search,
  X,
  ZoomIn,
} from 'lucide-react';
import { Publication, extractDoiIdentifier, getPublicationKey } from '@/lib/publications';
import type { PublicationsText } from '@/lib/i18n';
import type { PubSort, PubViewMode } from '@/hooks/usePublications';
import { parseTakeawayLines, splitAuthorsHighlighted } from '@/lib/publicationDisplay';
import { getResearchDomainById } from '@/lib/researchDomains';
import { EDITORIAL_EASE, InkRule } from '@/app/components/EditorialMotion';
import {
  FigureLightboxModal,
  type FigureLightboxPayload,
} from '@/app/components/FigureLightboxModal';
import { TopJournalsChart } from '@/app/components/TopJournalsChart';
import { useRenderProfiler } from './useRenderProfiler';
import { uiTokens } from './uiTokens';
import { PublicationLazyImage } from './PublicationLazyImage';
import { PublicationTimelineChart } from './PublicationTimelineChart';

type Lang = 'en' | 'zh';
type CitationFormat = 'apa' | 'bibtex';
type CopiedState = { key: string; format: CitationFormat } | null;
type LightboxState = FigureLightboxPayload | null;

type PublicationsSectionProps = {
  pubsText: PublicationsText;
  lang: Lang;
  allPublications: Publication[];
  pubFilter: string;
  pubSort: PubSort;
  correspondingOnly: boolean;
  activeDomainId: string | null;
  selectedJournal: string | null;
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
  onClearDomainFilter: () => void;
  onSelectJournal: (journal: string | null) => void;
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

function formatBibTeXString(pub: Publication): string {
  const bareDoi = extractDoiIdentifier(pub.doi);
  const firstWord =
    pub.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .find((w) => w.length >= 3 && !['the', 'and', 'for', 'with', 'from', 'into'].includes(w)) ??
    'paper';
  const citeKey = `ma${pub.year > 0 ? pub.year : 'nd'}${firstWord}`;
  const authorsBib = pub.authors?.trim()
    ? pub.authors
        .split(/,\s*/)
        .map((a) => a.trim())
        .filter(Boolean)
        .join(' and ')
    : 'Ma, Yuan-Ron';
  const escapeBraces = (s: string) => s.replace(/[{}]/g, '');

  const lines = [
    `@article{${citeKey},`,
    `  author  = {${escapeBraces(authorsBib)}},`,
    `  title   = {${escapeBraces(pub.title)}},`,
  ];
  if (pub.journal && pub.journal !== 'Unknown') {
    lines.push(`  journal = {${escapeBraces(pub.journal)}},`);
  }
  if (pub.year > 0) {
    lines.push(`  year    = {${pub.year}},`);
  }
  if (bareDoi) {
    lines.push(`  doi     = {${bareDoi}},`);
  } else if (pub.doi) {
    lines.push(`  url     = {${pub.doi}},`);
  }
  lines.push('}');
  return lines.join('\n');
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
  lang: Lang;
  isMobile: boolean;
  litePub: boolean;
  featuredRank?: number;
  index: number;
  locale: string;
  currentYear: number;
  expandedKey: string | null;
  copiedState: CopiedState;
  onToggleAbstract: (key: string) => void;
  onCopyCitation: (key: string, pub: Publication, format: CitationFormat) => void;
  onOpenLightbox: (payload: NonNullable<LightboxState>) => void;
};

/** 溫潤圓角學報書目列（閱讀聚光燈、APA/BibTeX 雙制複製與圓角摘要圖燈箱） */
const PublicationJournalRow = memo(function PublicationJournalRow({
  pub,
  pubKey,
  pubsText,
  lang,
  isMobile,
  litePub,
  featuredRank,
  index,
  locale,
  currentYear,
  expandedKey,
  copiedState,
  onToggleAbstract,
  onCopyCitation,
  onOpenLightbox,
}: PublicationRowProps) {
  const figureUrl = resolveGraphicalAbstractUrl(pub);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showFigure = Boolean(figureUrl) && failedUrl !== figureUrl;

  const takeawayLines = parseTakeawayLines(pub.takeaway);
  const expanded = expandedKey === pubKey;
  const isApaCopied = copiedState?.key === pubKey && copiedState.format === 'apa';
  const isBibCopied = copiedState?.key === pubKey && copiedState.format === 'bibtex';
  const hasAbstractBody = !!pub.abstract_excerpt?.trim();
  const isInPress = pub.year > currentYear;
  const eagerMain = index < (isMobile ? 1 : 3);
  const altmetricHref = pub.altmetric_id
    ? `https://www.altmetric.com/details.php?doi=${encodeURIComponent(pub.altmetric_id)}`
    : null;
  const isZh = lang === 'zh';

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
      className="group relative rounded-2xl border-b border-[var(--app-rule)]/70 px-3 py-6 transition-[opacity,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[var(--app-surface-card)] md:px-5 md:group-hover/list:opacity-65 md:hover:!opacity-100"
    >
      {/* 當前閱讀行左側柔圓書籤線 */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-4 left-0 top-4 hidden w-[3px] origin-top scale-y-0 rounded-full bg-[var(--app-accent)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100 motion-reduce:transition-none md:block"
      />
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:gap-7">
        {/* 左欄：年份膠囊、預刊與通訊星號 */}
        <div className="flex flex-wrap items-center gap-2 md:w-28 md:shrink-0 md:flex-col md:items-start md:gap-2">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[var(--app-hover)] px-2.5 py-0.5 font-mono text-xs font-semibold text-[var(--app-ink)] [font-variant-numeric:tabular-nums]">
              {pub.year > 0 ? pub.year : '—'}
            </span>
            {isInPress ? (
              <span className="rounded-full bg-[var(--app-accent)]/15 px-2 py-0.5 text-[10px] font-medium text-[var(--app-accent)]">
                {pubsText.inPress}
              </span>
            ) : null}
          </div>

          {featuredRank !== undefined ? (
            <span className="rounded-full bg-[#C88A2B]/15 px-2.5 py-0.5 text-[11px] font-semibold text-[#B4771D] dark:text-[#F3DF87]">
              {pubsText.featuredSpotlight} {String(featuredRank).padStart(2, '0')}
            </span>
          ) : null}

          {pub.is_star === '是' ? (
            <span className="text-xs font-medium text-[var(--app-accent)]">
              ★ {pubsText.corresponding}
            </span>
          ) : (
            <span className="text-xs text-[var(--app-muted)]">{pubsText.coauthor}</span>
          )}
        </div>

        {/* 中欄：書目主內容 */}
        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="font-editorial mb-2 text-lg font-semibold leading-[1.35] text-[var(--app-ink)] transition-colors group-hover:text-[var(--app-accent)] md:text-[1.18rem]">
            {pub.title}
          </h3>

          {pub.authors?.trim() ? (
            <p className="mb-2.5 text-sm leading-relaxed text-[var(--app-muted)]">
              {splitAuthorsHighlighted(pub.authors)}
            </p>
          ) : null}

          {takeawayLines.length > 0 ? (
            <ul className="mb-3 space-y-1 rounded-xl border-l-2 border-[var(--app-accent)] bg-[var(--app-bg)]/60 py-2 pl-3.5 pr-3 text-sm leading-relaxed text-[var(--app-body)]">
              {takeawayLines.map((line, li) => (
                <li key={li}>{line}</li>
              ))}
            </ul>
          ) : null}

          <div className="mt-1 flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-sm">
            <span className="font-journal-italic text-[15px] text-[var(--app-body)]">
              {pub.journal}
            </span>
            <span className="rounded-full bg-[var(--app-hover)] px-2.5 py-0.5 font-mono text-[11px] text-[var(--app-ink)] [font-variant-numeric:tabular-nums]">
              {pub.citations.toLocaleString(locale)} {pubsText.citations}
            </span>
            {pub.doi ? (
              <a
                href={pub.doi}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 break-all font-mono text-xs text-[var(--app-muted)] underline decoration-[var(--app-rule)] underline-offset-4 transition-colors hover:text-[var(--app-accent)] hover:decoration-[var(--app-accent)]"
              >
                {getLinkDisplay(pub.doi, pubsText)}
                <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
              </a>
            ) : null}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[var(--app-muted)]">
            <button
              type="button"
              onClick={() => onCopyCitation(pubKey, pub, 'apa')}
              className="inline-flex h-5 items-center overflow-hidden transition-colors hover:text-[var(--app-ink)]"
            >
              <AnimatePresence mode="wait" initial={false}>
                {isApaCopied ? (
                  <motion.span
                    key="apa-copied"
                    initial={litePub ? { opacity: 1 } : { y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={litePub ? { opacity: 0 } : { y: -8, opacity: 0 }}
                    transition={{ duration: litePub ? 0 : 0.2, ease: EDITORIAL_EASE }}
                    className="inline-flex items-center gap-1 font-medium text-[var(--app-accent)]"
                  >
                    <Check className="h-3.5 w-3.5 text-[var(--app-accent)]" aria-hidden />
                    <span>{isZh ? '已複製書目' : pubsText.copiedCitation}</span>
                  </motion.span>
                ) : (
                  <motion.span
                    key="apa-copy"
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

            <button
              type="button"
              onClick={() => onCopyCitation(pubKey, pub, 'bibtex')}
              className="inline-flex h-5 items-center overflow-hidden font-mono transition-colors hover:text-[var(--app-ink)]"
            >
              <AnimatePresence mode="wait" initial={false}>
                {isBibCopied ? (
                  <motion.span
                    key="bib-copied"
                    initial={litePub ? { opacity: 1 } : { y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={litePub ? { opacity: 0 } : { y: -8, opacity: 0 }}
                    transition={{ duration: litePub ? 0 : 0.2, ease: EDITORIAL_EASE }}
                    className="inline-flex items-center gap-1 font-sans font-medium text-[var(--app-accent)]"
                  >
                    <Check className="h-3.5 w-3.5 text-[var(--app-accent)]" aria-hidden />
                    <span>{isZh ? '已複製 BibTeX' : 'BibTeX copied'}</span>
                  </motion.span>
                ) : (
                  <motion.span
                    key="bib-copy"
                    initial={litePub ? { opacity: 1 } : { y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={litePub ? { opacity: 0 } : { y: -8, opacity: 0 }}
                    transition={{ duration: litePub ? 0 : 0.2, ease: EDITORIAL_EASE }}
                    className="inline-flex items-center gap-1"
                  >
                    <Code2 className="h-3.5 w-3.5" aria-hidden />
                    <span>BibTeX</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {altmetricHref ? (
              <a
                href={altmetricHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 transition-colors hover:text-[var(--app-accent)] hover:underline"
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
                className="inline-flex items-center gap-1 font-medium text-[var(--app-ink)] transition-colors hover:text-[var(--app-accent)]"
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
                transition={{ duration: litePub ? 0 : 0.18, ease: EDITORIAL_EASE }}
                className="overflow-hidden"
              >
                <p className="mt-4 rounded-xl bg-[var(--app-bg)]/80 p-4 text-sm leading-relaxed text-[var(--app-body)]">
                  {pub.abstract_excerpt}
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* 右欄：溫潤圓角單篇摘要圖縮圖 */}
        {showFigure ? (
          <div className="w-full shrink-0 md:w-[230px] lg:w-[252px]">
            <motion.div
              layoutId={litePub ? undefined : figLayoutId}
              transition={{ duration: 0.36, ease: EDITORIAL_EASE }}
              onClick={openFigure}
              className="group/img relative flex aspect-[16/10] w-full cursor-zoom-in items-center justify-center overflow-hidden rounded-2xl border border-[var(--app-rule)] bg-[var(--app-figure-mat)] p-2.5 shadow-xs transition-all hover:border-[var(--app-ink)] hover:shadow-md"
            >
              <PublicationLazyImage
                key={figureUrl}
                src={figureUrl}
                alt={pub.title}
                eager={eagerMain}
                onUnavailable={handleUnavailable}
                className="editorial-figure-img h-full w-full object-contain transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/img:scale-[1.03]"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openFigure();
                }}
                aria-label={pubsText.zoomFigure}
                title={pubsText.zoomFigure}
                className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-[var(--app-rule)] bg-[var(--app-bg)]/95 text-[var(--app-ink)] opacity-85 transition-colors hover:border-[var(--app-ink)] hover:bg-[var(--app-ink)] hover:text-[var(--app-bg)] group-hover/img:opacity-100 md:opacity-0"
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
  const prevMatch = prev.copiedState?.key === prev.pubKey ? prev.copiedState.format : null;
  const nextMatch = next.copiedState?.key === next.pubKey ? next.copiedState.format : null;
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
    prev.lang === next.lang &&
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
    prevMatch === nextMatch
  );
});

const PublicationCompactRow = memo(function PublicationCompactRow({
  pub,
  pubKey,
  pubsText,
  lang,
  locale,
  currentYear,
  copiedState,
  onCopyCitation,
}: {
  pub: Publication;
  pubKey: string;
  pubsText: PublicationsText;
  lang: Lang;
  locale: string;
  currentYear: number;
  copiedState: CopiedState;
  onCopyCitation: (key: string, pub: Publication, format: CitationFormat) => void;
}) {
  const isApaCopied = copiedState?.key === pubKey && copiedState.format === 'apa';
  const isBibCopied = copiedState?.key === pubKey && copiedState.format === 'bibtex';
  const isInPress = pub.year > currentYear;

  return (
    <article className="group relative flex flex-col gap-2 rounded-xl border-b border-[var(--app-rule)]/70 px-3 py-4 transition-[opacity,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[var(--app-surface-card)] md:flex-row md:items-baseline md:gap-6 md:px-4 md:group-hover/list:opacity-65 md:hover:!opacity-100">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-3 left-0 top-3 hidden w-[3px] origin-top scale-y-0 rounded-full bg-[var(--app-accent)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100 motion-reduce:transition-none md:block"
      />
      <div className="flex items-center gap-2 md:w-28 md:shrink-0">
        <span className="rounded-full bg-[var(--app-hover)] px-2 py-0.5 font-mono text-xs font-medium text-[var(--app-ink)] [font-variant-numeric:tabular-nums]">
          {pub.year > 0 ? pub.year : '—'}
        </span>
        {isInPress ? (
          <span className="rounded-full bg-[var(--app-accent)]/15 px-1.5 py-0.5 text-[10px] text-[var(--app-accent)]">
            {pubsText.inPress}
          </span>
        ) : null}
        {pub.is_star === '是' ? (
          <span className="text-xs text-[var(--app-accent)]" aria-label={pubsText.corresponding}>
            ★
          </span>
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="font-editorial text-base font-medium leading-snug text-[var(--app-ink)] transition-colors group-hover:text-[var(--app-accent)]">
          {pub.title}
        </h3>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-4 gap-y-0.5 text-xs text-[var(--app-muted)]">
          <span className="font-journal-italic text-sm text-[var(--app-body)]">{pub.journal}</span>
          <span className="font-mono text-[var(--app-ink)]">
            {pub.citations.toLocaleString(locale)} {pubsText.citations}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3 text-xs">
        <button
          type="button"
          onClick={() => onCopyCitation(pubKey, pub, 'apa')}
          className={`transition-colors ${
            isApaCopied
              ? 'font-medium text-[var(--app-accent)]'
              : 'text-[var(--app-muted)] hover:text-[var(--app-ink)]'
          }`}
        >
          {isApaCopied ? (lang === 'zh' ? '✓ 已複製' : `✓ ${pubsText.copiedCitation}`) : pubsText.copyCitation}
        </button>
        <button
          type="button"
          onClick={() => onCopyCitation(pubKey, pub, 'bibtex')}
          className={`font-mono transition-colors ${
            isBibCopied
              ? 'font-medium text-[var(--app-accent)]'
              : 'text-[var(--app-muted)] hover:text-[var(--app-ink)]'
          }`}
        >
          {isBibCopied ? '✓ BibTeX' : 'BibTeX'}
        </button>
        {pub.doi ? (
          <a
            href={pub.doi}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-[var(--app-ink)] underline decoration-[var(--app-rule)] underline-offset-4 transition-colors hover:text-[var(--app-accent)] hover:decoration-[var(--app-accent)]"
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
      className="space-y-4 py-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={pubsText.loadingPublications}
    >
      {[0, 1, 2].map((i) => (
        <div key={i} className={`flex flex-col gap-3 rounded-2xl bg-[var(--app-surface-card)] p-5 ${pulse}`}>
          <div className="h-3.5 w-24 rounded-full bg-[var(--app-hover)]" />
          <div className="h-5 w-[78%] rounded-lg bg-[var(--app-hover)]" />
          <div className="h-4 w-[48%] rounded-lg bg-[var(--app-hover)]/70" />
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
  activeDomainId,
  selectedJournal,
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
  onClearDomainFilter,
  onSelectJournal,
  onViewModeChange,
  onSearchChange,
  onLoadMore,
}: PublicationsSectionProps) {
  useRenderProfiler('PublicationsSection');
  const litePub = Boolean(prefersReducedMotion) || isMobile;
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [copiedState, setCopiedState] = useState<CopiedState>(null);
  const [lightbox, setLightbox] = useState<LightboxState>(null);
  const locale = lang === 'zh' ? 'zh-TW' : 'en-US';
  const currentYear = new Date().getFullYear();
  const activeDomain = getResearchDomainById(activeDomainId);
  const isZh = lang === 'zh';

  const onToggleAbstract = useCallback((key: string) => {
    setExpandedKey((prev) => (prev === key ? null : key));
  }, []);

  const onCopyCitation = useCallback(
    (key: string, pub: Publication, format: CitationFormat) => {
      const citation = format === 'bibtex' ? formatBibTeXString(pub) : formatCitationString(pub);
      if (navigator.clipboard?.writeText) {
        void navigator.clipboard.writeText(citation).then(() => setCopiedState({ key, format }));
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = citation;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setCopiedState({ key, format });
      }
    },
    [],
  );

  useEffect(() => {
    if (!copiedState) return;
    const timer = window.setTimeout(() => setCopiedState(null), 2000);
    return () => window.clearTimeout(timer);
  }, [copiedState]);

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
      className="scroll-mt-16 bg-[var(--app-bg-alt)] py-20 md:py-24"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="pb-4">
          <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
            <h2 className={uiTokens.sectionTitle}>
              {pubsText.title}
              {lang === 'en' ? ' ' : ''}
              {pubsText.subtitle}
            </h2>
            <p className="max-w-md text-sm text-[var(--app-muted)] md:text-right">
              {pubsText.desc}
            </p>
          </div>
        </div>
        <InkRule thick />

        {/* BAND 03 上層：雙互動產出圖表分析室（左 7 欄歷年軌跡 ＋ 右 5 欄 Top 10 核心期刊） */}
        {!isLoading && allPublications.length > 0 ? (
          <div className="my-8 grid grid-cols-1 items-stretch gap-5 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <PublicationTimelineChart
                publications={allPublications}
                selectedFilter={pubFilter}
                lang={lang}
                onSelectYear={onFilterChange}
              />
            </div>
            <div className="lg:col-span-5">
              <TopJournalsChart
                publications={allPublications}
                selectedJournal={selectedJournal}
                lang={lang}
                onSelectJournal={onSelectJournal}
              />
            </div>
          </div>
        ) : null}

        {/* 溫潤圓角檢索工具列 */}
        <div className="atlas-card mb-6 p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label htmlFor="pub-filter-select" className="text-xs text-[var(--app-muted)]">
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
                    className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--app-muted)]"
                    aria-hidden
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="pub-sort-select" className="text-xs text-[var(--app-muted)]">
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
                    className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--app-muted)]"
                    aria-hidden
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={onCorrespondingToggle}
                aria-pressed={correspondingOnly}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  correspondingOnly
                    ? 'border-[var(--app-accent)] bg-[var(--app-accent)] text-white'
                    : 'border-[var(--app-rule)] bg-[var(--app-bg)] text-[var(--app-muted)] hover:border-[var(--app-ink)] hover:text-[var(--app-ink)]'
                }`}
              >
                ★ {pubsText.correspondingOnly}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-0 flex-1 sm:w-64">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--app-muted)]"
                  aria-hidden
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={pubsText.searchPlaceholder}
                  aria-label={pubsText.searchAriaLabel}
                  className="w-full rounded-full border border-[var(--app-rule)] bg-[var(--app-bg)] py-1.5 pl-9 pr-8 text-sm text-[var(--app-ink)] placeholder:text-[var(--app-muted)]/75 focus:border-[var(--app-accent)] focus:outline-none"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => onSearchChange('')}
                    aria-label={pubsText.clearSearch}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-[var(--app-muted)] hover:text-[var(--app-ink)]"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden />
                  </button>
                ) : null}
              </div>

              <div
                role="group"
                aria-label="View mode"
                className="inline-flex rounded-full border border-[var(--app-rule)] bg-[var(--app-bg)] p-0.5 text-xs"
              >
                <button
                  type="button"
                  onClick={() => onViewModeChange('card')}
                  aria-pressed={viewMode === 'card'}
                  className={`rounded-full px-3 py-1 transition-colors ${
                    viewMode === 'card'
                      ? 'bg-[var(--app-ink)] font-semibold text-[var(--app-bg)]'
                      : 'text-[var(--app-muted)] hover:text-[var(--app-ink)]'
                  }`}
                >
                  {pubsText.viewCard}
                </button>
                <button
                  type="button"
                  onClick={() => onViewModeChange('compact')}
                  aria-pressed={viewMode === 'compact'}
                  className={`rounded-full px-3 py-1 transition-colors ${
                    viewMode === 'compact'
                      ? 'bg-[var(--app-ink)] font-semibold text-[var(--app-bg)]'
                      : 'text-[var(--app-muted)] hover:text-[var(--app-ink)]'
                  }`}
                >
                  {pubsText.viewCompact}
                </button>
              </div>

              {!isLoading ? (
                <span
                  className="rounded-full bg-[var(--app-hover)] px-3 py-1 font-mono text-xs text-[var(--app-muted)] [font-variant-numeric:tabular-nums]"
                  aria-live="polite"
                >
                  {pubsText.resultCount.replace('{count}', String(filteredCount))}
                </span>
              ) : null}
            </div>
          </div>

          {/* 領域／期刊即時篩選狀態膠囊 */}
          {activeDomain || selectedJournal ? (
            <div className="mt-3.5 flex flex-wrap items-center gap-2 border-t border-[var(--app-rule)] pt-3 text-xs">
              {activeDomain ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--app-accent)]/40 bg-[var(--app-accent)]/10 px-3 py-1 text-[var(--app-ink)]">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: activeDomain.color }}
                  />
                  <span>
                    {isZh ? '領域：' : 'Area: '}
                    <strong>{isZh ? activeDomain.labelZh : activeDomain.labelEn}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={onClearDomainFilter}
                    aria-label={isZh ? '清除領域篩選' : 'Clear area filter'}
                    className="rounded-full p-0.5 text-[var(--app-muted)] hover:bg-[var(--app-ink)] hover:text-[var(--app-bg)]"
                  >
                    <X className="h-3 w-3" aria-hidden />
                  </button>
                </span>
              ) : null}

              {selectedJournal ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--app-accent)]/40 bg-[var(--app-accent)]/10 px-3 py-1 text-[var(--app-ink)]">
                  <span>
                    {isZh ? '期刊：' : 'Journal: '}
                    <strong className="font-journal-italic">{selectedJournal}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectJournal(null)}
                    aria-label={isZh ? '清除期刊篩選' : 'Clear journal filter'}
                    className="rounded-full p-0.5 text-[var(--app-muted)] hover:bg-[var(--app-ink)] hover:text-[var(--app-bg)]"
                  >
                    <X className="h-3 w-3" aria-hidden />
                  </button>
                </span>
              ) : null}
            </div>
          ) : null}

          {isUsingFallback ? (
            <p className="mt-3 rounded-xl border-l-2 border-[var(--app-accent)] bg-[var(--app-bg)] px-3 py-2 text-xs text-[var(--app-accent)]">
              {pubsText.offlineFallbackNote}
            </p>
          ) : null}
        </div>

        {/* 著作目錄列表 */}
        {isLoading ? (
          <PublicationsListSkeleton prefersReducedMotion={prefersReducedMotion} pubsText={pubsText} />
        ) : filteredCount === 0 ? (
          <div
            className="atlas-card py-16 text-center text-sm text-[var(--app-muted)]"
            role="status"
            aria-live="polite"
          >
            {pubsText.emptyPublications}
          </div>
        ) : (
          <LayoutGroup id="publications-figures">
            <div className="group/list space-y-1">
              {showFeaturedStrip
                ? featuredPublications.map((pub, fi) => {
                    const key = getPublicationKey(pub, fi);
                    return (
                      <PublicationJournalRow
                        key={key}
                        pubKey={key}
                        pub={pub}
                        pubsText={pubsText}
                        lang={lang}
                        isMobile={isMobile}
                        litePub={litePub}
                        featuredRank={fi + 1}
                        index={fi}
                        locale={locale}
                        currentYear={currentYear}
                        expandedKey={expandedKey}
                        copiedState={copiedState}
                        onToggleAbstract={onToggleAbstract}
                        onCopyCitation={onCopyCitation}
                        onOpenLightbox={onOpenLightbox}
                      />
                    );
                  })
                : null}

              {listAllInFeatured ? (
                <p className="py-6 text-center text-sm text-[var(--app-muted)]">
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
                          lang={lang}
                          locale={locale}
                          currentYear={currentYear}
                          copiedState={copiedState}
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
                          lang={lang}
                          isMobile={isMobile}
                          litePub={litePub}
                          index={i + featuredPublications.length}
                          locale={locale}
                          currentYear={currentYear}
                          expandedKey={expandedKey}
                          copiedState={copiedState}
                          onToggleAbstract={onToggleAbstract}
                          onCopyCitation={onCopyCitation}
                          onOpenLightbox={onOpenLightbox}
                        />
                      );
                    })
                : null}
            </div>

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
      </div>
    </section>
  );
}

export const PublicationsSection = memo(PublicationsSectionComponent);
