'use client';

import React, { memo, useState } from 'react';
import { GraduationCap } from 'lucide-react';
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

type AboutTab = 'roles' | 'admin' | 'service' | 'awards';

function renderListItem(text: string) {
  const match = text.match(/(.*?)\s*\(([^)]+)\)$/);
  if (match) {
    return (
      <div className="flex flex-col gap-2 border-b border-stone-800/50 py-3 transition-colors last:border-0 sm:flex-row sm:items-start sm:justify-between group-hover:border-stone-700/60">
        <span className="font-medium leading-relaxed text-stone-300">{match[1]}</span>
        <span className="mt-1 whitespace-nowrap rounded border border-stone-700/50 bg-stone-900/40 px-2 py-1 font-mono text-[10px] text-stone-500 sm:mt-0">
          {match[2]}
        </span>
      </div>
    );
  }
  return <div className="py-2 leading-relaxed text-stone-300">{text}</div>;
}

function AboutSectionComponent({ aboutText, lang }: AboutSectionProps) {
  useRenderProfiler('AboutSection');
  const [tab, setTab] = useState<AboutTab>('roles');
  const [isExpandedAdmin, setIsExpandedAdmin] = useState(false);
  const [isExpandedService, setIsExpandedService] = useState(false);
  const tablistLabel = lang === 'zh' ? '學術履歷分類' : 'Resume categories';

  return (
    <section id="about" className={`mx-auto max-w-7xl px-6 py-28 md:py-32 ${uiTokens.sectionDivider}`}>
      <div className="grid grid-cols-1 items-start gap-14 lg:grid-cols-3 lg:gap-16">
        <div className="relative lg:col-span-1">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-stone-800/60 bg-slate-900 shadow-[0_8px_32px_rgba(0,0,0,0.3)] lg:aspect-square lg:sticky lg:top-28">
            <div
              className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-[#1a1612]"
              aria-hidden
            />
            <div
              className="absolute inset-0 opacity-90"
              style={{
                backgroundImage: `
                  radial-gradient(ellipse 80% 60% at 30% 40%, rgba(148, 163, 184, 0.12), transparent 55%),
                  radial-gradient(ellipse 70% 50% at 75% 65%, rgba(196, 167, 125, 0.08), transparent 50%),
                  linear-gradient(180deg, transparent 40%, #0c0a09 100%)
                `,
              }}
              aria-hidden
            />
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='none' stroke='%2378716c' stroke-width='0.35' d='M12 1v22M1 12h22'/%3E%3C/svg%3E")`,
                backgroundSize: '24px 24px',
              }}
              aria-hidden
            />
          </div>
          <div className="absolute -bottom-12 -right-6 max-w-xs rounded-2xl border border-stone-700/50 bg-slate-950/95 p-8 shadow-[0_20px_48px_rgba(0,0,0,0.45)] md:-right-12 md:p-10 md:backdrop-blur-md">
            <GraduationCap className="mb-4 h-8 w-8 stroke-1 text-[#c4a77d]" />
            <h4 className="font-heading-serif mb-3 text-xl font-normal tracking-wide text-stone-100">
              {aboutText.leadership}
            </h4>
            <p className="text-sm font-light leading-relaxed text-stone-500">{aboutText.leadershipDesc}</p>
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
            className="mb-8 flex flex-wrap gap-2 border-b border-stone-800/60 pb-4"
          >
            {(
              [
                ['roles', aboutText.rolesEduTab],
                ['admin', aboutText.adminLabel],
                ['service', aboutText.serviceLabel],
                ['awards', aboutText.awardsLabel],
              ] as const
            ).map(([id, label]) => {
              const selected = tab === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  id={`about-tab-${id}`}
                  aria-controls={`about-panel-${id}`}
                  onClick={() => setTab(id)}
                  className={`rounded-full px-3.5 py-2 text-left font-mono text-[10px] uppercase tracking-[0.18em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9a8260]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 md:px-4 ${
                    selected
                      ? 'border border-[#8f7038]/45 bg-[#2a241c]/60 text-[#e8dcc4]'
                      : 'border border-transparent text-stone-500 hover:border-stone-700/60 hover:bg-stone-900/40 hover:text-stone-300'
                  }`}
                >
                  {label}
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
                className="space-y-7 md:space-y-8"
              >
                <div className="group flex gap-6">
                  <div className="h-full min-h-[48px] w-px bg-stone-800/80 transition-colors group-hover:bg-[#9a8260]/50" />
                  <div className="flex-1">
                    <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[#b08d52]/90">
                      {aboutText.roleLabel}
                    </div>
                    <div className="space-y-1">
                      {aboutText.roles.map((role, idx) => (
                        <div key={idx}>{renderListItem(role)}</div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="group flex gap-6">
                  <div className="h-full min-h-[48px] w-px bg-stone-800/80 transition-colors group-hover:bg-stone-600/70" />
                  <div className="flex-1">
                    <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500">
                      {aboutText.eduLabel}
                    </div>
                    <div className="space-y-1">
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
                className="group flex gap-6"
              >
                <div className="h-full min-h-[48px] w-px bg-stone-800/80 transition-colors group-hover:bg-[#9a8260]/45" />
                <div className="flex-1">
                  <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500">
                    {aboutText.adminLabel}
                  </div>
                  <div className="space-y-1">
                    {(isExpandedAdmin ? aboutText.admin : aboutText.admin.slice(0, 5)).map((item, idx) => (
                      <div key={idx}>{renderListItem(item)}</div>
                    ))}
                  </div>
                  {aboutText.admin.length > 5 && (
                    <button
                      type="button"
                      onClick={() => setIsExpandedAdmin(!isExpandedAdmin)}
                      className="mt-3 flex items-center gap-1 font-mono text-[10px] text-[#a8906a] transition-colors hover:text-[#d4c4a8]"
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
                className="group flex gap-6"
              >
                <div className="h-full min-h-[48px] w-px bg-stone-800/80 transition-colors group-hover:bg-stone-600/60" />
                <div className="flex-1">
                  <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500">
                    {aboutText.serviceLabel}
                  </div>
                  <div className="space-y-1">
                    {(isExpandedService ? aboutText.service : aboutText.service.slice(0, 5)).map((item, idx) => (
                      <div key={idx}>{renderListItem(item)}</div>
                    ))}
                  </div>
                  {aboutText.service.length > 5 && (
                    <button
                      type="button"
                      onClick={() => setIsExpandedService(!isExpandedService)}
                      className="mt-3 flex items-center gap-1 font-mono text-[10px] text-[#a8906a] transition-colors hover:text-[#d4c4a8]"
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
                className="group flex gap-6"
              >
                <div className="h-full min-h-[48px] w-px bg-stone-800/80 transition-colors group-hover:bg-[#9a8260]/45" />
                <div className="flex-1">
                  <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[#b08d52]/90">
                    {aboutText.awardsLabel}
                  </div>
                  <div className="space-y-1">
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
