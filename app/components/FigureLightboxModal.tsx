'use client';

import React, { useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { X } from 'lucide-react';
import { EDITORIAL_EASE } from './EditorialMotion';

export type FigureLightboxPayload = {
  layoutId: string;
  src: string;
  alt: string;
  title: string;
  journal: string;
  year?: number;
};

type FigureLightboxModalProps = {
  lightbox: FigureLightboxPayload | null;
  closeLabel: string;
  onClose: () => void;
};

/** 霧化暗房摘要圖放大燈箱（支援 layoutId 絲滑展開、雙版相紙底襯防眩光與 ESC 關閉） */
export function FigureLightboxModal({
  lightbox,
  closeLabel,
  onClose,
}: FigureLightboxModalProps) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!lightbox) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [lightbox, onClose]);

  return (
    <AnimatePresence>
      {lightbox ? (
        <motion.div
          key="editorial-figure-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.24, ease: EDITORIAL_EASE }}
          onClick={onClose}
          className="fixed inset-0 z-[100000] flex items-center justify-center bg-[color-mix(in_srgb,var(--app-bg)_92%,transparent)] p-4 backdrop-blur-md md:p-8"
        >
          <motion.div
            initial={reduce ? { opacity: 1 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: reduce ? 0 : 0.3, ease: EDITORIAL_EASE }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[24px] border border-[var(--app-rule)] bg-[var(--app-surface-card)] shadow-[0_28px_70px_-24px_rgba(0,0,0,0.45)]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-[var(--app-rule)] px-6 py-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-2 text-base text-[var(--app-muted)]">
                  {lightbox.year && lightbox.year > 0 ? (
                    <span className="rounded-full bg-[var(--app-hover)] px-2.5 py-0.5 font-mono text-sm text-[var(--app-ink)] [font-variant-numeric:tabular-nums]">
                      {lightbox.year}
                    </span>
                  ) : null}
                  <span className="font-journal-italic">{lightbox.journal}</span>
                </div>
                <h4 className="font-editorial mt-1.5 line-clamp-2 text-lg font-semibold text-[var(--app-ink)]">
                  {lightbox.title}
                </h4>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={closeLabel}
                className="shrink-0 rounded-full border border-[var(--app-rule)] p-2 text-[var(--app-muted)] transition-colors hover:border-[var(--app-ink)] hover:bg-[var(--app-ink)] hover:text-[var(--app-bg)]"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-[var(--app-hover)] p-5 md:p-8">
              <motion.div
                layoutId={reduce ? undefined : lightbox.layoutId}
                transition={{ duration: 0.38, ease: EDITORIAL_EASE }}
                className="overflow-hidden rounded-2xl border border-[var(--app-rule)] bg-[var(--app-figure-mat)] p-3"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={lightbox.src}
                  alt={lightbox.alt}
                  referrerPolicy="no-referrer"
                  className="editorial-figure-img max-h-[66vh] max-w-full object-contain"
                />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
