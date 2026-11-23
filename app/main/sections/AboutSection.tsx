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
      <div className="flex flex-col gap-2 border-b border-[#eae4d9] py-3.5 transition-colors last:border-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <span className="font-medium leading-relaxed text-[#1f1d1a]">{match[1]}</span>
        <span className="w-fit max-w-full rounded-md border border-[#e2dacd] bg-[#f5f1e9] px-2.5 py-1 font-mono text-xs leading-snug text-[#57524b] sm:max-w-[44%] sm:shrink-0 sm:text-right">
          {match[2]}
        </span>
      </div>
    );
  }
  return (
    <div className="border-b border-[#eae4d9] py-3 leading-relaxed text-[#1f1d1a] last:border-0">
      {text}
    </div>
  );
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
      className={`mx-auto max-w-7xl scroll-mt-24 px-6 py-20 md:py-28 ${uiTokens.sectionDivider}`}
    >
      <div className="mb-10 border-b border-[#e5dfd5] pb-8 md:mb-12">
        <div className={`${uiTokens.sectionKicker} mb-3`}>03 / ACADEMIC JOURNEY</div>
        <h2 className={uiTokens.sectionTitle}>
          <span className={uiTokens.titleLight}>{aboutText.title}</span>{' '}
          <span className={uiTokens.titleBold}>{aboutText.subtitle}</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-3 lg:gap-12">
        {/* 左側羊皮紙黏性領導摘要卡 */}
        <div className="lg:sticky lg:top-28 lg:col-span-1">
          <div className="relative overflow-hidden rounded-2xl border border-[#e2dacd] bg-[#f3efe7] p-7 shadow-[0_6px_24px_rgba(20,19,17,0.04)] md:p-8">
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#9a742e] via-[#c7a96c] to-transparent"
              aria-hidden
            />
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-[#dfd5c4] bg-white text-[#8a6522]">
              <GraduationCap className="h-6 w-6 stroke-[1.6]" aria-hidden />
            </div>
            <h3 className="font-heading-serif mb-3 text-2xl font-semibold text-[#141311]">
              {aboutText.leadership}
            </h3>
            <p className="mb-7 text-sm leading-relaxed text-[#3f3b36]">
              {aboutText.leadershipDesc}
            </p>

            <div className="grid grid-cols-2 gap-3 border-t border-[#dfd7c9] pt-6">
              {summaryHighlights.map(({ icon: Icon, label, count, targetTab }) => {
                const isActive = tab === targetTab;
                return (
                  <button
                    key={targetTab}
                    type="button"
                    onClick={() => setTab(targetTab)}
                    className={`rounded-xl border p-3.5 text-left transition-all ${
                      isActive
                        ? 'border-[#181614] bg-[#181614] text-[#faf8f4]'
                        : 'border-[#e2dacd] bg-white text-[#141311] hover:border-[#9a742e]'
                    }`}
                  >
                    <div className="mb-1.5 flex items-center justify-between">
                      <Icon
                        className={`h-4 w-4 ${isActive ? 'text-[#dcc08e]' : 'text-[#8a6522]'}`}
                        aria-hidden
                      />
                      <span className="font-mono text-lg font-semibold">{count}</span>
                    </div>
                    <div
                      className={`line-clamp-1 text-xs ${
                        isActive ? 'text-[#e5dfd5]' : 'text-[#57524b]'
                      }`}
                    >
                      {label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 右側分頁式編年履歷 */}
        <div className="lg:col-span-2">
          <div
            role="tablist"
            aria-label={tablistLabel}
            className="mb-8 flex flex-wrap gap-2 border-b border-[#e5dfd5] pb-4"
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
                  className={`rounded-full px-4 py-2 text-left font-mono text-xs font-medium uppercase tracking-[0.12em] transition-colors ${
                    selected
                      ? 'border border-[#181614] bg-[#181614] text-[#faf8f4]'
                      : 'border border-[#dcd4c7] bg-white text-[#57524b] hover:border-[#9a742e] hover:text-[#141311]'
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

          <div className="min-h-[14rem] rounded-2xl border border-[#e5dfd5] bg-white p-6 shadow-[0_2px_16px_rgba(20,19,17,0.03)] md:p-8">
            {tab === 'roles' && (
              <div
                role="tabpanel"
                id="about-panel-roles"
                aria-labelledby="about-tab-roles"
                className="space-y-8"
              >
                <div>
                  <div className="mb-2 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#8a6522]">
                    {aboutText.roleLabel}
                  </div>
                  <div>
                    {aboutText.roles.map((role, idx) => (
                      <div key={idx}>{renderListItem(role)}</div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-2 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#6b655d]">
                    {aboutText.eduLabel}
                  </div>
                  <div>
                    {aboutText.edu.map((eduItem, idx) => (
                      <div key={idx}>{renderListItem(eduItem)}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === 'admin' && (
              <div role="tabpanel" id="about-panel-admin" aria-labelledby="about-tab-admin">
                <div className="mb-2 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#8a6522]">
                  {aboutText.adminLabel}
                </div>
                <div>
                  {(isExpandedAdmin ? aboutText.admin : aboutText.admin.slice(0, 5)).map((item, idx) => (
                    <div key={idx}>{renderListItem(item)}</div>
                  ))}
                </div>
                {aboutText.admin.length > 5 && (
                  <button
                    type="button"
                    onClick={() => setIsExpandedAdmin(!isExpandedAdmin)}
                    className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-[#d8cfc0] bg-[#faf8f4] px-4 py-2 font-mono text-xs font-medium text-[#292622] transition-colors hover:border-[#9a742e] hover:text-[#7f5d1e]"
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
            )}

            {tab === 'service' && (
              <div role="tabpanel" id="about-panel-service" aria-labelledby="about-tab-service">
                <div className="mb-2 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#8a6522]">
                  {aboutText.serviceLabel}
                </div>
                <div>
                  {(isExpandedService ? aboutText.service : aboutText.service.slice(0, 5)).map((item, idx) => (
                    <div key={idx}>{renderListItem(item)}</div>
                  ))}
                </div>
                {aboutText.service.length > 5 && (
                  <button
                    type="button"
                    onClick={() => setIsExpandedService(!isExpandedService)}
                    className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-[#d8cfc0] bg-[#faf8f4] px-4 py-2 font-mono text-xs font-medium text-[#292622] transition-colors hover:border-[#9a742e] hover:text-[#7f5d1e]"
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
            )}

            {tab === 'awards' && (
              <div role="tabpanel" id="about-panel-awards" aria-labelledby="about-tab-awards">
                <div className="mb-2 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#8a6522]">
                  {aboutText.awardsLabel}
                </div>
                <div>
                  {aboutText.awards.map((item, idx) => (
                    <div key={idx}>{renderListItem(item)}</div>
                  ))}
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
