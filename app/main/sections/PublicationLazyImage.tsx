'use client';

import Image, { type ImageProps } from 'next/image';
import { useEffect, useRef, useState } from 'react';

const ROOT_MARGIN = '280px 0px';

type PublicationLazyImageProps = Omit<ImageProps, 'src'> & {
  src: string;
  /** 首屏 N 張：立即掛載 <Image>；其餘等接近視窗再掛載，減少同時解碼 */
  eager: boolean;
};

/**
 * 論文遠端圖：非 eager 時延後掛載 next/image，避免列表一次拉進大量圖片造成手機卡頓。
 * 外層請維持 `position: relative` 與固定比例（如 aspect-video）。
 */
export function PublicationLazyImage({
  eager,
  src,
  alt,
  fill,
  className,
  sizes,
  priority,
  ...rest
}: PublicationLazyImageProps) {
  const [mounted, setMounted] = useState(eager);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (eager || mounted) return;
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((e) => e.isIntersecting);
        if (hit) {
          setMounted(true);
          io.disconnect();
        }
      },
      { root: null, rootMargin: ROOT_MARGIN, threshold: 0.01 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [eager, mounted]);

  return (
    <div ref={wrapRef} className={fill ? 'absolute inset-0' : 'relative size-full min-h-0'}>
      {mounted ? (
        <Image
          src={src}
          alt={alt}
          fill={fill}
          className={className}
          sizes={sizes}
          priority={priority}
          loading={priority ? undefined : 'lazy'}
          decoding="async"
          {...rest}
        />
      ) : (
        <div
          className={
            fill
              ? 'absolute inset-0 flex items-center justify-center p-2'
              : 'flex size-full items-center justify-center p-1'
          }
          aria-hidden
        >
          <div className="size-full max-h-full max-w-full rounded-lg bg-gradient-to-b from-teal-500/[0.07] to-transparent ring-1 ring-inset ring-white/[0.06]" />
        </div>
      )}
    </div>
  );
}
