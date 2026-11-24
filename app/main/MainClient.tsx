'use client';

import React, { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useLanguage } from '../LanguageContext';
import { dict } from '@/lib/i18n';
import { vcardData } from '@/lib/impactData';
import type { Publication } from '@/lib/publications';
import { Navbar } from '@/app/components/Navbar';
import { CommandPalette } from '@/app/components/CommandPalette';
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
      <section className="mx-auto max-w-6xl px-6 py-16 text-sm text-[var(--app-muted)]">
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

  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  const {
    allPublications,
    pubFilter,
    pubSort,
    correspondingOnly,
    activeDomainId,
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
    handleDomainFilterChange,
    handleKeywordQuickFilter,
    handleViewModeChange,
    handleSearchChange,
    handleLoadMore,
  } = usePublications(isMobile, initialPublications);

  // 全域監聽 ⌘K / Ctrl+K 快捷喚出學術檢索窗
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const scrollToElement = useCallback((id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.replaceState(null, '', `#${id}`);
  }, []);

  const handleResearchDomainSelect = useCallback(
    (domainId: string) => {
      handleDomainFilterChange(domainId);
      scrollToElement('publications');
    },
    [handleDomainFilterChange, scrollToElement],
  );

  const handleResearchKeywordSelect = useCallback(
    (keyword: string) => {
      handleKeywordQuickFilter(keyword);
      scrollToElement('publications');
    },
    [handleKeywordQuickFilter, scrollToElement],
  );

  const handleClearDomainFilter = useCallback(() => {
    handleDomainFilterChange(null);
  }, [handleDomainFilterChange]);

  const handlePaletteSelectPublication = useCallback(
    (pub: Publication) => {
      handleKeywordQuickFilter(pub.title.slice(0, 60));
      scrollToElement('publications');
    },
    [handleKeywordQuickFilter, scrollToElement],
  );

  const handleOpenCommandPalette = useCallback(() => {
    setIsPaletteOpen(true);
  }, []);

  const handleCloseCommandPalette = useCallback(() => {
    setIsPaletteOpen(false);
  }, []);

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
    <main className="relative min-h-screen overflow-x-hidden bg-[var(--app-bg)] font-sans text-[var(--app-body)]">
      <Navbar
        navText={t.nav}
        lang={lang}
        onOpenCommandPalette={handleOpenCommandPalette}
      />

      <CommandPalette
        open={isPaletteOpen}
        onClose={handleCloseCommandPalette}
        publications={allPublications}
        navText={t.nav}
        onSelectPublication={handlePaletteSelectPublication}
        onNavigateSection={scrollToElement}
        onDownloadVCard={handleDownloadVCard}
      />

      <div>
        <HeroStatsResearchSection
          heroText={t.hero}
          statsText={t.stats}
          researchText={t.research}
          lang={lang}
          totalPubs={totalPubs}
          totalCitations={totalCitations}
          hIndexValue={hIndexValue}
          allPublications={allPublications}
          activeDomainId={activeDomainId}
          onFilterByDomain={handleResearchDomainSelect}
          onFilterByKeyword={handleResearchKeywordSelect}
        />

        <ErrorBoundary>
          <PublicationsSection
            pubsText={t.pubs}
            lang={lang}
            allPublications={allPublications}
            pubFilter={pubFilter}
            pubSort={pubSort}
            correspondingOnly={correspondingOnly}
            activeDomainId={activeDomainId}
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
            onClearDomainFilter={handleClearDomainFilter}
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
