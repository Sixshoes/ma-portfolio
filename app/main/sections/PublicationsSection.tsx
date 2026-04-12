'use client';

import React, { memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, FolderOpen, Quote, Star } from 'lucide-react';
import { Publication } from '@/lib/publications';
import { useRenderProfiler } from './useRenderProfiler';
import { uiTokens } from './uiTokens';
import { PublicationFigurePlaceholder } from './PublicationFigurePlaceholder';
import { PublicationLazyImage } from './PublicationLazyImage';

type PublicationsText = {
  title: string;
  subtitle: string;
  desc: string;
  filterBy: string;
  filterAll: string;
  filterSelected: string;
  filterYearGroup: string;
  citations: string;
  journal: string;
  doi: string;
  scholar: string;
  link: string;
  year: string;
  corresponding: string;
  coauthor: string;
  abstract: string;
  cover: string;
  benchmark: string;
  keyFocus: string;
  general: string;
  quantum: string;
  researchGate: string;
  linkFallback: string;
  loadMore: string;
  loadingPublications: string;
  emptyPublications: string;
};

type PublicationsSectionProps = {
  pubsText: PublicationsText;
  pubFilter: string;
  uniqueYears: string[];
  isLoading: boolean;
  visiblePublications: Publication[];
  filteredCount: number;
  isMobile: boolean;
  prefersReducedMotion: boolean | null;
  onFilterChange: (value: string) => void;
  onLoadMore: () => void;
};

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
    return 'border-[#9a8260]/40 bg-[#6b5429]/20 text-[#e8dcc4]';
  }
  if (highlight === pubsText.keyFocus) {
    return 'border-stone-600/50 bg-stone-800/40 text-stone-200';
  }
  return 'border-stone-700/50 bg-stone-900/50 text-stone-500';
}

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
      className="flex flex-col gap-6 md:gap-7"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={pubsText.loadingPublications}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`flex flex-col gap-5 rounded-3xl border border-stone-800/50 bg-slate-900/30 p-6 md:flex-row md:gap-8 md:p-8 ${pulse}`}
        >
          <div className="w-full shrink-0 md:w-1/3">
            <div className="aspect-video w-full rounded-xl bg-white/[0.06]" />
          </div>
          <div className="flex flex-1 flex-col gap-4 pt-2 md:pt-0">
            <div className="flex flex-wrap gap-2">
              <div className="h-7 w-24 rounded-full bg-white/[0.06]" />
              <div className="h-7 w-28 rounded-full bg-white/[0.05]" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-[92%] rounded bg-white/[0.07]" />
              <div className="h-4 w-[78%] rounded bg-white/[0.06]" />
              <div className="h-4 w-[64%] rounded bg-white/[0.05]" />
            </div>
            <div className="mt-auto grid gap-4 border-t border-stone-800/50 pt-5 md:grid-cols-2">
              <div className="h-3 w-20 rounded bg-white/[0.06]" />
              <div className="h-3 w-24 rounded bg-white/[0.06]" />
              <div className="h-3 w-full rounded bg-white/[0.05] md:col-span-2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PublicationsSectionComponent({
  pubsText,
  pubFilter,
  uniqueYears,
  isLoading,
  visiblePublications,
  filteredCount,
  isMobile,
  prefersReducedMotion,
  onFilterChange,
  onLoadMore,
}: PublicationsSectionProps) {
  useRenderProfiler('PublicationsSection');
  const litePub = prefersReducedMotion || isMobile;
  const cardStaggerDelay = (i: number) => (litePub ? 0 : Math.min(i, 10) * 0.04);

  return (
    <section
      id="publications"
      className={`relative border-b border-white/[0.05] bg-gradient-to-b from-[#050A18] to-[#050A18] py-28 md:py-32 ${uiTokens.sectionDivider}`}
    >
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="mb-14 md:mb-16">
          <h2 className={`${uiTokens.sectionTitle} mb-4`}>
            <span className={uiTokens.titleLight}>{pubsText.title}</span> <br />
            <span className={uiTokens.titleBold}>{pubsText.subtitle}</span>
          </h2>
          <p
            className={`${uiTokens.sectionDesc} mb-8 md:mb-10 max-w-2xl leading-relaxed text-stone-500 normal-case tracking-normal font-sans text-sm md:text-base`}
          >
            {pubsText.desc}
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <span className={uiTokens.metaMono}>
              {pubsText.filterBy}
              <span className="text-stone-600" aria-hidden>
                :
              </span>
            </span>
            <div className="relative w-full sm:w-auto">
              <select
                value={pubFilter}
                onChange={(e) => onFilterChange(e.target.value)}
                className={`w-full sm:w-auto ${uiTokens.fieldSelect}`}
              >
                <option value="All">{pubsText.filterAll}</option>
                <option value="Selected">{pubsText.filterSelected}</option>
                <optgroup label={pubsText.filterYearGroup}>
                  {uniqueYears.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </optgroup>
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-stone-500">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>
          </div>
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
              <PublicationsListSkeleton
                prefersReducedMotion={prefersReducedMotion}
                pubsText={pubsText}
              />
            </motion.div>
          ) : filteredCount === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col items-center justify-center rounded-3xl border border-stone-800/50 bg-slate-900/30 px-6 py-16 text-center md:py-20"
              role="status"
              aria-live="polite"
            >
              <FolderOpen className="mb-5 h-12 w-12 text-stone-600" aria-hidden />
              <p className="max-w-md text-sm leading-relaxed text-stone-500 md:text-base">
                {pubsText.emptyPublications}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col gap-6 md:gap-7"
            >
              {visiblePublications.map((pub, i) => {
                const highlightLabel = getHighlightText(pub.citations, pubsText);
                const abstractImg = pub.cover_url;
                const journalImg = pub.file_img;
                const hasAbstract = !!abstractImg;
                const hasJournal = !!journalImg;
                const isSameImg = abstractImg === journalImg;

                let mainImg: string | undefined = abstractImg || undefined;
                let mainLabel = pubsText.abstract;
                let secondaryImg = (!isSameImg && hasJournal) ? journalImg : null;

                if (!hasAbstract && hasJournal) {
                  mainImg = journalImg || undefined;
                  mainLabel = pubsText.cover;
                } else if (!hasAbstract && !hasJournal) {
                  mainImg = undefined;
                  mainLabel = pubsText.quantum;
                }

                const showFigurePlaceholder = !mainImg;
                const eagerMainCount = isMobile ? 1 : 2;
                const eagerMain = i < eagerMainCount;

                return (
                  <motion.div
                    key={i}
                    initial={litePub ? false : { opacity: 0, y: 20 }}
                    whileInView={litePub ? undefined : { opacity: 1, y: 0 }}
                    viewport={
                      litePub ? undefined : { once: true, margin: '0px 0px -50px 0px', amount: 'some' }
                    }
                    transition={{ delay: cardStaggerDelay(i), duration: litePub ? 0 : 0.35 }}
                    whileHover={litePub ? {} : { y: -2 }}
                    style={{ transform: 'translateZ(0)' }}
                    className={`group flex flex-col gap-8 p-8 md:flex-row md:gap-10 md:p-10 ${uiTokens.surfaceCard} ${uiTokens.surfaceCardHover}`}
                  >
                      <div className="w-full lg:w-1/3 flex flex-col gap-3 shrink-0">
                      <div
                        className={`group/img relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl p-2 ${uiTokens.pubFigureSurface}`}
                      >
                        {showFigurePlaceholder ? (
                          <PublicationFigurePlaceholder />
                        ) : mainImg ? (
                          <PublicationLazyImage
                            eager={eagerMain}
                            src={mainImg}
                            alt={mainLabel || 'Publication Image'}
                            fill
                            priority={i === 0}
                            sizes={isMobile ? '100vw' : '(max-width: 1024px) 100vw, 33vw'}
                            className="object-contain p-2 transition-transform duration-500 group-hover/img:scale-[1.01]"
                            referrerPolicy="no-referrer"
                            fetchPriority={i === 0 ? 'high' : eagerMain ? 'auto' : 'low'}
                          />
                        ) : null}
                        <div className={`absolute left-2 top-2 px-2 py-1 text-[10px] ${uiTokens.pubBadgeOverlay}`}>
                          {mainLabel}
                        </div>
                      </div>
                      {secondaryImg && (
                        <div
                          className={`group/img relative flex aspect-[3/4] w-1/3 max-w-[120px] items-center justify-center overflow-hidden rounded-xl p-1 ${uiTokens.pubFigureSurface}`}
                        >
                          <PublicationLazyImage
                            eager={false}
                            src={secondaryImg}
                            alt={pubsText.cover || 'Journal Cover'}
                            fill
                            sizes="120px"
                            className="object-contain p-1 transition-transform duration-500 group-hover/img:scale-[1.02]"
                            referrerPolicy="no-referrer"
                            fetchPriority="low"
                          />
                          <div className={`absolute left-1 top-1 px-1.5 py-0.5 text-[8px] ${uiTokens.pubBadgeOverlay}`}>
                            {pubsText.cover}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="w-full lg:w-2/3 flex flex-col">
                      <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-stone-800/50 pb-5">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-mono ${getHighlightBadgeClass(highlightLabel, pubsText)}`}
                        >
                          {highlightLabel}
                        </span>
                        {pub.is_star === '是' ? (
                          <span className="flex items-center gap-1.5 text-xs text-stone-500">
                            <Star className="h-3 w-3 fill-[#b6a178]/35 text-[#b6a178]" aria-hidden />
                            {pubsText.corresponding}
                          </span>
                        ) : (
                          <span className="text-xs text-stone-600">{pubsText.coauthor}</span>
                        )}
                        <span className="font-mono text-xs text-stone-600">
                          {pubsText.year}: {pub.year}
                        </span>
                      </div>

                      <h3 className="font-heading-serif mb-6 text-xl font-semibold leading-snug text-stone-100 transition-colors group-hover:text-[#e8dcc4] md:text-2xl">
                        {pub.title}
                      </h3>

                      <div className="mt-auto flex flex-col gap-3 border-t border-stone-800/50 pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <div className={`${uiTokens.metaMono} mb-1.5`}>{pubsText.journal}</div>
                            <div className="text-sm font-medium text-slate-400">{pub.journal}</div>
                          </div>
                          <div>
                            <div className={`${uiTokens.metaMono} mb-1.5`}>{pubsText.citations}</div>
                            <div className="flex items-center gap-2 font-mono text-sm text-stone-400">
                              <Quote className="h-3 w-3 text-stone-600" aria-hidden /> {pub.citations}
                            </div>
                          </div>
                          <div className="md:col-span-2">
                            <div className={`${uiTokens.metaMono} mb-1.5`}>{pubsText.doi}</div>
                            <a
                              href={pub.doi}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 break-all text-sm text-stone-500 transition-colors hover:text-[#c4a77d]"
                            >
                              {getLinkDisplay(pub.doi, pubsText)}{' '}
                              <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {!isLoading && filteredCount > 0 && visiblePublications.length < filteredCount && (
          <div className="mt-12 md:mt-14 flex justify-center">
            <button
              type="button"
              onClick={onLoadMore}
              className={`${uiTokens.buttonGhost} flex items-center gap-2 rounded-full px-8 py-3 font-mono text-sm shadow-[0_8px_25px_rgba(0,0,0,0.25)]`}
            >
              {pubsText.loadMore}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export const PublicationsSection = memo(PublicationsSectionComponent);
