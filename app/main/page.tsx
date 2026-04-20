'use client';

import React, { useCallback } from 'react';
import dynamic from 'next/dynamic';
import { motion, useReducedMotion } from 'motion/react';
import { useLanguage } from '../LanguageContext';
import { dict } from '@/lib/i18n';
import { vcardData } from '@/lib/impactData';
import { Navbar } from '@/app/components/Navbar';
import { ErrorBoundary } from '@/app/components/ErrorBoundary';
import { HeroStatsResearchSection } from './sections/HeroStatsResearchSection';
import { useRenderProfiler } from './sections/useRenderProfiler';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLowPowerMode } from '@/hooks/use-low-power-mode';
import { usePublications } from '@/hooks/usePublications';

const PublicationsSection = dynamic(
  () => import('./sections/PublicationsSection').then((mod) => mod.PublicationsSection),
  {
    loading: () => <section className="mx-auto max-w-7xl px-6 py-16 text-sm text-stone-500">Loading publications...</section>,
  }
);
const AboutSection = dynamic(
  () => import('./sections/AboutSection').then((mod) => mod.AboutSection)
);
const BottomSections = dynamic(
  () => import('./sections/BottomSections').then((mod) => mod.BottomSections)
);

export default function HomePage() {
  useRenderProfiler('MainPage');
  const { lang } = useLanguage();
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  const isLowPowerMode = useLowPowerMode();
  const noMotion = prefersReducedMotion === true || isLowPowerMode;
  const t = dict[lang];

  const {
    pubFilter,
    uniqueYears,
    isLoading,
    featuredPublications,
    visiblePublications,
    filteredPublications,
    publicationsRows,
    totalPubs,
    totalCitations,
    handlePubFilterChange,
    handleLoadMore,
  } = usePublications(isMobile);

  const handleDownloadVCard = useCallback(() => {
    const blob = new Blob([vcardData], { type: 'text/vcard' });
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
    <main className="relative min-h-screen overflow-x-hidden bg-[var(--app-bg)] bg-[radial-gradient(ellipse_120%_80%_at_50%_-18%,rgba(100,116,139,0.07),transparent_52%),radial-gradient(circle_at_88%_12%,rgba(212,175,55,0.055),transparent_45%)] font-sans text-stone-400">
      {/* Dynamic Animated Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          style={{ willChange: 'transform, opacity' }}
          animate={
            noMotion
              ? { opacity: 0.06 }
              : { scale: [1, 1.1, 1], opacity: [0.04, 0.06, 0.04], rotate: [0, 60, 0] }
          }
          transition={
            noMotion ? { duration: 0.2 } : { duration: 28, repeat: Infinity, ease: 'linear' }
          }
          className="absolute -left-[10%] -top-[20%] h-[70vw] w-[70vw] rounded-full bg-gradient-to-br from-slate-700/14 to-transparent blur-[80px] transform-gpu md:blur-[100px]"
        />
        <motion.div
          style={{ willChange: 'transform, opacity' }}
          animate={
            noMotion
              ? { opacity: 0.04 }
              : { scale: [1, 1.25, 1], opacity: [0.025, 0.045, 0.025], x: [0, 60, 0], y: [0, -30, 0] }
          }
          transition={
            noMotion ? { duration: 0.2 } : { duration: 32, repeat: Infinity, ease: 'easeInOut' }
          }
          className="absolute -right-[20%] top-[40%] h-[60vw] w-[60vw] rounded-full bg-gradient-to-tl from-[#5c4a32]/14 to-transparent blur-[120px] transform-gpu"
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.02),transparent_65%)] opacity-[0.22]" />
      </div>

      <Navbar navText={t.nav} />

      <HeroStatsResearchSection
        heroText={t.hero}
        statsText={t.stats}
        researchText={t.research}
        totalPubs={totalPubs}
        totalCitations={totalCitations}
        isMobile={isMobile}
        prefersReducedMotion={noMotion}
      />

      <ErrorBoundary>
        <PublicationsSection
          pubsText={t.pubs}
          lang={lang}
          pubFilter={pubFilter}
          uniqueYears={uniqueYears}
          isLoading={isLoading}
          featuredPublications={featuredPublications}
          visiblePublications={visiblePublications}
          filteredCount={filteredPublications.length}
          listRowCount={publicationsRows.length}
          listAllInFeatured={
            filteredPublications.length > 0 && publicationsRows.length === 0
          }
          isMobile={isMobile}
          prefersReducedMotion={noMotion}
          onFilterChange={handlePubFilterChange}
          onLoadMore={handleLoadMore}
        />
      </ErrorBoundary>

      <AboutSection aboutText={t.about} lang={lang} />

      <BottomSections t={t} lang={lang} onDownloadVCard={handleDownloadVCard} />
    </main>
  );
}
