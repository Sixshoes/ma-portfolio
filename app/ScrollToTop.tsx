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

  return (
    <AnimatePresence>
      {showScrollTop && pathname !== '/' && pathname !== '/admin' && (
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.96 }}
          onClick={onScrollToTop}
          type="button"
          className="group fixed bottom-6 right-6 z-[99999] flex h-11 w-11 items-center justify-center rounded-lg border border-white/[0.14] bg-[#0e0d0c]/90 text-[#e8e4dc] shadow-[0_12px_32px_rgba(0,0,0,0.6)] backdrop-blur-md transition-colors hover:border-[#c8a464]/70 hover:text-[#e5cea0] md:bottom-8 md:right-8"
          aria-label={ariaTop}
        >
          <ArrowUp className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

function ScrollToTopLenis() {
  const pathname = usePathname();
  const [showScrollTop, setShowScrollTop] = useState(false);

  const lenis = useLenis(({ scroll }) => {
    const nextShow = pathname !== '/' && scroll > 280;
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
      const nextShow = pathname !== '/' && scroll > 280;
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
