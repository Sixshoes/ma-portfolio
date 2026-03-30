'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
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

  const [mounted, setMounted] = useState(false);
  const particles = useMemo(() => {
    return Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      size: ((i * 7) % 6) + 1,
      x: (i * 13) % 100,
      y: (i * 17) % 100,
      duration: ((i * 3) % 15) + 10,
      delay: (i * 0.5) % 2,
      color: i % 2 === 0 ? 'bg-teal-400' : 'bg-amber-400',
    }));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mouseX, mouseY]);

  return (
    <main className="relative w-full h-screen bg-[#080C16] overflow-hidden flex items-center justify-center font-sans">
      {/* Language Toggle */}
      <div className="absolute top-8 right-8 z-50 flex gap-2">
        <button 
          onClick={() => setLang('en')}
          className={`text-xs font-mono px-3 py-1 rounded-full transition-colors ${lang === 'en' ? 'bg-amber-400 text-[#080C16]' : 'text-slate-400 hover:text-white border border-white/10'}`}
        >
          EN
        </button>
        <button 
          onClick={() => setLang('zh')}
          className={`text-xs font-mono px-3 py-1 rounded-full transition-colors ${lang === 'zh' ? 'bg-amber-400 text-[#080C16]' : 'text-slate-400 hover:text-white border border-white/10'}`}
        >
          中文
        </button>
      </div>

      {/* Enter Site Button */}
      <Link 
        href="/main" 
        className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50 text-amber-400 hover:text-[#080C16] hover:bg-amber-400 transition-all flex items-center gap-2 font-display text-sm uppercase tracking-[0.2em] border border-amber-400/50 px-8 py-3 rounded-full backdrop-blur-md shadow-[0_0_20px_rgba(251,191,36,0.2)] hover:shadow-[0_0_30px_rgba(251,191,36,0.5)]"
      >
        {t.enter}
      </Link>

      {/* Mouse Follower Glow */}
      <motion.div
        className="absolute w-[40vw] h-[40vw] rounded-full bg-teal-500/10 blur-[100px] pointer-events-none z-0"
        style={{
          x: springX,
          y: springY,
        }}
      />

      {/* Central Quantum Core */}
      <div className="relative z-10 flex items-center justify-center">
        {/* Outer Orbit */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute w-[600px] h-[600px] border border-white/[0.03] rounded-full border-dashed"
        />
        
        {/* Middle Orbit */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute w-[400px] h-[400px] border border-teal-500/20 rounded-full"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-teal-400 rounded-full shadow-[0_0_15px_rgba(45,212,191,0.8)]" />
        </motion.div>

        {/* Inner Orbit */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute w-[200px] h-[200px] border border-amber-500/30 rounded-full"
        >
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 bg-amber-400 rounded-full shadow-[0_0_20px_rgba(251,191,36,0.8)]" />
        </motion.div>

        {/* Core Glow */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1], 
            opacity: [0.6, 1, 0.6],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="w-40 h-40 bg-gradient-to-tr from-amber-500 to-teal-500 rounded-full blur-2xl opacity-80 mix-blend-screen"
        />
        
        {/* Core Text */}
        <div className="absolute text-white font-display text-xl tracking-[0.5em] font-light uppercase text-center pointer-events-none flex flex-col items-center gap-4 w-[600px]">
          <span className="block text-teal-300/80 text-sm tracking-[0.3em]">{t.name}</span>
          <span className="block text-3xl font-bold tracking-[0.2em] text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">{t.title}</span>
          <span className="block text-slate-400 text-xs tracking-[0.2em] mt-2">{t.subtitle}</span>
        </div>
      </div>

      {/* Floating Particles */}
      {mounted && particles.map((p) => (
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

      {/* Grain Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none z-50"></div>
    </main>
  );
}
