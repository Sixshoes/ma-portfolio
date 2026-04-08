'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp } from 'lucide-react';
import { useLenis } from 'lenis/react';
import { usePathname } from 'next/navigation';
import { useIsMobile } from '@/hooks/use-mobile';

function ScrollTopFab({ showScrollTop }: { showScrollTop: boolean }) {
  const pathname = usePathname();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

function ScrollToTopLenis() {
  const pathname = usePathname();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useLenis(({ scroll }) => {
    const nextShow = pathname !== '/' && scroll > 10;
    setShowScrollTop((prev) => (prev === nextShow ? prev : nextShow));
  }, [pathname]);

  return <ScrollTopFab showScrollTop={showScrollTop} />;
}

function ScrollToTopNative() {
  const pathname = usePathname();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scroll = window.scrollY || document.documentElement.scrollTop;
      const nextShow = pathname !== '/' && scroll > 10;
      setShowScrollTop((prev) => (prev === nextShow ? prev : nextShow));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  return <ScrollTopFab showScrollTop={showScrollTop} />;
}

export default function ScrollToTop() {
  const isMobile = useIsMobile();
  return isMobile ? <ScrollToTopNative /> : <ScrollToTopLenis />;
}
