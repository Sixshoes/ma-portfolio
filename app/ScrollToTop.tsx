'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowUp } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useLanguage } from './LanguageContext';

/**
 * 原生捲動回頂部懸浮鈕：
 * - 在 /admin 後台自動隱藏
 * - 捲動至 #site-footer 可視區時自動淡出隱藏，確保絕不遮擋頁尾署名文字
 */
export default function ScrollToTop() {
  const pathname = usePathname();
  const { lang } = useLanguage();
  const [pastThreshold, setPastThreshold] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);

  const isHiddenRoute = pathname.startsWith('/admin');

  useEffect(() => {
    if (isHiddenRoute) return;

    const onScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const nearBottom =
        window.innerHeight + scrollY >= document.documentElement.scrollHeight - 140;
      const nextPast = scrollY > 320 && !nearBottom;
      setPastThreshold((prev) => (prev === nextPast ? prev : nextPast));
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [isHiddenRoute]);

  useEffect(() => {
    if (isHiddenRoute || typeof IntersectionObserver === 'undefined') return;

    let observer: IntersectionObserver | null = null;
    const attach = () => {
      const footer = document.getElementById('site-footer');
      if (!footer) return false;
      observer = new IntersectionObserver(
        ([entry]) => {
          setFooterVisible(Boolean(entry?.isIntersecting));
        },
        { threshold: 0.05 },
      );
      observer.observe(footer);
      return true;
    };

    if (!attach()) {
      const timer = window.setTimeout(attach, 600);
      return () => {
        window.clearTimeout(timer);
        observer?.disconnect();
      };
    }

    return () => observer?.disconnect();
  }, [isHiddenRoute]);

  const handleScrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (isHiddenRoute) return null;

  const visible = pastThreshold && !footerVisible;
  const ariaTop = lang === 'zh' ? '回到頂部' : 'Scroll to top';

  return (
    <button
      type="button"
      onClick={handleScrollToTop}
      aria-label={ariaTop}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={`group fixed bottom-6 right-6 z-40 flex h-10 w-10 items-center justify-center rounded-md border border-[#DCE2E8] bg-white/95 text-[#11161C] shadow-[0_4px_14px_rgba(17,22,28,0.08)] backdrop-blur-sm transition-all duration-150 hover:border-[#0F4C81] hover:text-[#0F4C81] md:bottom-8 md:right-8 ${
        visible ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'
      }`}
    >
      <ArrowUp className="h-4 w-4 transition-transform duration-150 group-hover:-translate-y-0.5" />
    </button>
  );
}
