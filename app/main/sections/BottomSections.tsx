'use client';

import React, { memo } from 'react';
import { motion } from 'motion/react';
import { useRenderProfiler } from './useRenderProfiler';
import { uiTokens } from './uiTokens';
import {
  Globe,
  MapPin,
  GraduationCap,
  Mail,
  Phone,
  Printer,
  UserPlus,
  Download,
} from 'lucide-react';

type BottomSectionsProps = {
  t: {
    impact: {
      title: string;
      subtitle: string;
      ndhu: string;
      fgu: string;
      worldRank: string;
      countryRank: string;
      uniRank: string;
      hIndex: string;
      total: string;
      last5: string;
      ratio: string;
      source: string;
    };
    contact: {
      title: string;
      subtitle: string;
      email: string;
      phone: string;
      fax: string;
      vcardModal: {
        add: string;
        click: string;
      };
      footer: string;
      developer: string;
    };
  };
  lang: 'en' | 'zh';
  onDownloadVCard: () => void;
};

function BottomSectionsComponent({ t, lang, onDownloadVCard }: BottomSectionsProps) {
  useRenderProfiler('BottomSections');
  return (
    <>
      <section id="impact" className="py-24 md:py-28 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-14 md:mb-16">
            <h2 className={`${uiTokens.sectionTitle} mb-6`}>
              <span className={uiTokens.titleLight}>{t.impact.title}</span> <br />
              <span className={uiTokens.titleBold}>{t.impact.subtitle}</span>
            </h2>
            <p className="text-xs font-mono text-slate-500/80 mt-4">{t.impact.source}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`${uiTokens.surfaceCard} p-7 md:p-8 transition-colors hover:border-amber-400/35`}
            >
              <div className="mb-8 flex items-center gap-4 border-b border-white/10 pb-8">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-amber-500/15 bg-amber-500/[0.06]">
                  <GraduationCap className="h-8 w-8 stroke-1 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-display font-bold text-white">{t.impact.ndhu}</h3>
                  <p className="text-sm text-slate-400 font-mono mt-1">Hualien, Taiwan</p>
                </div>
              </div>

              <div className="mb-10 grid grid-cols-3 gap-2 md:gap-4">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-8 w-8 items-center justify-center rounded-full border border-teal-500/20 bg-teal-500/[0.08] md:h-10 md:w-10">
                    <Globe className="h-4 w-4 stroke-1 text-teal-400 md:h-5 md:w-5" />
                  </div>
                  <div className="font-display text-lg font-bold text-white md:text-2xl">49,442</div>
                  <div className="mt-1 text-[8px] font-medium uppercase tracking-wider text-slate-500 md:text-[10px]">{t.impact.worldRank}</div>
                </div>
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-8 w-8 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/[0.08] md:h-10 md:w-10">
                    <MapPin className="h-4 w-4 stroke-1 text-amber-400 md:h-5 md:w-5" />
                  </div>
                  <div className="font-display text-lg font-bold text-white md:text-2xl">225</div>
                  <div className="mt-1 text-[8px] font-medium uppercase tracking-wider text-slate-500 md:text-[10px]">{t.impact.countryRank}</div>
                </div>
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] md:h-10 md:w-10">
                    <GraduationCap className="h-4 w-4 stroke-1 text-slate-300 md:h-5 md:w-5" />
                  </div>
                  <div className="font-display text-lg font-bold text-white md:text-2xl">1</div>
                  <div className="mt-1 text-[8px] font-medium uppercase tracking-wider text-slate-500 md:text-[10px]">{t.impact.uniRank}</div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 md:p-6">
                <h4 className="mb-6 text-center font-mono text-xs uppercase tracking-widest text-slate-400 md:text-sm">{t.impact.hIndex}</h4>
                <div className="grid grid-cols-3 gap-2 text-center md:gap-4">
                  <div>
                    <div className="font-display text-xl font-bold text-amber-400 md:text-3xl">62</div>
                    <div className="text-[8px] md:text-[10px] uppercase tracking-wider text-slate-500 mt-2">{t.impact.total}</div>
                  </div>
                  <div>
                    <div className="text-xl md:text-3xl font-display font-bold text-white">47</div>
                    <div className="text-[8px] md:text-[10px] uppercase tracking-wider text-slate-500 mt-2">{t.impact.last5}</div>
                  </div>
                  <div>
                    <div className="text-xl md:text-3xl font-display font-bold text-white">0.758</div>
                    <div className="text-[8px] md:text-[10px] uppercase tracking-wider text-slate-500 mt-2">{t.impact.ratio}</div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className={`${uiTokens.surfaceCard} p-7 md:p-8 transition-colors hover:border-teal-400/35`}
            >
              <div className="mb-8 flex items-center gap-4 border-b border-white/10 pb-8">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-teal-500/15 bg-teal-500/[0.06]">
                  <GraduationCap className="h-8 w-8 stroke-1 text-teal-400" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-display font-bold text-white">{t.impact.fgu}</h3>
                  <p className="text-sm text-slate-400 font-mono mt-1">Yilan County, Taiwan</p>
                </div>
              </div>

              <div className="mb-10 grid grid-cols-3 gap-2 md:gap-4">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-8 w-8 items-center justify-center rounded-full border border-teal-500/20 bg-teal-500/[0.08] md:h-10 md:w-10">
                    <Globe className="h-4 w-4 stroke-1 text-teal-400 md:h-5 md:w-5" />
                  </div>
                  <div className="font-display text-lg font-bold text-white md:text-2xl">80,658</div>
                  <div className="mt-1 text-[8px] font-medium uppercase tracking-wider text-slate-500 md:text-[10px]">{t.impact.worldRank}</div>
                </div>
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-8 w-8 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/[0.08] md:h-10 md:w-10">
                    <MapPin className="h-4 w-4 stroke-1 text-amber-400 md:h-5 md:w-5" />
                  </div>
                  <div className="font-display text-lg font-bold text-white md:text-2xl">423</div>
                  <div className="mt-1 text-[8px] font-medium uppercase tracking-wider text-slate-500 md:text-[10px]">{t.impact.countryRank}</div>
                </div>
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] md:h-10 md:w-10">
                    <GraduationCap className="h-4 w-4 stroke-1 text-slate-300 md:h-5 md:w-5" />
                  </div>
                  <div className="font-display text-lg font-bold text-white md:text-2xl">2</div>
                  <div className="mt-1 text-[8px] font-medium uppercase tracking-wider text-slate-500 md:text-[10px]">{t.impact.uniRank}</div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 md:p-6">
                <h4 className="mb-6 text-center font-mono text-xs uppercase tracking-widest text-slate-400 md:text-sm">{t.impact.hIndex}</h4>
                <div className="grid grid-cols-3 gap-2 text-center md:gap-4">
                  <div>
                    <div className="font-display text-xl font-bold text-teal-400 md:text-3xl">52</div>
                    <div className="text-[8px] md:text-[10px] uppercase tracking-wider text-slate-500 mt-2">{t.impact.total}</div>
                  </div>
                  <div>
                    <div className="text-xl md:text-3xl font-display font-bold text-white">38</div>
                    <div className="text-[8px] md:text-[10px] uppercase tracking-wider text-slate-500 mt-2">{t.impact.last5}</div>
                  </div>
                  <div>
                    <div className="text-xl md:text-3xl font-display font-bold text-white">0.731</div>
                    <div className="text-[8px] md:text-[10px] uppercase tracking-wider text-slate-500 mt-2">{t.impact.ratio}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="contact" className="py-24 md:py-28 bg-gradient-to-b from-[#0B101E]/60 to-[#090E1A]/70 border-t border-white/[0.06] relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto px-6 relative z-10"
        >
          <div className="text-center mb-10 md:mb-12">
            <h2 className={`${uiTokens.sectionTitle} mb-6`}>
              <span className={uiTokens.titleLight}>{t.contact.title}</span> <br />
              <span className={uiTokens.titleBold}>{t.contact.subtitle}</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-teal-500 mx-auto rounded-full opacity-50"></div>
          </div>

          <div className="bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.08] rounded-3xl p-7 md:p-10 backdrop-blur-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center relative z-10">
              <div className="space-y-6">
                <a href={`mailto:${t.contact.email}`} className="flex items-start gap-5 group">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20 group-hover:scale-110 group-hover:bg-amber-500/20 transition-all duration-300">
                    <Mail className="w-5 h-5 text-amber-400 stroke-1" />
                  </div>
                  <div>
                    <div className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-1">Email</div>
                    <div className="text-lg text-slate-200 group-hover:text-amber-400 transition-colors">{t.contact.email}</div>
                  </div>
                </a>

                <a href={`tel:${t.contact.phone.replace(/[^0-9+]/g, '')}`} className="flex items-start gap-5 group">
                  <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center shrink-0 border border-teal-500/20 group-hover:scale-110 group-hover:bg-teal-500/20 transition-all duration-300">
                    <Phone className="w-5 h-5 text-teal-400 stroke-1" />
                  </div>
                  <div>
                    <div className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-1">Phone</div>
                    <div className="text-lg text-slate-200 group-hover:text-teal-400 transition-colors">{t.contact.phone}</div>
                  </div>
                </a>

                <div className="group flex items-start gap-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/[0.04] transition-all duration-300 group-hover:scale-110 group-hover:border-slate-400/30 group-hover:bg-white/[0.06]">
                    <Printer className="h-5 w-5 stroke-1 text-slate-400" />
                  </div>
                  <div>
                    <div className="mb-1 font-mono text-xs uppercase tracking-widest text-slate-500">Fax</div>
                    <div className="text-lg text-slate-200 transition-colors group-hover:text-slate-100">{t.contact.fax}</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-6 md:p-8 border-t md:border-t-0 md:border-l border-white/[0.05]">
                <button
                  onClick={onDownloadVCard}
                  className={`group relative w-32 h-32 mb-6 rounded-full ${uiTokens.buttonPrimaryStrong} flex items-center justify-center hover:shadow-[0_0_40px_rgba(251,191,36,0.2)] hover:scale-105 transition-all duration-500`}
                  title={lang === 'en' ? 'Tap to download' : '點擊下載'}
                >
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
                  <UserPlus className="w-12 h-12 text-[#0A0F1C] group-hover:text-[#080C16] transition-colors relative z-10" />
                </button>
                <div className="text-center">
                  <div className="text-sm font-display tracking-widest uppercase text-white mb-2">
                    {t.contact.vcardModal.add}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center justify-center gap-1 mx-auto">
                    <Download className="w-3 h-3" />
                    {t.contact.vcardModal.click}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <footer className="w-full py-8 mt-16 md:mt-20 text-center border-t border-white/10">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-slate-500">
              {t.contact.footer}
            </p>
            <p className="mt-2 text-[10px] font-mono uppercase tracking-[0.3em] text-slate-600">
              {t.contact.developer}
            </p>
          </footer>
        </motion.div>
      </section>
    </>
  );
}

export const BottomSections = memo(BottomSectionsComponent);
