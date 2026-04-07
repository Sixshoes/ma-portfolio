'use client';

import { ReactLenis } from 'lenis/react';
import { useEffect, useState } from 'react';

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)');
    const onChange = () => setIsMobile(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return (
    <ReactLenis 
      root 
      options={{ 
        lerp: 0.08, 
        duration: 1.2, 
        smoothWheel: !isMobile,
        syncTouch: false,
      }}
    >
      {children}
    </ReactLenis>
  );
}
