'use client';

import React, { useCallback } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'motion/react';
import { useLanguage } from '../LanguageContext';
import { dict } from '@/lib/i18n';
import { vcardData } from '@/lib/impactData';
import type { Publication } from '@/lib/publications';
import { Navbar } from '@/app/components/Navbar';
import { ErrorBoundary } from '@/app/components/ErrorBoundary';
import { HeroStatsResearchSection } from './sections/HeroStatsResearchSection';
import { useRenderProfiler } from './sections/useRenderProfiler';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLiteVisuals } from '@/hooks/use-lite-visuals';
import { usePublications } from '@/hooks/usePublications';

const PublicationsSection = dynamic(
  () => import('./sections/PublicationsSection').then((mod) => mod.PublicationsSection),
  {
    loading: () => (
      <section className="mx-auto max-w-7xl px-6 py-16 text-sm text-stone-400">
        Loading publications...
      </section>
    ),
  },
);
const AboutSection = dynamic(
  () => import('./sections/AboutSection').then((mod) => mod.AboutSection),
);
const BottomSections = dynamic(
  () => import('./sections/BottomSections').then((mod) => mod.BottomSections),
);

type MainClientProps = {
  initialPublications?: Publication[] | null;
};

export function MainClient({ initialPublications = null }: MainClientProps) {
  useRenderProfiler('MainPage');
  const { lang } = useLanguage();
  const isMobile = useIsMobile();
  const liteVisuals = useLiteVisuals();
  const mainLite = isMobile || liteVisuals;
  const t = dict[lang];

  const {
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
    filteredPublications,
    publicationsRows,
    totalPubs,
    totalCitations,
    hIndexValue,
    handlePubFilterChange,
    handlePubSortChange,
    handleCorrespondingToggle,
    handleViewModeChange,
    handleSearchChange,
    handleLoadMore,
  } = usePublications(isMobile, initialPublications);

  const handleDownloadVCard = useCallback(() => {
    const blob = new Blob([vcardData], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Yuan-Ron_Ma.vcf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[var(--app-bg)] bg-[radial-gradient(ellipse_120%_80%_at_50%_-18%,rgba(196,167,125,0.06),transparent_52%),radial-gradient(circle_at_88%_12%,rgba(212,175,55,0.05),transparent_45%)] font-sans text-stone-300">
      {/* Dynamic Animated Background — unified warm charcoal-gold tint */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {mainLite ? (
          <>
            <div className="absolute -left-[10%] -top-[20%] h-[70vw] w-[70vw] rounded-full bg-gradient-to-br from-stone-700/12 to-transparent opacity-60" />
            <div className="absolute -right-[20%] top-[40%] h-[60vw] w-[60vw] rounded-full bg-gradient-to-tl from-[#6b5429]/12 to-transparent opacity-50" />
          </>
        ) : (
          <>
            <motion.div
              style={{ willChange: 'transform, opacity' }}
              animate={{ scale: [1, 1.1, 1], opacity: [0.04, 0.06, 0.04], rotate: [0, 60, 0] }}
              transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
              className="absolute -left-[10%] -top-[20%] h-[70vw] w-[70vw] transform-gpu rounded-full bg-gradient-to-br from-stone-600/14 to-transparent blur-[80px] md:blur-[100px]"
            />
            <motion.div
              style={{ willChange: 'transform, opacity' }}
              animate={{ scale: [1, 1.25, 1], opacity: [0.025, 0.045, 0.025], x: [0, 60, 0], y: [0, -30, 0] }}
              transition={{ duration: 32, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -right-[20%] top-[40%] h-[60vw] w-[60vw] transform-gpu rounded-full bg-gradient-to-tl from-[#6b5429]/16 to-transparent blur-[120px]"
            />
          </>
        )}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.02),transparent_65%)] opacity-[0.2]" />
      </div>

      <Navbar navText={t.nav} isMobile={isMobile} />

      <HeroStatsResearchSection
        heroText={t.hero}
        statsText={t.stats}
        researchText={t.research}
        totalPubs={totalPubs}
        totalCitations={totalCitations}
        hIndexValue={hIndexValue}
        isMobile={isMobile}
        prefersReducedMotion={mainLite}
      />

      <ErrorBoundary>
        <PublicationsSection
          pubsText={t.pubs}
          lang={lang}
          pubFilter={pubFilter}
          pubSort={pubSort}
          correspondingOnly={correspondingOnly}
          viewMode={viewMode}
          searchQuery={searchQuery}
          uniqueYears={uniqueYears}
          isLoading={isLoading}
          isUsingFallback={isUsingFallback}
          featuredPublications={featuredPublications}
          visiblePublications={visiblePublications}
          filteredCount={filteredPublications.length}
          listRowCount={publicationsRows.length}
          listAllInFeatured={
            featuredPublications.length > 0 &&
            filteredPublications.length > 0 &&
            publicationsRows.length === 0
          }
          isMobile={isMobile}
          prefersReducedMotion={mainLite}
          onFilterChange={handlePubFilterChange}
          onSortChange={handlePubSortChange}
          onCorrespondingToggle={handleCorrespondingToggle}
          onViewModeChange={handleViewModeChange}
          onSearchChange={handleSearchChange}
          onLoadMore={handleLoadMore}
        />
      </ErrorBoundary>

      <AboutSection aboutText={t.about} lang={lang} />

      <BottomSections t={t} lang={lang} isMobile={isMobile} onDownloadVCard={handleDownloadVCard} />
    </main>
  );
}
