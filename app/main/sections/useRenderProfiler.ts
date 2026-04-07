'use client';

import { useEffect, useRef } from 'react';

export function useRenderProfiler(name: string) {
  const renderCount = useRef(0);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    renderCount.current += 1;
    // Debug-only profiling signal for section-level re-renders.
    console.debug(`[render-profiler] ${name}:`, renderCount.current);
  });
}
