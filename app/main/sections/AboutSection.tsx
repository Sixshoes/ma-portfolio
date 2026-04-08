'use client';

import React, { memo, useState } from 'react';
import { GraduationCap } from 'lucide-react';
import { useRenderProfiler } from './useRenderProfiler';
import { uiTokens } from './uiTokens';

type AboutText = {
  title: string;
  subtitle: string;
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

function renderListItem(text: string) {
  const match = text.match(/(.*?)\s*\(([^)]+)\)$/);
  if (match) {
    return (
      <div className="flex flex-col gap-2 border-b border-white/[0.04] py-3 transition-colors last:border-0 sm:flex-row sm:items-start sm:justify-between group-hover:border-white/[0.07]">
        <span className="font-medium leading-relaxed text-slate-300">{match[1]}</span>
        <span className="mt-1 whitespace-nowrap rounded border border-teal-500/15 bg-teal-500/[0.06] px-2 py-1 font-mono text-[10px] text-teal-200/70 sm:mt-0">
          {match[2]}
        </span>
      </div>
    );
  }
  return <div className="py-2 leading-relaxed text-slate-300">{text}</div>;
}

function AboutSectionComponent({ aboutText, lang }: AboutSectionProps) {
  useRenderProfiler('AboutSection');
  const [isExpandedAdmin, setIsExpandedAdmin] = useState(false);
  const [isExpandedService, setIsExpandedService] = useState(false);

  return (
    <section id="about" className={`mx-auto max-w-7xl px-6 py-24 md:py-28 ${uiTokens.sectionDivider}`}>
      <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-20">
        <div className="relative">
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-white/[0.06] bg-[#0B101E] shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
            <div
              className="absolute inset-0 bg-gradient-to-br from-[#0d1528] via-[#080C16] to-[#0a1620]"
              aria-hidden
            />
            <div
              className="absolute inset-0 opacity-90"
              style={{
                backgroundImage: `
                  radial-gradient(ellipse 80% 60% at 30% 40%, rgba(45, 212, 191, 0.14), transparent 55%),
                  radial-gradient(ellipse 70% 50% at 75% 65%, rgba(251, 191, 36, 0.1), transparent 50%),
                  linear-gradient(180deg, transparent 40%, #080c16 100%)
                `,
              }}
              aria-hidden
            />
            <div
              className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='none' stroke='%232dd4bf' stroke-width='0.4' d='M12 1v22M1 12h22'/%3E%3C/svg%3E")`,
                backgroundSize: '24px 24px',
              }}
              aria-hidden
            />
          </div>
          <div className="absolute -bottom-12 -right-6 max-w-xs rounded-2xl border border-amber-500/25 bg-[#0B101E]/92 p-8 shadow-[0_20px_48px_rgba(0,0,0,0.55)] backdrop-blur-md md:-right-12 md:p-10">
            <GraduationCap className="mb-4 h-8 w-8 stroke-1 text-amber-400" />
            <h4 className="mb-3 font-display text-xl font-light tracking-wide text-white">
              {aboutText.leadership}
            </h4>
            <p className="text-sm font-light leading-relaxed text-slate-400">{aboutText.leadershipDesc}</p>
          </div>
        </div>
        <div>
          <h2 className={`${uiTokens.sectionTitle} mb-12 md:mb-14`}>
            <span className={uiTokens.titleLight}>{aboutText.title}</span> <br />
            <span className={uiTokens.titleBold}>{aboutText.subtitle}</span>
          </h2>
          <div className="space-y-7 md:space-y-8">
            <div className="group flex gap-6">
              <div className="h-full min-h-[48px] w-px bg-white/10 transition-colors group-hover:bg-amber-400/70" />
              <div className="flex-1">
                <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-amber-400/85">
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
              <div className="h-full min-h-[48px] w-px bg-white/10 transition-colors group-hover:bg-teal-400/70" />
              <div className="flex-1">
                <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-teal-400/85">
                  {aboutText.eduLabel}
                </div>
                <div className="space-y-1">
                  {aboutText.edu.map((eduItem, idx) => (
                    <div key={idx}>{renderListItem(eduItem)}</div>
                  ))}
                </div>
              </div>
            </div>
            <div className="group flex gap-6">
              <div className="h-full min-h-[48px] w-px bg-white/10 transition-colors group-hover:bg-amber-400/50" />
              <div className="flex-1">
                <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-amber-400/75">
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
                    className="mt-3 flex items-center gap-1 font-mono text-[10px] text-teal-400/90 transition-colors hover:text-teal-300"
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
            <div className="group flex gap-6">
              <div className="h-full min-h-[48px] w-px bg-white/10 transition-colors group-hover:bg-teal-400/50" />
              <div className="flex-1">
                <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-teal-400/75">
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
                    className="mt-3 flex items-center gap-1 font-mono text-[10px] text-teal-400/90 transition-colors hover:text-teal-300"
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
            <div className="group flex gap-6">
              <div className="h-full min-h-[48px] w-px bg-white/10 transition-colors group-hover:bg-amber-400/60" />
              <div className="flex-1">
                <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-amber-400/80">
                  {aboutText.awardsLabel}
                </div>
                <div className="space-y-1">
                  {aboutText.awards.map((item, idx) => (
                    <div key={idx}>{renderListItem(item)}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export const AboutSection = memo(AboutSectionComponent);
