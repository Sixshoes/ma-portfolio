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

  useEffect(() => {
    const savedLang = localStorage.getItem('preferred_lang') as Lang;
    if (savedLang === 'en' || savedLang === 'zh') {
      setTimeout(() => setLangState(savedLang), 0);
    }
  }, []);

  const setLang = (newLang: Lang) => {
    if (newLang === lang) return;
    setIsTransitioning(true);
    
    // Phase 1: Scatter/Flash (600ms)
    setTimeout(() => {
      setLangState(newLang);
      localStorage.setItem('preferred_lang', newLang);
      
      // Phase 2: Regroup (800ms)
      setTimeout(() => {
        setIsTransitioning(false);
      }, 800);
    }, 600);
  };

  const particles = useMemo(() => {
    return Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      angle: (i / 80) * Math.PI * 2,
      size: Math.random() * 15 + 5,
      color: i % 2 === 0 ? '#14b8a6' : '#f59e0b', // Teal and Amber
      delay: Math.random() * 0.2,
      speed: 0.5 + Math.random() * 1.5,
    }));
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang, isTransitioning }}>
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] pointer-events-none overflow-hidden"
          >
            {/* Full screen flash */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.6, times: [0, 0.5, 1] }}
              className="absolute inset-0 bg-white mix-blend-overlay"
            />
            
            {/* Quantum Particles */}
            {particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ x: '50vw', y: '50vh', scale: 0, opacity: 0 }}
                animate={{ 
                  x: [
                    '50vw', 
                    `calc(50vw + ${Math.cos(p.angle) * 120}vw)`, 
                    '50vw'
                  ],
                  y: [
                    '50vh', 
                    `calc(50vh + ${Math.sin(p.angle) * 120}vh)`, 
                    '50vh'
                  ],
                  scale: [0, 2, 0],
                  opacity: [0, 1, 0],
                  rotate: [0, 360]
                }}
                transition={{ 
                  duration: 1.4, 
                  ease: "easeInOut",
                  delay: p.delay 
                }}
                style={{
                  position: 'absolute',
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.color,
                  borderRadius: '50%',
                  boxShadow: `0 0 30px ${p.color}`,
                  filter: 'blur(2px)',
                }}
              />
            ))}

            {/* Central Energy Pulse */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 4, 0], opacity: [0, 0.5, 0] }}
              transition={{ duration: 1.2, ease: "circOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-tr from-teal-500 to-amber-500 blur-3xl"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        animate={{ 
          opacity: isTransitioning ? 0 : 1,
          scale: isTransitioning ? 0.9 : 1,
          filter: isTransitioning ? 'blur(15px)' : 'blur(0px)',
        }}
        transition={{ 
          duration: 0.6,
          ease: [0.4, 0, 0.2, 1]
        }}
        style={{ 
          transformOrigin: 'center center',
          willChange: 'transform, filter, opacity'
        }}
      >
        {children}
      </motion.div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
