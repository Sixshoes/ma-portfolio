'use client';

import React, { memo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, Quote, Star } from 'lucide-react';
import { Publication } from '@/lib/publications';
import { useRenderProfiler } from './useRenderProfiler';
import { uiTokens } from './uiTokens';

type PublicationsText = {
  title: string;
  subtitle: string;
  desc: string;
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
  return (
    <section id="publications" className="py-32 bg-gradient-to-b from-[#0B101E]/40 to-[#0A0F1C]/40 border-y border-white/[0.06] relative">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="mb-20">
          <h2 className={`${uiTokens.sectionTitle} mb-4`}>
            <span className={uiTokens.titleLight}>{pubsText.title}</span> <br />
            <span className={uiTokens.titleBold}>{pubsText.subtitle}</span>
          </h2>
          <p className="text-teal-400/80 font-mono uppercase text-[10px] tracking-[0.2em] mb-12">{pubsText.desc}</p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <span className="text-xs font-mono uppercase tracking-widest text-slate-500">Filter by:</span>
            <div className="relative w-full sm:w-auto">
              <select
                value={pubFilter}
                onChange={(e) => onFilterChange(e.target.value)}
                className="w-full sm:w-auto appearance-none bg-[#0B101E]/80 border border-white/[0.1] text-slate-300 px-6 py-3 pr-12 rounded-full text-sm font-mono focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all cursor-pointer backdrop-blur-md"
              >
                <option value="All">All Publications</option>
                <option value="Selected">Selected / Highlighted</option>
                <optgroup label="By Year">
                  {uniqueYears.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </optgroup>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
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
              className="h-96 flex items-center justify-center"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-amber-500"></div>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col gap-8"
            >
              {visiblePublications.map((pub, i) => {
                const abstractImg = pub.cover_url;
                const journalImg = pub.file_img;
                const hasAbstract = !!abstractImg;
                const hasJournal = !!journalImg;
                const isSameImg = abstractImg === journalImg;

                let mainImg = abstractImg;
                let mainLabel = pubsText.abstract;
                let secondaryImg = (!isSameImg && hasJournal) ? journalImg : null;

                if (!hasAbstract && hasJournal) {
                  mainImg = journalImg;
                  mainLabel = pubsText.cover;
                } else if (!hasAbstract && !hasJournal) {
                  mainImg = 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop';
                  mainLabel = pubsText.quantum;
                }

                return (
                  <motion.div
                    key={i}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                    whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={isMobile || prefersReducedMotion ? {} : { y: -3, scale: 1.005 }}
                    style={{ transform: 'translateZ(0)' }}
                    className={`flex flex-col lg:flex-row gap-8 p-6 md:p-8 ${uiTokens.surfaceCard} ${uiTokens.surfaceCardHover} group`}
                  >
                    <div className="w-full lg:w-1/3 flex flex-col gap-4 shrink-0">
                      <div className="relative w-full aspect-video bg-white rounded-xl border border-white/[0.05] p-2 flex items-center justify-center group/img overflow-hidden shadow-inner">
                        <Image
                          src={mainImg}
                          alt={mainLabel || 'Publication Image'}
                          fill
                          priority={i < 1}
                          loading={i < 1 ? 'eager' : 'lazy'}
                          sizes="(max-width: 1024px) 100vw, 33vw"
                          className="object-contain p-2 transition-transform duration-500 group-hover/img:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2 left-2 text-[10px] font-mono uppercase tracking-widest text-slate-800 bg-white/90 px-2 py-1 rounded border border-slate-200 backdrop-blur-md shadow-sm">
                          {mainLabel}
                        </div>
                      </div>
                      {secondaryImg && (
                        <div className="relative w-1/3 max-w-[120px] aspect-[3/4] bg-white rounded-xl border border-white/[0.05] p-1 flex items-center justify-center group/img overflow-hidden shadow-md">
                          <Image
                            src={secondaryImg}
                            alt={pubsText.cover || 'Journal Cover'}
                            fill
                            loading="lazy"
                            sizes="120px"
                            className="object-contain p-1 transition-transform duration-500 group-hover/img:scale-105"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-1 left-1 text-[8px] font-mono uppercase tracking-widest text-slate-800 bg-white/90 px-1.5 py-0.5 rounded border border-slate-200 backdrop-blur-md">
                            {pubsText.cover}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="w-full lg:w-2/3 flex flex-col">
                      <div className="flex flex-wrap items-center gap-3 mb-6">
                        <span className="bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-mono text-amber-300">
                          {getHighlightText(pub.citations, pubsText)}
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

                      <h3 className="font-display text-2xl md:text-3xl text-slate-200 mb-6 group-hover:text-amber-400 transition-colors leading-snug">
                        {pub.title}
                      </h3>

                      <div className="flex flex-col gap-4 mt-auto pt-6 border-t border-white/[0.05]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                              className="text-sm text-amber-400/80 hover:text-amber-400 flex items-center gap-2 break-all transition-colors"
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
          <div className="mt-16 flex justify-center">
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
