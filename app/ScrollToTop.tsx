'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp } from 'lucide-react';
import { useLenis } from 'lenis/react';
import { usePathname } from 'next/navigation';

export default function ScrollToTop() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useLenis(({ scroll }) => {
    // Only show if not on landing page and scrolled a bit
    if (pathname === '/') {
      setShowScrollTop(false);
    } else {
      setShowScrollTop(scroll > 10);
    }
  });

  useEffect(() => {
    const handleScroll = () => {
      if (pathname === '/') {
        setShowScrollTop(false);
      } else {
        setShowScrollTop(window.scrollY > 10);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {showScrollTop && pathname !== '/' && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{ scale: 1.05, backgroundColor: 'rgba(251, 191, 36, 0.1)' }}
          whileTap={{ scale: 0.95 }}
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 md:bottom-10 md:right-10 z-[99999] flex flex-col items-center gap-0.5 p-2 md:p-4 rounded-xl md:rounded-2xl bg-[#0B101E]/90 border border-white/10 text-slate-300 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:border-amber-500/40 hover:text-amber-400 transition-all duration-300 group"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-y-1 transition-transform duration-300" />
          <span className="text-[8px] md:text-[10px] font-mono font-bold tracking-tighter uppercase opacity-60 group-hover:opacity-100">TOP</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
