'use client';

import { useId } from 'react';
import { Atom } from 'lucide-react';

/** 無遠端圖時的站內佔位，與全站青綠／琥珀主題一致（不依賴外部圖庫） */
export function PublicationFigurePlaceholder() {
  const rawId = useId();
  const patternId = `pub-ph-grid-${rawId.replace(/:/g, '')}`;

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          background: `
            radial-gradient(ellipse 72% 58% at 38% 42%, rgba(45, 212, 191, 0.14), transparent 56%),
            radial-gradient(ellipse 58% 48% at 72% 62%, rgba(251, 191, 36, 0.09), transparent 52%)
          `,
        }}
      />
      <svg className="absolute inset-0 h-full w-full opacity-[0.11]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={patternId} width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M 28 0 L 0 0 0 28" fill="none" stroke="rgba(45,212,191,0.4)" strokeWidth="0.45" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
      <div className="relative flex flex-col items-center gap-1">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-teal-500/35 bg-teal-500/[0.09] shadow-[0_0_28px_rgba(45,212,191,0.15)]">
          <Atom className="h-7 w-7 text-teal-400/80" strokeWidth={1.2} />
        </div>
      </div>
    </div>
  );
}
