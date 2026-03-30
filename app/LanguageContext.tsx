'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

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

  // Load saved language from localStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('preferred_lang') as Lang;
    if (savedLang === 'en' || savedLang === 'zh') {
      setLangState(savedLang);
    }
  }, []);

  const setLang = (newLang: Lang) => {
    if (newLang === lang) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setLangState(newLang);
      localStorage.setItem('preferred_lang', newLang);
      setIsTransitioning(false);
    }, 400); // 400ms for quantum effect
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, isTransitioning }}>
      <div 
        style={{ 
          opacity: isTransitioning ? 0 : 1, 
          filter: isTransitioning ? 'blur(10px) drop-shadow(15px 0 0 rgba(20, 184, 166, 0.7)) drop-shadow(-15px 0 0 rgba(245, 158, 11, 0.7))' : 'blur(0px) drop-shadow(0 0 0 rgba(0,0,0,0))',
          transform: isTransitioning ? 'scale(0.95)' : 'scale(1)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' 
        }}
      >
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
