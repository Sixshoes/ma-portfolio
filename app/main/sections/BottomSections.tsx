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
      labelEmail: string;
      labelPhone: string;
      labelFax: string;
      email: string;
      phone: string;
      fax: string;
      vcardModal: {
        add: string;
        click: string;
        downloadTooltip: string;
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
            <p className={`${uiTokens.metaMono} mt-4 text-stone-600`}>{t.impact.source}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-7">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`${uiTokens.surfaceCard} p-7 transition-colors hover:border-[#9a8260]/35 md:p-8`}
            >
              <div className="mb-8 flex items-center gap-4 border-b border-stone-800/60 pb-8">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[#8f7038]/25 bg-[#2a241c]/40">
                  <GraduationCap className="h-8 w-8 stroke-1 text-[#c4a77d]" />
                </div>
                <div>
                  <h3 className="font-heading-serif text-xl font-semibold text-stone-100 md:text-2xl">{t.impact.ndhu}</h3>
                  <p className="mt-1 font-mono text-sm text-stone-500">Hualien, Taiwan</p>
                </div>
              </div>

              <div className="mb-10 grid grid-cols-3 gap-2 md:gap-4">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-8 w-8 items-center justify-center rounded-full border border-stone-700/60 bg-slate-900/50 md:h-10 md:w-10">
                    <Globe className="h-4 w-4 stroke-1 text-stone-400 md:h-5 md:w-5" />
                  </div>
                  <div className="font-heading-serif text-lg font-semibold text-stone-100 md:text-2xl">49,442</div>
                  <div className="mt-1 text-[8px] font-medium uppercase tracking-wider text-stone-600 md:text-[10px]">{t.impact.worldRank}</div>
                </div>
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-8 w-8 items-center justify-center rounded-full border border-[#8f7038]/30 bg-[#2a241c]/35 md:h-10 md:w-10">
                    <MapPin className="h-4 w-4 stroke-1 text-[#c4a77d] md:h-5 md:w-5" />
                  </div>
                  <div className="font-heading-serif text-lg font-semibold text-stone-100 md:text-2xl">225</div>
                  <div className="mt-1 text-[8px] font-medium uppercase tracking-wider text-stone-600 md:text-[10px]">{t.impact.countryRank}</div>
                </div>
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-8 w-8 items-center justify-center rounded-full border border-stone-800/80 bg-slate-900/40 md:h-10 md:w-10">
                    <GraduationCap className="h-4 w-4 stroke-1 text-stone-500 md:h-5 md:w-5" />
                  </div>
                  <div className="font-heading-serif text-lg font-semibold text-stone-100 md:text-2xl">1</div>
                  <div className="mt-1 text-[8px] font-medium uppercase tracking-wider text-stone-600 md:text-[10px]">{t.impact.uniRank}</div>
                </div>
              </div>

              <div className="rounded-2xl border border-stone-800/50 bg-slate-900/30 p-4 md:p-6">
                <h4 className="mb-6 text-center font-mono text-xs uppercase tracking-widest text-stone-500 md:text-sm">{t.impact.hIndex}</h4>
                <div className="grid grid-cols-3 gap-2 text-center md:gap-4">
                  <div>
                    <div className="font-heading-serif text-xl font-semibold text-[#c4a77d] md:text-3xl">62</div>
                    <div className="mt-2 text-[8px] uppercase tracking-wider text-stone-600 md:text-[10px]">{t.impact.total}</div>
                  </div>
                  <div>
                    <div className="font-heading-serif text-xl font-semibold text-stone-100 md:text-3xl">47</div>
                    <div className="mt-2 text-[8px] uppercase tracking-wider text-stone-600 md:text-[10px]">{t.impact.last5}</div>
                  </div>
                  <div>
                    <div className="font-heading-serif text-xl font-semibold text-stone-100 md:text-3xl">0.758</div>
                    <div className="mt-2 text-[8px] uppercase tracking-wider text-stone-600 md:text-[10px]">{t.impact.ratio}</div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className={`${uiTokens.surfaceCard} p-7 transition-colors hover:border-stone-500/40 md:p-8`}
            >
              <div className="mb-8 flex items-center gap-4 border-b border-stone-800/60 pb-8">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-stone-600/40 bg-slate-800/40">
                  <GraduationCap className="h-8 w-8 stroke-1 text-stone-400" />
                </div>
                <div>
                  <h3 className="font-heading-serif text-xl font-semibold text-stone-100 md:text-2xl">{t.impact.fgu}</h3>
                  <p className="mt-1 font-mono text-sm text-stone-500">Yilan County, Taiwan</p>
                </div>
              </div>

              <div className="mb-10 grid grid-cols-3 gap-2 md:gap-4">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-8 w-8 items-center justify-center rounded-full border border-stone-700/60 bg-slate-900/50 md:h-10 md:w-10">
                    <Globe className="h-4 w-4 stroke-1 text-stone-400 md:h-5 md:w-5" />
                  </div>
                  <div className="font-heading-serif text-lg font-semibold text-stone-100 md:text-2xl">80,658</div>
                  <div className="mt-1 text-[8px] font-medium uppercase tracking-wider text-stone-600 md:text-[10px]">{t.impact.worldRank}</div>
                </div>
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-8 w-8 items-center justify-center rounded-full border border-[#8f7038]/30 bg-[#2a241c]/35 md:h-10 md:w-10">
                    <MapPin className="h-4 w-4 stroke-1 text-[#c4a77d] md:h-5 md:w-5" />
                  </div>
                  <div className="font-heading-serif text-lg font-semibold text-stone-100 md:text-2xl">423</div>
                  <div className="mt-1 text-[8px] font-medium uppercase tracking-wider text-stone-600 md:text-[10px]">{t.impact.countryRank}</div>
                </div>
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-8 w-8 items-center justify-center rounded-full border border-stone-800/80 bg-slate-900/40 md:h-10 md:w-10">
                    <GraduationCap className="h-4 w-4 stroke-1 text-stone-500 md:h-5 md:w-5" />
                  </div>
                  <div className="font-heading-serif text-lg font-semibold text-stone-100 md:text-2xl">2</div>
                  <div className="mt-1 text-[8px] font-medium uppercase tracking-wider text-stone-600 md:text-[10px]">{t.impact.uniRank}</div>
                </div>
              </div>

              <div className="rounded-2xl border border-stone-800/50 bg-slate-900/30 p-4 md:p-6">
                <h4 className="mb-6 text-center font-mono text-xs uppercase tracking-widest text-stone-500 md:text-sm">{t.impact.hIndex}</h4>
                <div className="grid grid-cols-3 gap-2 text-center md:gap-4">
                  <div>
                    <div className="font-heading-serif text-xl font-semibold text-[#c4a77d] md:text-3xl">52</div>
                    <div className="mt-2 text-[8px] uppercase tracking-wider text-stone-600 md:text-[10px]">{t.impact.total}</div>
                  </div>
                  <div>
                    <div className="font-heading-serif text-xl font-semibold text-stone-100 md:text-3xl">38</div>
                    <div className="mt-2 text-[8px] uppercase tracking-wider text-stone-600 md:text-[10px]">{t.impact.last5}</div>
                  </div>
                  <div>
                    <div className="font-heading-serif text-xl font-semibold text-stone-100 md:text-3xl">0.731</div>
                    <div className="mt-2 text-[8px] uppercase tracking-wider text-stone-600 md:text-[10px]">{t.impact.ratio}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section
        id="contact"
        className="relative overflow-hidden border-t border-stone-800/50 bg-gradient-to-b from-slate-950 to-slate-950 py-24 md:py-28"
      >
        <div className="absolute left-1/2 top-0 h-px w-full max-w-3xl -translate-x-1/2 bg-gradient-to-r from-transparent via-[#8f7038]/35 to-transparent" />

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
            <div className={uiTokens.titleAccentBar} />
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-stone-800/50 bg-slate-900/35 p-7 shadow-2xl backdrop-blur-md md:p-10">
            <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 -translate-y-1/2 translate-x-1/3 rounded-full bg-[#5c4a32]/10 blur-3xl" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 -translate-x-1/3 translate-y-1/3 rounded-full bg-slate-600/10 blur-3xl" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center relative z-10">
              <div className="space-y-6">
                <a href={`mailto:${t.contact.email}`} className="group flex items-start gap-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#8f7038]/30 bg-[#2a241c]/30 transition-all duration-300 group-hover:scale-105 group-hover:bg-[#2a241c]/50">
                    <Mail className="h-5 w-5 stroke-1 text-[#c4a77d]" />
                  </div>
                  <div>
                    <div className={`${uiTokens.metaMono} mb-1`}>{t.contact.labelEmail}</div>
                    <div className="text-lg text-stone-300 transition-colors group-hover:text-[#e8dcc4]">{t.contact.email}</div>
                  </div>
                </a>

                <a href={`tel:${t.contact.phone.replace(/[^0-9+]/g, '')}`} className="group flex items-start gap-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-stone-700/60 bg-slate-900/50 transition-all duration-300 group-hover:scale-105 group-hover:border-stone-600">
                    <Phone className="h-5 w-5 stroke-1 text-stone-400" />
                  </div>
                  <div>
                    <div className={`${uiTokens.metaMono} mb-1`}>{t.contact.labelPhone}</div>
                    <div className="text-lg text-stone-300 transition-colors group-hover:text-stone-100">{t.contact.phone}</div>
                  </div>
                </a>

                <div className="group flex items-start gap-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-stone-800/80 bg-slate-900/40 transition-all duration-300 group-hover:scale-105 group-hover:border-stone-700">
                    <Printer className="h-5 w-5 stroke-1 text-stone-500" />
                  </div>
                  <div>
                    <div className={`${uiTokens.metaMono} mb-1`}>{t.contact.labelFax}</div>
                    <div className="text-lg text-stone-300 transition-colors group-hover:text-stone-100">{t.contact.fax}</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center border-t border-stone-800/50 p-6 md:border-l md:border-t-0 md:p-8">
                <button
                  onClick={onDownloadVCard}
                  type="button"
                  className={`group relative mb-6 flex h-32 w-32 items-center justify-center rounded-full ${uiTokens.buttonPrimaryStrong} transition-all duration-500 hover:scale-105 hover:shadow-[0_0_36px_rgba(196,167,125,0.18)]`}
                  title={t.contact.vcardModal.downloadTooltip}
                >
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#c4a77d]/15 to-slate-600/15 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
                  <UserPlus className="relative z-10 h-12 w-12 text-stone-950 transition-colors group-hover:text-stone-900" />
                </button>
                <div className="text-center">
                  <div className="mb-2 font-display text-sm uppercase tracking-widest text-stone-200">
                    {t.contact.vcardModal.add}
                  </div>
                  <div className="mx-auto flex items-center justify-center gap-1 text-xs text-stone-600">
                    <Download className="w-3 h-3" />
                    {t.contact.vcardModal.click}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <footer className="mt-16 w-full border-t border-stone-800/50 py-8 text-center md:mt-20">
            <p className={uiTokens.footerLegal}>{t.contact.footer}</p>
            <p className={uiTokens.footerCredit}>{t.contact.developer}</p>
          </footer>
        </motion.div>
      </section>
    </>
  );
}

export const BottomSections = memo(BottomSectionsComponent);
