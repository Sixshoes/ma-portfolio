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
      {showScrollTop && pathname !== '/' && pathname !== '/admin' && (
        <motion.button
          initial={{ opacity: 0, scale: 0.85, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 16 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onScrollToTop}
          type="button"
          className="group fixed bottom-5 right-5 z-[99999] flex min-h-11 min-w-11 flex-col items-center justify-center gap-0.5 rounded-full border border-[#d8cfc0] bg-white/95 p-3 text-[#292622] shadow-[0_8px_24px_rgba(20,19,17,0.12)] backdrop-blur-md transition-colors hover:border-[#9a742e] hover:bg-[#181614] hover:text-[#faf8f4] md:bottom-8 md:right-8 md:h-14 md:w-14"
          aria-label={ariaTop}
        >
          <ArrowUp className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 md:h-5 md:w-5" />
          <span className="font-mono text-[9px] font-bold uppercase tracking-tight opacity-75 group-hover:opacity-100">
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
    const nextShow = pathname !== '/' && scroll > 240;
    setShowScrollTop((prev) => (prev === nextShow ? prev : nextShow));
  }, [pathname]);

  const handleScrollToTop = useCallback(() => {
    if (lenis) {
      lenis.scrollTo(0, { duration: 0.9 });
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
      const nextShow = pathname !== '/' && scroll > 240;
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
