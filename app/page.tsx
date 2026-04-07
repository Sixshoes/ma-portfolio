'use client';

import React from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { useLanguage } from './LanguageContext';

export default function VisualsPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({ width: 1000, height: 1000 });
  const [particles, setParticles] = useState<Array<{id: number, size: number, x: number, y: number, duration: number, delay: number, color: string}>>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };

    const initializeParticles = () => {
      // Generate random particles only on client to avoid hydration mismatch
      const generatedParticles = Array.from({ length: 80 }).map((_, i) => ({
        id: i,
        size: Math.random() * 6 + 1,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: Math.random() * 20 + 15,
        delay: Math.random() * 10,
        color: Math.random() > 0.5 ? 'bg-teal-400' : 'bg-amber-400',
      }));
      setParticles(generatedParticles);
    };

    initializeParticles();
    handleResize();
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <main className="relative w-full h-[100dvh] bg-[#080C16] overflow-hidden flex items-center justify-center font-sans">
      {/* Subtle background gradient — no animation */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[50vw] h-[50vh] bg-teal-900/20 rounded-full blur-[120px] -translate-x-1/4 -translate-y-1/4" />
        <div className="absolute bottom-0 right-0 w-[40vw] h-[40vh] bg-amber-900/15 rounded-full blur-[120px] translate-x-1/4 translate-y-1/4" />
      </div>

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

      {/* Centered content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 gap-6 md:gap-8">
        {/* Thin decorative rule */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="w-16 h-px bg-amber-400/60"
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="flex flex-col items-center gap-3"
        >
          <span className="text-teal-300/70 text-[11px] md:text-sm font-mono tracking-[0.25em] uppercase">
            {t.name}
          </span>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-white tracking-wide">
            {t.title}
          </h1>
          <p className="text-slate-400 text-xs md:text-sm tracking-[0.15em] uppercase font-mono">
            {t.subtitle}
          </p>
        </motion.div>

        {/* Thin decorative rule */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="w-16 h-px bg-teal-400/40"
        />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Link
            href="/main"
            className="inline-flex items-center gap-2 font-display text-[11px] md:text-sm uppercase tracking-[0.18em] text-amber-400 border border-amber-400/40 px-7 py-3 rounded-full hover:bg-amber-400 hover:text-[#080C16] transition-all duration-300"
          >
            {t.enter}
          </Link>
        </motion.div>
      </div>
    </main>
  );
}
