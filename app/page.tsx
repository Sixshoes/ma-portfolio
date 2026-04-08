'use client';

import React, { useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
  AnimatePresence,
} from 'motion/react';
import { useLanguage } from './LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const { lang, setLang } = useLanguage();
  const t = dict[lang];
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  const noMotion = prefersReducedMotion === true;
  const fullDesktop = !isMobile && !noMotion;
  const mobileAnim = isMobile && !noMotion;

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { damping: 40, stiffness: 50, mass: 1 });
  const springY = useSpring(mouseY, { damping: 40, stiffness: 50, mass: 1 });

  const particles = useMemo(() => {
    if (noMotion) return [];
    const count = fullDesktop ? 40 : 16;
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      size: ((i * 7) % 6) + 1,
      x: (i * 13) % 100,
      y: (i * 17) % 100,
      duration: ((i * 3) % 15) + (fullDesktop ? 10 : 14),
      delay: (i * 0.5) % 2,
      color: i % 2 === 0 ? 'bg-teal-400' : 'bg-amber-400',
    }));
  }, [fullDesktop, noMotion]);

  useEffect(() => {
    if (!fullDesktop) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [fullDesktop, mouseX, mouseY]);

  const orbitOuter = noMotion ? 0 : fullDesktop ? 360 : 360;
  const orbitOuterDur = noMotion ? 0 : fullDesktop ? 38 : 95;
  const orbitMid = noMotion ? 0 : fullDesktop ? -360 : -360;
  const orbitMidDur = noMotion ? 0 : fullDesktop ? 28 : 78;
  const orbitInner = noMotion ? 0 : fullDesktop ? 360 : 360;
  const orbitInnerDur = noMotion ? 0 : fullDesktop ? 14 : 52;

  return (
    <main className="relative w-full h-[100dvh] bg-[#080C16] overflow-hidden flex items-center justify-center font-sans">
      {/* Ambient vignette pulse — 僅桌機完整動效 */}
      {fullDesktop && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(8,12,22,0.55)_70%,#080C16_100%)]"
          animate={{ opacity: [0.65, 0.9, 0.65] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Language Toggle — 滑動高亮 + spring */}
      <div className="absolute top-6 right-6 md:top-8 md:right-8 z-50 flex gap-2">
        <div className="relative flex rounded-full border border-white/15 bg-black/35 p-1 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
          {(['en', 'zh'] as const).map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setLang(code)}
              className={`relative z-10 min-w-[3rem] px-3 py-1.5 rounded-full text-[10px] md:text-xs font-mono transition-colors ${
                lang === code ? 'text-[#080C16]' : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang === code && (
                <motion.span
                  layoutId="landing-lang-pill"
                  className="absolute inset-0 rounded-full bg-amber-400 shadow-[0_0_22px_rgba(251,191,36,0.45)] -z-10"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative">{code === 'en' ? 'EN' : '中文'}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Enter Site */}
      <motion.div
        className="absolute bottom-24 md:bottom-16 left-1/2 z-50 -translate-x-1/2"
        initial={noMotion ? false : { opacity: 0, y: 14 }}
        animate={noMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          animate={
            noMotion
              ? undefined
              : {
                  boxShadow: [
                    '0 0 20px rgba(251,191,36,0.18)',
                    '0 0 36px rgba(45,212,191,0.22)',
                    '0 0 20px rgba(251,191,36,0.18)',
                  ],
                }
          }
          transition={
            noMotion ? undefined : { duration: 4.5, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          <Link
            href="/main"
            className="group flex items-center gap-2 rounded-full border border-amber-400/50 bg-[#080C16]/40 px-6 py-2.5 font-display text-[10px] uppercase tracking-[0.1em] text-amber-400 backdrop-blur-md transition-colors hover:bg-amber-400 hover:text-[#080C16] active:scale-[0.98] md:px-8 md:py-3 md:text-sm md:tracking-[0.2em] whitespace-nowrap"
          >
            <span className="inline-flex items-center gap-2 transition-transform duration-300 group-hover:scale-[1.05] group-active:scale-[0.97]">
              {t.enter}
            </span>
          </Link>
        </motion.div>
      </motion.div>

      {/* Glow follower */}
      {noMotion ? (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[60vw] w-[60vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-500/5 blur-[80px] md:h-[40vw] md:w-[40vw] md:bg-teal-500/10 md:blur-[100px]" />
      ) : fullDesktop ? (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            className="h-[60vw] w-[60vw] rounded-full bg-teal-500/5 blur-[80px] md:h-[40vw] md:w-[40vw] md:bg-teal-500/10 md:blur-[100px]"
            style={{ x: springX, y: springY }}
          />
        </div>
      ) : (
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[60vw] w-[60vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-500/5 blur-[80px] md:h-[40vw] md:w-[40vw] md:bg-teal-500/10 md:blur-[100px]"
          animate={{ x: [0, 18, -12, 0], y: [0, -14, 10, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Central core */}
      <motion.div
        className="relative z-10 flex items-center justify-center"
        initial={noMotion ? false : { opacity: 0, scale: 0.92 }}
        animate={noMotion ? undefined : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
      >
        {fullDesktop && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute aspect-square w-[min(92vw,640px)] rounded-full border border-teal-500/10"
            animate={{ scale: [1, 1.04, 1], opacity: [0.12, 0.28, 0.12] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        <motion.div
          animate={noMotion ? { rotate: 0 } : { rotate: orbitOuter }}
          transition={
            noMotion
              ? { duration: 0 }
              : { duration: orbitOuterDur, repeat: Infinity, ease: 'linear' }
          }
          className="absolute h-[300px] w-[300px] rounded-full border border-dashed border-white/[0.05] md:h-[600px] md:w-[600px]"
        />

        <motion.div
          animate={noMotion ? { rotate: 0 } : { rotate: orbitMid }}
          transition={
            noMotion
              ? { duration: 0 }
              : { duration: orbitMidDur, repeat: Infinity, ease: 'linear' }
          }
          className="absolute h-[200px] w-[200px] rounded-full border border-teal-500/20 md:h-[400px] md:w-[400px]"
        >
          <div className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-400 shadow-[0_0_15px_rgba(45,212,191,0.8)] md:h-3 md:w-3" />
        </motion.div>

        <motion.div
          animate={noMotion ? { rotate: 0 } : { rotate: orbitInner }}
          transition={
            noMotion
              ? { duration: 0 }
              : { duration: orbitInnerDur, repeat: Infinity, ease: 'linear' }
          }
          className="absolute h-[120px] w-[120px] rounded-full border border-amber-500/30 md:h-[200px] md:w-[200px]"
        >
          <div className="absolute bottom-0 left-1/2 h-3 w-3 translate-y-1/2 -translate-x-1/2 rounded-full bg-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.8)] md:h-4 md:w-4" />
        </motion.div>

        <motion.div
          animate={
            noMotion
              ? { scale: 1, opacity: 0.85, rotate: 0 }
              : fullDesktop
                ? {
                    scale: [1, 1.22, 1],
                    opacity: [0.55, 1, 0.55],
                    rotate: [0, 180, 360],
                  }
                : {
                    scale: [1, 1.12, 1],
                    opacity: [0.65, 0.95, 0.65],
                    rotate: 0,
                  }
          }
          transition={
            noMotion
              ? { duration: 0.2 }
              : fullDesktop
                ? { duration: 8, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 5.5, repeat: Infinity, ease: 'easeInOut' }
          }
          className="h-24 w-24 rounded-full bg-gradient-to-tr from-amber-500 to-teal-500 opacity-80 mix-blend-screen blur-2xl md:h-40 md:w-40"
        />

        <div className="pointer-events-none absolute flex w-[90vw] flex-col items-center gap-2 text-center font-display font-light uppercase text-white md:w-[600px] md:gap-4 md:text-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={lang}
              initial={noMotion ? false : { opacity: 0, y: 10, filter: 'blur(6px)' }}
              animate={
                noMotion
                  ? undefined
                  : { opacity: 1, y: 0, filter: 'blur(0px)' }
              }
              exit={noMotion ? undefined : { opacity: 0, y: -8, filter: 'blur(4px)' }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center gap-2 md:gap-4"
            >
              <motion.span
                animate={
                  noMotion
                    ? undefined
                    : { opacity: fullDesktop ? [0.55, 1, 0.55] : [0.75, 1, 0.75] }
                }
                transition={
                  noMotion
                    ? undefined
                    : { duration: fullDesktop ? 4 : 5.5, repeat: Infinity, ease: 'easeInOut' }
                }
                className="block text-[10px] tracking-[0.2em] text-teal-300/80 md:text-sm md:tracking-[0.3em]"
              >
                {t.name}
              </motion.span>
              <motion.span
                animate={
                  noMotion
                    ? undefined
                    : {
                        textShadow: [
                          '0 0 10px rgba(251,191,36,0.35)',
                          '0 0 26px rgba(45,212,191,0.35)',
                          '0 0 10px rgba(251,191,36,0.35)',
                        ],
                      }
                }
                transition={
                  noMotion
                    ? undefined
                    : { duration: 3.8, repeat: Infinity, ease: 'easeInOut' }
                }
                className="block text-xl font-bold tracking-[0.1em] text-amber-400 md:text-3xl md:tracking-[0.2em]"
              >
                {t.title}
              </motion.span>
              <span className="mt-1 block text-[9px] tracking-[0.1em] text-slate-400 md:mt-2 md:text-xs md:tracking-[0.2em]">
                {t.subtitle}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

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
              willChange: 'transform, opacity',
            }}
            animate={{
              y: [0, -800],
              opacity: [0, 0.85, 0.85, 0],
              x: [0, Math.sin(p.id) * (fullDesktop ? 150 : 100), 0],
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

      <div className="pointer-events-none absolute inset-0 z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
    </main>
  );
}
