'use client';

import React, { memo } from 'react';
import { motion } from 'motion/react';
import { useRenderProfiler } from './useRenderProfiler';
import { uiTokens } from './uiTokens';
import { impactData } from '@/lib/impactData';
import {
  Globe,
  MapPin,
  GraduationCap,
  Mail,
  Phone,
  Printer,
  ChevronDown,
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
      emailAdditional?: string[];
      phone: string;
      fax: string;
      vcard: string;
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

function BottomSectionsComponent({ t, lang: _lang, onDownloadVCard }: BottomSectionsProps) {
  useRenderProfiler('BottomSections');
  return (
    <>
      <section id="impact" className="relative overflow-hidden py-28 md:py-32">
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
                  <p className="mt-1 font-mono text-sm text-stone-500">{impactData.ndhu.location}</p>
                </div>
              </div>

              <div className="mb-10 grid grid-cols-3 gap-2 md:gap-4">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-8 w-8 items-center justify-center rounded-full border border-stone-700/60 bg-slate-900/50 md:h-10 md:w-10">
                    <Globe className="h-4 w-4 stroke-1 text-stone-400 md:h-5 md:w-5" />
                  </div>
                  <div className="font-heading-serif text-lg font-semibold text-stone-100 md:text-2xl">{impactData.ndhu.worldRank}</div>
                  <div className="mt-1 text-[8px] font-medium uppercase tracking-wider text-stone-600 md:text-[10px]">{t.impact.worldRank}</div>
                </div>
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-8 w-8 items-center justify-center rounded-full border border-[#8f7038]/30 bg-[#2a241c]/35 md:h-10 md:w-10">
                    <MapPin className="h-4 w-4 stroke-1 text-[#c4a77d] md:h-5 md:w-5" />
                  </div>
                  <div className="font-heading-serif text-lg font-semibold text-stone-100 md:text-2xl">{impactData.ndhu.countryRank}</div>
                  <div className="mt-1 text-[8px] font-medium uppercase tracking-wider text-stone-600 md:text-[10px]">{t.impact.countryRank}</div>
                </div>
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-8 w-8 items-center justify-center rounded-full border border-stone-800/80 bg-slate-900/40 md:h-10 md:w-10">
                    <GraduationCap className="h-4 w-4 stroke-1 text-stone-500 md:h-5 md:w-5" />
                  </div>
                  <div className="font-heading-serif text-lg font-semibold text-stone-100 md:text-2xl">{impactData.ndhu.uniRank}</div>
                  <div className="mt-1 text-[8px] font-medium uppercase tracking-wider text-stone-600 md:text-[10px]">{t.impact.uniRank}</div>
                </div>
              </div>

              <div className="rounded-2xl border border-stone-800/50 bg-slate-900/30 p-4 md:p-6">
                <h4 className="mb-6 text-center font-mono text-xs uppercase tracking-widest text-stone-500 md:text-sm">{t.impact.hIndex}</h4>
                <div className="grid grid-cols-3 gap-2 text-center md:gap-4">
                  <div>
                    <div className="font-heading-serif text-xl font-semibold text-[#c4a77d] md:text-3xl">{impactData.ndhu.hIndex.total}</div>
                    <div className="mt-2 text-[8px] uppercase tracking-wider text-stone-600 md:text-[10px]">{t.impact.total}</div>
                  </div>
                  <div>
                    <div className="font-heading-serif text-xl font-semibold text-stone-100 md:text-3xl">{impactData.ndhu.hIndex.last5}</div>
                    <div className="mt-2 text-[8px] uppercase tracking-wider text-stone-600 md:text-[10px]">{t.impact.last5}</div>
                  </div>
                  <div>
                    <div className="font-heading-serif text-xl font-semibold text-stone-100 md:text-3xl">{impactData.ndhu.hIndex.ratio}</div>
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
                  <p className="mt-1 font-mono text-sm text-stone-500">{impactData.fgu.location}</p>
                </div>
              </div>

              <div className="mb-10 grid grid-cols-3 gap-2 md:gap-4">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-8 w-8 items-center justify-center rounded-full border border-stone-700/60 bg-slate-900/50 md:h-10 md:w-10">
                    <Globe className="h-4 w-4 stroke-1 text-stone-400 md:h-5 md:w-5" />
                  </div>
                  <div className="font-heading-serif text-lg font-semibold text-stone-100 md:text-2xl">{impactData.fgu.worldRank}</div>
                  <div className="mt-1 text-[8px] font-medium uppercase tracking-wider text-stone-600 md:text-[10px]">{t.impact.worldRank}</div>
                </div>
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-8 w-8 items-center justify-center rounded-full border border-[#8f7038]/30 bg-[#2a241c]/35 md:h-10 md:w-10">
                    <MapPin className="h-4 w-4 stroke-1 text-[#c4a77d] md:h-5 md:w-5" />
                  </div>
                  <div className="font-heading-serif text-lg font-semibold text-stone-100 md:text-2xl">{impactData.fgu.countryRank}</div>
                  <div className="mt-1 text-[8px] font-medium uppercase tracking-wider text-stone-600 md:text-[10px]">{t.impact.countryRank}</div>
                </div>
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-8 w-8 items-center justify-center rounded-full border border-stone-800/80 bg-slate-900/40 md:h-10 md:w-10">
                    <GraduationCap className="h-4 w-4 stroke-1 text-stone-500 md:h-5 md:w-5" />
                  </div>
                  <div className="font-heading-serif text-lg font-semibold text-stone-100 md:text-2xl">{impactData.fgu.uniRank}</div>
                  <div className="mt-1 text-[8px] font-medium uppercase tracking-wider text-stone-600 md:text-[10px]">{t.impact.uniRank}</div>
                </div>
              </div>

              <div className="rounded-2xl border border-stone-800/50 bg-slate-900/30 p-4 md:p-6">
                <h4 className="mb-6 text-center font-mono text-xs uppercase tracking-widest text-stone-500 md:text-sm">{t.impact.hIndex}</h4>
                <div className="grid grid-cols-3 gap-2 text-center md:gap-4">
                  <div>
                    <div className="font-heading-serif text-xl font-semibold text-[#c4a77d] md:text-3xl">{impactData.fgu.hIndex.total}</div>
                    <div className="mt-2 text-[8px] uppercase tracking-wider text-stone-600 md:text-[10px]">{t.impact.total}</div>
                  </div>
                  <div>
                    <div className="font-heading-serif text-xl font-semibold text-stone-100 md:text-3xl">{impactData.fgu.hIndex.last5}</div>
                    <div className="mt-2 text-[8px] uppercase tracking-wider text-stone-600 md:text-[10px]">{t.impact.last5}</div>
                  </div>
                  <div>
                    <div className="font-heading-serif text-xl font-semibold text-stone-100 md:text-3xl">{impactData.fgu.hIndex.ratio}</div>
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
        className="relative overflow-hidden border-t border-white/[0.06] bg-[var(--app-bg)] py-28 md:py-36"
      >
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-full w-full max-w-5xl -translate-x-1/2 bg-[radial-gradient(circle_at_50%_42%,rgba(212,175,55,0.035),transparent_68%)]"
          aria-hidden
        />
        <div className="absolute left-1/2 top-0 h-px w-full max-w-3xl -translate-x-1/2 bg-gradient-to-r from-transparent via-[#d4af37]/25 to-transparent" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 mx-auto max-w-6xl px-6"
        >
          <div className="mb-14 text-center md:mb-16">
            <h2 className="font-heading-serif mb-5 text-4xl tracking-tight text-stone-100 md:text-5xl">
              <span className="font-normal italic text-[#e8dcc4]/95">{t.contact.title}</span>{' '}
              <span className="font-semibold not-italic text-stone-100">{t.contact.subtitle}</span>
            </h2>
            <div className="mx-auto h-px w-20 bg-gradient-to-r from-transparent via-[#d4af37]/45 to-transparent" />
          </div>

          <div className="mb-14 grid grid-cols-1 gap-8 md:mb-16 md:grid-cols-3">
            {(
              [
                {
                  label: t.contact.labelEmail,
                  value: [t.contact.email, ...(t.contact.emailAdditional ?? [])],
                  href: [t.contact.email, ...(t.contact.emailAdditional ?? [])].map((e) => `mailto:${e}`),
                  Icon: Mail,
                },
                {
                  label: t.contact.labelPhone,
                  value: t.contact.phone,
                  href: `tel:${t.contact.phone.replace(/[^0-9+]/g, '')}`,
                  Icon: Phone,
                },
                {
                  label: t.contact.labelFax,
                  value: t.contact.fax,
                  href: null as string | null,
                  Icon: Printer,
                },
              ] as const
            ).map(({ label, value, href, Icon }) => (
              <div
                key={label}
                className="group relative rounded-2xl border border-[rgba(212,175,55,0.12)] bg-[rgba(255,255,255,0.02)] p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-500 hover:border-[rgba(212,175,55,0.22)] hover:bg-[rgba(255,255,255,0.035)]"
              >
                <div className="mb-5 flex items-center gap-2.5 text-[#c4a77d]/85 transition-colors group-hover:text-[#e8dcc4]">
                  <Icon className="h-5 w-5 shrink-0 stroke-[1.25]" aria-hidden />
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500 group-hover:text-stone-400">
                    {label}
                  </span>
                </div>
                {Array.isArray(value) && Array.isArray(href) ? (
                  <div className="flex flex-col gap-2">
                    {value.map((v, i) => (
                      <a
                        key={v}
                        href={href[i]}
                        className="break-words text-lg font-medium leading-snug text-stone-200 transition-colors hover:text-stone-50"
                      >
                        {v}
                      </a>
                    ))}
                  </div>
                ) : href ? (
                  <a
                    href={href as string}
                    className="break-words text-lg font-medium leading-snug text-stone-200 transition-colors hover:text-stone-50"
                  >
                    {value as string}
                  </a>
                ) : (
                  <p className="text-lg font-medium leading-snug text-stone-200">{value as string}</p>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={onDownloadVCard}
              title={t.contact.vcardModal.downloadTooltip}
              className="group relative overflow-hidden rounded-full border border-[rgba(212,175,55,0.28)] bg-transparent px-10 py-4 transition-all duration-300 hover:border-[rgba(212,175,55,0.48)]"
            >
              <span
                className="absolute inset-0 translate-y-full bg-[rgba(212,175,55,0.08)] transition-transform duration-300 ease-out group-hover:translate-y-0"
                aria-hidden
              />
              <span className="relative flex items-center gap-3 font-heading-serif text-base tracking-wide text-[#e8dcc4]">
                {t.contact.vcard}
                <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" aria-hidden />
              </span>
            </button>
            <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-stone-600">
              <Download className="h-3 w-3 shrink-0 opacity-80" aria-hidden />
              {t.contact.vcardModal.click}
            </p>
          </div>

          <footer className="mt-20 w-full border-t border-white/[0.06] py-10 md:mt-24">
            <div className="flex flex-col items-center text-center">
              <p className={uiTokens.footerLegal}>
                {t.contact.footer.replace(/\{year\}/g, String(new Date().getFullYear()))}
              </p>
              <p className={uiTokens.footerCredit}>{t.contact.developer}</p>
            </div>
          </footer>
        </motion.div>
      </section>
    </>
  );
}

export const BottomSections = memo(BottomSectionsComponent);
