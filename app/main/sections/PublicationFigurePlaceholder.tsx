'use client';

import { useId } from 'react';
import { Atom } from 'lucide-react';

/** 無遠端圖時的象牙紙白幾何佔位（不依賴外部圖庫） */
export function PublicationFigurePlaceholder() {
  const rawId = useId();
  const patternId = `pub-ph-grid-${rawId.replace(/:/g, '')}`;

  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#f8f5ef]"
      aria-hidden
    >
      <svg className="absolute inset-0 h-full w-full opacity-[0.45]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={patternId} width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#e5dfd5" strokeWidth="0.7" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
      <div className="relative flex flex-col items-center gap-1.5">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#dfd5c4] bg-white shadow-[0_4px_14px_rgba(20,19,17,0.06)]">
          <Atom className="h-6 w-6 text-[#8a6522]" strokeWidth={1.4} />
        </div>
        <span className="font-mono text-[10px] tracking-[0.22em] text-[#787168]">YRM LAB</span>
      </div>
    </div>
  );
}
