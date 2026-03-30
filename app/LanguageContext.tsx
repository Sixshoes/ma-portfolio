'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

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

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLangState] = useState<Lang>('en');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
      const savedLang = localStorage.getItem('preferred_lang') as Lang;
      if (savedLang === 'en' || savedLang === 'zh') {
        setLangState(savedLang);
      }
    }, 0);
  }, []);

  const setLang = (newLang: Lang) => {
    if (newLang === lang || isTransitioning) return;
    setIsTransitioning(true);
    
    // Quick switch
    setTimeout(() => {
      setLangState(newLang);
      localStorage.setItem('preferred_lang', newLang);
    }, 300);

    // Snappy end
    setTimeout(() => {
      setIsTransitioning(false);
    }, 600);
  };

  const particles = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => {
      const angle = (i / 12) * Math.PI * 2;
      // Deterministic pseudo-random values based on index
      const distance = 100 + ((i * 137) % 50);
      const duration = 0.5 + ((i * 7) % 3) * 0.1;
      return { angle, distance, duration };
    });
  }, []);

  if (!mounted) return <>{children}</>;

  return (
    <LanguageContext.Provider value={{ lang, setLang, isTransitioning }}>
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            key="lang-transition-minimal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999999] pointer-events-none flex items-center justify-center bg-white/10"
          >
            {/* Minimalist Particles */}
            {particles.map((p, i) => {
              return (
                <motion.div
                  key={`p-${i}`}
                  initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                  animate={{ 
                    x: Math.cos(p.angle) * p.distance,
                    y: Math.sin(p.angle) * p.distance,
                    scale: [0, 1, 0],
                    opacity: [0, 0.8, 0],
                  }}
                  transition={{ 
                    duration: p.duration, 
                    ease: "easeOut",
                  }}
                  className="absolute w-2 h-2 rounded-full bg-teal-500/60"
                  style={{
                    left: '50%',
                    top: '50%',
                    marginLeft: '-4px',
                    marginTop: '-4px',
                    willChange: 'transform, opacity',
                  }}
                />
              );
            })}

            {/* Subtle Pulse */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.2, opacity: [0, 0.3, 0] }}
              transition={{ duration: 0.5 }}
              className="absolute w-40 h-40 rounded-full bg-teal-500/10 blur-xl"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        animate={{ 
          opacity: isTransitioning ? 0.3 : 1,
          scale: isTransitioning ? 0.98 : 1,
        }}
        transition={{ 
          duration: 0.4,
          ease: "easeInOut"
        }}
        className="relative z-10"
      >
        {children}
      </motion.div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
