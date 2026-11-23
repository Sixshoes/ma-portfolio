'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp } from 'lucide-react';
import { useLenis } from 'lenis/react';
import { usePathname } from 'next/navigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLanguage } from './LanguageContext';

function ScrollTopFab({
  showScrollTop,
  onScrollToTop,
}: {
  showScrollTop: boolean;
  onScrollToTop: () => void;
}) {
  const pathname = usePathname();
  const { lang } = useLanguage();
  const ariaTop = lang === 'zh' ? '回到頂部' : 'Scroll to top';
  const labelTop = lang === 'zh' ? '頂部' : 'TOP';

  return (
    <AnimatePresence>
      {showScrollTop && pathname !== '/' && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{ scale: 1.05, backgroundColor: 'rgba(196, 167, 125, 0.12)' }}
          whileTap={{ scale: 0.95 }}
          onClick={onScrollToTop}
          type="button"
          className="group fixed bottom-4 right-4 z-[99999] flex min-h-11 min-w-11 flex-col items-center justify-center gap-0.5 rounded-xl border border-white/[0.08] bg-[#0c0a09]/92 p-2 text-stone-400 shadow-[0_0_28px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all duration-300 hover:border-[rgba(212,175,55,0.35)] hover:text-[#e8dcc4] md:bottom-10 md:right-10 md:min-h-0 md:min-w-0 md:rounded-2xl md:p-4"
          aria-label={ariaTop}
        >
          <ArrowUp className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-1 md:h-5 md:w-5" />
          <span className="font-mono text-[8px] font-bold uppercase tracking-tighter opacity-60 group-hover:opacity-100 md:text-[10px]">
            {labelTop}
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

function ScrollToTopLenis() {
  const pathname = usePathname();
  const [showScrollTop, setShowScrollTop] = useState(false);

  const lenis = useLenis(({ scroll }) => {
    const nextShow = pathname !== '/' && scroll > 10;
    setShowScrollTop((prev) => (prev === nextShow ? prev : nextShow));
  }, [pathname]);

  const handleScrollToTop = useCallback(() => {
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.0 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [lenis]);

  return <ScrollTopFab showScrollTop={showScrollTop} onScrollToTop={handleScrollToTop} />;
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

  const handleScrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return <ScrollTopFab showScrollTop={showScrollTop} onScrollToTop={handleScrollToTop} />;
}

export default function ScrollToTop() {
  const isMobile = useIsMobile();
  return isMobile ? <ScrollToTopNative /> : <ScrollToTopLenis />;
}
