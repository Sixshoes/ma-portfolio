'use client';

import React, { memo, useMemo, useState } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
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
  exp: string;
  scopusNote: string;
  expValue: string;
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
  isMobile: boolean;
  prefersReducedMotion: boolean | null;
};

function HeroStatsResearchSectionComponent({
  heroText,
  statsText,
  researchText,
  totalPubs,
  totalCitations,
  isMobile,
  prefersReducedMotion,
}: HeroStatsResearchSectionProps) {
  useRenderProfiler('HeroStatsResearchSection');
  const [isImgLoaded, setIsImgLoaded] = useState(false);

  const profileParticles = useMemo(() => {
    const count = isMobile ? 0 : 4;
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      size: ((i * 13) % 4) + 2,
      x: ((i * 17) % 120) - 10,
      y: ((i * 23) % 120) - 10,
      duration: ((i * 7) % 10) + 10,
      delay: (i * 0.25) % 5,
      color: i % 2 === 0 ? 'bg-slate-400' : 'bg-[#c4a77d]',
    }));
  }, [isMobile]);

  return (
    <>
      <section className="pt-32 md:pt-36 pb-20 md:pb-24 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[86vh] relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, staggerChildren: 0.2 }}
          className="relative z-10"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6 inline-block rounded-full border border-stone-600/50 bg-stone-900/50 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[#d4c4a8]"
          >
            {heroText.role}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-heading-serif mb-7 text-4xl leading-[1.08] text-stone-100 drop-shadow-[0_4px_24px_rgba(0,0,0,0.35)] md:text-6xl lg:text-7xl"
          >
            <span className="inline-block origin-left font-normal tracking-wide text-[#c4a77d] transition-transform hover:scale-[1.02]">
              {heroText.title1}
            </span>{' '}
            <br />
            <span className="inline-block origin-left font-semibold tracking-tight text-stone-100 transition-transform hover:scale-[1.02]">
              {heroText.title2}
            </span>{' '}
            {heroText.title3} <br />
            <span className="inline-block origin-left font-normal tracking-wide text-stone-400 transition-transform hover:scale-[1.02]">
              {heroText.title4}
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="mb-8 max-w-xl text-base font-light leading-relaxed text-stone-500 md:text-lg"
          >
            {heroText.desc}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="flex space-x-4 pt-1">
            <motion.a
              whileHover={prefersReducedMotion ? {} : { scale: 1.02, boxShadow: '0 0 20px rgba(196,167,125,0.18)' }}
              whileTap={{ scale: 0.95 }}
              href="#publications"
              className={`${uiTokens.buttonPrimaryStrong} px-7 py-3.5 rounded-full text-xs font-display font-bold uppercase tracking-[0.2em] transition-all inline-block`}
            >
              {heroText.cta}
            </motion.a>
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.2 }} className="relative aspect-[4/5] w-full max-w-md mx-auto">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-slate-600/15 to-[#5c4a32]/20 blur-3xl md:animate-pulse" />
          {!prefersReducedMotion && profileParticles.map((p) => (
            <motion.div
              key={`avatar-p-${p.id}`}
              className={`absolute rounded-full ${p.color} opacity-40 blur-[1px] z-20`}
              style={{ width: p.size, height: p.size, left: `${p.x}%`, top: `${p.y}%`, willChange: 'transform, opacity' }}
              animate={{ y: [0, -40, 0], x: [0, Math.sin(p.id) * 30, 0], opacity: [0.2, 0.5, 0.2], scale: [1, 1.2, 1] }}
              transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
            />
          ))}
          <motion.div
            animate={prefersReducedMotion || isMobile ? { y: 0 } : { y: [0, -6, 0] }}
            transition={prefersReducedMotion || isMobile ? { duration: 0.2 } : { duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
            className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-3xl border border-stone-800/60 bg-slate-950 shadow-[0_8px_32px_rgba(0,0,0,0.45)]"
          >
            <div className="absolute inset-0 opacity-40">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="hex" width="40" height="69.282" patternUnits="userSpaceOnUse" patternTransform="scale(1.5)">
                    <path d="M40 17.32l-20 11.547L0 17.32V-5.774l20-11.547L40-5.774V17.32zm0 46.188l-20 11.548-20-11.548V40.414L20 28.867l20 11.547v23.094z" fill="none" stroke="rgba(148, 163, 184, 0.22)" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#hex)" />
              </svg>
            </div>
            <div className="absolute left-1/4 top-1/4 h-40 w-40 rounded-full bg-slate-600/20 blur-3xl md:animate-pulse" />
            <div
              className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-[#6b5429]/25 blur-3xl md:animate-pulse"
              style={{ animationDelay: '1s' }}
            />
            <div
              className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-700/20 blur-2xl md:animate-pulse"
              style={{ animationDelay: '2s' }}
            />
            <div className="absolute inset-0 z-10 overflow-hidden rounded-3xl">
              <Image
                src="https://sixshoes.github.io/Ma-Research-Portal/profile.jpg"
                alt="馬遠榮副校長個人照 (Prof. Y.R. Ma)"
                fill
                priority
                onLoad={() => setIsImgLoaded(true)}
                className={`object-cover object-top transition-all duration-1000 hover:scale-105 ${isImgLoaded ? 'opacity-100' : 'opacity-0'}`}
                referrerPolicy="no-referrer"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-slate-950 via-transparent to-slate-950 opacity-50" />
            </div>
            <div className="absolute inset-0 z-20 pointer-events-none">
              <div className="absolute left-4 top-4 h-8 w-8 rounded-tl-lg border-l-2 border-t-2 border-stone-600/40" />
              <div className="absolute right-4 top-4 h-8 w-8 rounded-tr-lg border-r-2 border-t-2 border-stone-600/40" />
              <div className="absolute bottom-4 left-4 h-8 w-8 rounded-bl-lg border-b-2 border-l-2 border-stone-600/40" />
              <div className="absolute bottom-4 right-4 h-8 w-8 rounded-br-lg border-b-2 border-r-2 border-stone-600/40" />
              <motion.div
                animate={prefersReducedMotion ? { opacity: 0.5 } : { top: ['0%', '100%', '0%'] }}
                transition={prefersReducedMotion ? { duration: 0.2 } : { duration: 12, repeat: Infinity, ease: 'linear' }}
                className="absolute left-0 hidden h-px w-full bg-gradient-to-r from-transparent via-stone-500/35 to-transparent md:block"
              />
            </div>
          </motion.div>
          <motion.div
            animate={prefersReducedMotion || isMobile ? { rotate: 0 } : { rotate: 360 }}
            transition={prefersReducedMotion || isMobile ? { duration: 0.2 } : { duration: 28, repeat: Infinity, ease: 'linear' }}
            className="absolute -right-6 top-1/4 hidden h-12 w-12 items-center justify-center rounded-full border border-stone-600/40 md:flex"
          >
            <div className="h-1.5 w-1.5 rounded-full bg-[#b08d52]" />
          </motion.div>
          <motion.div
            animate={prefersReducedMotion || isMobile ? { rotate: 0 } : { rotate: -360 }}
            transition={prefersReducedMotion || isMobile ? { duration: 0.2 } : { duration: 24, repeat: Infinity, ease: 'linear' }}
            className="absolute -left-6 bottom-1/4 hidden h-16 w-16 items-center justify-center rounded-full border border-stone-600/35 md:flex"
          >
            <div className="h-1 w-1 rounded-full bg-stone-500" />
          </motion.div>
        </motion.div>
      </section>

      <section className="border-y border-stone-800/50 bg-slate-900/20 py-14 backdrop-blur-sm md:py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-10 text-center">
          {[{ label: statsText.pubs, value: totalPubs }, { label: statsText.citations, value: totalCitations }, { label: statsText.exp, value: statsText.expValue }].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}>
              <div className="font-heading-serif mb-2 text-3xl font-light text-stone-100 md:text-5xl">{stat.value}</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <p className="font-mono text-xs text-stone-600">{statsText.scopusNote}</p>
        </div>
      </section>

      <section id="research" className="py-20 md:py-28 px-6 max-w-7xl mx-auto relative">
        <div className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-700/10 blur-[80px] md:block md:h-[800px] md:w-[800px] md:blur-[120px]" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-16 relative z-10">
          <h2 className={uiTokens.sectionTitle}>
            <span className={uiTokens.titleLight}>{researchText.title}</span> <br />
            <span className={uiTokens.titleBold}>{researchText.subtitle}</span>
          </h2>
          <div className={`${uiTokens.sectionEyebrow} mt-6 md:mt-0`}>
            {researchText.desc}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 relative z-10">
          {researchText.items.map((item, i) => (
            <motion.div
              key={i}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 30, scale: 0.95 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.215, 0.61, 0.355, 1] }}
              whileHover={prefersReducedMotion ? {} : { y: -6, scale: 1.01 }}
              className={`${uiTokens.surfaceCard} ${uiTokens.surfaceCardHover} p-8 md:p-9 group relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-stone-800/0 to-[#3d3428]/0 opacity-0 transition-opacity duration-500 group-hover:from-stone-800/30 group-hover:to-[#3d3428]/20 group-hover:opacity-100" />
              <div className="relative z-10">
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-xl border border-stone-800/60 bg-slate-900/40 text-stone-400 transition-all duration-500 group-hover:border-[#8f7038]/35 group-hover:bg-[#2a241c]/50 group-hover:text-[#d4c4a8] group-hover:rotate-3">
                  <item.icon className="h-6 w-6 stroke-1" />
                </div>
                <h3 className="font-heading-serif mb-4 text-2xl font-medium text-stone-100 transition-colors group-hover:text-[#e8dcc4]">
                  {item.title}
                </h3>
                <p className="text-sm font-light leading-relaxed text-stone-500 transition-colors group-hover:text-stone-400">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}

export const HeroStatsResearchSection = memo(HeroStatsResearchSectionComponent);
