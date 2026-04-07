'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import Link from 'next/link';
import { useLanguage } from './LanguageContext';

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

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { damping: 40, stiffness: 50, mass: 1 });
  const springY = useSpring(mouseY, { damping: 40, stiffness: 50, mass: 1 });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)');
    const onChange = () => setIsMobile(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  const particles = useMemo(() => {
    const count = isMobile ? 25 : 40;
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      size: ((i * 7) % 6) + 1,
      x: (i * 13) % 100,
      y: (i * 17) % 100,
      duration: ((i * 3) % 15) + 10,
      delay: (i * 0.5) % 2,
      color: i % 2 === 0 ? 'bg-teal-400' : 'bg-amber-400',
    }));
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) return;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mouseX, mouseY, isMobile]);

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

      {/* Mouse Follower Glow - Optimized for mobile */}
      <motion.div
        className="absolute w-[60vw] h-[60vw] md:w-[40vw] md:h-[40vw] rounded-full bg-teal-500/5 md:bg-teal-500/10 blur-[60px] md:blur-[80px] pointer-events-none z-0"
        animate={isMobile ? {
          x: [0, 20, -20, 0],
          y: [0, -20, 20, 0],
        } : undefined}
        style={!isMobile ? {
          x: springX,
          y: springY,
        } : undefined}
        transition={isMobile ? {
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        } : undefined}
      />

      {/* Central Quantum Core - Using CSS animations for orbits */}
      <div className="relative z-10 flex items-center justify-center">
        {/* Outer Orbit */}
        <div
          style={{ animation: 'orbit-cw 40s linear infinite' }}
          className="absolute w-[300px] h-[300px] md:w-[600px] md:h-[600px] border border-white/[0.03] rounded-full border-dashed"
        />
        
        {/* Middle Orbit */}
        <div
          style={{ animation: 'orbit-ccw 30s linear infinite' }}
          className="absolute w-[200px] h-[200px] md:w-[400px] md:h-[400px] border border-teal-500/20 rounded-full"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 md:w-3 md:h-3 bg-teal-400 rounded-full shadow-[0_0_15px_rgba(45,212,191,0.8)]" />
        </div>

        {/* Inner Orbit */}
        <div
          style={{ animation: 'orbit-cw 15s linear infinite' }}
          className="absolute w-[120px] h-[120px] md:w-[200px] md:h-[200px] border border-amber-500/30 rounded-full"
        >
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 md:w-4 md:h-4 bg-amber-400 rounded-full shadow-[0_0_20px_rgba(251,191,36,0.8)]" />
        </div>

        {/* Core Glow - CSS animation */}
        <div
          style={{ animation: 'core-glow 8s ease-in-out infinite' }}
          className="w-24 h-24 md:w-40 md:h-40 bg-gradient-to-tr from-amber-500 to-teal-500 rounded-full blur-2xl opacity-80 mix-blend-screen"
        />
        
        {/* Core Text */}
        <div className="absolute text-white font-display text-base md:text-xl tracking-[0.3em] md:tracking-[0.5em] font-light uppercase text-center pointer-events-none flex flex-col items-center gap-2 md:gap-4 w-[90vw] md:w-[600px]">
          <motion.span 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="block text-teal-300/80 text-[10px] md:text-sm tracking-[0.2em] md:tracking-[0.3em]"
          >
            {t.name}
          </motion.span>
          <motion.span 
            animate={{ 
              textShadow: [
                "0 0 10px rgba(251,191,36,0.3)",
                "0 0 20px rgba(251,191,36,0.6)",
                "0 0 10px rgba(251,191,36,0.3)"
              ]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="block text-xl md:text-3xl font-bold tracking-[0.1em] md:tracking-[0.2em] text-amber-400"
          >
            {t.title}
          </motion.span>
          <span className="block text-slate-400 text-[9px] md:text-xs tracking-[0.1em] md:tracking-[0.2em] mt-1 md:mt-2">{t.subtitle}</span>
        </div>
      </div>

      {/* Floating Particles Container - CSS animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {particles.map((p) => (
          <div
            key={p.id}
            className={`absolute rounded-full ${p.color} opacity-30`}
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              top: `${p.y}%`,
              animation: `float-up ${p.duration}s linear ${p.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Grain Overlay - Inline noise texture */}
      <div className="absolute inset-0 noise-overlay opacity-20 mix-blend-overlay pointer-events-none z-50"></div>
    </main>
  );
}
