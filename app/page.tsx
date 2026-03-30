'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

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
    <main className="relative w-full h-screen bg-[#080C16] overflow-hidden flex items-center justify-center font-sans">
      {/* Enter Site Button */}
      <Link 
        href="/main" 
        className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50 text-amber-400 hover:text-[#080C16] hover:bg-amber-400 transition-all flex items-center gap-2 font-display text-sm uppercase tracking-[0.2em] border border-amber-400/50 px-8 py-3 rounded-full backdrop-blur-md shadow-[0_0_20px_rgba(251,191,36,0.2)] hover:shadow-[0_0_30px_rgba(251,191,36,0.5)]"
      >
        Enter Website
      </Link>

      {/* Mouse Follower Glow */}
      <motion.div
        className="absolute w-[40vw] h-[40vw] rounded-full bg-teal-500/10 blur-[100px] pointer-events-none z-0"
        animate={{
          x: mousePosition.x - windowSize.width / 2,
          y: mousePosition.y - windowSize.height / 2,
        }}
        transition={{ type: 'spring', damping: 40, stiffness: 50, mass: 1 }}
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
          <span className="block text-teal-300/80 text-sm tracking-[0.3em]">Yuan-Ron Ma</span>
          <span className="block text-3xl font-bold tracking-[0.2em] text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">Personal Website</span>
          <span className="block text-slate-400 text-xs tracking-[0.2em] mt-2">Advanced Materials & Quantum Devices</span>
        </div>
      </div>

      {/* Floating Particles */}
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
            y: [0, -800],
            opacity: [0, 0.8, 0],
            x: [0, Math.sin(p.id) * 150, 0],
            scale: [0, 1.5, 0]
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear",
          }}
        />
      ))}

      {/* Grain Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none z-50"></div>
    </main>
  );
}
