'use client';

import React, { memo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Sparkles, ZoomIn } from 'lucide-react';
import type { ChalkboardItem } from '@/lib/chalkboards';
import type { FigureLightboxPayload } from './FigureLightboxModal';
import { ChalkboardFallbackGraphic } from './ChalkboardFallbackGraphic';
import { EDITORIAL_EASE } from './EditorialMotion';

type ChalkboardGallerySectionProps = {
  chalkboards: ChalkboardItem[];
  lang: 'en' | 'zh';
  onOpenLightbox: (payload: FigureLightboxPayload) => void;
};

/** 滿版深墨綠黑板展廳上半層：馬遠榮副校長親筆黑板手稿藝廊（溫潤圓角、點擊全螢幕賞析粉筆字跡） */
function ChalkboardGallerySectionComponent({
  chalkboards,
  lang,
  onOpenLightbox,
}: ChalkboardGallerySectionProps) {
  const reduceMotion = useReducedMotion();
  const [failedIds, setFailedIds] = useState<Record<string, boolean>>({});
  const isZh = lang === 'zh';

  if (chalkboards.length === 0) return null;

  const isSingle = chalkboards.length === 1;

  return (
    <div className="mb-14">
      <div className="mb-7 flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F3DF87]/35 bg-[#152820] px-3 py-1 font-mono text-[11px] font-medium tracking-wider text-[#F3DF87]">
            <Sparkles className="h-3 w-3" aria-hidden />
            {isZh ? '講堂親筆手稿典藏' : 'LECTURE CHALKBOARD ARCHIVE'}
          </span>
          <h2 className="font-editorial mt-3 text-3xl font-semibold tracking-tight text-[#F4F1EA] sm:text-4xl">
            {isZh ? '親筆黑板推導手稿藝廊' : 'Handwritten Chalkboard Derivations'}
          </h2>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-[#BFD3C8] md:text-right">
          {isZh
            ? '收錄馬副校長講堂上親手以粉筆推導的量子力學與凝態物理原稿，點擊任一幅即可全螢幕高清放大賞析筆跡與公式。'
            : 'Authentic chalkboard derivations from Prof. Ma’s lectures in quantum mechanics and condensed matter physics. Click any plate to inspect in high resolution.'}
        </p>
      </div>

      {/* 單幅大展板或雙排／橫向手稿畫廊（溫潤圓角 rounded-3xl / rounded-2xl） */}
      <div
        className={
          isSingle
            ? 'grid grid-cols-1'
            : 'grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3'
        }
      >
        {chalkboards.map((item, idx) => {
          const plateNum = `PLATE ${String(idx + 1).padStart(2, '0')}`;
          const imgFailed = Boolean(failedIds[item.id]);
          const title = isZh ? item.titleZh : item.titleEn;
          const secondaryTitle = isZh ? item.titleEn : item.titleZh;
          const layoutId = `chalkboard-plate-${item.id}`;

          const handleZoom = () => {
            if (imgFailed) return;
            onOpenLightbox({
              layoutId,
              src: item.imageUrl,
              alt: title,
              title,
              journal: item.courseOrTopic || item.formulaNote || 'Chalkboard Derivation',
              year: item.year ? Number(item.year) || undefined : undefined,
            });
          };

          if (isSingle) {
            return (
              <motion.article
                key={item.id}
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: reduceMotion ? 0 : 0.6, ease: EDITORIAL_EASE }}
                className="group overflow-hidden rounded-[26px] border border-[#34594A] bg-[#152820] shadow-[0_20px_50px_-24px_rgba(0,0,0,0.55)]"
              >
                <div className="grid grid-cols-1 items-stretch lg:grid-cols-12">
                  {/* 左 7 欄：手稿實拍圖（無原圖時自動切換精繪粉筆向量板） */}
                  <div
                    onClick={handleZoom}
                    className={`relative aspect-[16/10] w-full overflow-hidden bg-[#12221B] lg:col-span-7 lg:aspect-auto lg:min-h-[300px] ${
                      imgFailed ? '' : 'cursor-zoom-in'
                    }`}
                  >
                    {imgFailed ? (
                      <ChalkboardFallbackGraphic />
                    ) : (
                      <motion.div
                        layoutId={reduceMotion ? undefined : layoutId}
                        className="h-full w-full"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.imageUrl}
                          alt={title}
                          loading="lazy"
                          onError={() =>
                            setFailedIds((prev) => ({ ...prev, [item.id]: true }))
                          }
                          className="h-full w-full object-cover object-[70%_35%] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                        />
                      </motion.div>
                    )}

                    <span className="absolute left-4 top-4 rounded-full border border-[#F3DF87]/45 bg-[#152820]/85 px-3 py-1 font-mono text-[11px] font-semibold text-[#F3DF87] backdrop-blur-sm">
                      {plateNum}
                    </span>

                    {!imgFailed ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleZoom();
                        }}
                        aria-label={isZh ? '全螢幕放大檢視黑板手稿' : 'Inspect chalkboard in full screen'}
                        className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full border border-[#F3DF87]/45 bg-[#152820]/90 px-3.5 py-1.5 text-xs font-medium text-[#F4F1EA] backdrop-blur-sm transition-colors hover:bg-[#F3DF87] hover:text-[#152820]"
                      >
                        <ZoomIn className="h-3.5 w-3.5" aria-hidden />
                        {isZh ? '放大賞析筆跡' : 'Inspect Chalk'}
                      </button>
                    ) : null}
                  </div>

                  {/* 右 5 欄：策展說明與關鍵公式籤 */}
                  <div className="flex flex-col justify-between gap-6 p-6 sm:p-8 lg:col-span-5">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {item.courseOrTopic ? (
                          <span className="rounded-full bg-[#213F33] px-3 py-1 font-mono text-[11px] text-[#BFD3C8]">
                            {item.courseOrTopic}
                          </span>
                        ) : null}
                        {item.year ? (
                          <span className="font-mono text-[11px] text-[#E88D84]">
                            {item.year}
                          </span>
                        ) : null}
                      </div>

                      <h3 className="font-editorial mt-4 text-2xl font-semibold leading-snug text-[#F4F1EA]">
                        {title}
                      </h3>
                      {secondaryTitle && secondaryTitle !== title ? (
                        <p className="mt-1.5 text-sm text-[#9FB8AC]">{secondaryTitle}</p>
                      ) : null}

                      {item.formulaNote ? (
                        <div className="mt-5 rounded-2xl border border-[#F3DF87]/30 bg-[#1B3329] p-4">
                          <div className="font-mono text-[10px] uppercase tracking-wider text-[#E88D84]">
                            {isZh ? '推導核心方程' : 'KEY DERIVATION'}
                          </div>
                          <div className="mt-1.5 break-words font-mono text-sm leading-relaxed text-[#F3DF87]">
                            {item.formulaNote}
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <p className="text-xs leading-relaxed text-[#9FB8AC]">
                      {isZh
                        ? '從位能障邊界波函數連續條件出發，以雙曲函數展開推得電子穿隧穿透率，為掃描穿隧顯微術（STM）與低維量子元件物理之基石。'
                        : 'Derived from wave-function continuity across a rectangular potential barrier—forming the physical foundation of scanning tunneling microscopy (STM) and low-dimensional quantum devices.'}
                    </p>
                  </div>
                </div>
              </motion.article>
            );
          }

          return (
            <motion.article
              key={item.id}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{
                duration: reduceMotion ? 0 : 0.5,
                delay: reduceMotion ? 0 : idx * 0.06,
                ease: EDITORIAL_EASE,
              }}
              className="group flex flex-col overflow-hidden rounded-2xl border border-[#34594A] bg-[#152820] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#F3DF87]/60"
            >
              <div
                onClick={handleZoom}
                className={`relative aspect-[16/10] w-full overflow-hidden bg-[#12221B] ${
                  imgFailed ? '' : 'cursor-zoom-in'
                }`}
              >
                {imgFailed ? (
                  <ChalkboardFallbackGraphic />
                ) : (
                  <motion.div
                    layoutId={reduceMotion ? undefined : layoutId}
                    className="h-full w-full"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt={title}
                      loading="lazy"
                      onError={() =>
                        setFailedIds((prev) => ({ ...prev, [item.id]: true }))
                      }
                      className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                    />
                  </motion.div>
                )}

                <span className="absolute left-3 top-3 rounded-full border border-[#F3DF87]/40 bg-[#152820]/85 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-[#F3DF87] backdrop-blur-sm">
                  {plateNum}
                </span>

                {!imgFailed ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleZoom();
                    }}
                    aria-label={isZh ? '放大檢視黑板手稿' : 'Zoom chalkboard'}
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-[#F3DF87]/40 bg-[#152820]/85 text-[#F4F1EA] opacity-90 transition-colors hover:bg-[#F3DF87] hover:text-[#152820]"
                  >
                    <ZoomIn className="h-3.5 w-3.5" aria-hidden />
                  </button>
                ) : null}
              </div>

              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <div className="flex items-center justify-between gap-2 text-[11px] text-[#9FB8AC]">
                    <span className="truncate font-mono">{item.courseOrTopic || 'Physics Lecture'}</span>
                    {item.year ? (
                      <span className="shrink-0 font-mono text-[#E88D84]">{item.year}</span>
                    ) : null}
                  </div>
                  <h3 className="font-editorial mt-2 line-clamp-2 text-lg font-semibold leading-snug text-[#F4F1EA] group-hover:text-[#F3DF87]">
                    {title}
                  </h3>
                </div>

                {item.formulaNote ? (
                  <p className="mt-3 line-clamp-2 rounded-xl border border-[#2F5243] bg-[#1B3329] px-3 py-2 font-mono text-[11px] text-[#F3DF87]">
                    {item.formulaNote}
                  </p>
                ) : null}
              </div>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}

export const ChalkboardGallerySection = memo(ChalkboardGallerySectionComponent);
