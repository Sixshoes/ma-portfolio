'use client';

import { ReactLenis } from 'lenis/react';
import { useIsMobile } from '@/hooks/use-mobile';

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  return (
    <ReactLenis 
      root 
      options={{ 
        lerp: 0.08, 
        duration: 1.2, 
        smoothWheel: !isMobile,
        syncTouch: false, // Let mobile use native touch scrolling
      }}
    >
      {children}
    </ReactLenis>
  );
}
