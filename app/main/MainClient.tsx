'use client';

import React, { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useLanguage } from '../LanguageContext';
import { dict } from '@/lib/i18n';
import { vcardData } from '@/lib/impactData';
import type { Publication } from '@/lib/publications';
import { DEFAULT_CHALKBOARDS, type ChalkboardItem } from '@/lib/chalkboards';
import { Navbar } from '@/app/components/Navbar';
import { CommandPalette } from '@/app/components/CommandPalette';
import { ErrorBoundary } from '@/app/components/ErrorBoundary';
import { HeroStatsResearchSection } from './sections/HeroStatsResearchSection';
import { useRenderProfiler } from './sections/useRenderProfiler';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLiteVisuals } from '@/hooks/use-lite-visuals';
import { usePublications } from '@/hooks/usePublications';
import { getPreferredScrollBehavior, isAnyModalOpen } from '@/lib/clientUtils';

const PublicationsSection = dynamic(
  () => import('./sections/PublicationsSection').then((mod) => mod.PublicationsSection),
  {
    loading: () => (
      <section className="mx-auto max-w-6xl px-6 py-16 text-sm text-[var(--app-muted)]">
        載入著作目錄中… / Loading publications…
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
  initialChalkboards?: ChalkboardItem[] | null;
  serverYear?: number;
};

export function MainClient({
  initialPublications = null,
  initialChalkboards = null,
  serverYear = 2026,
}: MainClientProps) {
  useRenderProfiler('MainPage');
  const { lang } = useLanguage();
  const isMobile = useIsMobile();
  const liteVisuals = useLiteVisuals();
  const mainLite = isMobile || liteVisuals;
  const t = dict[lang];

  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [filterJumpSeq, setFilterJumpSeq] = useState(0);
  const chalkboards =
    initialChalkboards && initialChalkboards.length > 0
      ? initialChalkboards
      : DEFAULT_CHALKBOARDS;

  const {
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
    filteredPublications,
    publicationsRows,
    totalPubs,
    totalCitations,
    hIndexValue,
    handlePubFilterChange,
    handlePubSortChange,
    handleCorrespondingToggle,
    handleDomainFilterChange,
    handleJournalFilterChange,
    handleKeywordQuickFilter,
    handleResetAllFilters,
    handleViewModeChange,
    handleSearchChange,
    handleLoadMore,
  } = usePublications(isMobile, initialPublications);

  // 全域監聽 ⌘K / Ctrl+K 快捷喚出學術檢索窗（若已有其他燈箱開啟則不重複疊加）
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsPaletteOpen((prev) => {
          if (prev) return false;
          if (isAnyModalOpen()) return false;
          return true;
        });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const scrollToElement = useCallback((id: string, hashOverride?: string) => {
    const performScroll = () => {
      const target = document.getElementById(id);
      if (!target) return false;
      target.scrollIntoView({ behavior: getPreferredScrollBehavior(), block: 'start' });
      const nextHash = hashOverride ?? id;
      if (nextHash) {
        window.history.replaceState(null, '', `#${nextHash}`);
      }
      return true;
    };

    // 以雙重 rAF 等候彈窗解除 body 捲動鎖定與篩選重排後再捲動；若動態區塊尚未掛載則於 140ms 後補試一次
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (!performScroll()) {
          window.setTimeout(performScroll, 140);
        }
      });
    });
  }, []);

  /** 所有由外部圖表／領域／關鍵字／⌘K 觸發的篩選跳轉，直接定位至「論文篩選結果清單」而非上方長條圖 */
  const scrollToPublicationsList = useCallback(() => {
    setFilterJumpSeq((seq) => seq + 1);
    scrollToElement('publications-list', 'publications');
  }, [scrollToElement]);

  const scrollToPublicationsCharts = useCallback(() => {
    scrollToElement('publications', 'publications');
  }, [scrollToElement]);

  const handleResearchDomainSelect = useCallback(
    (domainId: string) => {
      handleDomainFilterChange(domainId);
      scrollToPublicationsList();
    },
    [handleDomainFilterChange, scrollToPublicationsList],
  );

  const handleResearchKeywordSelect = useCallback(
    (keyword: string) => {
      handleKeywordQuickFilter(keyword);
      scrollToPublicationsList();
    },
    [handleKeywordQuickFilter, scrollToPublicationsList],
  );

  const handleClearDomainFilter = useCallback(() => {
    handleDomainFilterChange(null);
  }, [handleDomainFilterChange]);

  const handlePaletteSelectPublication = useCallback(
    (pub: Publication) => {
      handleKeywordQuickFilter(pub.title.slice(0, 60));
      scrollToPublicationsList();
    },
    [handleKeywordQuickFilter, scrollToPublicationsList],
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
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[var(--app-bg)] font-sans text-[var(--app-body)]">
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

      <main>
        <HeroStatsResearchSection
          heroText={t.hero}
          statsText={t.stats}
          researchText={t.research}
          lang={lang}
          totalPubs={totalPubs}
          totalCitations={totalCitations}
          hIndexValue={hIndexValue}
          allPublications={allPublications}
          chalkboards={chalkboards}
          activeDomainId={activeDomainId}
          onFilterByDomain={handleResearchDomainSelect}
          onFilterByKeyword={handleResearchKeywordSelect}
        />

        <ErrorBoundary>
          <PublicationsSection
            pubsText={t.pubs}
            lang={lang}
            serverYear={serverYear}
            allPublications={allPublications}
            pubFilter={pubFilter}
            pubSort={pubSort}
            correspondingOnly={correspondingOnly}
            activeDomainId={activeDomainId}
            selectedJournal={selectedJournal}
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
            filterJumpSeq={filterJumpSeq}
            onFilterChange={handlePubFilterChange}
            onSortChange={handlePubSortChange}
            onCorrespondingToggle={handleCorrespondingToggle}
            onClearDomainFilter={handleClearDomainFilter}
            onSelectJournal={handleJournalFilterChange}
            onResetAllFilters={handleResetAllFilters}
            onJumpToList={scrollToPublicationsList}
            onJumpToCharts={scrollToPublicationsCharts}
            onViewModeChange={handleViewModeChange}
            onSearchChange={handleSearchChange}
            onLoadMore={handleLoadMore}
          />
        </ErrorBoundary>

        <AboutSection aboutText={t.about} lang={lang} />

        <BottomSections
          t={t}
          lang={lang}
          serverYear={serverYear}
          hIndexValue={hIndexValue}
          onDownloadVCard={handleDownloadVCard}
        />
      </main>
    </div>
  );
}
