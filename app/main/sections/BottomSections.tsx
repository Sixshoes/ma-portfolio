'use client';

import React, { memo, useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useRenderProfiler } from './useRenderProfiler';
import { uiTokens } from './uiTokens';
import { impactData } from '@/lib/impactData';
import {
  Check,
  Copy,
  Download,
  Globe,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Printer,
} from 'lucide-react';

type BottomSectionsProps = {
  t: {
    impact: {
      title: string;
      subtitle: string;
      ndhu: string;
      ndhuLocation: string;
      fgu: string;
      fguLocation: string;
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
      copyAction: string;
      copiedAction: string;
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
  isMobile?: boolean;
  onDownloadVCard: () => void;
};

function BottomSectionsComponent({ t, lang: _lang, isMobile = false, onDownloadVCard }: BottomSectionsProps) {
  useRenderProfiler('BottomSections');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const cardSurface = isMobile ? uiTokens.surfaceCardSolid : uiTokens.surfaceCard;
  const fadeIn = isMobile
    ? {}
    : {
        initial: { opacity: 0, y: 20 } as const,
        whileInView: { opacity: 1, y: 0 } as const,
        viewport: { once: true } as const,
      };

  const handleCopy = useCallback((key: string, text: string) => {
    if (navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(text).then(() => setCopiedField(key));
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedField(key);
    }
  }, []);

  useEffect(() => {
    if (!copiedField) return;
    const timer = window.setTimeout(() => setCopiedField(null), 1800);
    return () => window.clearTimeout(timer);
  }, [copiedField]);

  const institutions = [
    {
      key: 'ndhu' as const,
      name: t.impact.ndhu,
      location: t.impact.ndhuLocation,
      metrics: impactData.ndhu,
      accentBorder: 'hover:border-[#d4af37]/45',
      iconBadge: 'border-[#c4a77d]/35 bg-[#2a241c]/65 text-[#d4af37]',
    },
    {
      key: 'fgu' as const,
      name: t.impact.fgu,
      location: t.impact.fguLocation,
      metrics: impactData.fgu,
      accentBorder: 'hover:border-stone-500/50',
      iconBadge: 'border-stone-600/50 bg-stone-800/60 text-stone-200',
    },
  ];

  const contactItems = [
    {
      key: 'email',
      label: t.contact.labelEmail,
      values: [t.contact.email, ...(t.contact.emailAdditional ?? [])],
      hrefs: [t.contact.email, ...(t.contact.emailAdditional ?? [])].map((e) => `mailto:${e}`),
      copyValue: t.contact.email,
      Icon: Mail,
    },
    {
      key: 'phone',
      label: t.contact.labelPhone,
      values: [t.contact.phone],
      hrefs: [`tel:${t.contact.phone.replace(/[^0-9+]/g, '')}`],
      copyValue: t.contact.phone,
      Icon: Phone,
    },
    {
      key: 'fax',
      label: t.contact.labelFax,
      values: [t.contact.fax],
      hrefs: [null],
      copyValue: t.contact.fax,
      Icon: Printer,
    },
  ] as const;

  return (
    <>
      <section id="impact" className="relative scroll-mt-24 overflow-hidden py-24 md:py-32">
        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center md:mb-16">
            <h2 className={`${uiTokens.sectionTitle} mb-5`}>
              <span className={uiTokens.titleLight}>{t.impact.title}</span> <br />
              <span className={uiTokens.titleBold}>{t.impact.subtitle}</span>
            </h2>
            <p className="mt-4 font-mono text-xs tracking-wider text-stone-300">{t.impact.source}</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:gap-7 lg:grid-cols-2">
            {institutions.map((inst, idx) => (
              <motion.div
                key={inst.key}
                {...fadeIn}
                transition={isMobile ? undefined : { delay: idx * 0.1 }}
                className={`${cardSurface} p-7 transition-colors ${inst.accentBorder} md:p-8`}
              >
                <div className="mb-8 flex items-center gap-4 border-b border-stone-800/75 pb-7">
                  <div
                    className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full border ${inst.iconBadge}`}
                  >
                    <GraduationCap className="h-8 w-8 stroke-[1.5]" aria-hidden />
                  </div>
                  <div>
                    <h3 className="font-heading-serif text-xl font-semibold text-stone-100 md:text-2xl">
                      {inst.name}
                    </h3>
                    <p className="mt-1 font-mono text-sm text-stone-300">{inst.location}</p>
                  </div>
                </div>

                <div className="mb-8 grid grid-cols-3 gap-3 md:gap-4">
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full border border-stone-700/70 bg-stone-900/75 md:h-10 md:w-10">
                      <Globe className="h-4 w-4 stroke-[1.5] text-stone-300 md:h-5 md:w-5" aria-hidden />
                    </div>
                    <div className="font-heading-serif text-xl font-semibold text-stone-100 md:text-2xl">
                      {inst.metrics.worldRank}
                    </div>
                    <div className="mt-1.5 text-[11px] font-medium uppercase tracking-wider text-stone-300 sm:text-xs">
                      {t.impact.worldRank}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full border border-[#c4a77d]/35 bg-[#2a241c]/55 md:h-10 md:w-10">
                      <MapPin className="h-4 w-4 stroke-[1.5] text-[#d4af37] md:h-5 md:w-5" aria-hidden />
                    </div>
                    <div className="font-heading-serif text-xl font-semibold text-stone-100 md:text-2xl">
                      {inst.metrics.countryRank}
                    </div>
                    <div className="mt-1.5 text-[11px] font-medium uppercase tracking-wider text-stone-300 sm:text-xs">
                      {t.impact.countryRank}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full border border-stone-700/70 bg-stone-900/75 md:h-10 md:w-10">
                      <GraduationCap className="h-4 w-4 stroke-[1.5] text-stone-300 md:h-5 md:w-5" aria-hidden />
                    </div>
                    <div className="font-heading-serif text-xl font-semibold text-stone-100 md:text-2xl">
                      {inst.metrics.uniRank}
                    </div>
                    <div className="mt-1.5 text-[11px] font-medium uppercase tracking-wider text-stone-300 sm:text-xs">
                      {t.impact.uniRank}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-stone-800/75 bg-stone-950/55 p-5 md:p-6">
                  <h4 className="mb-5 text-center font-mono text-xs uppercase tracking-widest text-stone-300 md:text-sm">
                    {t.impact.hIndex}
                  </h4>
                  <div className="grid grid-cols-3 gap-3 text-center md:gap-4">
                    <div>
                      <div className="font-heading-serif text-2xl font-semibold text-[#d4af37] md:text-3xl">
                        {inst.metrics.hIndex.total}
                      </div>
                      <div className="mt-2 text-[11px] uppercase tracking-wider text-stone-300 sm:text-xs">
                        {t.impact.total}
                      </div>
                    </div>
                    <div>
                      <div className="font-heading-serif text-2xl font-semibold text-stone-100 md:text-3xl">
                        {inst.metrics.hIndex.last5}
                      </div>
                      <div className="mt-2 text-[11px] uppercase tracking-wider text-stone-300 sm:text-xs">
                        {t.impact.last5}
                      </div>
                    </div>
                    <div>
                      <div className="font-heading-serif text-2xl font-semibold text-stone-100 md:text-3xl">
                        {inst.metrics.hIndex.ratio}
                      </div>
                      <div className="mt-2 text-[11px] uppercase tracking-wider text-stone-300 sm:text-xs">
                        {t.impact.ratio}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="contact"
        className="relative scroll-mt-24 overflow-hidden border-t border-stone-800/70 bg-[var(--app-bg)] py-24 md:py-32"
      >
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-full w-full max-w-5xl -translate-x-1/2 bg-[radial-gradient(circle_at_50%_42%,rgba(212,175,55,0.045),transparent_68%)]"
          aria-hidden
        />
        <div className="absolute left-1/2 top-0 h-px w-full max-w-3xl -translate-x-1/2 bg-gradient-to-r from-transparent via-[#d4af37]/30 to-transparent" />

        <motion.div
          {...(isMobile
            ? { className: 'relative z-10 mx-auto max-w-6xl px-6' }
            : {
                initial: { opacity: 0, y: 24 },
                whileInView: { opacity: 1, y: 0 },
                viewport: { once: true, margin: '-60px' },
                transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                className: 'relative z-10 mx-auto max-w-6xl px-6',
              })}
        >
          <div className="mb-14 text-center md:mb-16">
            <h2 className="font-heading-serif mb-5 text-4xl tracking-tight text-stone-100 md:text-5xl">
              <span className="font-normal italic text-[#e8dcc4]">{t.contact.title}</span>{' '}
              <span className="font-semibold not-italic text-stone-100">{t.contact.subtitle}</span>
            </h2>
            <div className="mx-auto h-px w-20 bg-gradient-to-r from-transparent via-[#d4af37]/50 to-transparent" />
          </div>

          <div className="mb-14 grid grid-cols-1 gap-6 md:mb-16 md:grid-cols-3 md:gap-8">
            {contactItems.map(({ key, label, values, hrefs, copyValue, Icon }) => {
              const isCopied = copiedField === key;
              return (
                <div
                  key={key}
                  className="group relative flex flex-col justify-between rounded-2xl border border-stone-700/55 bg-stone-900/45 p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-300 hover:border-[#c4a77d]/45 hover:bg-stone-900/70 md:p-8"
                >
                  <div>
                    <div className="mb-5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 text-[#d4af37]">
                        <Icon className="h-5 w-5 shrink-0 stroke-[1.5]" aria-hidden />
                        <span className="font-mono text-xs uppercase tracking-[0.18em] text-stone-300">
                          {label}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(key, copyValue)}
                        aria-label={`${t.contact.copyAction} ${label}`}
                        className="inline-flex items-center gap-1 rounded-full border border-stone-700/75 bg-stone-950/65 px-2.5 py-1 font-mono text-[11px] text-stone-300 transition-colors hover:border-[#c4a77d]/60 hover:text-[#e8dcc4]"
                      >
                        {isCopied ? (
                          <>
                            <Check className="h-3 w-3 text-[#d4af37]" aria-hidden />
                            {t.contact.copiedAction}
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" aria-hidden />
                            {t.contact.copyAction}
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex flex-col gap-2">
                      {values.map((val, i) => {
                        const href = hrefs[i];
                        return href ? (
                          <a
                            key={val}
                            href={href}
                            className="break-words text-base font-medium leading-snug text-stone-100 transition-colors hover:text-[#e8dcc4] md:text-lg"
                          >
                            {val}
                          </a>
                        ) : (
                          <p key={val} className="text-base font-medium leading-snug text-stone-100 md:text-lg">
                            {val}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={onDownloadVCard}
              title={t.contact.vcardModal.downloadTooltip}
              className="group relative overflow-hidden rounded-full border border-[#d4af37]/45 bg-stone-900/50 px-10 py-4 transition-all duration-300 hover:border-[#d4af37]/75 hover:bg-[#2a241c]/55"
            >
              <span className="relative flex items-center gap-3 font-heading-serif text-base tracking-wide text-[#f0e4cc]">
                <Download
                  className="h-4 w-4 text-[#d4af37] transition-transform duration-300 group-hover:translate-y-0.5"
                  aria-hidden
                />
                {t.contact.vcard}
              </span>
            </button>
            <p className="font-mono text-xs tracking-wider text-stone-400">
              {t.contact.vcardModal.click}
            </p>
          </div>

          <footer className="mt-20 w-full border-t border-stone-800/70 py-10 md:mt-24">
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
