'use client';

import React, { memo, useCallback, useRef, useState } from 'react';
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

/** 瑞士編年履歷列：純粹 1px 細線與等寬年份對齊 */
function renderLedgerRow(text: string) {
  const match = text.match(/(.*?)\s*\(([^)]+)\)$/);
  if (match) {
    return (
      <div className="flex flex-col gap-1 border-b border-[#DCE2E8] px-3 py-3.5 transition-colors last:border-0 hover:bg-white sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
        <span className="text-[15px] leading-relaxed text-[#11161C]">{match[1]}</span>
        <span className="font-mono text-xs leading-snug text-[#5A6775] [font-variant-numeric:tabular-nums] sm:max-w-[42%] sm:shrink-0 sm:text-right">
          {match[2]}
        </span>
      </div>
    );
  }
  return (
    <div className="border-b border-[#DCE2E8] px-3 py-3.5 text-[15px] leading-relaxed text-[#11161C] last:border-0">
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
  const sectionKicker = lang === 'zh' ? '個人簡歷與領導' : 'CURRICULUM VITAE';

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

  const tabs: { id: AboutTab; label: string; count: number }[] = [
    { id: 'roles', label: aboutText.rolesEduTab, count: aboutText.roles.length + aboutText.edu.length },
    { id: 'admin', label: aboutText.adminLabel, count: aboutText.admin.length },
    { id: 'service', label: aboutText.serviceLabel, count: aboutText.service.length },
    { id: 'awards', label: aboutText.awardsLabel, count: aboutText.awards.length },
  ];

  return (
    <section
      id="about"
      className="mx-auto max-w-7xl scroll-mt-20 border-t border-[#DCE2E8] px-6 py-20 md:py-24"
    >
      <div className="mb-10 md:mb-12">
        <div className="mb-2.5 flex items-center gap-2.5">
          <span className="h-[2px] w-5 bg-[#0F4C81]" aria-hidden />
          <span className={uiTokens.sectionKicker}>{sectionKicker}</span>
        </div>
        <h2 className={uiTokens.sectionTitle}>
          {aboutText.title}
          {lang === 'en' ? ' ' : ''}
          {aboutText.subtitle}
        </h2>
      </div>

      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
        {/* 左側黏性瑞士目錄欄 */}
        <div className="lg:sticky lg:top-24 lg:col-span-4">
          <div className="rounded-lg border border-[#DCE2E8] bg-white p-6">
            <h3 className="mb-2.5 text-lg font-semibold text-[#11161C]">
              {aboutText.leadership}
            </h3>
            <p className="mb-6 text-sm leading-[1.75] text-[#475569]">
              {aboutText.leadershipDesc}
            </p>

            <div
              role="tablist"
              aria-label={tablistLabel}
              className="divide-y divide-[#DCE2E8] border-t border-[#DCE2E8]"
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
                    className={`group flex w-full items-center justify-between py-3 text-left transition-colors ${
                      selected
                        ? 'font-semibold text-[#0F4C81]'
                        : 'text-[#5A6775] hover:text-[#11161C]'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 text-sm">
                      <span
                        className={`h-[2px] transition-all duration-150 ${
                          selected
                            ? 'w-4 bg-[#0F4C81]'
                            : 'w-2 bg-[#CBD5E1] group-hover:w-3 group-hover:bg-[#64748B]'
                        }`}
                        aria-hidden
                      />
                      {label}
                    </span>
                    <span
                      className={`font-mono text-xs [font-variant-numeric:tabular-nums] ${
                        selected ? 'font-semibold text-[#0F4C81]' : 'text-[#64748B]'
                      }`}
                    >
                      {String(count).padStart(2, '0')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 右側編年履歷主欄 */}
        <div className="min-h-[18rem] lg:col-span-8">
          {tab === 'roles' && (
            <div
              role="tabpanel"
              id="about-panel-roles"
              aria-labelledby="about-tab-roles"
              className="space-y-8"
            >
              <div>
                <div className="mb-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0F4C81]">
                  {aboutText.roleLabel}
                </div>
                <div className="overflow-hidden rounded-lg border border-[#DCE2E8] bg-[#FAFBFC]">
                  {aboutText.roles.map((role, idx) => (
                    <div key={idx}>{renderLedgerRow(role)}</div>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5A6775]">
                  {aboutText.eduLabel}
                </div>
                <div className="overflow-hidden rounded-lg border border-[#DCE2E8] bg-[#FAFBFC]">
                  {aboutText.edu.map((eduItem, idx) => (
                    <div key={idx}>{renderLedgerRow(eduItem)}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'admin' && (
            <div role="tabpanel" id="about-panel-admin" aria-labelledby="about-tab-admin">
              <div className="mb-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0F4C81]">
                {aboutText.adminLabel}
              </div>
              <div className="overflow-hidden rounded-lg border border-[#DCE2E8] bg-[#FAFBFC]">
                {(isExpandedAdmin ? aboutText.admin : aboutText.admin.slice(0, 6)).map((item, idx) => (
                  <div key={idx}>{renderLedgerRow(item)}</div>
                ))}
              </div>
              {aboutText.admin.length > 6 && (
                <button
                  type="button"
                  onClick={() => setIsExpandedAdmin(!isExpandedAdmin)}
                  className="mt-5 inline-flex items-center gap-2 rounded-md border border-[#C5CFD8] bg-white px-4 py-2 font-mono text-xs font-medium text-[#2B3642] transition-colors hover:border-[#0F4C81] hover:text-[#0F4C81]"
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
            </div>
          )}

          {tab === 'service' && (
            <div role="tabpanel" id="about-panel-service" aria-labelledby="about-tab-service">
              <div className="mb-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0F4C81]">
                {aboutText.serviceLabel}
              </div>
              <div className="overflow-hidden rounded-lg border border-[#DCE2E8] bg-[#FAFBFC]">
                {(isExpandedService ? aboutText.service : aboutText.service.slice(0, 6)).map(
                  (item, idx) => (
                    <div key={idx}>{renderLedgerRow(item)}</div>
                  ),
                )}
              </div>
              {aboutText.service.length > 6 && (
                <button
                  type="button"
                  onClick={() => setIsExpandedService(!isExpandedService)}
                  className="mt-5 inline-flex items-center gap-2 rounded-md border border-[#C5CFD8] bg-white px-4 py-2 font-mono text-xs font-medium text-[#2B3642] transition-colors hover:border-[#0F4C81] hover:text-[#0F4C81]"
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
            </div>
          )}

          {tab === 'awards' && (
            <div role="tabpanel" id="about-panel-awards" aria-labelledby="about-tab-awards">
              <div className="mb-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0F4C81]">
                {aboutText.awardsLabel}
              </div>
              <div className="overflow-hidden rounded-lg border border-[#DCE2E8] bg-[#FAFBFC]">
                {aboutText.awards.map((item, idx) => (
                  <div key={idx}>{renderLedgerRow(item)}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export const AboutSection = memo(AboutSectionComponent);
