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
    }, 300); // 300ms fade out
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, isTransitioning }}>
      <div 
        style={{ 
          opacity: isTransitioning ? 0 : 1, 
          filter: isTransitioning ? 'blur(8px)' : 'blur(0px)',
          transition: 'opacity 0.3s ease-in-out, filter 0.3s ease-in-out' 
        }}
      >
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
