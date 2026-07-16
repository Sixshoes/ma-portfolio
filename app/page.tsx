'use client';

import React, { useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from 'motion/react';
import { useLanguage } from './LanguageContext';
import { LanguageSwitcher } from '@/app/components/LanguageSwitcher';
import { useIsMobile } from '@/hooks/use-mobile';
import { prefetchPapersJson } from '@/lib/papersCache';

const dict = {
  en: {
    name: 'Prof. Yuan-Ron Ma',
    title: 'Academic Portfolio',
    subtitle: 'Advanced Materials & Quantum Devices',
    enter: 'Enter Portfolio',
  },
  zh: {
    name: '馬遠榮 教授',
    title: '學術研究專頁',
    subtitle: '先進材料與量子元件',
    enter: '進入專頁',
  },
};

export default function VisualsPage() {
  const { lang } = useLanguage();
  const t = dict[lang];
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  const noMotion = prefersReducedMotion === true;
  const fullDesktop = !isMobile && !noMotion;

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { damping: 40, stiffness: 50, mass: 1 });
  const springY = useSpring(mouseY, { damping: 40, stiffness: 50, mass: 1 });

  const particles = useMemo(() => {
    if (noMotion) return [];
    const count = fullDesktop ? 26 : 6;
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      size: ((i * 7) % 6) + 1,
      x: (i * 13) % 100,
      y: (i * 17) % 100,
      duration: ((i * 3) % 15) + (fullDesktop ? 10 : 14),
      delay: (i * 0.5) % 2,
      color: i % 2 === 0 ? 'bg-slate-400' : 'bg-[#c4a77d]',
      sinX: Math.sin(i) * (fullDesktop ? 105 : 64),
    }));
  }, [fullDesktop, noMotion]);

  useEffect(() => {
    if (!fullDesktop) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [fullDesktop, mouseX, mouseY]);

  useEffect(() => {
    prefetchPapersJson();
  }, []);

  const orbitOuterDur = fullDesktop ? 38 : 95;
  const orbitMidDur = fullDesktop ? 28 : 78;
  const orbitInnerDur = fullDesktop ? 14 : 52;

  return (
    <main className="relative flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-slate-950 font-sans">
      {fullDesktop && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(2,6,23,0.5)_72%,#020617_100%)]"
          animate={{ opacity: [0.65, 0.9, 0.65] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <div className="absolute right-6 top-6 z-50 md:right-8 md:top-8">
        <LanguageSwitcher layoutId="hetero-landing" />
      </div>

      {/* Plain HTML — avoids iOS WebKit opacity stuck at 0 */}
      <div className="absolute bottom-24 left-1/2 z-50 -translate-x-1/2 md:bottom-16">
        <Link
          href="/main"
          className="group flex items-center gap-2 whitespace-nowrap rounded-full border border-[#9a8260]/45 bg-slate-950/90 px-6 py-2.5 font-display text-[10px] uppercase tracking-[0.1em] text-[#d4c4a8] transition-colors hover:bg-[#c4a77d] hover:text-stone-950 active:scale-[0.98] md:bg-slate-950/50 md:px-8 md:py-3 md:text-sm md:tracking-[0.2em] md:backdrop-blur-md"
        >
          {t.enter}
        </Link>
      </div>

      {noMotion ? (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[60vw] w-[60vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-600/10 md:h-[40vw] md:w-[40vw] md:blur-[100px]" />
      ) : fullDesktop ? (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            className="h-[60vw] w-[60vw] rounded-full bg-slate-600/10 blur-[80px] md:h-[40vw] md:w-[40vw] md:blur-[100px]"
            style={{ x: springX, y: springY }}
          />
        </div>
      ) : (
        <div className="anim-hero-glow pointer-events-none absolute left-1/2 top-1/2 z-0 h-[60vw] w-[60vw] rounded-full bg-slate-600/15 md:h-[40vw] md:w-[40vw]" />
      )}

      <div className="relative z-10 flex items-center justify-center">
        {fullDesktop && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute aspect-square w-[min(92vw,640px)] rounded-full border border-stone-700/25"
            animate={{ scale: [1, 1.04, 1], opacity: [0.12, 0.28, 0.12] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        <div
          className={`absolute h-[300px] w-[300px] rounded-full border border-dashed border-white/[0.05] md:h-[600px] md:w-[600px] ${
            noMotion ? '' : 'anim-hero-spin-cw'
          }`}
          style={noMotion ? undefined : { animationDuration: `${orbitOuterDur}s` }}
        />

        <div
          className={`absolute h-[200px] w-[200px] rounded-full border border-stone-600/30 md:h-[400px] md:w-[400px] ${
            noMotion ? '' : 'anim-hero-spin-ccw'
          }`}
          style={noMotion ? undefined : { animationDuration: `${orbitMidDur}s` }}
        >
          <div className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-400 shadow-[0_0_12px_rgba(148,163,184,0.45)] md:h-3 md:w-3" />
        </div>

        <div
          className={`absolute h-[120px] w-[120px] rounded-full border border-[#8f7038]/35 md:h-[200px] md:w-[200px] ${
            noMotion ? '' : 'anim-hero-spin-cw'
          }`}
          style={noMotion ? undefined : { animationDuration: `${orbitInnerDur}s` }}
        >
          <div className="absolute bottom-0 left-1/2 h-3 w-3 -translate-x-1/2 translate-y-1/2 rounded-full bg-[#c4a77d] shadow-[0_0_16px_rgba(196,167,125,0.45)] md:h-4 md:w-4" />
        </div>

        {fullDesktop ? (
          <motion.div
            animate={{ scale: [1, 1.22, 1], opacity: [0.55, 1, 0.55], rotate: [0, 180, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="h-24 w-24 rounded-full bg-gradient-to-tr from-[#6b5429]/40 to-slate-600/35 opacity-90 mix-blend-screen blur-2xl md:h-40 md:w-40"
          />
        ) : (
          <div
            className={`h-24 w-24 rounded-full bg-gradient-to-tr from-[#6b5429]/40 to-slate-600/35 opacity-90 md:h-40 md:w-40 ${
              noMotion ? '' : 'anim-hero-core'
            }`}
          />
        )}

        <div
          key={lang}
          className="pointer-events-none absolute flex w-[90vw] flex-col items-center gap-2 text-center font-display font-light uppercase text-stone-100 md:w-[600px] md:gap-4 md:text-xl"
        >
          <span className="block text-[10px] tracking-[0.2em] text-stone-400 md:text-sm md:tracking-[0.3em]">
            {t.name}
          </span>
          <span className="font-heading-serif text-gold-gradient block text-xl font-semibold tracking-[0.08em] md:text-3xl md:tracking-[0.15em]">
            {t.title}
          </span>
          <span className="mt-1 block text-[9px] tracking-[0.1em] text-stone-400 md:mt-2 md:text-xs md:tracking-[0.2em]">
            {t.subtitle}
          </span>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className={`anim-hero-particle absolute rounded-full ${p.color} opacity-30`}
            style={
              {
                width: p.size,
                height: p.size,
                left: `${p.x}%`,
                top: `${p.y}%`,
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`,
                '--px': `${p.sinX}px`,
                '--rise': `${fullDesktop ? -620 : -420}px`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 z-50 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03),transparent_60%)] opacity-[0.25]" />
    </main>
  );
}
