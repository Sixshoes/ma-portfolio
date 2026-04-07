'use client';

import React, { memo, useMemo, useState } from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { useRenderProfiler } from './useRenderProfiler';

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
    const count = isMobile ? 2 : 4;
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      size: ((i * 13) % 4) + 2,
      x: ((i * 17) % 120) - 10,
      y: ((i * 23) % 120) - 10,
      duration: ((i * 7) % 10) + 10,
      delay: (i * 0.25) % 5,
      color: i % 2 === 0 ? 'bg-teal-400' : 'bg-amber-400',
    }));
  }, [isMobile]);

  return (
    <>
      <section className="pt-36 pb-24 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center min-h-[90vh] relative z-10">
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
            className="inline-block border border-amber-500/20 bg-amber-500/5 text-amber-400/90 px-4 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-[0.2em] mb-8"
          >
            {heroText.role}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl md:text-7xl lg:text-8xl leading-[1.05] mb-8 text-white drop-shadow-[0_6px_30px_rgba(8,12,22,0.75)]"
          >
            <span className="font-display font-light text-amber-500/90 tracking-wide inline-block hover:scale-105 transition-transform origin-left">{heroText.title1}</span> <br />
            <span className="font-display font-bold tracking-tight inline-block hover:scale-105 transition-transform origin-left">{heroText.title2}</span> {heroText.title3} <br />
            <span className="font-display font-light text-teal-400/80 inline-block hover:scale-105 transition-transform origin-left">{heroText.title4}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="text-lg text-slate-400/95 max-w-xl leading-relaxed mb-10 font-light"
          >
            {heroText.desc}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="flex space-x-4">
            <motion.a
              whileHover={prefersReducedMotion ? {} : { scale: 1.03, boxShadow: '0 0 18px rgba(251,191,36,0.28)' }}
              whileTap={{ scale: 0.95 }}
              href="#publications"
              className="bg-gradient-to-r from-amber-300 to-amber-400 text-[#080C16] px-8 py-4 rounded-full text-xs font-display font-bold uppercase tracking-[0.2em] transition-all shadow-[0_10px_30px_rgba(251,191,36,0.25)] inline-block border border-amber-200/50"
            >
              {heroText.cta}
            </motion.a>
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.2 }} className="relative aspect-[4/5] w-full max-w-md mx-auto">
          <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/20 to-amber-500/20 rounded-3xl blur-3xl animate-pulse" />
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
            animate={prefersReducedMotion ? { y: 0 } : { y: [0, -6, 0] }}
            transition={prefersReducedMotion ? { duration: 0.2 } : { duration: isMobile ? 10 : 8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
            className="relative w-full h-full bg-[#080C16] rounded-3xl overflow-hidden border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center justify-center"
          >
            <div className="absolute inset-0 opacity-40">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="hex" width="40" height="69.282" patternUnits="userSpaceOnUse" patternTransform="scale(1.5)">
                    <path d="M40 17.32l-20 11.547L0 17.32V-5.774l20-11.547L40-5.774V17.32zm0 46.188l-20 11.548-20-11.548V40.414L20 28.867l20 11.547v23.094z" fill="none" stroke="rgba(20, 184, 166, 0.3)" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#hex)" />
              </svg>
            </div>
            <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-teal-500/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
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
              <div className="absolute inset-0 bg-gradient-to-t from-[#080C16] via-[#080C16]/20 to-transparent pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#080C16] via-transparent to-[#080C16] opacity-50 pointer-events-none" />
            </div>
            <div className="absolute inset-0 z-20 pointer-events-none">
              <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-teal-500/50 rounded-tl-lg" />
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-teal-500/50 rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-teal-500/50 rounded-bl-lg" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-teal-500/50 rounded-br-lg" />
              <motion.div
                animate={prefersReducedMotion ? { opacity: 0.5 } : { top: ['0%', '100%', '0%'] }}
                transition={prefersReducedMotion ? { duration: 0.2 } : { duration: 12, repeat: Infinity, ease: 'linear' }}
                className="hidden md:block absolute left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-teal-400/50 to-transparent"
              />
            </div>
          </motion.div>
          <motion.div animate={prefersReducedMotion ? { rotate: 0 } : { rotate: 360 }} transition={prefersReducedMotion ? { duration: 0.2 } : { duration: 28, repeat: Infinity, ease: 'linear' }} className="absolute -right-6 top-1/4 w-12 h-12 border border-amber-500/30 rounded-full flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
          </motion.div>
          <motion.div animate={prefersReducedMotion ? { rotate: 0 } : { rotate: -360 }} transition={prefersReducedMotion ? { duration: 0.2 } : { duration: 24, repeat: Infinity, ease: 'linear' }} className="absolute -left-6 bottom-1/4 w-16 h-16 border border-teal-500/30 rounded-full flex items-center justify-center">
            <div className="w-1 h-1 bg-teal-400 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      <section className="border-y border-white/[0.05] bg-white/[0.01] py-16 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12 text-center">
          {[{ label: statsText.pubs, value: totalPubs }, { label: statsText.citations, value: totalCitations }, { label: statsText.exp, value: statsText.expValue }].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}>
              <div className="font-display font-light text-3xl md:text-5xl text-white mb-2">{stat.value}</div>
              <div className="text-[10px] uppercase tracking-[0.2em] font-mono text-amber-400/80">{stat.label}</div>
            </motion.div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <p className="text-xs font-mono text-slate-500/80">{statsText.scopusNote}</p>
        </div>
      </section>

      <section id="research" className="py-24 md:py-32 px-6 max-w-7xl mx-auto relative">
        <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[800px] h-[300px] md:h-[800px] bg-teal-500/5 rounded-full blur-[80px] md:blur-[120px] pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-20 relative z-10">
          <h2 className="text-4xl md:text-7xl text-white">
            <span className="font-display font-light text-amber-500/90 tracking-wide">{researchText.title}</span> <br />
            <span className="font-display font-bold tracking-tight">{researchText.subtitle}</span>
          </h2>
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-teal-400/80 mt-6 md:mt-0 border border-teal-500/20 px-4 py-2 rounded-full bg-teal-500/5">
            {researchText.desc}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {researchText.items.map((item, i) => (
            <motion.div
              key={i}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 30, scale: 0.95 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.215, 0.61, 0.355, 1] }}
              whileHover={prefersReducedMotion ? {} : { y: -6, scale: 1.01 }}
              className="bg-gradient-to-b from-[#0C1324]/95 to-[#0A1120]/95 backdrop-blur-md border border-white/[0.08] p-10 rounded-3xl hover:border-amber-500/35 hover:bg-[#101a31] transition-all duration-500 group relative overflow-hidden shadow-[0_12px_36px_rgba(0,0,0,0.28)] hover:shadow-[0_20px_50px_rgba(251,191,36,0.12)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/[0.02] rounded-xl flex items-center justify-center mb-8 group-hover:bg-amber-500/10 group-hover:text-amber-400 transition-colors duration-500 border border-white/[0.05] group-hover:border-amber-500/20 group-hover:rotate-6">
                  <item.icon className="w-6 h-6 stroke-1" />
                </div>
                <h3 className="font-display text-2xl font-medium text-white mb-4 group-hover:text-amber-400 transition-colors">{item.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400 group-hover:text-slate-300 transition-colors font-light">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}

export const HeroStatsResearchSection = memo(HeroStatsResearchSectionComponent);
