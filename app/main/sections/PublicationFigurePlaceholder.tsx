'use client';

import { useId } from 'react';
import { Atom } from 'lucide-react';

/** 無遠端圖時的黑底建築製圖佔位板 */
export function PublicationFigurePlaceholder() {
  const rawId = useId();
  const patternId = `pub-ph-grid-${rawId.replace(/:/g, '')}`;

  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#12110f]"
      aria-hidden
    >
      <svg className="absolute inset-0 h-full w-full opacity-[0.22]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={patternId} width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
      <div className="relative flex flex-col items-center gap-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#c8a464]/30 bg-[#0a0a09]">
          <Atom className="h-5 w-5 text-[#c8a464]/75" strokeWidth={1.25} />
        </div>
        <span className="font-mono text-[10px] tracking-[0.26em] text-[#7d7870]">YRM ARCHIVE</span>
      </div>
    </div>
  );
}
