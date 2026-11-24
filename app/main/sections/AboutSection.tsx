'use client';

import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react';
import { Award } from 'lucide-react';
import { EDITORIAL_EASE, InkRule } from '@/app/components/EditorialMotion';
import { getPreferredScrollBehavior } from '@/lib/clientUtils';
import { useRenderProfiler } from './useRenderProfiler';
import { uiTokens } from './uiTokens';

type AboutText = {
  title: string;
  subtitle: string;
  rolesEduTab: string;
  leadership: string;
  leadershipDesc: string;
  roleLabel: string;
  roles: string[];
  eduLabel: string;
  edu: string[];
  adminLabel: string;
  admin: string[];
  serviceLabel: string;
  service: string[];
  awardsLabel: string;
  awards: string[];
};

type AboutSectionProps = {
  aboutText: AboutText;
  lang: 'en' | 'zh';
};

const TAB_IDS = ['roles', 'admin', 'service', 'awards'] as const;
type AboutTab = (typeof TAB_IDS)[number];

function splitTitleAndDate(text: string): { main: string; period: string | null } {
  const match = text.match(/(.*?)\s*\(([^)]+)\)$/);
  if (match) return { main: match[1].trim(), period: match[2].trim() };
  return { main: text.trim(), period: null };
}

function renderChronoRow(text: string, key: number) {
  const { main, period } = splitTitleAndDate(text);
  if (period) {
    return (
      <div
        key={key}
        className="flex flex-col gap-1 border-b border-[var(--app-rule)]/70 px-3 py-4 transition-colors duration-150 last:border-b-0 hover:bg-[var(--app-hover)]/60 sm:flex-row sm:items-baseline sm:gap-5"
      >
        <span className="font-mono text-sm leading-snug text-[var(--app-muted)] [font-variant-numeric:tabular-nums] sm:w-48 sm:shrink-0">
          {period}
        </span>
        <span className="flex-1 text-base leading-relaxed text-[var(--app-ink)]">
          {main}
        </span>
      </div>
    );
  }
  return (
    <div
      key={key}
      className="border-b border-[var(--app-rule)]/70 px-3 py-4 text-base leading-relaxed text-[var(--app-ink)] last:border-b-0 hover:bg-[var(--app-hover)]/60"
    >
      {main}
    </div>
  );
}

function AboutSectionComponent({ aboutText, lang }: AboutSectionProps) {
  useRenderProfiler('AboutSection');
  const reduceMotion = useReducedMotion();
  const [tab, setTab] = useState<AboutTab>('roles');
  const [isExpandedAdmin, setIsExpandedAdmin] = useState(false);
  const [isExpandedService, setIsExpandedService] = useState(false);
  const [portraitError, setPortraitError] = useState(false);
  const portraitImgRef = useRef<HTMLImageElement>(null);
  const panelWrapRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<AboutTab, HTMLButtonElement | null>>({
    roles: null,
    admin: null,
    service: null,
    awards: null,
  });

  useEffect(() => {
    const img = portraitImgRef.current;
    if (img && img.complete && img.naturalWidth === 0) {
      setPortraitError(true);
    }
  }, []);

  const handleViewAllAwards = useCallback(() => {
    setTab('awards');
    window.requestAnimationFrame(() => {
      panelWrapRef.current?.scrollIntoView({
        behavior: getPreferredScrollBehavior(),
        block: 'start',
      });
    });
  }, []);

  const isZh = lang === 'zh';
  const tablistLabel = isZh ? '學術履歷分類' : 'Resume categories';
  const highlightedHonors = aboutText.awards.slice(0, 6);

  const handleTabKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, currentId: AboutTab) => {
      const idx = TAB_IDS.indexOf(currentId);
      let nextIdx: number | null = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextIdx = (idx + 1) % TAB_IDS.length;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp')
        nextIdx = (idx - 1 + TAB_IDS.length) % TAB_IDS.length;
      else if (e.key === 'Home') nextIdx = 0;
      else if (e.key === 'End') nextIdx = TAB_IDS.length - 1;

      if (nextIdx !== null) {
        e.preventDefault();
        const nextId = TAB_IDS[nextIdx];
        setTab(nextId);
        tabRefs.current[nextId]?.focus();
      }
    },
    [],
  );

  const tabs: { id: AboutTab; label: string; count: number }[] = [
    { id: 'roles', label: aboutText.rolesEduTab, count: aboutText.roles.length + aboutText.edu.length },
    { id: 'admin', label: aboutText.adminLabel, count: aboutText.admin.length },
    { id: 'service', label: aboutText.serviceLabel, count: aboutText.service.length },
    { id: 'awards', label: aboutText.awardsLabel, count: aboutText.awards.length },
  ];

  return (
    <section
      id="about"
      className="scroll-mt-16 bg-[var(--app-bg-warm)] py-20 md:py-24"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="pb-4">
          <h2 className={uiTokens.sectionTitle}>
            {lang === 'en'
              ? `${aboutText.title} ${aboutText.subtitle}`
              : `${aboutText.title}${aboutText.subtitle}`}
          </h2>
        </div>
        <InkRule thick className="mb-8" />

        {/* 頂部直接公開展示 6 項重點榮譽獎章帶（溫潤圓角卡片，不必點進分頁才看得到） */}
        {highlightedHonors.length > 0 ? (
          <div className="mb-10">
            <div className="mb-4 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C88A2B]/15 px-3.5 py-1 font-mono text-xs font-semibold text-[#8A560B] dark:text-[#F3DF87]">
                <Award className="h-4 w-4" aria-hidden />
                {isZh ? '重點國際榮譽與院士頭銜' : 'FEATURED HONORS & FELLOWSHIPS'}
              </span>
              <button
                type="button"
                onClick={handleViewAllAwards}
                className="text-sm font-medium text-[var(--app-accent)] hover:underline"
              >
                {isZh ? `查看全部 ${aboutText.awards.length} 項 →` : `View all ${aboutText.awards.length} →`}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {highlightedHonors.map((honor, idx) => {
                const { main, period } = splitTitleAndDate(honor);
                return (
                  <motion.div
                    key={idx}
                    initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{
                      duration: reduceMotion ? 0 : 0.4,
                      delay: reduceMotion ? 0 : idx * 0.04,
                      ease: EDITORIAL_EASE,
                    }}
                    className="flex items-start gap-3 rounded-2xl border border-[var(--app-rule)] bg-[var(--app-surface-card)] p-4 shadow-xs transition-colors hover:border-[#C88A2B]/60"
                  >
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#C88A2B]/15 text-[#8A560B] dark:text-[#F3DF87]">
                      <Award className="h-4 w-4" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-medium leading-snug text-[var(--app-ink)]">
                        {main}
                      </p>
                      {period ? (
                        <span className="mt-1.5 inline-block rounded-full bg-[var(--app-hover)] px-2.5 py-0.5 font-mono text-xs text-[var(--app-muted)]">
                          {period}
                        </span>
                      ) : null}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">
          {/* 左側黏性個人小檔案欄：整合原 /profile.jpg 溫潤圓角相紙肖像 ＋ 滑動墨線分頁選單 */}
          <div className="lg:sticky lg:top-24 lg:col-span-4">
            <div className="atlas-card overflow-hidden p-5">
              <div className="mb-5 flex items-center gap-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-[var(--app-rule)] bg-[var(--portrait-mat)]">
                  {portraitError ? (
                    <div className="font-editorial flex h-full w-full items-center justify-center text-lg font-semibold text-[var(--app-muted)]">
                      YRM
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      ref={portraitImgRef}
                      src="/profile-avatar.webp"
                      alt={isZh ? '馬遠榮副校長肖像照' : 'Portrait of Prof. Yuan-Ron Ma'}
                      width={80}
                      height={80}
                      loading="lazy"
                      onError={() => setPortraitError(true)}
                      className="h-full w-full scale-110 object-cover object-[50%_18%] mix-blend-multiply contrast-[1.04]"
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-editorial text-xl font-semibold text-[var(--app-ink)]">
                    {isZh ? '馬遠榮 副校長' : 'Prof. Yuan-Ron Ma'}
                  </h3>
                  <p className="mt-0.5 text-sm text-[var(--app-muted)]">
                    {isZh ? '佛光大學 · 國立東華大學' : 'Fo Guang University · NDHU'}
                  </p>
                  <span className="mt-1.5 inline-block rounded-full bg-[var(--app-hover)] px-2.5 py-0.5 font-mono text-xs text-[var(--app-accent)]">
                    {aboutText.leadership}
                  </span>
                </div>
              </div>

              <p className="mb-6 text-base leading-[1.8] text-[var(--app-body)]">
                {aboutText.leadershipDesc}
              </p>

              <LayoutGroup id="about-tabs">
                <div
                  role="tablist"
                  aria-label={tablistLabel}
                  aria-orientation="vertical"
                  className="space-y-1 border-t border-[var(--app-rule)] pt-4"
                >
                  {tabs.map(({ id, label, count }) => {
                    const selected = tab === id;
                    return (
                      <button
                        key={id}
                        ref={(el) => {
                          tabRefs.current[id] = el;
                        }}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        tabIndex={selected ? 0 : -1}
                        id={`about-tab-${id}`}
                        aria-controls={`about-panel-${id}`}
                        onClick={() => setTab(id)}
                        onKeyDown={(e) => handleTabKeyDown(e, id)}
                        className={`relative flex w-full items-center justify-between rounded-xl py-3 pl-4 pr-3 text-left transition-colors ${
                          selected
                            ? 'bg-[var(--app-hover)] font-semibold text-[var(--app-ink)]'
                            : 'text-[var(--app-muted)] hover:bg-[var(--app-hover)]/55 hover:text-[var(--app-ink)]'
                        }`}
                      >
                        {selected ? (
                          <motion.span
                            layoutId={reduceMotion ? undefined : 'aboutTabInk'}
                            transition={{ duration: 0.3, ease: EDITORIAL_EASE }}
                            aria-hidden="true"
                            className="absolute bottom-2 left-1 top-2 w-[3px] rounded-full bg-[var(--app-accent)]"
                          />
                        ) : null}
                        <span className="text-base">{label}</span>
                        <span className="rounded-full bg-[var(--app-bg)] px-2.5 py-0.5 font-mono text-xs text-[var(--app-muted)] [font-variant-numeric:tabular-nums]">
                          {String(count).padStart(2, '0')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </LayoutGroup>
            </div>
          </div>

          {/* 右側溫潤圓角編年履歷卡片 */}
          <div ref={panelWrapRef} className="min-h-[18rem] scroll-mt-24 lg:col-span-8">
            <AnimatePresence mode="wait" initial={false}>
              {tab === 'roles' ? (
                <motion.div
                  key="panel-roles"
                  role="tabpanel"
                  tabIndex={0}
                  id="about-panel-roles"
                  aria-labelledby="about-tab-roles"
                  initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                  transition={{ duration: reduceMotion ? 0 : 0.18, ease: EDITORIAL_EASE }}
                  className="space-y-6"
                >
                  <div className="atlas-card p-5 sm:p-6">
                    <h4 className="font-editorial mb-3 text-lg font-semibold text-[var(--app-ink)]">
                      {aboutText.roleLabel}
                    </h4>
                    <div>{aboutText.roles.map((role, idx) => renderChronoRow(role, idx))}</div>
                  </div>
                  <div className="atlas-card p-5 sm:p-6">
                    <h4 className="font-editorial mb-3 text-lg font-semibold text-[var(--app-ink)]">
                      {aboutText.eduLabel}
                    </h4>
                    <div>{aboutText.edu.map((eduItem, idx) => renderChronoRow(eduItem, idx))}</div>
                  </div>
                </motion.div>
              ) : null}

              {tab === 'admin' ? (
                <motion.div
                  key="panel-admin"
                  role="tabpanel"
                  tabIndex={0}
                  id="about-panel-admin"
                  aria-labelledby="about-tab-admin"
                  initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                  transition={{ duration: reduceMotion ? 0 : 0.18, ease: EDITORIAL_EASE }}
                  className="atlas-card p-5 sm:p-6"
                >
                  <h4 className="font-editorial mb-3 text-lg font-semibold text-[var(--app-ink)]">
                    {aboutText.adminLabel}
                  </h4>
                  <div>
                    {(isExpandedAdmin ? aboutText.admin : aboutText.admin.slice(0, 6)).map(
                      (item, idx) => renderChronoRow(item, idx),
                    )}
                  </div>
                  {aboutText.admin.length > 6 && (
                    <button
                      type="button"
                      onClick={() => setIsExpandedAdmin(!isExpandedAdmin)}
                      className={`${uiTokens.buttonOutline} mt-5 px-6 py-2.5 text-sm`}
                    >
                      {isExpandedAdmin
                        ? isZh
                          ? '收起清單'
                          : 'Show less'
                        : isZh
                          ? `展開其餘 ${aboutText.admin.length - 6} 項`
                          : `Show remaining ${aboutText.admin.length - 6}`}
                    </button>
                  )}
                </motion.div>
              ) : null}

              {tab === 'service' ? (
                <motion.div
                  key="panel-service"
                  role="tabpanel"
                  tabIndex={0}
                  id="about-panel-service"
                  aria-labelledby="about-tab-service"
                  initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                  transition={{ duration: reduceMotion ? 0 : 0.18, ease: EDITORIAL_EASE }}
                  className="atlas-card p-5 sm:p-6"
                >
                  <h4 className="font-editorial mb-3 text-lg font-semibold text-[var(--app-ink)]">
                    {aboutText.serviceLabel}
                  </h4>
                  <div>
                    {(isExpandedService ? aboutText.service : aboutText.service.slice(0, 6)).map(
                      (item, idx) => renderChronoRow(item, idx),
                    )}
                  </div>
                  {aboutText.service.length > 6 && (
                    <button
                      type="button"
                      onClick={() => setIsExpandedService(!isExpandedService)}
                      className={`${uiTokens.buttonOutline} mt-5 px-6 py-2.5 text-sm`}
                    >
                      {isExpandedService
                        ? isZh
                          ? '收起清單'
                          : 'Show less'
                        : isZh
                          ? `展開其餘 ${aboutText.service.length - 6} 項`
                          : `Show remaining ${aboutText.service.length - 6}`}
                    </button>
                  )}
                </motion.div>
              ) : null}

              {tab === 'awards' ? (
                <motion.div
                  key="panel-awards"
                  role="tabpanel"
                  tabIndex={0}
                  id="about-panel-awards"
                  aria-labelledby="about-tab-awards"
                  initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                  transition={{ duration: reduceMotion ? 0 : 0.18, ease: EDITORIAL_EASE }}
                  className="atlas-card p-5 sm:p-6"
                >
                  <h4 className="font-editorial mb-3 text-lg font-semibold text-[var(--app-ink)]">
                    {aboutText.awardsLabel}
                  </h4>
                  <div>{aboutText.awards.map((item, idx) => renderChronoRow(item, idx))}</div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

export const AboutSection = memo(AboutSectionComponent);
