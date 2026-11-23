'use client';

import React, { useCallback } from 'react';
import dynamic from 'next/dynamic';
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
      <section className="mx-auto max-w-7xl px-6 py-16 text-sm text-[#8f8980]">
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
    <main className="relative min-h-screen overflow-x-hidden bg-[#080807] font-sans text-[#b8b3aa]">
      {/* 極細底片微粒與極克制頂部暗棚微光（移除廉價大光球） */}
      <div
        aria-hidden
        className="editorial-grain pointer-events-none fixed inset-0 z-0 opacity-[0.028]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[520px] bg-[radial-gradient(ellipse_70%_55%_at_50%_-10%,rgba(200,164,100,0.08),transparent_70%)]"
      />

      <Navbar navText={t.nav} isMobile={isMobile} />

      <div className="relative z-10">
        <HeroStatsResearchSection
          heroText={t.hero}
          statsText={t.stats}
          researchText={t.research}
          lang={lang}
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
            allPublications={allPublications}
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
      </div>
    </main>
  );
}
