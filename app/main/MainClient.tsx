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
      <section className="mx-auto max-w-7xl px-6 py-16 text-sm text-[#5A6775]">
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
    <main className="relative min-h-screen overflow-x-hidden bg-[#F6F7F8] font-sans text-[#2B3642]">
      <Navbar navText={t.nav} />

      <div>
        <HeroStatsResearchSection
          heroText={t.hero}
          statsText={t.stats}
          researchText={t.research}
          lang={lang}
          totalPubs={totalPubs}
          totalCitations={totalCitations}
          hIndexValue={hIndexValue}
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

        <BottomSections t={t} lang={lang} onDownloadVCard={handleDownloadVCard} />
      </div>
    </main>
  );
}
