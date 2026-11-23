'use client';

import React, { memo, useCallback, useState } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { ArrowDownRight } from 'lucide-react';
import { useLenis } from 'lenis/react';
import { HeroLatticeBackground } from '@/app/components/HeroLatticeBackground';
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
  isMobile: boolean;
  prefersReducedMotion: boolean | null;
};

function formatStatValue(val: number | string): string {
  return typeof val === 'number' ? val.toLocaleString('en-US') : val;
}

function HeroStatsResearchSectionComponent({
  heroText,
  statsText,
  researchText,
  lang,
  totalPubs,
  totalCitations,
  hIndexValue,
  isMobile,
  prefersReducedMotion,
}: HeroStatsResearchSectionProps) {
  useRenderProfiler('HeroStatsResearchSection');
  const [isImgLoaded, setIsImgLoaded] = useState(false);
  const [isImgError, setIsImgError] = useState(false);
  const onImgLoaded = useCallback(() => setIsImgLoaded(true), []);
  const onImgError = useCallback(() => setIsImgError(true), []);
  const lenis = useLenis();
  const lite = Boolean(prefersReducedMotion) || isMobile;
  const displayHIndex = hIndexValue ?? statsText.hIndexValue;

  const scrollToSection = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      if (lenis && !isMobile) {
        lenis.scrollTo(target, { offset: -76, duration: 0.9 });
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      window.history.replaceState(null, '', `#${id}`);
    },
    [lenis, isMobile],
  );

  const secondaryCtaLabel = lang === 'zh' ? '學術歷程' : 'Academic Journey';
  const portraitCaption =
    lang === 'zh'
      ? '馬遠榮 副校長・佛光大學／東華大學特聘教授'
      : 'Prof. Yuan-Ron Ma · FGU Vice President · NDHU Distinguished Professor';

  const heroContent = (
    <div className="relative z-10">
      <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-[#dfd5c4] bg-[#f5efe2] px-4 py-1.5 font-mono text-xs font-medium uppercase tracking-[0.16em] text-[#7f5d1e]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#9a742e]" aria-hidden />
        {heroText.role}
      </div>

      <h1 className="font-heading-serif mb-6 text-4xl leading-[1.08] tracking-tight text-[#141311] sm:text-5xl md:text-6xl lg:text-[4.25rem]">
        <span className="font-normal italic text-[#8a6522]">{heroText.title1}</span>
        <br />
        <span className="font-semibold text-[#141311]">{heroText.title2}</span>
        {heroText.title3 ? (
          <span className="font-normal text-[#3f3b36]"> {heroText.title3}</span>
        ) : null}
        <br />
        <span className="font-normal text-[#57524b]">{heroText.title4}</span>
      </h1>

      <div className="mb-6 h-px w-20 bg-[#9a742e]/60" aria-hidden />

      <p className="mb-8 max-w-xl text-base leading-relaxed text-[#3f3b36] md:text-lg">
        {heroText.desc}
      </p>

      <div className="flex flex-wrap items-center gap-3.5">
        <a
          href="#publications"
          onClick={(e) => scrollToSection(e, 'publications')}
          className={`${uiTokens.buttonPrimaryStrong} inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-display text-xs font-semibold uppercase tracking-[0.16em]`}
        >
          {heroText.cta}
          <ArrowDownRight className="h-4 w-4" aria-hidden />
        </a>
        <a
          href="#about"
          onClick={(e) => scrollToSection(e, 'about')}
          className={`${uiTokens.buttonGhost} inline-flex items-center rounded-full px-6 py-3.5 font-display text-xs font-semibold uppercase tracking-[0.16em]`}
        >
          {secondaryCtaLabel}
        </a>
      </div>
    </div>
  );

  const portraitFrame = (
    <figure className="relative mx-auto w-full max-w-md">
      {/* 畫廊級白卡襯框：乾淨、典雅、零科幻遮罩干擾 */}
      <div className="rounded-3xl border border-[#e2dacd] bg-white p-3.5 shadow-[0_24px_60px_rgba(20,19,17,0.09)] md:p-4">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-[#f3efe7]">
          {isImgError ? (
            <div className="flex h-full w-full items-center justify-center bg-[#f3efe7] font-heading-serif text-5xl font-semibold tracking-widest text-[#8a6522]/70">
              YRM
            </div>
          ) : (
            <Image
              src="/profile.jpg"
              alt="馬遠榮副校長個人照 (Prof. Y.R. Ma)"
              fill
              priority
              sizes="(max-width: 768px) 92vw, 448px"
              onLoad={onImgLoaded}
              onError={onImgError}
              className={`object-cover object-top transition-opacity duration-700 ${
                isImgLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )}
        </div>
        <figcaption className="mt-3.5 flex items-center justify-between gap-3 border-t border-[#efeae0] px-1 pt-3">
          <span className="font-mono text-[11px] leading-snug text-[#57524b]">{portraitCaption}</span>
          <span className="h-2 w-2 shrink-0 rounded-full bg-[#9a742e]" aria-hidden />
        </figcaption>
      </div>
    </figure>
  );

  return (
    <>
      <section className="relative z-10 mx-auto max-w-7xl overflow-hidden px-6 pb-16 pt-28 md:pb-24 md:pt-36">
        <HeroLatticeBackground isMobile={isMobile} prefersReducedMotion={prefersReducedMotion} />
        <div className="relative z-10 grid grid-cols-1 items-center gap-12 md:grid-cols-12 md:gap-10 lg:gap-14">
          <div className="md:col-span-7">
            {lite ? (
              heroContent
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              >
                {heroContent}
              </motion.div>
            )}
          </div>
          <div className="md:col-span-5">
            {lite ? (
              portraitFrame
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
              >
                {portraitFrame}
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* 期刊式量化指標帶（暖羊皮紙襯底 + 細直線分隔） */}
      <section className="border-y border-[#e5dfd5] bg-[#f3efe7] py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 divide-y divide-[#e2dacd] text-center sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {[
              { label: statsText.pubs, value: formatStatValue(totalPubs) },
              { label: statsText.citations, value: formatStatValue(totalCitations) },
              { label: statsText.hIndex, value: formatStatValue(displayHIndex) },
            ].map((stat, i) => (
              <div key={i} className="px-4 py-5 sm:py-2">
                <div className="font-heading-serif mb-1.5 text-4xl font-semibold tracking-tight text-[#141311] md:text-5xl">
                  {stat.value}
                </div>
                <div className="font-mono text-xs font-medium uppercase tracking-[0.18em] text-[#6b655d]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <p className="font-mono text-xs text-[#6b655d]">{statsText.scopusNote}</p>
          </div>
        </div>
      </section>

      {/* 01 / 研究領域 */}
      <section id="research" className="relative mx-auto max-w-7xl scroll-mt-24 px-6 py-20 md:py-28">
        <div className="mb-10 flex flex-col items-start justify-between gap-5 border-b border-[#e5dfd5] pb-8 md:mb-14 md:flex-row md:items-end">
          <div>
            <div className={`${uiTokens.sectionKicker} mb-3`}>01 / RESEARCH AREAS</div>
            <h2 className={uiTokens.sectionTitle}>
              <span className={uiTokens.titleLight}>{researchText.title}</span>{' '}
              <span className={uiTokens.titleBold}>{researchText.subtitle}</span>
            </h2>
          </div>
          <div className={uiTokens.sectionEyebrow}>{researchText.desc}</div>
        </div>

        {/* 6 欄平衡網格：上排 3 卡、下排 2 寬卡 */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-6">
          {researchText.items.map((item, i) => {
            const spanClass =
              researchText.items.length === 5
                ? i < 3
                  ? 'lg:col-span-2'
                  : i === 4
                    ? 'md:col-span-2 lg:col-span-3'
                    : 'lg:col-span-3'
                : 'lg:col-span-2';
            const num = String(i + 1).padStart(2, '0');

            const cardBody = (
              <>
                <div className="mb-6 flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#e6dcc8] bg-[#f7f2e7] text-[#8a6522] transition-colors group-hover:border-[#9a742e] group-hover:bg-[#181614] group-hover:text-[#faf8f4]">
                    <item.icon className="h-5 w-5 stroke-[1.6]" />
                  </div>
                  <span className="font-mono text-xs font-medium tracking-widest text-[#9a9287]">
                    {num}
                  </span>
                </div>
                <h3 className="font-heading-serif mb-2.5 text-2xl font-semibold text-[#141311] transition-colors group-hover:text-[#7f5d1e]">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#57524b]">{item.desc}</p>
              </>
            );

            return lite ? (
              <div
                key={i}
                className={`${spanClass} ${uiTokens.surfaceCardSolid} ${uiTokens.surfaceCardHover} group relative overflow-hidden p-7 md:p-8`}
              >
                {cardBody}
              </div>
            ) : (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 'some' }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                whileHover={{ y: -3 }}
                className={`${spanClass} ${uiTokens.surfaceCard} ${uiTokens.surfaceCardHover} group relative overflow-hidden p-7 md:p-8`}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 bg-[#9a742e] transition-transform duration-300 group-hover:scale-x-100"
                />
                {cardBody}
              </motion.div>
            );
          })}
        </div>
      </section>
    </>
  );
}

export const HeroStatsResearchSection = memo(HeroStatsResearchSectionComponent);
