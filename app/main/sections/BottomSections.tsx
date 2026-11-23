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
  const fadeIn = isMobile
    ? {}
    : {
        initial: { opacity: 0, y: 18 } as const,
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
      iconBadge: 'border-[#dfd5c4] bg-[#f7f2e7] text-[#8a6522]',
    },
    {
      key: 'fgu' as const,
      name: t.impact.fgu,
      location: t.impact.fguLocation,
      metrics: impactData.fgu,
      iconBadge: 'border-[#dcd4c7] bg-[#f3efe7] text-[#292622]',
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
      {/* 04 / 學術影響力（暖羊皮紙底 + 白底評比卡片） */}
      <section
        id="impact"
        className="relative scroll-mt-24 overflow-hidden border-t border-[#e5dfd5] bg-[#f3efe7] py-20 md:py-28"
      >
        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center md:mb-14">
            <div className={`${uiTokens.sectionKicker} mb-3`}>04 / SCIENTIFIC IMPACT</div>
            <h2 className={`${uiTokens.sectionTitle} mb-4`}>
              <span className={uiTokens.titleLight}>{t.impact.title}</span>{' '}
              <span className={uiTokens.titleBold}>{t.impact.subtitle}</span>
            </h2>
            <p className="font-mono text-xs tracking-wider text-[#6b655d]">{t.impact.source}</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:gap-7 lg:grid-cols-2">
            {institutions.map((inst, idx) => (
              <motion.div
                key={inst.key}
                {...fadeIn}
                transition={isMobile ? undefined : { delay: idx * 0.08 }}
                className={`${uiTokens.surfaceCard} ${uiTokens.surfaceCardHover} p-7 md:p-8`}
              >
                <div className="mb-8 flex items-center gap-4 border-b border-[#efeae0] pb-6">
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border ${inst.iconBadge}`}
                  >
                    <GraduationCap className="h-7 w-7 stroke-[1.6]" aria-hidden />
                  </div>
                  <div>
                    <h3 className="font-heading-serif text-xl font-semibold text-[#141311] md:text-2xl">
                      {inst.name}
                    </h3>
                    <p className="mt-0.5 font-mono text-xs text-[#6b655d]">{inst.location}</p>
                  </div>
                </div>

                <div className="mb-8 grid grid-cols-3 gap-3 md:gap-4">
                  <div className="text-center">
                    <div className="mx-auto mb-2.5 flex h-9 w-9 items-center justify-center rounded-full border border-[#e5dfd5] bg-[#faf8f4]">
                      <Globe className="h-4 w-4 stroke-[1.6] text-[#57524b]" aria-hidden />
                    </div>
                    <div className="font-heading-serif text-xl font-semibold text-[#141311] md:text-2xl">
                      {inst.metrics.worldRank}
                    </div>
                    <div className="mt-1 text-[11px] font-medium uppercase tracking-wider text-[#6b655d] sm:text-xs">
                      {t.impact.worldRank}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="mx-auto mb-2.5 flex h-9 w-9 items-center justify-center rounded-full border border-[#dfd5c4] bg-[#f7f2e7]">
                      <MapPin className="h-4 w-4 stroke-[1.6] text-[#8a6522]" aria-hidden />
                    </div>
                    <div className="font-heading-serif text-xl font-semibold text-[#141311] md:text-2xl">
                      {inst.metrics.countryRank}
                    </div>
                    <div className="mt-1 text-[11px] font-medium uppercase tracking-wider text-[#6b655d] sm:text-xs">
                      {t.impact.countryRank}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="mx-auto mb-2.5 flex h-9 w-9 items-center justify-center rounded-full border border-[#e5dfd5] bg-[#faf8f4]">
                      <GraduationCap className="h-4 w-4 stroke-[1.6] text-[#57524b]" aria-hidden />
                    </div>
                    <div className="font-heading-serif text-xl font-semibold text-[#141311] md:text-2xl">
                      {inst.metrics.uniRank}
                    </div>
                    <div className="mt-1 text-[11px] font-medium uppercase tracking-wider text-[#6b655d] sm:text-xs">
                      {t.impact.uniRank}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-[#ece6dc] bg-[#faf8f4] p-5">
                  <h4 className="mb-4 text-center font-mono text-xs font-semibold uppercase tracking-[0.18em] text-[#57524b]">
                    {t.impact.hIndex}
                  </h4>
                  <div className="grid grid-cols-3 gap-3 text-center md:gap-4">
                    <div>
                      <div className="font-heading-serif text-2xl font-semibold text-[#8a6522] md:text-3xl">
                        {inst.metrics.hIndex.total}
                      </div>
                      <div className="mt-1.5 text-[11px] uppercase tracking-wider text-[#6b655d] sm:text-xs">
                        {t.impact.total}
                      </div>
                    </div>
                    <div>
                      <div className="font-heading-serif text-2xl font-semibold text-[#141311] md:text-3xl">
                        {inst.metrics.hIndex.last5}
                      </div>
                      <div className="mt-1.5 text-[11px] uppercase tracking-wider text-[#6b655d] sm:text-xs">
                        {t.impact.last5}
                      </div>
                    </div>
                    <div>
                      <div className="font-heading-serif text-2xl font-semibold text-[#141311] md:text-3xl">
                        {inst.metrics.hIndex.ratio}
                      </div>
                      <div className="mt-1.5 text-[11px] uppercase tracking-wider text-[#6b655d] sm:text-xs">
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

      {/* 05 / 聯絡資訊 */}
      <section
        id="contact"
        className="relative scroll-mt-24 overflow-hidden border-t border-[#e5dfd5] bg-[#faf8f4] py-20 md:py-28"
      >
        <motion.div
          {...(isMobile
            ? { className: 'relative z-10 mx-auto max-w-6xl px-6' }
            : {
                initial: { opacity: 0, y: 18 },
                whileInView: { opacity: 1, y: 0 },
                viewport: { once: true, margin: '-50px' },
                transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
                className: 'relative z-10 mx-auto max-w-6xl px-6',
              })}
        >
          <div className="mb-12 text-center md:mb-14">
            <div className={`${uiTokens.sectionKicker} mb-3`}>05 / CONTACT</div>
            <h2 className="font-heading-serif mb-4 text-4xl tracking-tight text-[#141311] md:text-5xl">
              <span className="font-normal italic text-[#8a6522]">{t.contact.title}</span>{' '}
              <span className="font-semibold not-italic text-[#141311]">{t.contact.subtitle}</span>
            </h2>
            <div className={uiTokens.titleAccentBar} />
          </div>

          <div className="mb-12 grid grid-cols-1 gap-6 md:mb-14 md:grid-cols-3 md:gap-7">
            {contactItems.map(({ key, label, values, hrefs, copyValue, Icon }) => {
              const isCopied = copiedField === key;
              return (
                <div
                  key={key}
                  className={`${uiTokens.surfaceCard} ${uiTokens.surfaceCardHover} group flex flex-col justify-between p-7`}
                >
                  <div>
                    <div className="mb-5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 text-[#8a6522]">
                        <Icon className="h-5 w-5 shrink-0 stroke-[1.6]" aria-hidden />
                        <span className="font-mono text-xs font-medium uppercase tracking-[0.16em] text-[#57524b]">
                          {label}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(key, copyValue)}
                        aria-label={`${t.contact.copyAction} ${label}`}
                        className="inline-flex items-center gap-1 rounded-full border border-[#dcd4c7] bg-[#faf8f4] px-2.5 py-1 font-mono text-[11px] text-[#3f3b36] transition-colors hover:border-[#9a742e] hover:text-[#7f5d1e]"
                      >
                        {isCopied ? (
                          <>
                            <Check className="h-3 w-3 text-[#8a6522]" aria-hidden />
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
                            className="break-words text-base font-semibold leading-snug text-[#141311] transition-colors hover:text-[#8a6522] md:text-lg"
                          >
                            {val}
                          </a>
                        ) : (
                          <p key={val} className="text-base font-semibold leading-snug text-[#141311] md:text-lg">
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
              className="group inline-flex items-center gap-3 rounded-full border border-[#181614] bg-[#181614] px-9 py-4 font-heading-serif text-base font-medium tracking-wide text-[#faf8f4] shadow-[0_10px_28px_rgba(20,19,17,0.14)] transition-all hover:border-[#8a6522] hover:bg-[#8a6522]"
            >
              <Download
                className="h-4 w-4 text-[#dcc08e] transition-transform duration-300 group-hover:translate-y-0.5 group-hover:text-white"
                aria-hidden
              />
              {t.contact.vcard}
            </button>
            <p className="font-mono text-xs tracking-wider text-[#6b655d]">
              {t.contact.vcardModal.click}
            </p>
          </div>

          <footer className="mt-16 w-full border-t border-[#e5dfd5] pt-10 md:mt-20">
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
