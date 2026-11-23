'use client';

import React, { memo, useCallback, useRef, useState } from 'react';
import { Award, Briefcase, GraduationCap, Users } from 'lucide-react';
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

function renderListItem(text: string) {
  const match = text.match(/(.*?)\s*\(([^)]+)\)$/);
  if (match) {
    return (
      <div className="flex flex-col gap-2 border-b border-stone-800/60 py-3.5 transition-colors last:border-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4 group-hover:border-stone-700/60">
        <span className="font-medium leading-relaxed text-stone-200">{match[1]}</span>
        <span className="w-fit max-w-full rounded-md border border-stone-700/60 bg-stone-900/70 px-2.5 py-1 font-mono text-xs leading-snug text-stone-300 sm:max-w-[44%] sm:shrink-0 sm:text-right">
          {match[2]}
        </span>
      </div>
    );
  }
  return <div className="border-b border-stone-800/60 py-3 leading-relaxed text-stone-200 last:border-0">{text}</div>;
}

function AboutSectionComponent({ aboutText, lang }: AboutSectionProps) {
  useRenderProfiler('AboutSection');
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
      if (e.key === 'ArrowRight') nextIdx = (idx + 1) % TAB_IDS.length;
      else if (e.key === 'ArrowLeft') nextIdx = (idx - 1 + TAB_IDS.length) % TAB_IDS.length;
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

  const summaryHighlights = [
    {
      icon: Briefcase,
      label: aboutText.roleLabel,
      count: aboutText.roles.length,
      targetTab: 'roles' as AboutTab,
    },
    {
      icon: GraduationCap,
      label: aboutText.adminLabel,
      count: aboutText.admin.length,
      targetTab: 'admin' as AboutTab,
    },
    {
      icon: Users,
      label: aboutText.serviceLabel,
      count: aboutText.service.length,
      targetTab: 'service' as AboutTab,
    },
    {
      icon: Award,
      label: aboutText.awardsLabel,
      count: aboutText.awards.length,
      targetTab: 'awards' as AboutTab,
    },
  ];

  const tabs: { id: AboutTab; label: string; count?: number }[] = [
    { id: 'roles', label: aboutText.rolesEduTab },
    { id: 'admin', label: aboutText.adminLabel, count: aboutText.admin.length },
    { id: 'service', label: aboutText.serviceLabel, count: aboutText.service.length },
    { id: 'awards', label: aboutText.awardsLabel, count: aboutText.awards.length },
  ];

  return (
    <section
      id="about"
      className={`mx-auto max-w-7xl scroll-mt-24 px-6 py-24 md:py-32 ${uiTokens.sectionDivider}`}
    >
      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-3 lg:gap-14">
        {/* 實質內容化的黏性左側摘要卡（修正原先空白漸層框與手機版負邊距截斷問題） */}
        <div className="lg:sticky lg:top-28 lg:col-span-1">
          <div className="relative overflow-hidden rounded-3xl border border-stone-700/50 bg-gradient-to-br from-[#211e1b] via-[#191715] to-[#131210] p-7 shadow-[0_18px_48px_rgba(0,0,0,0.45)] md:p-8">
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d4af37]/60 to-transparent"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='none' stroke='%23d4af37' stroke-width='0.4' d='M12 1v22M1 12h22'/%3E%3C/svg%3E")`,
                backgroundSize: '24px 24px',
              }}
              aria-hidden
            />

            <div className="relative z-10">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#c4a77d]/35 bg-[#2a241c]/70 text-[#d4af37]">
                <GraduationCap className="h-6 w-6 stroke-[1.5]" aria-hidden />
              </div>
              <h3 className="font-heading-serif mb-3 text-2xl font-medium tracking-wide text-stone-100">
                {aboutText.leadership}
              </h3>
              <p className="mb-7 text-sm font-light leading-relaxed text-stone-300">
                {aboutText.leadershipDesc}
              </p>

              <div className="grid grid-cols-2 gap-3 border-t border-stone-800/70 pt-6">
                {summaryHighlights.map(({ icon: Icon, label, count, targetTab }) => {
                  const isActive = tab === targetTab;
                  return (
                    <button
                      key={targetTab}
                      type="button"
                      onClick={() => setTab(targetTab)}
                      className={`rounded-2xl border p-3.5 text-left transition-all ${
                        isActive
                          ? 'border-[#c4a77d]/50 bg-[#2a241c]/55'
                          : 'border-stone-800/70 bg-stone-900/45 hover:border-stone-700/80 hover:bg-stone-900/75'
                      }`}
                    >
                      <div className="mb-1.5 flex items-center justify-between">
                        <Icon className="h-4 w-4 text-[#c4a77d]" aria-hidden />
                        <span className="font-mono text-lg font-semibold text-stone-100">{count}</span>
                      </div>
                      <div className="line-clamp-1 text-xs text-stone-300">{label}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <h2 className={`${uiTokens.sectionTitle} mb-8 md:mb-10`}>
            <span className={uiTokens.titleLight}>{aboutText.title}</span> <br />
            <span className={uiTokens.titleBold}>{aboutText.subtitle}</span>
          </h2>

          <div
            role="tablist"
            aria-label={tablistLabel}
            className="mb-8 flex flex-wrap gap-2 border-b border-stone-800/70 pb-4"
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
                  className={`rounded-full px-4 py-2 text-left font-mono text-xs uppercase tracking-[0.14em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c4a77d]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#161514] ${
                    selected
                      ? 'border border-[#c4a77d]/55 bg-[#2a241c]/70 text-[#e8dcc4]'
                      : 'border border-stone-800/70 bg-stone-900/40 text-stone-300 hover:border-stone-700/80 hover:bg-stone-900/75 hover:text-stone-100'
                  }`}
                >
                  {label}
                  {count !== undefined ? (
                    <span className="ml-1.5 text-[11px] opacity-75">({count})</span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="min-h-[12rem]">
            {tab === 'roles' && (
              <div
                role="tabpanel"
                id="about-panel-roles"
                aria-labelledby="about-tab-roles"
                className="space-y-8"
              >
                <div className="group flex gap-5">
                  <div className="min-h-[48px] w-px bg-stone-800 transition-colors group-hover:bg-[#c4a77d]/55" />
                  <div className="min-w-0 flex-1">
                    <div className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-[#d4af37]">
                      {aboutText.roleLabel}
                    </div>
                    <div className="space-y-0.5">
                      {aboutText.roles.map((role, idx) => (
                        <div key={idx}>{renderListItem(role)}</div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="group flex gap-5">
                  <div className="min-h-[48px] w-px bg-stone-800 transition-colors group-hover:bg-stone-600" />
                  <div className="min-w-0 flex-1">
                    <div className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-stone-400">
                      {aboutText.eduLabel}
                    </div>
                    <div className="space-y-0.5">
                      {aboutText.edu.map((eduItem, idx) => (
                        <div key={idx}>{renderListItem(eduItem)}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === 'admin' && (
              <div
                role="tabpanel"
                id="about-panel-admin"
                aria-labelledby="about-tab-admin"
                className="group flex gap-5"
              >
                <div className="min-h-[48px] w-px bg-stone-800 transition-colors group-hover:bg-[#c4a77d]/55" />
                <div className="min-w-0 flex-1">
                  <div className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-stone-400">
                    {aboutText.adminLabel}
                  </div>
                  <div className="space-y-0.5">
                    {(isExpandedAdmin ? aboutText.admin : aboutText.admin.slice(0, 5)).map((item, idx) => (
                      <div key={idx}>{renderListItem(item)}</div>
                    ))}
                  </div>
                  {aboutText.admin.length > 5 && (
                    <button
                      type="button"
                      onClick={() => setIsExpandedAdmin(!isExpandedAdmin)}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-stone-700/70 bg-stone-900/50 px-4 py-1.5 font-mono text-xs text-[#e8dcc4] transition-colors hover:border-[#c4a77d]/55 hover:bg-stone-800/70"
                    >
                      {isExpandedAdmin
                        ? lang === 'zh'
                          ? '收起'
                          : 'Show less'
                        : lang === 'zh'
                          ? `顯示更多 (${aboutText.admin.length - 5})`
                          : `Show more (${aboutText.admin.length - 5})`}
                    </button>
                  )}
                </div>
              </div>
            )}

            {tab === 'service' && (
              <div
                role="tabpanel"
                id="about-panel-service"
                aria-labelledby="about-tab-service"
                className="group flex gap-5"
              >
                <div className="min-h-[48px] w-px bg-stone-800 transition-colors group-hover:bg-stone-600" />
                <div className="min-w-0 flex-1">
                  <div className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-stone-400">
                    {aboutText.serviceLabel}
                  </div>
                  <div className="space-y-0.5">
                    {(isExpandedService ? aboutText.service : aboutText.service.slice(0, 5)).map((item, idx) => (
                      <div key={idx}>{renderListItem(item)}</div>
                    ))}
                  </div>
                  {aboutText.service.length > 5 && (
                    <button
                      type="button"
                      onClick={() => setIsExpandedService(!isExpandedService)}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-stone-700/70 bg-stone-900/50 px-4 py-1.5 font-mono text-xs text-[#e8dcc4] transition-colors hover:border-[#c4a77d]/55 hover:bg-stone-800/70"
                    >
                      {isExpandedService
                        ? lang === 'zh'
                          ? '收起'
                          : 'Show less'
                        : lang === 'zh'
                          ? `顯示更多 (${aboutText.service.length - 5})`
                          : `Show more (${aboutText.service.length - 5})`}
                    </button>
                  )}
                </div>
              </div>
            )}

            {tab === 'awards' && (
              <div
                role="tabpanel"
                id="about-panel-awards"
                aria-labelledby="about-tab-awards"
                className="group flex gap-5"
              >
                <div className="min-h-[48px] w-px bg-stone-800 transition-colors group-hover:bg-[#c4a77d]/55" />
                <div className="min-w-0 flex-1">
                  <div className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-[#d4af37]">
                    {aboutText.awardsLabel}
                  </div>
                  <div className="space-y-0.5">
                    {aboutText.awards.map((item, idx) => (
                      <div key={idx}>{renderListItem(item)}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export const AboutSection = memo(AboutSectionComponent);
