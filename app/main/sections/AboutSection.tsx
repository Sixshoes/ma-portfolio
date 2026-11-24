'use client';

import React, { memo, useCallback, useRef, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react';
import { EDITORIAL_EASE, InkRule } from '@/app/components/EditorialMotion';
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

/** 左側年份、右側內文的無框學報時間尺規列 */
function renderChronoRow(text: string) {
  const match = text.match(/(.*?)\s*\(([^)]+)\)$/);
  if (match) {
    return (
      <div className="flex flex-col gap-1 border-b border-[var(--app-rule)] px-2 py-4 transition-colors duration-150 last:border-b-0 hover:bg-[var(--app-hover)] sm:flex-row sm:items-baseline sm:gap-6">
        <span className="font-mono text-xs leading-snug text-[var(--app-muted)] [font-variant-numeric:tabular-nums] sm:w-44 sm:shrink-0">
          {match[2]}
        </span>
        <span className="flex-1 text-[15px] leading-relaxed text-[var(--app-ink)]">
          {match[1]}
        </span>
      </div>
    );
  }
  return (
    <div className="border-b border-[var(--app-rule)] px-2 py-4 text-[15px] leading-relaxed text-[var(--app-ink)] last:border-b-0 hover:bg-[var(--app-hover)]">
      {text}
    </div>
  );
}

function AboutSectionComponent({ aboutText, lang }: AboutSectionProps) {
  useRenderProfiler('AboutSection');
  const reduceMotion = useReducedMotion();
  const [tab, setTab] = useState<AboutTab>('roles');
  const [isExpandedAdmin, setIsExpandedAdmin] = useState(false);
  const [isExpandedService, setIsExpandedService] = useState(false);
  const tabRefs = useRef<Record<AboutTab, HTMLButtonElement | null>>({
    roles: null,
    admin: null,
    service: null,
    awards: null,
  });

  const tablistLabel = lang === 'zh' ? '學術履歷分類' : 'Resume categories';

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
      className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20 md:py-24"
    >
      <div className="pb-4">
        <h2 className={uiTokens.sectionTitle}>
          {aboutText.title}
          {lang === 'en' ? ' ' : ''}
          {aboutText.subtitle}
        </h2>
      </div>
      <InkRule thick className="mb-10" />

      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
        {/* 左側無框黏性章節目錄（搭配 layoutId="aboutTabInk" 垂直物理滑動墨線） */}
        <div className="lg:sticky lg:top-24 lg:col-span-4">
          <h3 className="font-editorial mb-3 text-xl font-semibold text-[var(--app-ink)]">
            {aboutText.leadership}
          </h3>
          <p className="mb-8 text-sm leading-[1.8] text-[var(--app-body)]">
            {aboutText.leadershipDesc}
          </p>

          <LayoutGroup id="about-tabs">
            <div
              role="tablist"
              aria-label={tablistLabel}
              className="divide-y divide-[var(--app-rule)] border-y border-[var(--app-ink)]"
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
                    className={`relative flex w-full items-center justify-between py-3.5 pl-4 pr-2 text-left transition-colors ${
                      selected
                        ? 'bg-[var(--app-hover)]/75 font-semibold text-[var(--app-ink)]'
                        : 'text-[var(--app-muted)] hover:bg-[var(--app-hover)]/45 hover:text-[var(--app-ink)]'
                    }`}
                  >
                    {selected ? (
                      <motion.span
                        layoutId={reduceMotion ? undefined : 'aboutTabInk'}
                        transition={{ duration: 0.3, ease: EDITORIAL_EASE }}
                        aria-hidden="true"
                        className="absolute bottom-1.5 left-0 top-1.5 w-[2.5px] bg-[var(--app-accent)]"
                      />
                    ) : null}
                    <span className="text-sm">{label}</span>
                    <span className="font-mono text-xs text-[var(--app-muted)] [font-variant-numeric:tabular-nums]">
                      {String(count).padStart(2, '0')}
                    </span>
                  </button>
                );
              })}
            </div>
          </LayoutGroup>
        </div>

        {/* 右側無框編年履歷表（切換帶 180ms 淡入微移） */}
        <div className="min-h-[18rem] lg:col-span-8">
          <AnimatePresence mode="wait" initial={false}>
            {tab === 'roles' ? (
              <motion.div
                key="panel-roles"
                role="tabpanel"
                id="about-panel-roles"
                aria-labelledby="about-tab-roles"
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                transition={{ duration: reduceMotion ? 0 : 0.18, ease: EDITORIAL_EASE }}
                className="space-y-10"
              >
                <div>
                  <h4 className="font-editorial mb-3 text-base font-semibold text-[var(--app-ink)]">
                    {aboutText.roleLabel}
                  </h4>
                  <div className="border-y border-[var(--app-ink)]">
                    {aboutText.roles.map((role, idx) => (
                      <div key={idx}>{renderChronoRow(role)}</div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-editorial mb-3 text-base font-semibold text-[var(--app-ink)]">
                    {aboutText.eduLabel}
                  </h4>
                  <div className="border-y border-[var(--app-ink)]">
                    {aboutText.edu.map((eduItem, idx) => (
                      <div key={idx}>{renderChronoRow(eduItem)}</div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : null}

            {tab === 'admin' ? (
              <motion.div
                key="panel-admin"
                role="tabpanel"
                id="about-panel-admin"
                aria-labelledby="about-tab-admin"
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                transition={{ duration: reduceMotion ? 0 : 0.18, ease: EDITORIAL_EASE }}
              >
                <h4 className="font-editorial mb-3 text-base font-semibold text-[var(--app-ink)]">
                  {aboutText.adminLabel}
                </h4>
                <div className="border-y border-[var(--app-ink)]">
                  {(isExpandedAdmin ? aboutText.admin : aboutText.admin.slice(0, 6)).map(
                    (item, idx) => (
                      <div key={idx}>{renderChronoRow(item)}</div>
                    ),
                  )}
                </div>
                {aboutText.admin.length > 6 && (
                  <button
                    type="button"
                    onClick={() => setIsExpandedAdmin(!isExpandedAdmin)}
                    className={`${uiTokens.buttonOutline} mt-6 px-5 py-2 text-xs`}
                  >
                    {isExpandedAdmin
                      ? lang === 'zh'
                        ? '收起清單'
                        : 'Show less'
                      : lang === 'zh'
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
                id="about-panel-service"
                aria-labelledby="about-tab-service"
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                transition={{ duration: reduceMotion ? 0 : 0.18, ease: EDITORIAL_EASE }}
              >
                <h4 className="font-editorial mb-3 text-base font-semibold text-[var(--app-ink)]">
                  {aboutText.serviceLabel}
                </h4>
                <div className="border-y border-[var(--app-ink)]">
                  {(isExpandedService ? aboutText.service : aboutText.service.slice(0, 6)).map(
                    (item, idx) => (
                      <div key={idx}>{renderChronoRow(item)}</div>
                    ),
                  )}
                </div>
                {aboutText.service.length > 6 && (
                  <button
                    type="button"
                    onClick={() => setIsExpandedService(!isExpandedService)}
                    className={`${uiTokens.buttonOutline} mt-6 px-5 py-2 text-xs`}
                  >
                    {isExpandedService
                      ? lang === 'zh'
                        ? '收起清單'
                        : 'Show less'
                      : lang === 'zh'
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
                id="about-panel-awards"
                aria-labelledby="about-tab-awards"
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                transition={{ duration: reduceMotion ? 0 : 0.18, ease: EDITORIAL_EASE }}
              >
                <h4 className="font-editorial mb-3 text-base font-semibold text-[var(--app-ink)]">
                  {aboutText.awardsLabel}
                </h4>
                <div className="border-y border-[var(--app-ink)]">
                  {aboutText.awards.map((item, idx) => (
                    <div key={idx}>{renderChronoRow(item)}</div>
                  ))}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

export const AboutSection = memo(AboutSectionComponent);
