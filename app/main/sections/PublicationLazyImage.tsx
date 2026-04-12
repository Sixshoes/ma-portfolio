'use client';

import Image, { type ImageProps } from 'next/image';

type PublicationLazyImageProps = Omit<ImageProps, 'src'> & {
  src: string;
  /** 首屏 N 張：與 Next/Image priority + loading 協調，略過原生 lazy */
  eager: boolean;
};

/**
 * 論文遠端圖：以 Next.js Image 內建 lazy / decoding 為主，避免每張圖各掛一個 IntersectionObserver。
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
  const eagerLoad = eager || priority;

  return (
    <div className={fill ? 'absolute inset-0' : 'relative size-full min-h-0'}>
      <Image
        src={src}
        alt={alt}
        fill={fill}
        className={className}
        sizes={sizes}
        priority={eagerLoad}
        loading={eagerLoad ? 'eager' : 'lazy'}
        decoding="async"
        {...rest}
      />
    </div>
  );
}
