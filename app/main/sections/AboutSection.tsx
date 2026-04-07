'use client';

import React, { memo, useState } from 'react';
import Image from 'next/image';
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
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 py-3 border-b border-white/[0.02] last:border-0 group-hover:border-white/[0.05] transition-colors">
        <span className="text-slate-300 font-medium leading-relaxed">{match[1]}</span>
        <span className="text-[10px] font-mono text-slate-500 bg-white/[0.02] px-2 py-1 rounded whitespace-nowrap mt-1 sm:mt-0">{match[2]}</span>
      </div>
    );
  }
  return <div className="py-2 text-slate-300 leading-relaxed">{text}</div>;
}

function AboutSectionComponent({ aboutText, lang }: AboutSectionProps) {
  useRenderProfiler('AboutSection');
  const [isExpandedAdmin, setIsExpandedAdmin] = useState(false);
  const [isExpandedService, setIsExpandedService] = useState(false);

  return (
    <section id="about" className="py-24 md:py-28 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
        <div className="relative">
          <div className="aspect-square bg-[#0B101E] rounded-3xl overflow-hidden border border-white/[0.05] relative shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <Image
              src="https://picsum.photos/seed/university/1000/1000"
              alt="Fo Guang University"
              fill
              className="object-cover opacity-50 mix-blend-luminosity"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080C16] via-transparent to-transparent" />
          </div>
          <div className="absolute -bottom-12 -right-6 md:-right-12 bg-[#0B101E]/90 backdrop-blur-md p-8 md:p-10 border border-amber-500/20 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] max-w-xs">
            <GraduationCap className="w-8 h-8 mb-4 text-amber-400 stroke-1" />
            <h4 className="font-display font-light text-xl text-white mb-3 tracking-wide">{aboutText.leadership}</h4>
            <p className="text-sm leading-relaxed text-slate-400 font-light">{aboutText.leadershipDesc}</p>
          </div>
        </div>
        <div>
          <h2 className={`${uiTokens.sectionTitle} mb-12 md:mb-14`}>
            <span className={uiTokens.titleLight}>{aboutText.title}</span> <br />
            <span className={uiTokens.titleBold}>{aboutText.subtitle}</span>
          </h2>
          <div className="space-y-7 md:space-y-8">
            <div className="flex gap-6 group">
              <div className="w-px h-full min-h-[48px] bg-white/10 group-hover:bg-amber-400 transition-colors" />
              <div className="flex-1">
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-400/80 mb-3">{aboutText.roleLabel}</div>
                <div className="space-y-1">
                  {aboutText.roles.map((role, idx) => (
                    <div key={idx}>{renderListItem(role)}</div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-6 group">
              <div className="w-px h-full min-h-[48px] bg-white/10 group-hover:bg-blue-400 transition-colors" />
              <div className="flex-1">
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-blue-400/80 mb-3">{aboutText.eduLabel}</div>
                <div className="space-y-1">
                  {aboutText.edu.map((eduItem, idx) => (
                    <div key={idx}>{renderListItem(eduItem)}</div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-6 group">
              <div className="w-px h-full min-h-[48px] bg-white/10 group-hover:bg-purple-400 transition-colors" />
              <div className="flex-1">
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-purple-400/80 mb-3">{aboutText.adminLabel}</div>
                <div className="space-y-1">
                  {(isExpandedAdmin ? aboutText.admin : aboutText.admin.slice(0, 5)).map((item, idx) => (
                    <div key={idx}>{renderListItem(item)}</div>
                  ))}
                </div>
                {aboutText.admin.length > 5 && (
                  <button
                    onClick={() => setIsExpandedAdmin(!isExpandedAdmin)}
                    className="mt-3 text-[10px] font-mono text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                  >
                    {isExpandedAdmin ? (lang === 'zh' ? '收起' : 'Show Less') : (lang === 'zh' ? `顯示更多 (${aboutText.admin.length - 5})` : `Show More (${aboutText.admin.length - 5})`)}
                  </button>
                )}
              </div>
            </div>
            <div className="flex gap-6 group">
              <div className="w-px h-full min-h-[48px] bg-white/10 group-hover:bg-emerald-400 transition-colors" />
              <div className="flex-1">
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-emerald-400/80 mb-3">{aboutText.serviceLabel}</div>
                <div className="space-y-1">
                  {(isExpandedService ? aboutText.service : aboutText.service.slice(0, 5)).map((item, idx) => (
                    <div key={idx}>{renderListItem(item)}</div>
                  ))}
                </div>
                {aboutText.service.length > 5 && (
                  <button
                    onClick={() => setIsExpandedService(!isExpandedService)}
                    className="mt-3 text-[10px] font-mono text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
                  >
                    {isExpandedService ? (lang === 'zh' ? '收起' : 'Show Less') : (lang === 'zh' ? `顯示更多 (${aboutText.service.length - 5})` : `Show More (${aboutText.service.length - 5})`)}
                  </button>
                )}
              </div>
            </div>
            <div className="flex gap-6 group">
              <div className="w-px h-full min-h-[48px] bg-white/10 group-hover:bg-rose-400 transition-colors" />
              <div className="flex-1">
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-rose-400/80 mb-3">{aboutText.awardsLabel}</div>
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
