'use client';

import React, { memo, useCallback, useMemo, useState } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
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
  const cardSurface = lite ? uiTokens.surfaceCardSolid : uiTokens.surfaceCard;
  const displayHIndex = hIndexValue ?? statsText.hIndexValue;

  const handleCtaClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      const target = document.getElementById('publications');
      if (!target) return;
      e.preventDefault();
      if (lenis && !isMobile) {
        lenis.scrollTo(target, { offset: -76, duration: 0.9 });
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      window.history.replaceState(null, '', '#publications');
    },
    [lenis, isMobile],
  );

  const profileParticles = useMemo(() => {
    const count = isMobile ? 0 : 4;
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      size: ((i * 13) % 4) + 2,
      x: ((i * 17) % 120) - 10,
      y: ((i * 23) % 120) - 10,
      duration: ((i * 7) % 10) + 10,
      delay: (i * 0.25) % 5,
      color: i % 2 === 0 ? 'bg-stone-400' : 'bg-[#c4a77d]',
    }));
  }, [isMobile]);

  const titleLine2 = (
    <>
      <span className="inline-block origin-left font-semibold tracking-tight text-stone-50">
        {heroText.title2}
      </span>
      {heroText.title3 ? <span className="font-normal text-stone-200"> {heroText.title3}</span> : null}
    </>
  );

  return (
    <>
      <section className="relative z-10 mx-auto min-h-[84vh] max-w-7xl overflow-hidden px-6 pb-20 pt-32 md:pb-28 md:pt-40">
        <HeroLatticeBackground isMobile={isMobile} prefersReducedMotion={prefersReducedMotion} />
        <div className="relative z-10 grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-16">
          {lite ? (
            <div className="relative z-10">
              <div className="mb-6 inline-block rounded-full border border-[#c4a77d]/35 bg-stone-900/70 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.18em] text-[#e8dcc4]">
                {heroText.role}
              </div>
              <h1 className="font-heading-serif mb-7 text-4xl leading-[1.12] text-stone-100 drop-shadow-[0_4px_24px_rgba(0,0,0,0.35)] md:text-6xl lg:text-7xl">
                <span className="inline-block origin-left font-normal tracking-wide text-[#d4af37]">
                  {heroText.title1}
                </span>
                <br />
                {titleLine2}
                <br />
                <span className="inline-block origin-left font-normal tracking-wide text-stone-300">
                  {heroText.title4}
                </span>
              </h1>
              <p className="mb-8 max-w-xl text-base font-light leading-relaxed text-stone-300 md:text-lg">
                {heroText.desc}
              </p>
              <div className="flex space-x-4 pt-1">
                <a
                  href="#publications"
                  onClick={handleCtaClick}
                  className={`${uiTokens.buttonPrimaryStrong} inline-block rounded-full px-7 py-3.5 font-display text-xs font-bold uppercase tracking-[0.18em] transition-all`}
                >
                  {heroText.cta}
                </a>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.75 }}
              className="relative z-10"
            >
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mb-6 inline-block rounded-full border border-[#c4a77d]/35 bg-stone-900/70 px-4 py-1.5 font-mono text-xs uppercase tracking-[0.18em] text-[#e8dcc4]"
              >
                {heroText.role}
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="font-heading-serif mb-7 text-4xl leading-[1.12] text-stone-100 drop-shadow-[0_4px_24px_rgba(0,0,0,0.35)] md:text-6xl lg:text-7xl"
              >
                <span className="inline-block origin-left font-normal tracking-wide text-[#d4af37] transition-transform hover:scale-[1.02]">
                  {heroText.title1}
                </span>
                <br />
                {titleLine2}
                <br />
                <span className="inline-block origin-left font-normal tracking-wide text-stone-300 transition-transform hover:scale-[1.02]">
                  {heroText.title4}
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45, duration: 0.8 }}
                className="mb-8 max-w-xl text-base font-light leading-relaxed text-stone-300 md:text-lg"
              >
                {heroText.desc}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex space-x-4 pt-1"
              >
                <motion.a
                  whileHover={prefersReducedMotion ? {} : { scale: 1.02, boxShadow: '0 0 20px rgba(212,175,55,0.22)' }}
                  whileTap={{ scale: 0.96 }}
                  href="#publications"
                  onClick={handleCtaClick}
                  className={`${uiTokens.buttonPrimaryStrong} inline-block rounded-full px-7 py-3.5 font-display text-xs font-bold uppercase tracking-[0.18em] transition-all`}
                >
                  {heroText.cta}
                </motion.a>
              </motion.div>
            </motion.div>
          )}

          {lite ? (
            <div className="relative mx-auto aspect-[4/5] w-full max-w-md">
              <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-3xl border border-stone-700/50 bg-[#121110] shadow-[0_8px_32px_rgba(0,0,0,0.45)]">
                <div className="absolute inset-0 z-10 overflow-hidden rounded-3xl">
                  {isImgError ? (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-stone-900 to-[#11100f] font-heading-serif text-4xl font-semibold tracking-widest text-[#c4a77d]/70">
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
                      className={`object-cover object-top transition-opacity duration-700 ${isImgLoaded ? 'opacity-100' : 'opacity-0'}`}
                    />
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#121110] via-[#121110]/20 to-transparent" />
                </div>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.15 }}
              className="relative mx-auto aspect-[4/5] w-full max-w-md"
            >
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-stone-700/15 to-[#6b5429]/20 blur-3xl md:animate-pulse" />
              {!prefersReducedMotion &&
                profileParticles.map((p) => (
                  <motion.div
                    key={`avatar-p-${p.id}`}
                    className={`absolute z-20 rounded-full ${p.color} opacity-40 blur-[1px]`}
                    style={{
                      width: p.size,
                      height: p.size,
                      left: `${p.x}%`,
                      top: `${p.y}%`,
                      willChange: 'transform, opacity',
                    }}
                    animate={{ y: [0, -40, 0], x: [0, Math.sin(p.id) * 30, 0], opacity: [0.2, 0.5, 0.2], scale: [1, 1.2, 1] }}
                    transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
                  />
                ))}
              <motion.div
                animate={prefersReducedMotion || isMobile ? { y: 0 } : { y: [0, -6, 0] }}
                transition={prefersReducedMotion || isMobile ? { duration: 0.2 } : { duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
                className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-3xl border border-stone-700/50 bg-[#121110] shadow-[0_8px_32px_rgba(0,0,0,0.45)]"
              >
                <div className="absolute inset-0 opacity-35">
                  <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="hex" width="40" height="69.282" patternUnits="userSpaceOnUse" patternTransform="scale(1.5)">
                        <path
                          d="M40 17.32l-20 11.547L0 17.32V-5.774l20-11.547L40-5.774V17.32zm0 46.188l-20 11.548-20-11.548V40.414L20 28.867l20 11.547v23.094z"
                          fill="none"
                          stroke="rgba(196, 167, 125, 0.2)"
                          strokeWidth="1"
                        />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#hex)" />
                  </svg>
                </div>
                <div className="absolute inset-0 z-10 overflow-hidden rounded-3xl">
                  {isImgError ? (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-stone-900 to-[#11100f] font-heading-serif text-5xl font-semibold tracking-widest text-[#c4a77d]/70">
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
                      className={`object-cover object-top transition-all duration-1000 hover:scale-105 ${isImgLoaded ? 'opacity-100' : 'opacity-0'}`}
                    />
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#121110] via-[#121110]/20 to-transparent" />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#121110] via-transparent to-[#121110] opacity-40" />
                </div>
                <div className="pointer-events-none absolute inset-0 z-20">
                  <div className="absolute left-4 top-4 h-8 w-8 rounded-tl-lg border-l-2 border-t-2 border-[#c4a77d]/45" />
                  <div className="absolute right-4 top-4 h-8 w-8 rounded-tr-lg border-r-2 border-t-2 border-[#c4a77d]/45" />
                  <div className="absolute bottom-4 left-4 h-8 w-8 rounded-bl-lg border-b-2 border-l-2 border-[#c4a77d]/45" />
                  <div className="absolute bottom-4 right-4 h-8 w-8 rounded-br-lg border-b-2 border-r-2 border-[#c4a77d]/45" />
                  <motion.div
                    animate={prefersReducedMotion ? { opacity: 0.4 } : { top: ['0%', '100%', '0%'] }}
                    transition={prefersReducedMotion ? { duration: 0.2 } : { duration: 12, repeat: Infinity, ease: 'linear' }}
                    className="absolute left-0 hidden h-px w-full bg-gradient-to-r from-transparent via-[#c4a77d]/35 to-transparent md:block"
                  />
                </div>
              </motion.div>
              <motion.div
                animate={prefersReducedMotion || isMobile ? { rotate: 0 } : { rotate: 360 }}
                transition={prefersReducedMotion || isMobile ? { duration: 0.2 } : { duration: 28, repeat: Infinity, ease: 'linear' }}
                className="absolute -right-6 top-1/4 hidden h-12 w-12 items-center justify-center rounded-full border border-stone-600/45 md:flex"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-[#d4af37]" />
              </motion.div>
              <motion.div
                animate={prefersReducedMotion || isMobile ? { rotate: 0 } : { rotate: -360 }}
                transition={prefersReducedMotion || isMobile ? { duration: 0.2 } : { duration: 24, repeat: Infinity, ease: 'linear' }}
                className="absolute -left-6 bottom-1/4 hidden h-16 w-16 items-center justify-center rounded-full border border-stone-600/40 md:flex"
              >
                <div className="h-1 w-1 rounded-full bg-stone-400" />
              </motion.div>
            </motion.div>
          )}
        </div>
      </section>

      <section className="border-y border-stone-800/70 bg-stone-900/35 py-14 md:py-18 md:backdrop-blur-sm">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 text-center sm:grid-cols-3 md:gap-10">
          {[
            { label: statsText.pubs, value: formatStatValue(totalPubs) },
            { label: statsText.citations, value: formatStatValue(totalCitations) },
            { label: statsText.hIndex, value: formatStatValue(displayHIndex) },
          ].map((stat, i) =>
            lite ? (
              <div key={i}>
                <div className="font-heading-serif mb-2 text-3xl font-light text-stone-50 md:text-5xl">
                  {stat.value}
                </div>
                <div className="font-mono text-xs uppercase tracking-[0.18em] text-stone-300">{stat.label}</div>
              </div>
            ) : (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.45 }}
              >
                <div className="font-heading-serif mb-2 text-3xl font-light text-stone-50 md:text-5xl">
                  {stat.value}
                </div>
                <div className="font-mono text-xs uppercase tracking-[0.18em] text-stone-300">{stat.label}</div>
              </motion.div>
            ),
          )}
        </div>
        <div className="mt-7 text-center">
          <p className="font-mono text-xs text-stone-400">{statsText.scopusNote}</p>
        </div>
      </section>

      <section id="research" className="relative mx-auto max-w-7xl scroll-mt-24 px-6 py-24 md:py-32">
        <div className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#c4a77d]/[0.04] blur-[80px] md:block md:h-[700px] md:w-[700px] md:blur-[120px]" />
        <div className="relative z-10 mb-10 flex flex-col items-start justify-between md:mb-16 md:flex-row md:items-end">
          <h2 className={uiTokens.sectionTitle}>
            <span className={uiTokens.titleLight}>{researchText.title}</span> <br />
            <span className={uiTokens.titleBold}>{researchText.subtitle}</span>
          </h2>
          <div className={`${uiTokens.sectionEyebrow} mt-6 md:mt-0`}>{researchText.desc}</div>
        </div>
        {/* 6 欄平衡網格：前 3 張各佔 2 欄、後 2 張各佔 3 欄，徹底消除 5 張卡片在桌機版的空洞 */}
        <div className="relative z-10 grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-6">
          {researchText.items.map((item, i) => {
            const spanClass =
              researchText.items.length === 5
                ? i < 3
                  ? 'lg:col-span-2'
                  : i === 4
                    ? 'md:col-span-2 lg:col-span-3'
                    : 'lg:col-span-3'
                : 'lg:col-span-2';

            return lite ? (
              <div
                key={i}
                className={`${spanClass} ${cardSurface} ${uiTokens.surfaceCardHover} group relative overflow-hidden p-8 md:p-9`}
              >
                <div className="relative z-10">
                  <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-xl border border-stone-700/60 bg-stone-900/70 text-[#d4af37]">
                    <item.icon className="h-6 w-6 stroke-[1.5]" />
                  </div>
                  <h3 className="font-heading-serif mb-3 text-2xl font-medium text-stone-100">{item.title}</h3>
                  <p className="text-sm font-light leading-relaxed text-stone-300">{item.desc}</p>
                </div>
              </div>
            ) : (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.07, ease: [0.215, 0.61, 0.355, 1] }}
                whileHover={{ y: -4 }}
                className={`${spanClass} ${uiTokens.surfaceCard} ${uiTokens.surfaceCardHover} group relative overflow-hidden p-8 md:p-9`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-stone-800/0 to-[#4a3b24]/0 opacity-0 transition-opacity duration-500 group-hover:from-stone-800/25 group-hover:to-[#4a3b24]/25 group-hover:opacity-100" />
                <div className="relative z-10">
                  <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-xl border border-stone-700/60 bg-stone-900/70 text-[#c4a77d] transition-all duration-300 group-hover:rotate-3 group-hover:border-[#d4af37]/45 group-hover:bg-[#2a241c]/70 group-hover:text-[#e8dcc4]">
                    <item.icon className="h-6 w-6 stroke-[1.5]" />
                  </div>
                  <h3 className="font-heading-serif mb-3 text-2xl font-medium text-stone-100 transition-colors group-hover:text-[#e8dcc4]">
                    {item.title}
                  </h3>
                  <p className="text-sm font-light leading-relaxed text-stone-300 transition-colors group-hover:text-stone-200">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </>
  );
}

export const HeroStatsResearchSection = memo(HeroStatsResearchSectionComponent);
