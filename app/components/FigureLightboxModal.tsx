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

/** 紙白霧化暗房摘要圖放大燈箱（支援 layoutId 絲滑展開與 ESC 關閉） */
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
          className="fixed inset-0 z-[100000] flex items-center justify-center bg-[#F7F6F2]/92 p-4 backdrop-blur-md md:p-8"
        >
          <motion.div
            initial={reduce ? { opacity: 1 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: reduce ? 0 : 0.3, ease: EDITORIAL_EASE }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden border border-[#141413] bg-[#F7F6F2]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#D4D1C8] px-6 py-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-2 text-sm text-[#5C5953]">
                  {lightbox.year && lightbox.year > 0 ? (
                    <span className="font-mono text-xs text-[#141413] [font-variant-numeric:tabular-nums]">
                      {lightbox.year}
                    </span>
                  ) : null}
                  <span className="font-journal-italic">{lightbox.journal}</span>
                </div>
                <h4 className="font-editorial mt-1 line-clamp-2 text-base font-semibold text-[#141413]">
                  {lightbox.title}
                </h4>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={closeLabel}
                className="shrink-0 border border-[#D4D1C8] p-1.5 text-[#5C5953] transition-colors hover:border-[#141413] hover:bg-[#141413] hover:text-[#F7F6F2]"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-[#E6E4DD] p-5 md:p-8">
              <motion.div
                layoutId={reduce ? undefined : lightbox.layoutId}
                transition={{ duration: 0.38, ease: EDITORIAL_EASE }}
                className="border border-[#D4D1C8] bg-white p-3"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={lightbox.src}
                  alt={lightbox.alt}
                  referrerPolicy="no-referrer"
                  className="max-h-[66vh] max-w-full object-contain"
                />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
