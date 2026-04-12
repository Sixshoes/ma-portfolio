'use client';

import Image, { type ImageProps } from 'next/image';

type PublicationLazyImageProps = Omit<ImageProps, 'src'> & {
  src: string;
  eager: boolean;
};

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
  // 直接交給 Next.js 處理，完全移除 useState 與 useEffect 監聽
  return (
    <div className={fill ? 'absolute inset-0' : 'relative size-full min-h-0'}>
      <Image
        src={src}
        alt={alt}
        fill={fill}
        className={className}
        sizes={sizes}
        priority={eager || priority}
        loading={eager || priority ? 'eager' : 'lazy'}
        decoding="async"
        {...rest}
      />
    </div>
  );
}
