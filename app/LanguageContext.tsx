'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

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
    
    setTimeout(() => {
      setLangState(newLang);
      localStorage.setItem('preferred_lang', newLang);
      
      setTimeout(() => {
        setIsTransitioning(false);
      }, 600); // Wait for particles to regroup
    }, 600); // Wait for particles to scatter
  };

  const particles = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      angle: (i / 40) * Math.PI * 2,
      size: ((i * 137) % 20) + 10,
      color: i % 2 === 0 ? 'rgba(20,184,166,0.6)' : 'rgba(245,158,11,0.6)',
    }));
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang, isTransitioning }}>
      {/* Particle Scattering Overlay */}
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 9999,
          overflow: 'hidden',
          display: isTransitioning ? 'block' : 'none',
        }}
      >
        {particles.map((p, i) => {
          const distance = isTransitioning ? '150vw' : '0vw';
          
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                borderRadius: '50%',
                boxShadow: `0 0 20px ${p.color}`,
                transform: `translate(-50%, -50%) translate(${isTransitioning ? `calc(${Math.cos(p.angle)} * ${distance})` : '0px'}, ${isTransitioning ? `calc(${Math.sin(p.angle)} * ${distance})` : '0px'}) scale(${isTransitioning ? 0 : 1})`,
                transition: 'all 0.8s cubic-bezier(0.19, 1, 0.22, 1)',
                opacity: isTransitioning ? 1 : 0,
              }}
            />
          );
        })}
      </div>

      <div 
        style={{ 
          opacity: isTransitioning ? 0 : 1, 
          filter: isTransitioning ? 'blur(20px)' : 'none',
          transform: isTransitioning ? 'scale(0.8)' : 'scale(1)',
          transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          transformOrigin: 'center center',
          willChange: 'transform, filter, opacity'
        }}
      >
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
