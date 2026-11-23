'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
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
    affiliation: 'Fo Guang University · National Dong Hwa University',
    name: 'Prof. Yuan-Ron Ma',
    title: 'Advanced Materials',
    titleSub: '& Quantum Devices',
    subtitle: 'Academic Archive · Research Portfolio',
    enter: 'Enter Portfolio',
  },
  zh: {
    affiliation: '佛光大學副校長 · 國立東華大學特聘教授',
    name: '馬遠榮 教授',
    title: '先進材料',
    titleSub: '與量子元件實驗室',
    subtitle: '個人學術檔案 · 研究著作專頁',
    enter: '進入學術專頁',
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
  const springX = useSpring(mouseX, { damping: 45, stiffness: 50, mass: 1 });
  const springY = useSpring(mouseY, { damping: 45, stiffness: 50, mass: 1 });

  useEffect(() => {
    if (!fullDesktop) return;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set((e.clientX - window.innerWidth / 2) * 0.05);
      mouseY.set((e.clientY - window.innerHeight / 2) * 0.05);
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [fullDesktop, mouseX, mouseY]);

  useEffect(() => {
    prefetchPapersJson();
  }, []);

  return (
    <main className="relative flex min-h-[100dvh] w-full flex-col items-center justify-between overflow-hidden bg-[#080807] px-6 py-7 font-sans text-[#f5f3ef] md:px-10 md:py-9">
      {/* 極細底片微粒與極克制的暗棚頂光 */}
      <div
        aria-hidden
        className="editorial-grain pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_65%_50%_at_50%_42%,rgba(200,164,100,0.085),transparent_70%)]"
      />
      {/* 建築細線外框 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-4 border border-white/[0.07] md:inset-7"
      />

      {/* 頂部刊頭 */}
      <header className="relative z-40 flex w-full max-w-6xl items-center justify-between gap-4 px-2 md:px-4">
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#8f8980]">
          {t.affiliation}
        </span>
        <LanguageSwitcher layoutId="hetero-landing" />
      </header>

      {/* 中央精密星盤細線與雕塑感襯線主標 */}
      <motion.div
        style={fullDesktop ? { x: springX, y: springY } : undefined}
        className="relative z-10 my-auto flex items-center justify-center py-12"
      >
        {/* 十字建築軸線 */}
        <div
          aria-hidden
          className="pointer-events-none absolute h-[340px] w-px bg-gradient-to-b from-transparent via-white/[0.08] to-transparent md:h-[580px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute h-px w-[340px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent md:w-[580px]"
        />

        {/* 極細同心幾何軌道（無廉價霓虹光球） */}
        <motion.div
          animate={noMotion ? { rotate: 0 } : { rotate: 360 }}
          transition={noMotion ? { duration: 0 } : { duration: 64, repeat: Infinity, ease: 'linear' }}
          className="absolute h-[280px] w-[280px] rounded-full border border-dashed border-white/[0.09] md:h-[520px] md:w-[520px]"
        />
        <motion.div
          animate={noMotion ? { rotate: 0 } : { rotate: -360 }}
          transition={noMotion ? { duration: 0 } : { duration: 42, repeat: Infinity, ease: 'linear' }}
          className="absolute h-[210px] w-[210px] rounded-full border border-white/[0.07] md:h-[380px] md:w-[380px]"
        >
          <div className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f5f3ef]/70" />
        </motion.div>
        <motion.div
          animate={noMotion ? { rotate: 0 } : { rotate: 360 }}
          transition={noMotion ? { duration: 0 } : { duration: 24, repeat: Infinity, ease: 'linear' }}
          className="absolute h-[144px] w-[144px] rounded-full border border-[#c8a464]/35 md:h-[246px] md:w-[246px]"
        >
          <div className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 translate-y-1/2 rounded-full bg-[#c8a464]" />
        </motion.div>

        <div
          key={lang}
          className="pointer-events-none relative z-10 flex w-[88vw] flex-col items-center gap-3 text-center md:w-[680px]"
        >
          <span className="font-mono text-xs uppercase tracking-[0.28em] text-[#c8a464]">
            {t.name}
          </span>
          <h1 className="font-heading-serif text-4xl font-semibold leading-[1.08] tracking-[-0.02em] text-[#f5f3ef] sm:text-5xl md:text-6xl lg:text-[4.25rem]">
            <span className="font-normal italic text-[#e5cea0]">{t.title}</span>
            <br />
            <span>{t.titleSub}</span>
          </h1>
          <div className="my-1.5 h-px w-14 bg-[#c8a464]/60" aria-hidden />
          <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#9b958c] md:text-xs">
            {t.subtitle}
          </span>
        </div>
      </motion.div>

      {/* 底部極簡進入按鈕 */}
      <footer className="relative z-40 pb-4 md:pb-6">
        <Link
          href="/main"
          className="group inline-flex items-center gap-3 whitespace-nowrap rounded-lg border border-white/[0.18] bg-[#f5f3ef] px-8 py-3.5 font-display text-xs font-semibold uppercase tracking-[0.2em] text-[#080807] transition-all duration-300 hover:border-[#e5cea0] hover:bg-[#e5cea0] active:scale-[0.98]"
        >
          {t.enter}
          <ArrowRight
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden
          />
        </Link>
      </footer>
    </main>
  );
}
