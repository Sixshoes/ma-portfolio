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

/** 瑞士編年表列：純粹 1px 細線分隔與等寬年份對齊，零笨重圓角藥丸外框 */
function renderLedgerRow(text: string) {
  const match = text.match(/(.*?)\s*\(([^)]+)\)$/);
  if (match) {
    return (
      <div className="flex flex-col gap-1.5 border-b border-white/[0.07] py-4 transition-colors last:border-0 hover:bg-white/[0.015] sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
        <span className="text-[15px] font-normal leading-relaxed text-[#e8e4dc]">{match[1]}</span>
        <span className="font-mono text-xs leading-snug text-[#9b958c] [font-variant-numeric:tabular-nums] sm:max-w-[42%] sm:shrink-0 sm:text-right">
          {match[2]}
        </span>
      </div>
    );
  }
  return (
    <div className="border-b border-white/[0.07] py-4 text-[15px] leading-relaxed text-[#e8e4dc] last:border-0">
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
      className="mx-auto max-w-7xl scroll-mt-24 border-t border-white/[0.08] px-6 py-24 md:py-32"
    >
      <div className="mb-12 md:mb-16">
        <div className="mb-3 flex items-center gap-3">
          <span className="h-px w-6 bg-[#c8a464]" aria-hidden />
          <span className={uiTokens.sectionKicker}>{sectionKicker}</span>
        </div>
        <h2 className={uiTokens.sectionTitle}>
          <span className={uiTokens.titleLight}>{aboutText.title}</span>{' '}
          <span className={uiTokens.titleBold}>{aboutText.subtitle}</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-14">
        {/* 左側黏性瑞士目錄欄（純粹細線與簡潔文案，無笨重方框） */}
        <div className="lg:sticky lg:top-28 lg:col-span-4">
          <div className="border-t border-[#c8a464]/60 pt-6">
            <h3 className="font-heading-serif mb-3 text-2xl font-medium text-[#f5f3ef]">
              {aboutText.leadership}
            </h3>
            <p className="mb-8 text-sm font-light leading-[1.8] text-[#a39e95]">
              {aboutText.leadershipDesc}
            </p>

            {/* 垂直章節索引清單 */}
            <div
              role="tablist"
              aria-label={tablistLabel}
              className="divide-y divide-white/[0.08] border-y border-white/[0.08]"
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
                    className={`group flex w-full items-center justify-between py-3.5 text-left transition-colors ${
                      selected ? 'text-[#f5f3ef]' : 'text-[#8f8980] hover:text-[#d6d1c9]'
                    }`}
                  >
                    <span className="flex items-center gap-3 text-sm font-medium">
                      <span
                        className={`h-px transition-all duration-300 ${
                          selected
                            ? 'w-5 bg-[#c8a464]'
                            : 'w-2 bg-white/[0.15] group-hover:w-4 group-hover:bg-white/[0.4]'
                        }`}
                        aria-hidden
                      />
                      {label}
                    </span>
                    <span
                      className={`font-mono text-xs [font-variant-numeric:tabular-nums] ${
                        selected ? 'text-[#e2c992]' : 'text-[#6d6860]'
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
              className="space-y-10"
            >
              <div>
                <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[#c8a464]">
                  {aboutText.roleLabel}
                </div>
                <div className="border-t border-white/[0.1]">
                  {aboutText.roles.map((role, idx) => (
                    <div key={idx}>{renderLedgerRow(role)}</div>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[#8f8980]">
                  {aboutText.eduLabel}
                </div>
                <div className="border-t border-white/[0.1]">
                  {aboutText.edu.map((eduItem, idx) => (
                    <div key={idx}>{renderLedgerRow(eduItem)}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'admin' && (
            <div role="tabpanel" id="about-panel-admin" aria-labelledby="about-tab-admin">
              <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[#c8a464]">
                {aboutText.adminLabel}
              </div>
              <div className="border-t border-white/[0.1]">
                {(isExpandedAdmin ? aboutText.admin : aboutText.admin.slice(0, 6)).map((item, idx) => (
                  <div key={idx}>{renderLedgerRow(item)}</div>
                ))}
              </div>
              {aboutText.admin.length > 6 && (
                <button
                  type="button"
                  onClick={() => setIsExpandedAdmin(!isExpandedAdmin)}
                  className="mt-6 inline-flex items-center gap-2 rounded-lg border border-white/[0.14] px-4 py-2 font-mono text-xs text-[#d6d1c9] transition-colors hover:border-[#c8a464]/65 hover:text-[#e5cea0]"
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
              <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[#c8a464]">
                {aboutText.serviceLabel}
              </div>
              <div className="border-t border-white/[0.1]">
                {(isExpandedService ? aboutText.service : aboutText.service.slice(0, 6)).map((item, idx) => (
                  <div key={idx}>{renderLedgerRow(item)}</div>
                ))}
              </div>
              {aboutText.service.length > 6 && (
                <button
                  type="button"
                  onClick={() => setIsExpandedService(!isExpandedService)}
                  className="mt-6 inline-flex items-center gap-2 rounded-lg border border-white/[0.14] px-4 py-2 font-mono text-xs text-[#d6d1c9] transition-colors hover:border-[#c8a464]/65 hover:text-[#e5cea0]"
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
              <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[#c8a464]">
                {aboutText.awardsLabel}
              </div>
              <div className="border-t border-white/[0.1]">
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
