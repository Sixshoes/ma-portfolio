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
    name: '馬遠榮 副校長／教授',
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
    const count = fullDesktop ? 24 : 10;
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      size: ((i * 7) % 6) + 1,
      x: (i * 13) % 100,
      y: (i * 17) % 100,
      duration: ((i * 3) % 15) + (fullDesktop ? 10 : 14),
      delay: (i * 0.5) % 2,
      color: i % 2 === 0 ? 'bg-stone-400' : 'bg-[#c4a77d]',
      sinX: Math.sin(i) * (fullDesktop ? 105 : 64),
    }));
  }, [fullDesktop, noMotion]);

  useEffect(() => {
    if (!fullDesktop) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [fullDesktop, mouseX, mouseY]);

  useEffect(() => {
    prefetchPapersJson();
  }, []);

  const orbitOuterDur = fullDesktop ? 38 : 95;
  const orbitMidDur = fullDesktop ? 28 : 78;
  const orbitInnerDur = fullDesktop ? 14 : 52;

  return (
    <main className="relative flex min-h-[100dvh] w-full flex-col items-center justify-between overflow-hidden bg-[#100f0e] px-6 py-8 font-sans">
      {fullDesktop && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(16,15,14,0.52)_72%,#0b0a09_100%)]"
          animate={{ opacity: [0.65, 0.9, 0.65] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <div className="relative z-40 flex w-full max-w-7xl justify-end">
        <LanguageSwitcher layoutId="hetero-landing" />
      </div>

      {noMotion ? (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[60vw] w-[60vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#c4a77d]/10 md:h-[40vw] md:w-[40vw] md:blur-[100px]" />
      ) : fullDesktop ? (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            className="h-[60vw] w-[60vw] rounded-full bg-[#c4a77d]/10 blur-[80px] md:h-[40vw] md:w-[40vw] md:blur-[100px]"
            style={{ x: springX, y: springY }}
          />
        </div>
      ) : (
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[60vw] w-[60vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#c4a77d]/10 md:h-[40vw] md:w-[40vw]"
          animate={{ x: [0, 18, -12, 0], y: [0, -14, 10, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <div className="relative z-10 my-auto flex items-center justify-center py-12">
        {fullDesktop && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute aspect-square w-[min(86vw,600px)] rounded-full border border-stone-700/30"
            animate={{ scale: [1, 1.04, 1], opacity: [0.14, 0.3, 0.14] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        <motion.div
          animate={noMotion ? { rotate: 0 } : { rotate: 360 }}
          transition={
            noMotion ? { duration: 0 } : { duration: orbitOuterDur, repeat: Infinity, ease: 'linear' }
          }
          className="absolute h-[260px] w-[260px] rounded-full border border-dashed border-stone-500/20 md:h-[540px] md:w-[540px]"
        />

        <motion.div
          animate={noMotion ? { rotate: 0 } : { rotate: -360 }}
          transition={
            noMotion ? { duration: 0 } : { duration: orbitMidDur, repeat: Infinity, ease: 'linear' }
          }
          className="absolute h-[190px] w-[190px] rounded-full border border-stone-600/35 md:h-[380px] md:w-[380px]"
        >
          <div className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-stone-300 shadow-[0_0_12px_rgba(214,211,209,0.45)] md:h-3 md:w-3" />
        </motion.div>

        <motion.div
          animate={noMotion ? { rotate: 0 } : { rotate: 360 }}
          transition={
            noMotion ? { duration: 0 } : { duration: orbitInnerDur, repeat: Infinity, ease: 'linear' }
          }
          className="absolute h-[120px] w-[120px] rounded-full border border-[#c4a77d]/40 md:h-[200px] md:w-[200px]"
        >
          <div className="absolute bottom-0 left-1/2 h-3 w-3 -translate-x-1/2 translate-y-1/2 rounded-full bg-[#d4af37] shadow-[0_0_16px_rgba(212,175,55,0.45)] md:h-4 md:w-4" />
        </motion.div>

        <motion.div
          animate={
            noMotion
              ? { scale: 1, opacity: 0.85, rotate: 0 }
              : fullDesktop
                ? { scale: [1, 1.2, 1], opacity: [0.55, 0.95, 0.55], rotate: [0, 180, 360] }
                : { scale: [1, 1.12, 1], opacity: [0.65, 0.95, 0.65], rotate: 0 }
          }
          transition={
            noMotion
              ? { duration: 0.2 }
              : fullDesktop
                ? { duration: 8, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 5.5, repeat: Infinity, ease: 'easeInOut' }
          }
          className={`h-24 w-24 rounded-full bg-gradient-to-tr from-[#7a5f2f]/45 to-stone-600/35 opacity-90 md:h-40 md:w-40 ${fullDesktop ? 'mix-blend-screen blur-2xl' : ''}`}
        />

        <div
          key={lang}
          className="pointer-events-none absolute flex w-[88vw] flex-col items-center gap-2 text-center font-display font-light uppercase text-stone-100 md:w-[600px] md:gap-4"
        >
          <span className="block text-xs tracking-[0.22em] text-stone-300 md:text-sm md:tracking-[0.28em]">
            {t.name}
          </span>
          <h1 className="font-heading-serif block text-2xl font-semibold tracking-[0.08em] text-[#e8dcc4] md:text-4xl md:tracking-[0.14em]">
            {t.title}
          </h1>
          <span className="mt-1 block text-xs tracking-[0.14em] text-stone-300 md:mt-2 md:text-sm md:tracking-[0.2em]">
            {t.subtitle}
          </span>
        </div>
      </div>

      {/* Plain HTML flex item — never collides with center orbit on short screens */}
      <div className="relative z-40 pb-4 md:pb-8">
        <Link
          href="/main"
          className="group inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-[#c4a77d]/55 bg-stone-950/90 px-7 py-3 font-display text-xs font-medium uppercase tracking-[0.16em] text-[#e8dcc4] transition-colors hover:bg-[#d4b47c] hover:text-stone-950 active:scale-[0.98] md:bg-stone-950/60 md:px-9 md:py-3.5 md:text-sm md:tracking-[0.2em] md:backdrop-blur-md"
        >
          {t.enter}
        </Link>
      </div>

      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className={`absolute rounded-full ${p.color} opacity-30`}
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              top: `${p.y}%`,
            }}
            animate={{
              y: [0, fullDesktop ? -620 : -420],
              opacity: [0, 0.85, 0.85, 0],
              x: [0, p.sinX, 0],
              scale: [0, 1.5, 1.5, 0],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: 'linear',
              times: [0, 0.1, 0.9, 1],
            }}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03),transparent_60%)] opacity-[0.25]" />
    </main>
  );
}
