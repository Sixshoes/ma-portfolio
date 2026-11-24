'use client';

import React, { memo, useCallback, useEffect, useState } from 'react';
import { ArrowUp, Check, Copy, Download } from 'lucide-react';
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
      backToTop: string;
    };
  };
  lang: 'en' | 'zh';
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

  const handleBackToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const impactKicker = lang === 'zh' ? '國際影響力評比' : 'BIBLIOMETRIC RANKINGS';
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
      {/* 學術影響力：無縫雙欄瑞士數據表 */}
      <section
        id="impact"
        className="scroll-mt-20 border-t border-[#DCE2E8] bg-white py-20 md:py-24"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 flex flex-col items-start justify-between gap-4 md:mb-12 md:flex-row md:items-end">
            <div>
              <div className="mb-2.5 flex items-center gap-2.5">
                <span className="h-[2px] w-5 bg-[#0F4C81]" aria-hidden />
                <span className={uiTokens.sectionKicker}>{impactKicker}</span>
              </div>
              <h2 className={uiTokens.sectionTitle}>
                {t.impact.title}
                {lang === 'en' ? ' ' : ''}
                {t.impact.subtitle}
              </h2>
            </div>
            <p className="font-mono text-xs text-[#5A6775]">{t.impact.source}</p>
          </div>

          <div className="overflow-hidden rounded-lg border border-[#DCE2E8] bg-[#DCE2E8]">
            <div className="grid grid-cols-1 gap-px lg:grid-cols-2">
              {institutions.map((inst) => (
                <div key={inst.key} className="bg-[#FAFBFC] p-7 md:p-8">
                  <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-[#DCE2E8] pb-5">
                    <div>
                      <h3 className="text-xl font-semibold text-[#11161C] md:text-2xl">
                        {inst.name}
                      </h3>
                      <p className="mt-0.5 font-mono text-xs text-[#5A6775]">{inst.location}</p>
                    </div>
                    <span className="font-mono text-xs font-semibold tracking-widest text-[#0F4C81]">
                      {inst.index}
                    </span>
                  </div>

                  {/* 三項國際排名 */}
                  <div className="mb-6 grid grid-cols-3 gap-4 border-b border-[#DCE2E8] pb-6">
                    <div>
                      <div className="font-mono text-2xl font-semibold text-[#11161C] [font-variant-numeric:tabular-nums] md:text-3xl">
                        {inst.metrics.worldRank}
                      </div>
                      <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.1em] text-[#5A6775]">
                        {t.impact.worldRank}
                      </div>
                    </div>
                    <div className="border-l border-[#DCE2E8] pl-4">
                      <div className="font-mono text-2xl font-semibold text-[#0F4C81] [font-variant-numeric:tabular-nums] md:text-3xl">
                        #{inst.metrics.countryRank}
                      </div>
                      <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.1em] text-[#5A6775]">
                        {t.impact.countryRank}
                      </div>
                    </div>
                    <div className="border-l border-[#DCE2E8] pl-4">
                      <div className="font-mono text-2xl font-semibold text-[#11161C] [font-variant-numeric:tabular-nums] md:text-3xl">
                        #{inst.metrics.uniRank}
                      </div>
                      <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.1em] text-[#5A6775]">
                        {t.impact.uniRank}
                      </div>
                    </div>
                  </div>

                  {/* H-Index 與近五年動能比例條 */}
                  <div>
                    <div className="mb-3.5 flex items-center justify-between">
                      <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5A6775]">
                        {t.impact.hIndex}
                      </span>
                      <span className="font-mono text-xs font-medium text-[#0F4C81]">
                        {t.impact.ratio}: {inst.metrics.hIndex.ratio}
                      </span>
                    </div>

                    <div className="mb-4 grid grid-cols-3 gap-4">
                      <div>
                        <div className="font-mono text-3xl font-semibold text-[#0F4C81] [font-variant-numeric:tabular-nums]">
                          {inst.metrics.hIndex.total}
                        </div>
                        <div className="mt-0.5 font-mono text-[11px] text-[#5A6775]">
                          {t.impact.total}
                        </div>
                      </div>
                      <div>
                        <div className="font-mono text-3xl font-semibold text-[#11161C] [font-variant-numeric:tabular-nums]">
                          {inst.metrics.hIndex.last5}
                        </div>
                        <div className="mt-0.5 font-mono text-[11px] text-[#5A6775]">
                          {t.impact.last5}
                        </div>
                      </div>
                      <div>
                        <div className="font-mono text-3xl font-medium text-[#475569] [font-variant-numeric:tabular-nums]">
                          {inst.metrics.hIndex.ratio}
                        </div>
                        <div className="mt-0.5 font-mono text-[11px] text-[#5A6775]">
                          {lang === 'zh' ? '動能比' : 'Ratio'}
                        </div>
                      </div>
                    </div>

                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#DCE2E8]">
                      <div
                        style={{ width: `${inst.ratioPct}%` }}
                        className="h-full rounded-full bg-[#0F4C81]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 聯絡方式與頁尾（內嵌回頂部連結並確保與懸浮鈕零重疊） */}
      <section
        id="contact"
        className="scroll-mt-20 border-t border-[#DCE2E8] bg-[#F6F7F8] pb-16 pt-20 md:pb-20 md:pt-24"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-10 flex flex-col items-start justify-between gap-6 md:mb-12 md:flex-row md:items-end">
            <div>
              <div className="mb-2.5 flex items-center gap-2.5">
                <span className="h-[2px] w-5 bg-[#0F4C81]" aria-hidden />
                <span className={uiTokens.sectionKicker}>{contactKicker}</span>
              </div>
              <h2 className={uiTokens.sectionTitle}>
                {t.contact.title}
                {lang === 'en' ? ' ' : ''}
                {t.contact.subtitle}
              </h2>
            </div>

            <button
              type="button"
              onClick={onDownloadVCard}
              title={t.contact.vcardModal.downloadTooltip}
              className="inline-flex items-center gap-2 rounded-md border border-[#0F4C81] bg-[#0F4C81] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#0B3A63]"
            >
              <Download className="h-4 w-4" aria-hidden />
              {t.contact.vcard}
            </button>
          </div>

          <div className="overflow-hidden rounded-lg border border-[#DCE2E8] bg-[#DCE2E8]">
            <div className="grid grid-cols-1 gap-px md:grid-cols-3">
              {contactItems.map(({ key, label, values, hrefs, copyValue }) => {
                const isCopied = copiedField === key;
                return (
                  <div
                    key={key}
                    className="flex flex-col justify-between bg-white p-6 transition-colors hover:bg-[#FAFBFC] md:p-7"
                  >
                    <div className="mb-5 flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-[#5A6775]">
                        {label}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(key, copyValue)}
                        aria-label={`${t.contact.copyAction} ${label}`}
                        className="inline-flex items-center gap-1 font-mono text-[11px] text-[#5A6775] transition-colors hover:text-[#0F4C81]"
                      >
                        {isCopied ? (
                          <>
                            <Check className="h-3 w-3 text-[#0F4C81]" aria-hidden />
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

                    <div className="flex flex-col gap-1">
                      {values.map((val, i) => {
                        const href = hrefs[i];
                        return href ? (
                          <a
                            key={val}
                            href={href}
                            className="break-words text-base font-semibold text-[#11161C] transition-colors hover:text-[#0F4C81] md:text-lg"
                          >
                            {val}
                          </a>
                        ) : (
                          <p
                            key={val}
                            className="text-base font-semibold text-[#11161C] md:text-lg"
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

          <footer
            id="site-footer"
            className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-[#DCE2E8] pt-7 sm:flex-row"
          >
            <p className={uiTokens.footerLegal}>
              {t.contact.footer.replace(/\{year\}/g, String(new Date().getFullYear()))}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-end">
              <p className="font-mono text-xs tracking-[0.04em] text-[#5A6775]">
                {t.contact.developer}
              </p>
              <button
                type="button"
                onClick={handleBackToTop}
                className="inline-flex items-center gap-1 font-mono text-xs font-medium text-[#0F4C81] hover:underline"
              >
                {t.contact.backToTop}
                <ArrowUp className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
          </footer>
        </div>
      </section>
    </>
  );
}

export const BottomSections = memo(BottomSectionsComponent);
