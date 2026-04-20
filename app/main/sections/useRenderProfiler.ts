'use client';

import { useEffect, useRef } from 'react';

/**
 * Dev-only render profiler. In production builds the function body is empty,
 * so no ref is allocated and no effect is registered — zero overhead.
 */
export function useRenderProfiler(name: string) {
  if (process.env.NODE_ENV !== 'development') return;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const renderCount = useRef(0);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    renderCount.current += 1;
    console.debug(`[render-profiler] ${name}:`, renderCount.current);
  });
}
