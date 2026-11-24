'use client';

import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LayoutGroup, motion, useReducedMotion } from 'motion/react';
import {
  ArrowDown,
  Award,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ZoomIn,
} from 'lucide-react';
import {
  EDITORIAL_EASE,
  MaskedTextReveal,
  RollingNumber,
} from '@/app/components/EditorialMotion';
import { DomainDonutChart } from '@/app/components/DomainDonutChart';
import { ChalkboardFallbackGraphic } from '@/app/components/ChalkboardFallbackGraphic';
import { ChalkboardGallerySection } from '@/app/components/ChalkboardGallerySection';
import { ResearchPhysicsGlyph } from '@/app/components/ResearchPhysicsGlyph';
import {
  FigureLightboxModal,
  type FigureLightboxPayload,
} from '@/app/components/FigureLightboxModal';
import type { Publication } from '@/lib/publications';
import type { ChalkboardItem } from '@/lib/chalkboards';
import { computeDomainStats } from '@/lib/researchDomains';
import { getPreferredScrollBehavior } from '@/lib/clientUtils';
import { useRenderProfiler } from './useRenderProfiler';
import { uiTokens } from './uiTokens';

type HeroText = {
  role: string;
  title1: string;
  title2: string;
  title3: string;
  title4: string;
  desc: string;
  cta: string;
};

type StatsText = {
  pubs: string;
  citations: string;
  hIndex: string;
  hIndexValue: string;
  scopusNote: string;
};

type ResearchItem = {
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
};

type ResearchText = {
  title: string;
  subtitle: string;
  desc: string;
  items: ResearchItem[];
};

type HeroStatsResearchSectionProps = {
  heroText: HeroText;
  statsText: StatsText;
  researchText: ResearchText;
  lang: 'en' | 'zh';
  totalPubs: number | string;
  totalCitations: number | string;
  hIndexValue?: number | string;
  allPublications: Publication[];
  chalkboards: ChalkboardItem[];
  activeDomainId: string | null;
  onFilterByDomain: (domainId: string) => void;
  onFilterByKeyword: (keyword: string) => void;
};

function HeroStatsResearchSectionComponent({
  heroText,
  statsText,
  researchText,
  lang,
  totalPubs,
  totalCitations,
  hIndexValue,
  allPublications,
  chalkboards,
  activeDomainId,
  onFilterByDomain,
  onFilterByKeyword,
}: HeroStatsResearchSectionProps) {
  useRenderProfiler('HeroStatsResearchSection');
  const reduceMotion = useReducedMotion();
  const isZh = lang === 'zh';

  const heroChalkboards = useMemo(() => {
    const featured = chalkboards.filter((c) => c.featuredInHero);
    return featured.length > 0 ? featured : chalkboards;
  }, [chalkboards]);

  const [heroSlideIdx, setHeroSlideIdx] = useState(0);
  const [failedHeroIds, setFailedHeroIds] = useState<Record<string, boolean>>({});
  const [hoveredBlueprintIdx, setHoveredBlueprintIdx] = useState<number | null>(null);
  const [lightbox, setLightbox] = useState<FigureLightboxPayload | null>(null);
  const heroBoardImgRef = useRef<HTMLImageElement>(null);

  const safeSlideIdx = heroChalkboards.length > 0 ? heroSlideIdx % heroChalkboards.length : 0;
  const activeHeroBoard = heroChalkboards[safeSlideIdx];
  const activeHeroFailKey = activeHeroBoard
    ? `${activeHeroBoard.id}:${activeHeroBoard.imageUrl}`
    : '';
  const heroBoardImgFailed = activeHeroBoard ? Boolean(failedHeroIds[activeHeroFailKey]) : true;

  // 若圖片於 SSR 水合前已載入失敗，掛載時補檢 naturalWidth === 0 立即切換向量黑板備援
  useEffect(() => {
    const img = heroBoardImgRef.current;
    if (img && img.complete && img.naturalWidth === 0 && activeHeroFailKey) {
      setFailedHeroIds((prev) => (prev[activeHeroFailKey] ? prev : { ...prev, [activeHeroFailKey]: true }));
    }
  }, [activeHeroFailKey]);

  const displayHIndex = hIndexValue ?? statsText.hIndexValue;

  // 動態計算五大領域篇數與總引用數、實際年份區間，以及全站最高被引巔峰代表作
  const domainStats = useMemo(() => computeDomainStats(allPublications), [allPublications]);
  const landmarkPaper = useMemo(() => {
    if (allPublications.length === 0) return null;
    return [...allPublications].sort((a, b) => b.citations - a.citations)[0] ?? null;
  }, [allPublications]);
  const yearRangeLabel = useMemo(() => {
    const validYears = allPublications
      .map((p) => p.year)
      .filter((y) => Number.isFinite(y) && y >= 1900 && y <= 2100);
    if (validYears.length === 0) return '1993–2027';
    return `${Math.min(...validYears)}–${Math.max(...validYears)}`;
  }, [allPublications]);

  const scrollToSection = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: getPreferredScrollBehavior(), block: 'start' });
      window.history.replaceState(null, '', `#${id}`);
    },
    [],
  );

  const closeLightbox = useCallback(() => setLightbox(null), []);

  const openHeroLightbox = useCallback(() => {
    if (!activeHeroBoard || heroBoardImgFailed) return;
    setLightbox({
      layoutId: `hero-board-${activeHeroBoard.id}`,
      src: activeHeroBoard.imageUrl,
      alt: isZh ? activeHeroBoard.titleZh : activeHeroBoard.titleEn,
      title: isZh ? activeHeroBoard.titleZh : activeHeroBoard.titleEn,
      journal: activeHeroBoard.formulaNote || activeHeroBoard.courseOrTopic || 'Chalkboard Derivation',
      year: activeHeroBoard.year ? Number(activeHeroBoard.year) || undefined : undefined,
    });
  }, [activeHeroBoard, heroBoardImgFailed, isZh]);

  const institutionLine = isZh
    ? '佛光大學副校長暨講座教授 · 國立東華大學特聘教授'
    : 'Vice President & Chair Professor, Fo Guang University · Distinguished Professor, NDHU';
  const heroPrimaryName = isZh ? '馬遠榮' : 'Prof. Yuan-Ron Ma';
  const heroLabHeadline = isZh
    ? '先進材料與量子元件實驗室'
    : 'Advanced Materials & Quantum Devices';

  return (
    <LayoutGroup id="hero-chalkboard-gallery">
      {/* BAND 01 · 石灰岩等高線紙底 — 溫潤圓角首屏三區數據圖鑑（黑板實景 ＋ 領域環狀圖 ＋ 巔峰論文） */}
      <section
        id="top"
        className="atlas-contour-bg relative pb-16 pt-28 md:pb-20 md:pt-32"
      >
        <div className="mx-auto max-w-6xl px-6">
          {/* 上方人物名銜與雙圓角行動膠囊 */}
          <div className="mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <motion.span
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.45, ease: EDITORIAL_EASE }}
                className="inline-flex items-center rounded-full border border-[var(--app-rule)] bg-[var(--app-surface-card)]/90 px-4 py-1.5 text-sm font-medium text-[var(--app-muted)] shadow-xs"
              >
                {institutionLine}
              </motion.span>

              <h1 className="font-editorial mt-4 text-[var(--app-ink)]">
                <MaskedTextReveal
                  delay={0.08}
                  duration={0.6}
                  innerClassName="text-4xl font-semibold leading-[1.12] tracking-[-0.02em] sm:text-5xl"
                >
                  {heroPrimaryName}
                  <span className="ml-3 hidden text-2xl font-normal text-[var(--app-muted)] sm:inline">
                    · {heroLabHeadline}
                  </span>
                </MaskedTextReveal>
                <span className="mt-1.5 block text-xl font-medium text-[var(--app-body)] sm:hidden">
                  {heroLabHeadline}
                </span>
              </h1>

              <motion.p
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.5, delay: 0.16, ease: EDITORIAL_EASE }}
                className="mt-3.5 max-w-[35rem] text-pretty text-base leading-[1.85] text-[var(--app-body)] md:text-[1.05rem]"
              >
                {heroText.desc}
              </motion.p>
            </div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.5, delay: 0.22, ease: EDITORIAL_EASE }}
              className="flex shrink-0 flex-wrap items-center gap-3"
            >
              <a
                href="#publications"
                onClick={(e) => scrollToSection(e, 'publications')}
                className={`${uiTokens.buttonPrimary} inline-flex items-center gap-2 px-5 py-2.5 text-base`}
              >
                {heroText.cta}
                <ArrowDown className="h-4 w-4" aria-hidden />
              </a>
              <a
                href="#chalkboards"
                onClick={(e) => scrollToSection(e, 'chalkboards')}
                className={`${uiTokens.buttonOutline} inline-flex items-center px-5 py-2.5 text-base`}
              >
                {isZh ? '黑板手稿藝廊' : 'Chalkboard Gallery'}
              </a>
            </motion.div>
          </div>

          {/* 12 欄三區複合數據圖鑑（平板採滿寬黑板＋雙欄圖卡，桌機採 5/4/3 三欄） */}
          <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 lg:grid-cols-12">
            {/* 左 5 欄：馬副校長真實黑板推導主視覺（零隱藏延遲直繪 LCP，支援多張輪播＋墨綠公式底籤） */}
            <div className="group relative flex min-h-[340px] flex-col overflow-hidden rounded-[26px] border border-[#2C4B3E] bg-[#1B3329] shadow-[0_20px_48px_-24px_rgba(20,38,30,0.45)] md:col-span-2 lg:col-span-5 lg:min-h-[360px]">
              <div
                onClick={openHeroLightbox}
                className={`relative flex-1 overflow-hidden ${
                  heroBoardImgFailed ? '' : 'cursor-zoom-in'
                }`}
              >
                {!activeHeroBoard || heroBoardImgFailed ? (
                  <ChalkboardFallbackGraphic showPortraitHint />
                ) : (
                  <motion.div
                    key={activeHeroBoard.id}
                    layoutId={reduceMotion ? undefined : `hero-board-${activeHeroBoard.id}`}
                    className="h-full w-full"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      ref={heroBoardImgRef}
                      src={activeHeroBoard.imageUrl}
                      alt={isZh ? activeHeroBoard.titleZh : activeHeroBoard.titleEn}
                      width={1024}
                      height={768}
                      fetchPriority="high"
                      decoding="sync"
                      onError={() =>
                        setFailedHeroIds((prev) => ({
                          ...prev,
                          [activeHeroFailKey]: true,
                        }))
                      }
                      className="h-full w-full object-cover object-[76%_36%] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                    />
                  </motion.div>
                )}

                {/* 頂部柔和圓角徽章與放大鈕 */}
                <div className="pointer-events-none absolute inset-x-4 top-4 flex items-center justify-between gap-2">
                  <span className="rounded-full border border-[#F3DF87]/40 bg-[#152820]/85 px-3.5 py-1 font-mono text-xs font-medium tracking-wider text-[#F3DF87] backdrop-blur-sm">
                    {isZh ? '講堂實景推導' : 'LIVE LECTURE CHALKBOARD'}
                  </span>
                  {!heroBoardImgFailed ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openHeroLightbox();
                      }}
                      aria-label={isZh ? '全螢幕檢視黑板原圖' : 'View chalkboard in full screen'}
                      className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full border border-[#F3DF87]/40 bg-[#152820]/85 text-[#F4F1EA] backdrop-blur-sm transition-colors hover:bg-[#F3DF87] hover:text-[#152820]"
                    >
                      <ZoomIn className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  ) : null}
                </div>

                {/* 若後台有多張首頁精選黑板照，顯示柔和圓形左右輪播箭頭 */}
                {heroChalkboards.length > 1 ? (
                  <div className="pointer-events-none absolute inset-x-3 top-1/2 flex -translate-y-1/2 items-center justify-between">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setHeroSlideIdx(
                          (prev) => (prev - 1 + heroChalkboards.length) % heroChalkboards.length,
                        );
                      }}
                      aria-label={isZh ? '上一張黑板手稿' : 'Previous chalkboard'}
                      className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full border border-[#F3DF87]/35 bg-[#152820]/80 text-[#F4F1EA] backdrop-blur-sm transition-colors hover:bg-[#F3DF87] hover:text-[#152820]"
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setHeroSlideIdx((prev) => (prev + 1) % heroChalkboards.length);
                      }}
                      aria-label={isZh ? '下一張黑板手稿' : 'Next chalkboard'}
                      className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full border border-[#F3DF87]/35 bg-[#152820]/80 text-[#F4F1EA] backdrop-blur-sm transition-colors hover:bg-[#F3DF87] hover:text-[#152820]"
                    >
                      <ChevronRight className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                ) : null}
              </div>

              {/* 底部深墨綠圖說籤（手機端自然換行，不裁斷尾端指數 ]⁻¹） */}
              <div className="border-t border-[#2E5243] bg-[#152820]/95 px-5 py-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold leading-snug text-[#F4F1EA]">
                      {activeHeroBoard
                        ? isZh
                          ? activeHeroBoard.titleZh
                          : activeHeroBoard.titleEn
                        : heroPrimaryName}
                    </div>
                    {activeHeroBoard?.formulaNote ? (
                      <div className="mt-1 break-words font-mono text-xs leading-snug text-[#F3DF87] sm:text-sm">
                        {activeHeroBoard.formulaNote}
                      </div>
                    ) : null}
                  </div>
                  {heroChalkboards.length > 1 ? (
                    <span className="shrink-0 rounded-full bg-[#1B3329] px-2.5 py-0.5 font-mono text-xs text-[#BFD3C8]">
                      {safeSlideIdx + 1} / {heroChalkboards.length}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            {/* 中 4 欄：五大領域多色互動環狀圖 ＋ 三大精密跳表總指標 */}
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.55, delay: 0.08, ease: EDITORIAL_EASE }}
              className="atlas-card flex flex-col justify-between p-5 sm:p-6 md:col-span-1 lg:col-span-4"
            >
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-editorial text-lg font-semibold text-[var(--app-ink)]">
                    {isZh ? '研究領域產出分佈' : 'Research Domain Atlas'}
                  </h2>
                  <span className="rounded-full bg-[var(--app-hover)] px-2.5 py-0.5 font-mono text-xs text-[var(--app-muted)]">
                    {yearRangeLabel}
                  </span>
                </div>

                <DomainDonutChart
                  publications={allPublications}
                  lang={lang}
                  activeDomainId={activeDomainId}
                  onSelectDomain={onFilterByDomain}
                />
              </div>

              {/* 底部三大核心指標精密滾動跳表 */}
              <div className="mt-5 border-t border-[var(--app-rule)] pt-4">
                <div className="grid grid-cols-3 divide-x divide-[var(--app-rule)] text-center">
                  {[
                    { label: statsText.pubs, value: totalPubs },
                    { label: statsText.citations, value: totalCitations },
                    { label: statsText.hIndex, value: displayHIndex },
                  ].map((stat, i) => (
                    <div key={stat.label} className="px-1.5">
                      <div className="font-editorial text-2xl font-semibold text-[var(--app-ink)] sm:text-[1.6rem]">
                        <RollingNumber
                          value={stat.value}
                          delay={0.25 + i * 0.06}
                          duration={0.85}
                        />
                      </div>
                      <div className="mt-0.5 text-xs text-[var(--app-muted)]">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* 右 3 欄：琥珀金標題帶「最高被引巔峰代表作櫥窗」（WCAG AAA 深墨字高對比、完整標題不截斷） */}
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.55, delay: 0.14, ease: EDITORIAL_EASE }}
              className="atlas-card flex flex-col overflow-hidden md:col-span-1 lg:col-span-3"
            >
              {/* 暖琥珀金頂部標誌帶（深墨字 #1A1205 對比度 > 7.5:1） */}
              <div className="flex items-center justify-between bg-[#D99B32] px-5 py-3 text-[#1A1205]">
                <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider">
                  <Award className="h-4 w-4" aria-hidden />
                  {isZh ? '最高被引巔峰作' : 'LANDMARK WORK'}
                </span>
                {landmarkPaper?.year ? (
                  <span className="rounded-full bg-[#1A1205]/15 px-2.5 py-0.5 font-mono text-xs font-semibold">
                    {landmarkPaper.year}
                  </span>
                ) : null}
              </div>

              <div className="flex flex-1 flex-col justify-between p-5">
                {landmarkPaper ? (
                  <>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-editorial text-4xl font-bold tracking-tight text-[var(--app-ink)] [font-variant-numeric:tabular-nums]">
                          {landmarkPaper.citations.toLocaleString('en-US')}
                        </span>
                        <span className="font-mono text-sm font-semibold uppercase tracking-wider text-[#8A560B] dark:text-[#F3DF87]">
                          {isZh ? '次引用' : 'CITATIONS'}
                        </span>
                      </div>

                      <h3 className="mt-3.5 font-sans text-base font-semibold leading-[1.48] text-[var(--app-ink)]">
                        {landmarkPaper.title}
                      </h3>

                      <p className="font-journal-italic mt-2.5 text-base text-[var(--app-accent)]">
                        {landmarkPaper.journal}
                      </p>

                      {landmarkPaper.authors ? (
                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--app-muted)]">
                          {landmarkPaper.authors}
                        </p>
                      ) : null}
                    </div>

                    <div className="mt-5 flex flex-col gap-2.5 border-t border-[var(--app-rule)] pt-4">
                      {landmarkPaper.doi ? (
                        <a
                          href={landmarkPaper.doi}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[var(--app-ink)] px-4 py-2.5 text-sm font-medium text-[var(--app-bg)] transition-colors hover:bg-[#D99B32] hover:text-[#1A1205]"
                        >
                          {isZh ? '前往原文 DOI' : 'Read Landmark Paper'}
                          <ExternalLink className="h-4 w-4" aria-hidden />
                        </a>
                      ) : null}
                      <a
                        href="#publications"
                        onClick={(e) => scrollToSection(e, 'publications')}
                        className="inline-flex items-center justify-center gap-1 rounded-full border border-[var(--app-rule)] px-4 py-2 text-sm text-[var(--app-muted)] transition-colors hover:border-[var(--app-ink)] hover:text-[var(--app-ink)]"
                      >
                        {isZh ? `瀏覽完整 ${totalPubs} 篇著作 ↓` : 'Explore full bibliography ↓'}
                      </a>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-1 items-center justify-center text-sm text-[var(--app-muted)]">
                    {isZh ? '載入巔峰代表作中…' : 'Loading landmark metrics...'}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* BAND 02 · 滿版講堂深墨綠黑板橫幅 (#1B3329) — 上半黑板手稿藝廊 ＋ 下半五大粉筆科學藍圖展櫃 */}
      <section
        id="chalkboards"
        className="chalkboard-hall-bg relative scroll-mt-16 border-y border-[#2C4E3F] py-20 text-[#F4F1EA] md:py-24"
      >
        <div className="mx-auto max-w-6xl px-6">
          {/* 上半層：親筆黑板手稿藝廊 */}
          <ChalkboardGallerySection
            chalkboards={chalkboards}
            lang={lang}
            onOpenLightbox={setLightbox}
          />

          {/* 柔和粉筆虛線分隔 */}
          <div
            aria-hidden="true"
            className="mb-14 h-px w-full border-b border-dashed border-[#3B6251]"
          />

          {/* 下半層：五大研究領域粉筆科學藍圖展櫃 */}
          <div id="research" className="scroll-mt-24">
            <div className="mb-8">
              <span className="inline-flex items-center rounded-full border border-[#E88D84]/40 bg-[#152820] px-3.5 py-1 font-mono text-xs font-medium tracking-wider text-[#E88D84]">
                {isZh ? '五大研究藍圖展櫃' : 'FIVE SCIENTIFIC BLUEPRINTS'}
              </span>
              <h2 className="font-editorial mt-3 text-3xl font-semibold tracking-tight text-[#F4F1EA] sm:text-4xl">
                {lang === 'en'
                  ? `${researchText.title} ${researchText.subtitle}`
                  : `${researchText.title}${researchText.subtitle}`}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {domainStats.map(({ domain, count, citations }, i) => {
                const textItem = researchText.items[i];
                const isSelected = activeDomainId === domain.id;
                const isHovered = hoveredBlueprintIdx === i;

                return (
                  <motion.article
                    key={domain.id}
                    initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{
                      duration: reduceMotion ? 0 : 0.48,
                      delay: reduceMotion ? 0 : i * 0.055,
                      ease: EDITORIAL_EASE,
                    }}
                    onMouseEnter={() => setHoveredBlueprintIdx(i)}
                    onMouseLeave={() =>
                      setHoveredBlueprintIdx((prev) => (prev === i ? null : prev))
                    }
                    className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-4 transition-all duration-300 ${
                      i === 4 ? 'sm:col-span-2 lg:col-span-1' : ''
                    } ${
                      isSelected
                        ? 'border-[#F3DF87] bg-[#142920] shadow-[0_14px_34px_-16px_rgba(243,223,135,0.28)]'
                        : 'border-[#2F5243] bg-[#152820]/90 hover:-translate-y-1 hover:border-[#F3DF87]/65 hover:bg-[#142920]'
                    }`}
                  >
                    <div>
                      {/* 頂部礦物五色圓潤徽章與篇數 */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex h-9 w-9 items-center justify-center rounded-xl font-editorial text-sm font-bold shadow-sm ${
                            domain.color === '#C88A2B' ? 'text-[#1A1205]' : 'text-white'
                          }`}
                          style={{ backgroundColor: domain.color }}
                        >
                          {domain.roman}
                        </span>
                        <span className="rounded-full bg-[#1F3A2F] px-2.5 py-0.5 font-mono text-xs text-[#F3DF87] [font-variant-numeric:tabular-nums]">
                          {count} {isZh ? '篇' : 'pubs'}
                        </span>
                      </div>

                      {/* 彈性高度透明粉筆藍圖框（h-auto 避免第 IV/V 張雙行公式壓線溢位，無底色接縫補丁） */}
                      <button
                        type="button"
                        aria-pressed={isSelected}
                        aria-label={
                          isZh
                            ? `依「${textItem?.title ?? domain.labelZh}」篩選論文（${count} 篇）`
                            : `Filter publications by ${textItem?.title ?? domain.labelEn} (${count} works)`
                        }
                        onClick={() => onFilterByDomain(domain.id)}
                        className="my-3 flex h-auto min-h-[192px] w-full cursor-pointer flex-col items-center justify-between gap-2.5 rounded-xl border border-dashed border-[#34594A] bg-transparent px-3 py-3.5 transition-colors group-hover:border-[#F3DF87]/55"
                      >
                        <ResearchPhysicsGlyph
                          index={i}
                          isActive={isHovered || isSelected}
                          variant="blueprint"
                          chalkAccent={domain.chalkColor}
                        />
                        <span
                          className="flex min-h-[2.5rem] items-center justify-center text-center font-mono text-[11.5px] leading-snug tracking-tight"
                          style={{ color: domain.chalkColor }}
                        >
                          {domain.formulaTag}
                        </span>
                      </button>

                      {/* 標題與簡介 */}
                      <h3 className="font-editorial text-lg font-semibold leading-snug text-[#F4F1EA] group-hover:text-[#F3DF87]">
                        {textItem?.title ?? (isZh ? domain.labelZh : domain.labelEn)}
                      </h3>
                      {textItem?.desc ? (
                        <p className="mt-2 line-clamp-4 text-[14px] leading-relaxed text-[#B6D1C6]">
                          {textItem.desc}
                        </p>
                      ) : null}
                    </div>

                    {/* 底部材料關鍵詞圓角膠囊（固定最小高度對齊分隔線）＋ 引用數與篩選鈕 */}
                    <div className="mt-4 space-y-3 border-t border-[#28473A] pt-3">
                      <div className="flex min-h-[3.75rem] flex-wrap content-start gap-1.5">
                        {domain.keywords.slice(0, 3).map((kw) => (
                          <button
                            key={kw.label}
                            type="button"
                            onClick={() => onFilterByKeyword(kw.query)}
                            className="rounded-full border border-[#34594A] bg-[#1B3329] px-2.5 py-0.5 font-mono text-xs text-[#D7E6DF] transition-colors hover:border-[#F3DF87] hover:text-[#F3DF87]"
                          >
                            {kw.label}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-mono text-[#BFD3C8] [font-variant-numeric:tabular-nums]">
                          {citations.toLocaleString('en-US')} {isZh ? '引' : 'cit.'}
                        </span>
                        <button
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => onFilterByDomain(domain.id)}
                          className="inline-flex items-center gap-1 rounded-full bg-[#F3DF87]/15 px-3 py-1 font-medium text-[#F3DF87] transition-colors hover:bg-[#F3DF87] hover:text-[#152820]"
                        >
                          {isZh ? '篩選' : 'Filter'}
                          <ArrowDown className="h-3.5 w-3.5" aria-hidden />
                        </button>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <FigureLightboxModal
        lightbox={lightbox}
        closeLabel={isZh ? '關閉預覽' : 'Close preview'}
        onClose={closeLightbox}
      />
    </LayoutGroup>
  );
}

export const HeroStatsResearchSection = memo(HeroStatsResearchSectionComponent);
