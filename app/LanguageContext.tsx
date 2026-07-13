'use client';

import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useLiteVisuals } from '@/hooks/use-lite-visuals';

type Lang = 'en' | 'zh';

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  isTransitioning: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  isTransitioning: false,
});

const SWAP_MS = 160;
const CLEAR_MS = 520;

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLangState] = useState<Lang>('en');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const liteVisuals = useLiteVisuals();
  const prefersReducedMotion = useReducedMotion() === true;
  const skipTransition = prefersReducedMotion || liteVisuals;

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('preferred_lang') as Lang;
      if (savedLang === 'en' || savedLang === 'zh') setLangState(savedLang);
    } catch {
      /* localStorage unavailable */
    }
  }, []);

  const setLang = useCallback(
    (newLang: Lang) => {
      if (newLang === lang) return;
      if (skipTransition) {
        setLangState(newLang);
        try {
          localStorage.setItem('preferred_lang', newLang);
        } catch {
          /* ignore */
        }
        return;
      }
      if (isTransitioning) return;
      setIsTransitioning(true);
      window.setTimeout(() => {
        setLangState(newLang);
        try {
          localStorage.setItem('preferred_lang', newLang);
        } catch {
          /* ignore */
        }
      }, SWAP_MS);
      window.setTimeout(() => setIsTransitioning(false), CLEAR_MS);
    },
    [lang, isTransitioning, skipTransition]
  );

  const particles = useMemo(() => {
    if (prefersReducedMotion || liteVisuals) return [];
    const count = 8;
    return Array.from({ length: count }).map((_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const distance = 120 + ((i * 137) % 80);
      const duration = 0.45 + ((i * 11) % 5) * 0.06;
      const hue = i % 2 === 0 ? 'bg-slate-400/55' : 'bg-[#c4a77d]/50';
      return {
        angle,
        distance,
        duration,
        hue,
        delay: i * 0.03,
        cosA: Math.cos(angle) * distance,
        sinA: Math.sin(angle) * distance,
      };
    });
  }, [prefersReducedMotion, liteVisuals]);

  const contextValue = useMemo(
    () => ({ lang, setLang, isTransitioning }),
    [lang, setLang, isTransitioning]
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      <AnimatePresence>
        {isTransitioning && !skipTransition && (
          <motion.div
            key="lang-transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[9999999] pointer-events-none flex items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/75 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: [0.85, 1.08, 1], opacity: [0, 0.35, 0.2] }}
              exit={{ scale: 1.05, opacity: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="absolute h-[min(90vw,420px)] w-[min(90vw,420px)] rounded-full bg-gradient-to-tr from-slate-600/20 via-[#6b5429]/12 to-transparent blur-3xl"
            />
            {particles.map((p, i) => (
              <motion.div
                key={`p-${i}`}
                initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                animate={{
                  x: p.cosA,
                  y: p.sinA,
                  scale: [0, 1.1, 0],
                  opacity: [0, 0.95, 0],
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`absolute h-2 w-2 rounded-full ${p.hue} shadow-[0_0_10px_rgba(196,167,125,0.35)]`}
                style={{
                  left: '50%',
                  top: '50%',
                  marginLeft: -4,
                  marginTop: -4,
                  willChange: 'transform, opacity',
                }}
              />
            ))}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.35, opacity: [0, 0.45, 0] }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="absolute h-32 w-32 rounded-full border border-stone-500/35 shadow-[0_0_40px_rgba(0,0,0,0.25)]"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        animate={{
          opacity: isTransitioning && !skipTransition ? 0.78 : 1,
          y: isTransitioning && !skipTransition ? 5 : 0,
        }}
        transition={{
          duration: 0.32,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="relative z-10"
      >
        {children}
      </motion.div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
