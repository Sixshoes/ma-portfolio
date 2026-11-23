'use client';

import React, { memo, useCallback, useEffect, useState } from 'react';
import { Check, Copy, Download } from 'lucide-react';
import { useRenderProfiler } from './useRenderProfiler';
import { uiTokens } from './uiTokens';
import { impactData } from '@/lib/impactData';

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

function BottomSectionsComponent({ t, lang, onDownloadVCard }: BottomSectionsProps) {
  useRenderProfiler('BottomSections');
  const [copiedField, setCopiedField] = useState<string | null>(null);

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

  const impactKicker = lang === 'zh' ? '國際影響力評比' : 'GLOBAL BENCHMARKS';
  const contactKicker = lang === 'zh' ? '學術交流與聯繫' : 'CORRESPONDENCE';

  const institutions = [
    {
      key: 'ndhu' as const,
      index: '01',
      name: t.impact.ndhu,
      location: t.impact.ndhuLocation,
      metrics: impactData.ndhu,
      ratioPct: Math.min(100, Math.round(Number(impactData.ndhu.hIndex.ratio) * 100)),
    },
    {
      key: 'fgu' as const,
      index: '02',
      name: t.impact.fgu,
      location: t.impact.fguLocation,
      metrics: impactData.fgu,
      ratioPct: Math.min(100, Math.round(Number(impactData.fgu.hIndex.ratio) * 100)),
    },
  ];

  const contactItems = [
    {
      key: 'email',
      label: t.contact.labelEmail,
      values: [t.contact.email, ...(t.contact.emailAdditional ?? [])],
      hrefs: [t.contact.email, ...(t.contact.emailAdditional ?? [])].map((e) => `mailto:${e}`),
      copyValue: t.contact.email,
    },
    {
      key: 'phone',
      label: t.contact.labelPhone,
      values: [t.contact.phone],
      hrefs: [`tel:${t.contact.phone.replace(/[^0-9+]/g, '')}`],
      copyValue: t.contact.phone,
    },
    {
      key: 'fax',
      label: t.contact.labelFax,
      values: [t.contact.fax],
      hrefs: [null],
      copyValue: t.contact.fax,
    },
  ] as const;

  return (
    <>
      {/* 學術影響力：無縫雙欄黑曜石數據碑 + 視覺化近五年比例條 */}
      <section
        id="impact"
        className="relative scroll-mt-24 border-t border-white/[0.08] bg-[#0a0a09] py-24 md:py-32"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 flex flex-col items-start justify-between gap-4 md:mb-16 md:flex-row md:items-end">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <span className="h-px w-6 bg-[#c8a464]" aria-hidden />
                <span className={uiTokens.sectionKicker}>{impactKicker}</span>
              </div>
              <h2 className={uiTokens.sectionTitle}>
                <span className={uiTokens.titleLight}>{t.impact.title}</span>{' '}
                <span className={uiTokens.titleBold}>{t.impact.subtitle}</span>
              </h2>
            </div>
            <p className="font-mono text-xs text-[#8f8980]">{t.impact.source}</p>
          </div>

          <div className="overflow-hidden rounded-xl border border-white/[0.09] bg-white/[0.08]">
            <div className="grid grid-cols-1 gap-px lg:grid-cols-2">
              {institutions.map((inst) => (
                <div
                  key={inst.key}
                  className="bg-[#0d0c0b] p-8 transition-colors duration-300 hover:bg-[#100f0d] md:p-10"
                >
                  <div className="mb-8 flex items-baseline justify-between gap-4 border-b border-white/[0.08] pb-6">
                    <div>
                      <h3 className="font-heading-serif text-2xl font-medium text-[#f5f3ef] md:text-[1.65rem]">
                        {inst.name}
                      </h3>
                      <p className="mt-1 font-mono text-xs text-[#8f8980]">{inst.location}</p>
                    </div>
                    <span className="font-mono text-xs tracking-widest text-[#c8a464]/80">
                      {inst.index}
                    </span>
                  </div>

                  {/* 三項國際排名 */}
                  <div className="mb-8 grid grid-cols-3 gap-4 border-b border-white/[0.07] pb-8">
                    <div>
                      <div className="font-heading-serif text-2xl font-medium text-[#f5f3ef] [font-variant-numeric:lining-nums] md:text-3xl">
                        {inst.metrics.worldRank}
                      </div>
                      <div className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-[#8f8980]">
                        {t.impact.worldRank}
                      </div>
                    </div>
                    <div className="border-l border-white/[0.07] pl-4">
                      <div className="font-heading-serif text-2xl font-medium text-[#e2c992] [font-variant-numeric:lining-nums] md:text-3xl">
                        #{inst.metrics.countryRank}
                      </div>
                      <div className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-[#8f8980]">
                        {t.impact.countryRank}
                      </div>
                    </div>
                    <div className="border-l border-white/[0.07] pl-4">
                      <div className="font-heading-serif text-2xl font-medium text-[#f5f3ef] [font-variant-numeric:lining-nums] md:text-3xl">
                        #{inst.metrics.uniRank}
                      </div>
                      <div className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-[#8f8980]">
                        {t.impact.uniRank}
                      </div>
                    </div>
                  </div>

                  {/* H-Index 與近五年動能視覺條 */}
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#9b958c]">
                        {t.impact.hIndex}
                      </span>
                      <span className="font-mono text-xs text-[#e2c992]">
                        {t.impact.ratio}: {inst.metrics.hIndex.ratio}
                      </span>
                    </div>

                    <div className="mb-4 grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-gold-sheen font-heading-serif text-3xl font-semibold [font-variant-numeric:lining-nums] md:text-4xl">
                          {inst.metrics.hIndex.total}
                        </div>
                        <div className="mt-1 font-mono text-[11px] text-[#8f8980]">{t.impact.total}</div>
                      </div>
                      <div>
                        <div className="font-heading-serif text-3xl font-medium text-[#f5f3ef] [font-variant-numeric:lining-nums] md:text-4xl">
                          {inst.metrics.hIndex.last5}
                        </div>
                        <div className="mt-1 font-mono text-[11px] text-[#8f8980]">{t.impact.last5}</div>
                      </div>
                      <div>
                        <div className="font-heading-serif text-3xl font-medium text-[#b8b3aa] [font-variant-numeric:lining-nums] md:text-4xl">
                          {inst.metrics.hIndex.ratio}
                        </div>
                        <div className="mt-1 font-mono text-[11px] text-[#8f8980]">
                          {lang === 'zh' ? '動能比' : 'Ratio'}
                        </div>
                      </div>
                    </div>

                    {/* 視覺化比例進度細線 */}
                    <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.07]">
                      <div
                        style={{ width: `${inst.ratioPct}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-[#8f6c30] via-[#c8a464] to-[#e5cea0]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 聯絡方式與頁尾刊尾（建築式三欄細線排版） */}
      <section
        id="contact"
        className="relative scroll-mt-24 border-t border-white/[0.08] bg-[#080807] pb-16 pt-24 md:pb-20 md:pt-32"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 flex flex-col items-start justify-between gap-6 md:mb-16 md:flex-row md:items-end">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <span className="h-px w-6 bg-[#c8a464]" aria-hidden />
                <span className={uiTokens.sectionKicker}>{contactKicker}</span>
              </div>
              <h2 className={uiTokens.sectionTitle}>
                <span className={uiTokens.titleLight}>{t.contact.title}</span>{' '}
                <span className={uiTokens.titleBold}>{t.contact.subtitle}</span>
              </h2>
            </div>

            <button
              type="button"
              onClick={onDownloadVCard}
              title={t.contact.vcardModal.downloadTooltip}
              className="group inline-flex items-center gap-2.5 rounded-lg border border-white/[0.16] bg-[#f5f3ef] px-6 py-3 font-display text-xs font-semibold uppercase tracking-[0.16em] text-[#080807] transition-all hover:border-[#e5cea0] hover:bg-[#e5cea0]"
            >
              <Download className="h-4 w-4 transition-transform group-hover:translate-y-0.5" aria-hidden />
              {t.contact.vcard}
            </button>
          </div>

          {/* 無縫三欄細線聯繫列 */}
          <div className="overflow-hidden rounded-xl border border-white/[0.09] bg-white/[0.08]">
            <div className="grid grid-cols-1 gap-px md:grid-cols-3">
              {contactItems.map(({ key, label, values, hrefs, copyValue }) => {
                const isCopied = copiedField === key;
                return (
                  <div
                    key={key}
                    className="flex flex-col justify-between bg-[#0c0b0a] p-7 transition-colors hover:bg-[#100f0d] md:p-8"
                  >
                    <div className="mb-6 flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#8f8980]">
                        {label}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(key, copyValue)}
                        aria-label={`${t.contact.copyAction} ${label}`}
                        className="inline-flex items-center gap-1 font-mono text-[11px] text-[#8f8980] transition-colors hover:text-[#e5cea0]"
                      >
                        {isCopied ? (
                          <>
                            <Check className="h-3 w-3 text-[#c8a464]" aria-hidden />
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

                    <div className="flex flex-col gap-1.5">
                      {values.map((val, i) => {
                        const href = hrefs[i];
                        return href ? (
                          <a
                            key={val}
                            href={href}
                            className="break-words font-heading-serif text-lg font-medium text-[#f5f3ef] transition-colors hover:text-[#e5cea0] md:text-xl"
                          >
                            {val}
                          </a>
                        ) : (
                          <p
                            key={val}
                            className="font-heading-serif text-lg font-medium text-[#f5f3ef] md:text-xl"
                          >
                            {val}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <footer className="mt-16 flex flex-col items-center justify-between gap-3 border-t border-white/[0.08] pt-8 sm:flex-row">
            <p className={uiTokens.footerLegal}>
              {t.contact.footer.replace(/\{year\}/g, String(new Date().getFullYear()))}
            </p>
            <p className="font-mono text-xs tracking-[0.12em] text-[#78726a]">
              {t.contact.developer}
            </p>
          </footer>
        </div>
      </section>
    </>
  );
}

export const BottomSections = memo(BottomSectionsComponent);
