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
    title: 'Academic Monograph',
    subtitle: 'Advanced Materials & Quantum Devices',
    enter: 'Enter Portfolio',
  },
  zh: {
    affiliation: '佛光大學副校長 · 國立東華大學特聘教授',
    name: '馬遠榮 教授',
    title: '學術研究專頁',
    subtitle: '先進材料與量子元件實驗室',
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
  const springX = useSpring(mouseX, { damping: 45, stiffness: 55, mass: 1 });
  const springY = useSpring(mouseY, { damping: 45, stiffness: 55, mass: 1 });

  useEffect(() => {
    if (!fullDesktop) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set((e.clientX - window.innerWidth / 2) * 0.08);
      mouseY.set((e.clientY - window.innerHeight / 2) * 0.08);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [fullDesktop, mouseX, mouseY]);

  useEffect(() => {
    prefetchPapersJson();
  }, []);

  const orbitOuterDur = fullDesktop ? 48 : 95;
  const orbitMidDur = fullDesktop ? 34 : 78;
  const orbitInnerDur = fullDesktop ? 20 : 52;

  return (
    <main className="relative flex min-h-[100dvh] w-full flex-col items-center justify-between overflow-hidden bg-[#faf8f4] px-6 py-7 font-sans text-[#141311] md:px-10 md:py-9">
      {/* 細緻紙紋格線與古銅金邊框 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-4 rounded-3xl border border-[#e5dfd5] md:inset-7"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 45%, rgba(154,116,46,0.09), transparent 55%), radial-gradient(#d8cfc0 0.75px, transparent 0.75px)',
          backgroundSize: '100% 100%, 28px 28px',
        }}
      />

      {/* 頂部刊頭與語系切換 */}
      <header className="relative z-40 flex w-full max-w-6xl items-center justify-between gap-4 px-2 md:px-4">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#6b655d]">
          {t.affiliation}
        </span>
        <LanguageSwitcher layoutId="hetero-landing" />
      </header>

      {/* 中央古典科學軌道與襯線主標題 */}
      <motion.div
        style={fullDesktop ? { x: springX, y: springY } : undefined}
        className="relative z-10 my-auto flex items-center justify-center py-12"
      >
        {/* 外軌道（虛線製圖線） */}
        <motion.div
          animate={noMotion ? { rotate: 0 } : { rotate: 360 }}
          transition={
            noMotion ? { duration: 0 } : { duration: orbitOuterDur, repeat: Infinity, ease: 'linear' }
          }
          className="absolute h-[270px] w-[270px] rounded-full border border-dashed border-[#cfc5b4] md:h-[520px] md:w-[520px]"
        />

        {/* 中軌道（石墨細線 + 墨黑節點） */}
        <motion.div
          animate={noMotion ? { rotate: 0 } : { rotate: -360 }}
          transition={
            noMotion ? { duration: 0 } : { duration: orbitMidDur, repeat: Infinity, ease: 'linear' }
          }
          className="absolute h-[200px] w-[200px] rounded-full border border-[#dfd7c9] md:h-[380px] md:w-[380px]"
        >
          <div className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#181614] md:h-2.5 md:w-2.5" />
        </motion.div>

        {/* 內軌道（古銅金細線 + 暖金節點） */}
        <motion.div
          animate={noMotion ? { rotate: 0 } : { rotate: 360 }}
          transition={
            noMotion ? { duration: 0 } : { duration: orbitInnerDur, repeat: Infinity, ease: 'linear' }
          }
          className="absolute h-[136px] w-[136px] rounded-full border border-[#9a742e]/45 md:h-[240px] md:w-[240px]"
        >
          <div className="absolute bottom-0 left-1/2 h-2.5 w-2.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-[#9a742e] shadow-[0_0_10px_rgba(154,116,46,0.4)] md:h-3 md:w-3" />
        </motion.div>

        {/* 中央溫潤紙白暈底，讓標題清晰易讀 */}
        <div
          aria-hidden
          className="h-44 w-44 rounded-full bg-[#faf8f4]/90 blur-xl md:h-64 md:w-64"
        />

        <div
          key={lang}
          className="pointer-events-none absolute flex w-[86vw] flex-col items-center gap-3 text-center md:w-[620px] md:gap-4"
        >
          <span className="font-mono text-xs font-medium uppercase tracking-[0.26em] text-[#8a6522] md:text-sm">
            {t.name}
          </span>
          <h1 className="font-heading-serif text-3xl font-semibold tracking-tight text-[#141311] md:text-5xl lg:text-6xl">
            {t.title}
          </h1>
          <div className="h-px w-16 bg-[#9a742e]/60" aria-hidden />
          <span className="font-display text-xs uppercase tracking-[0.18em] text-[#57524b] md:text-sm md:tracking-[0.22em]">
            {t.subtitle}
          </span>
        </div>
      </motion.div>

      {/* 底部進入按鈕 */}
      <footer className="relative z-40 flex flex-col items-center gap-4 pb-4 md:pb-6">
        <Link
          href="/main"
          className="group inline-flex items-center gap-2.5 whitespace-nowrap rounded-full border border-[#181614] bg-[#181614] px-8 py-3.5 font-display text-xs font-semibold uppercase tracking-[0.18em] text-[#faf8f4] shadow-[0_10px_28px_rgba(20,19,17,0.16)] transition-all hover:border-[#8a6522] hover:bg-[#8a6522] active:scale-[0.98] md:px-10 md:py-4 md:text-sm"
        >
          {t.enter}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
        </Link>
      </footer>
    </main>
  );
}
