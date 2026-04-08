'use client';

import React, { useEffect, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { useLanguage } from './LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';

const dict = {
  en: {
    name: 'Prof. Yuan-Ron Ma',
    title: 'Academic Portfolio',
    subtitle: 'Advanced Materials & Quantum Devices',
    enter: 'Enter Portfolio'
  },
  zh: {
    name: '馬遠榮 教授',
    title: '學術研究專頁',
    subtitle: '先進材料與量子元件',
    enter: '進入專頁'
  }
};

export default function VisualsPage() {
  const { lang, setLang } = useLanguage();
  const t = dict[lang];
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { damping: 40, stiffness: 50, mass: 1 });
  const springY = useSpring(mouseY, { damping: 40, stiffness: 50, mass: 1 });

  const landingLite = prefersReducedMotion === true || isMobile;

  const particles = useMemo(() => {
    if (prefersReducedMotion) return [];
    const count = isMobile ? 8 : 36;
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      // Deterministic pseudo-random values based on index
      size: ((i * 7) % 6) + 1,
      x: (i * 13) % 100,
      y: (i * 17) % 100,
      duration: ((i * 3) % 15) + 10,
      delay: (i * 0.5) % 2,
      color: i % 2 === 0 ? 'bg-teal-400' : 'bg-amber-400',
    }));
  }, [isMobile, prefersReducedMotion]);

  useEffect(() => {
    if (isMobile || prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isMobile, prefersReducedMotion, mouseX, mouseY]);

  return (
    <main className="relative w-full h-[100dvh] bg-[#080C16] overflow-hidden flex items-center justify-center font-sans">
      {/* Language Toggle */}
      <div className="absolute top-6 right-6 md:top-8 md:right-8 z-50 flex gap-2">
        <button 
          onClick={() => setLang('en')}
          className={`text-[10px] md:text-xs font-mono px-2.5 py-1 md:px-3 md:py-1 rounded-full transition-colors ${lang === 'en' ? 'bg-amber-400 text-[#080C16]' : 'text-slate-400 hover:text-white border border-white/10'}`}
        >
          EN
        </button>
        <button 
          onClick={() => setLang('zh')}
          className={`text-[10px] md:text-xs font-mono px-2.5 py-1 md:px-3 md:py-1 rounded-full transition-colors ${lang === 'zh' ? 'bg-amber-400 text-[#080C16]' : 'text-slate-400 hover:text-white border border-white/10'}`}
        >
          中文
        </button>
      </div>

      {/* Enter Site Button */}
      <Link 
        href="/main" 
        className="absolute bottom-24 md:bottom-16 left-1/2 -translate-x-1/2 z-50 text-amber-400 hover:text-[#080C16] hover:bg-amber-400 transition-all flex items-center gap-2 font-display text-[10px] md:text-sm uppercase tracking-[0.1em] md:tracking-[0.2em] border border-amber-400/50 px-6 py-2.5 md:px-8 md:py-3 rounded-full backdrop-blur-md shadow-[0_0_20px_rgba(251,191,36,0.2)] hover:shadow-[0_0_30px_rgba(251,191,36,0.5)] whitespace-nowrap"
      >
        {t.enter}
      </Link>

      {/* Mouse Follower Glow — 手機／減動效：固定中心，避免 spring 與無限 keyframes */}
      {landingLite ? (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] md:w-[40vw] md:h-[40vw] rounded-full bg-teal-500/5 md:bg-teal-500/10 blur-[80px] md:blur-[100px] pointer-events-none z-0" />
      ) : (
        <motion.div
          className="absolute w-[60vw] h-[60vw] md:w-[40vw] md:h-[40vw] rounded-full bg-teal-500/5 md:bg-teal-500/10 blur-[80px] md:blur-[100px] pointer-events-none z-0"
          style={{
            x: springX,
            y: springY,
          }}
        />
      )}

      {/* Central Quantum Core */}
      <div className="relative z-10 flex items-center justify-center">
        {/* Outer Orbit */}
        <motion.div
          animate={landingLite ? { rotate: 0 } : { rotate: 360 }}
          transition={landingLite ? { duration: 0 } : { duration: 40, repeat: Infinity, ease: 'linear' }}
          className="absolute w-[300px] h-[300px] md:w-[600px] md:h-[600px] border border-white/[0.03] rounded-full border-dashed"
        />
        
        {/* Middle Orbit */}
        <motion.div
          animate={landingLite ? { rotate: 0 } : { rotate: -360 }}
          transition={landingLite ? { duration: 0 } : { duration: 30, repeat: Infinity, ease: 'linear' }}
          className="absolute w-[200px] h-[200px] md:w-[400px] md:h-[400px] border border-teal-500/20 rounded-full"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 md:w-3 md:h-3 bg-teal-400 rounded-full shadow-[0_0_15px_rgba(45,212,191,0.8)]" />
        </motion.div>

        {/* Inner Orbit */}
        <motion.div
          animate={landingLite ? { rotate: 0 } : { rotate: 360 }}
          transition={landingLite ? { duration: 0 } : { duration: 15, repeat: Infinity, ease: 'linear' }}
          className="absolute w-[120px] h-[120px] md:w-[200px] md:h-[200px] border border-amber-500/30 rounded-full"
        >
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 md:w-4 md:h-4 bg-amber-400 rounded-full shadow-[0_0_20px_rgba(251,191,36,0.8)]" />
        </motion.div>

        {/* Core Glow */}
        <motion.div
          animate={
            landingLite
              ? { scale: 1, opacity: 0.85, rotate: 0 }
              : {
                  scale: [1, 1.2, 1],
                  opacity: [0.6, 1, 0.6],
                  rotate: [0, 180, 360],
                }
          }
          transition={
            landingLite
              ? { duration: 0.2 }
              : { duration: 8, repeat: Infinity, ease: 'easeInOut' }
          }
          className="w-24 h-24 md:w-40 md:h-40 bg-gradient-to-tr from-amber-500 to-teal-500 rounded-full blur-2xl opacity-80 mix-blend-screen"
        />
        
        {/* Core Text */}
        <div className="absolute text-white font-display text-base md:text-xl tracking-[0.3em] md:tracking-[0.5em] font-light uppercase text-center pointer-events-none flex flex-col items-center gap-2 md:gap-4 w-[90vw] md:w-[600px]">
          <motion.span 
            animate={landingLite ? { opacity: 1 } : { opacity: [0.5, 1, 0.5] }}
            transition={landingLite ? { duration: 0.2 } : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="block text-teal-300/80 text-[10px] md:text-sm tracking-[0.2em] md:tracking-[0.3em]"
          >
            {t.name}
          </motion.span>
          <motion.span 
            animate={
              landingLite
                ? { textShadow: '0 0 14px rgba(251,191,36,0.45)' }
                : {
                    textShadow: [
                      '0 0 10px rgba(251,191,36,0.3)',
                      '0 0 20px rgba(251,191,36,0.6)',
                      '0 0 10px rgba(251,191,36,0.3)',
                    ],
                  }
            }
            transition={landingLite ? { duration: 0.2 } : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="block text-xl md:text-3xl font-bold tracking-[0.1em] md:tracking-[0.2em] text-amber-400"
          >
            {t.title}
          </motion.span>
          <span className="block text-slate-400 text-[9px] md:text-xs tracking-[0.1em] md:tracking-[0.2em] mt-1 md:mt-2">{t.subtitle}</span>
        </div>
      </div>

      {/* Floating Particles Container */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
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
              opacity: [0, 0.8, 0.8, 0],
              x: [0, Math.sin(p.id) * 150, 0],
              scale: [0, 1.5, 1.5, 0]
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "linear",
              times: [0, 0.1, 0.9, 1]
            }}
          />
        ))}
      </div>

      {/* Grain Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none z-50"></div>
    </main>
  );
}
