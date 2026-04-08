'use client';

import React, { memo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, Quote, Star } from 'lucide-react';
import { Publication } from '@/lib/publications';
import { useRenderProfiler } from './useRenderProfiler';
import { uiTokens } from './uiTokens';
import { PublicationFigurePlaceholder } from './PublicationFigurePlaceholder';

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
  year: string;
  corresponding: string;
  coauthor: string;
  abstract: string;
  cover: string;
  benchmark: string;
  keyFocus: string;
  general: string;
  quantum: string;
};

type PublicationsSectionProps = {
  pubsText: PublicationsText;
  lang: 'en' | 'zh';
  pubFilter: string;
  uniqueYears: string[];
  showPublications: boolean;
  isLoading: boolean;
  visiblePublications: Publication[];
  filteredCount: number;
  isMobile: boolean;
  prefersReducedMotion: boolean | null;
  onFilterChange: (value: string) => void;
  onLoadMore: () => void;
};

function getLinkDisplay(url: string): string {
  if (!url) return '';
  if (url.includes('doi.org/')) return url.split('doi.org/')[1];
  if (url.includes('scholar.google')) return 'Google Scholar';
  if (url.includes('researchgate.net')) return 'ResearchGate';
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return 'View Article';
  }
}

function getHighlightText(citations: number, pubsText: PublicationsText): string {
  if (citations >= 100) return pubsText.benchmark;
  if (citations >= 50) return pubsText.keyFocus;
  return pubsText.general;
}

function getHighlightBadgeClass(highlight: string, pubsText: PublicationsText): string {
  if (highlight === pubsText.benchmark) {
    return 'border-amber-400/35 bg-amber-500/[0.12] text-amber-200/95';
  }
  if (highlight === pubsText.keyFocus) {
    return 'border-teal-400/35 bg-teal-500/[0.1] text-teal-200/95';
  }
  return 'border-white/[0.1] bg-white/[0.04] text-slate-400';
}

function PublicationsSectionComponent({
  pubsText,
  lang,
  pubFilter,
  uniqueYears,
  showPublications,
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
      className={`relative border-b border-white/[0.06] bg-gradient-to-b from-[#0B101E]/40 to-[#0A0F1C]/40 py-24 md:py-28 ${uiTokens.sectionDivider}`}
    >
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="mb-14 md:mb-16">
          <h2 className={`${uiTokens.sectionTitle} mb-4`}>
            <span className={uiTokens.titleLight}>{pubsText.title}</span> <br />
            <span className={uiTokens.titleBold}>{pubsText.subtitle}</span>
          </h2>
          <p className="text-teal-400/80 font-mono uppercase text-[10px] tracking-[0.2em] mb-8 md:mb-10">{pubsText.desc}</p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-xs font-mono uppercase tracking-widest text-slate-500">
              {pubsText.filterBy}
              <span className="text-slate-600" aria-hidden>
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
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-teal-500/50">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!showPublications || isLoading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-72 md:h-80 flex items-center justify-center"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-amber-500"></div>
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

                return (
                  <motion.div
                    key={i}
                    initial={litePub ? false : { opacity: 0, y: 20 }}
                    whileInView={litePub ? undefined : { opacity: 1, y: 0 }}
                    viewport={litePub ? undefined : { once: true, margin: '-12% 0px -8% 0px' }}
                    transition={{ delay: cardStaggerDelay(i), duration: litePub ? 0 : 0.35 }}
                    whileHover={litePub ? {} : { y: -3, scale: 1.005 }}
                    style={{ transform: 'translateZ(0)' }}
                    className={`flex flex-col lg:flex-row gap-6 md:gap-7 p-5 md:p-6 ${uiTokens.surfaceCard} ${uiTokens.surfaceCardHover} group`}
                  >
                      <div className="w-full lg:w-1/3 flex flex-col gap-3 shrink-0">
                      <div
                        className={`relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] group/img ${uiTokens.pubFigureSurface}`}
                      >
                        {showFigurePlaceholder ? (
                          <PublicationFigurePlaceholder />
                        ) : mainImg ? (
                          <Image
                            src={mainImg}
                            alt={mainLabel || 'Publication Image'}
                            fill
                            priority={!isMobile && i === 0}
                            loading={!isMobile && i === 0 ? 'eager' : 'lazy'}
                            sizes={isMobile ? '100vw' : '(max-width: 1024px) 100vw, 33vw'}
                            className="object-contain p-2 transition-transform duration-500 group-hover/img:scale-[1.02]"
                            referrerPolicy="no-referrer"
                          />
                        ) : null}
                        <div className="absolute left-2 top-2 rounded border border-white/15 bg-[#080C16]/75 px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-slate-200 backdrop-blur-md">
                          {mainLabel}
                        </div>
                      </div>
                      {secondaryImg && (
                        <div
                          className={`group/img relative flex aspect-[3/4] w-1/3 max-w-[120px] items-center justify-center overflow-hidden rounded-xl p-1 shadow-md ${uiTokens.pubFigureSurface}`}
                        >
                          <Image
                            src={secondaryImg}
                            alt={pubsText.cover || 'Journal Cover'}
                            fill
                            loading="lazy"
                            sizes="120px"
                            className="object-contain p-1 transition-transform duration-500 group-hover/img:scale-[1.02]"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute left-1 top-1 rounded border border-white/15 bg-[#080C16]/75 px-1.5 py-0.5 text-[8px] font-mono uppercase tracking-widest text-slate-200 backdrop-blur-md">
                            {pubsText.cover}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="w-full lg:w-2/3 flex flex-col">
                      <div className="flex flex-wrap items-center gap-2.5 mb-5">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-mono ${getHighlightBadgeClass(highlightLabel, pubsText)}`}
                        >
                          {highlightLabel}
                        </span>
                        {pub.is_star === '是' ? (
                          <span className="bg-teal-500/10 border border-teal-500/20 px-3 py-1 rounded-full text-xs font-mono text-teal-300 flex items-center gap-1.5">
                            <Star className="w-3 h-3 fill-teal-400/50" /> {pubsText.corresponding}
                          </span>
                        ) : (
                          <span className="bg-white/[0.02] border border-white/[0.05] px-3 py-1 rounded-full text-xs font-mono text-slate-400">
                            {pubsText.coauthor}
                          </span>
                        )}
                        <span className="bg-white/[0.02] border border-white/[0.05] px-3 py-1 rounded-full text-xs font-mono text-slate-300">
                          {pubsText.year}: {pub.year}
                        </span>
                      </div>

                      <h3 className="font-display text-xl md:text-2xl text-slate-100 mb-5 group-hover:text-amber-300 transition-colors leading-snug">
                        {pub.title}
                      </h3>

                      <div className="flex flex-col gap-3 mt-auto pt-5 border-t border-white/[0.05]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1.5">{pubsText.journal}</div>
                            <div className="text-sm text-slate-300 font-medium">{pub.journal}</div>
                          </div>
                          <div>
                            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1.5">{pubsText.citations}</div>
                            <div className="text-sm text-slate-300 flex items-center gap-2 font-mono">
                              <Quote className="w-3 h-3 text-teal-500/50" /> {pub.citations}
                            </div>
                          </div>
                          <div className="md:col-span-2">
                            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-1.5">{pubsText.doi}</div>
                            <a
                              href={pub.doi}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-amber-300 hover:text-amber-200 flex items-center gap-2 break-all transition-colors"
                            >
                              {getLinkDisplay(pub.doi)} <ExternalLink className="w-3 h-3 shrink-0" />
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

        {visiblePublications.length < filteredCount && (
          <div className="mt-12 md:mt-14 flex justify-center">
            <button
              onClick={onLoadMore}
              className={`${uiTokens.buttonGhost} px-8 py-3 rounded-full font-mono text-sm flex items-center gap-2 shadow-[0_8px_25px_rgba(0,0,0,0.25)]`}
            >
              {lang === 'zh' ? '載入更多' : 'Load More'}
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
