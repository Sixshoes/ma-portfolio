'use client';

import React, { memo, useCallback, useEffect, useState } from 'react';
import { Check, Copy, Download, Mail } from 'lucide-react';
import { InkRule } from '@/app/components/EditorialMotion';
import { useRenderProfiler } from './useRenderProfiler';
import { uiTokens } from './uiTokens';
import { impactData } from '@/lib/impactData';

const DEVELOPER_EMAIL = 'wl03112816@gmail.com';
const DEVELOPER_MAILTO =
  'mailto:wl03112816@gmail.com?subject=%E9%97%9C%E6%96%BC%E5%AD%B8%E8%A1%93%E7%B6%B2%E7%AB%99%E8%A8%AD%E8%A8%88%E8%88%87%E9%96%8B%E7%99%BC%E6%B4%BD%E8%A9%A2';

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

  const institutions = [
    {
      key: 'ndhu' as const,
      index: '01.',
      name: t.impact.ndhu,
      location: t.impact.ndhuLocation,
      metrics: impactData.ndhu,
      ratioPct: Math.min(100, Math.round(Number(impactData.ndhu.hIndex.ratio) * 100)),
    },
    {
      key: 'fgu' as const,
      index: '02.',
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

  const isDevEmailCopied = copiedField === 'developer-email';

  return (
    <>
      {/* 學術影響力：無框雙欄水平印刷評比表 */}
      <section
        id="impact"
        className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20 md:py-24"
      >
        <div className="pb-4">
          <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
            <h2 className={uiTokens.sectionTitle}>
              {t.impact.title}
              {lang === 'en' ? ' ' : ''}
              {t.impact.subtitle}
            </h2>
            <p className="text-xs text-[#5C5953]">{t.impact.source}</p>
          </div>
        </div>
        <InkRule thick />

        <div className="grid grid-cols-1 divide-y divide-[#D4D1C8] border-b border-[#141413] lg:grid-cols-2 lg:divide-x lg:divide-y-0">
          {institutions.map((inst, idx) => (
            <div
              key={inst.key}
              className={`py-8 ${idx === 0 ? 'lg:pr-10' : 'lg:pl-10'}`}
            >
              <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-[#D4D1C8] pb-4">
                <div>
                  <h3 className="font-editorial text-2xl font-semibold text-[#141413]">
                    {inst.name}
                  </h3>
                  <p className="mt-1 text-xs text-[#5C5953]">{inst.location}</p>
                </div>
                <span className="font-editorial text-base text-[#5C5953]">
                  {inst.index}
                </span>
              </div>

              <div className="mb-6 grid grid-cols-3 divide-x divide-[#D4D1C8] border-b border-[#D4D1C8] pb-6">
                <div className="pr-3">
                  <div className="font-editorial text-2xl font-semibold text-[#141413] [font-variant-numeric:tabular-nums] sm:text-3xl">
                    {inst.metrics.worldRank}
                  </div>
                  <div className="mt-1 text-xs text-[#5C5953]">{t.impact.worldRank}</div>
                </div>
                <div className="px-3 sm:pl-5">
                  <div className="font-editorial text-2xl font-semibold text-[#141413] [font-variant-numeric:tabular-nums] sm:text-3xl">
                    #{inst.metrics.countryRank}
                  </div>
                  <div className="mt-1 text-xs text-[#5C5953]">{t.impact.countryRank}</div>
                </div>
                <div className="pl-3 sm:pl-5">
                  <div className="font-editorial text-2xl font-semibold text-[#141413] [font-variant-numeric:tabular-nums] sm:text-3xl">
                    #{inst.metrics.uniRank}
                  </div>
                  <div className="mt-1 text-xs text-[#5C5953]">{t.impact.uniRank}</div>
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-baseline justify-between text-xs text-[#5C5953]">
                  <span className="font-medium text-[#141413]">{t.impact.hIndex}</span>
                  <span className="font-mono text-[#5C5953]">
                    {t.impact.ratio}: {inst.metrics.hIndex.ratio}
                  </span>
                </div>

                <div className="mb-4 grid grid-cols-3 gap-4">
                  <div>
                    <div className="font-editorial text-3xl font-semibold text-[#141413] [font-variant-numeric:tabular-nums]">
                      {inst.metrics.hIndex.total}
                    </div>
                    <div className="mt-0.5 text-xs text-[#5C5953]">{t.impact.total}</div>
                  </div>
                  <div>
                    <div className="font-editorial text-3xl font-semibold text-[#141413] [font-variant-numeric:tabular-nums]">
                      {inst.metrics.hIndex.last5}
                    </div>
                    <div className="mt-0.5 text-xs text-[#5C5953]">{t.impact.last5}</div>
                  </div>
                  <div>
                    <div className="font-editorial text-3xl font-medium text-[#2D2C29] [font-variant-numeric:tabular-nums]">
                      {inst.metrics.hIndex.ratio}
                    </div>
                    <div className="mt-0.5 text-xs text-[#5C5953]">
                      {lang === 'zh' ? '動能比' : 'Ratio'}
                    </div>
                  </div>
                </div>

                <div className="h-1 w-full bg-[#D4D1C8]">
                  <div
                    style={{ width: `${inst.ratioPct}%` }}
                    className="h-full bg-[#1B365D]"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 聯絡方式：頂部 2px 墨黑粗線 + 無框三欄水平印刷欄位 + 頁尾開發者信箱互動署名 */}
      <section
        id="contact"
        className="mx-auto max-w-6xl scroll-mt-20 px-6 pb-8 pt-20 md:pt-24"
      >
        <InkRule thick />
        <div className="pt-8">
          <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <h2 className={uiTokens.sectionTitle}>
              {t.contact.title}
              {lang === 'en' ? ' ' : ''}
              {t.contact.subtitle}
            </h2>

            <button
              type="button"
              onClick={onDownloadVCard}
              title={t.contact.vcardModal.downloadTooltip}
              className={`${uiTokens.buttonOutline} inline-flex items-center gap-2 px-5 py-2.5 text-sm`}
            >
              <Download className="h-4 w-4" aria-hidden />
              {t.contact.vcard}
            </button>
          </div>

          <div className="grid grid-cols-1 divide-y divide-[#D4D1C8] border-y border-[#D4D1C8] md:grid-cols-3 md:divide-x md:divide-y-0">
            {contactItems.map(({ key, label, values, hrefs, copyValue }, idx) => {
              const isCopied = copiedField === key;
              return (
                <div
                  key={key}
                  className={`flex flex-col justify-between py-6 ${
                    idx === 0 ? 'md:pr-6' : idx === 1 ? 'md:px-6' : 'md:pl-6'
                  }`}
                >
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-[#5C5953]">{label}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(key, copyValue)}
                      aria-label={`${t.contact.copyAction} ${label}`}
                      className="inline-flex items-center gap-1 text-xs text-[#5C5953] transition-colors hover:text-[#141413]"
                    >
                      {isCopied ? (
                        <>
                          <Check className="h-3 w-3 text-[#1B365D]" aria-hidden />
                          <span className="text-[#1B365D]">{t.contact.copiedAction}</span>
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
                          className="font-editorial break-words text-lg font-medium text-[#141413] transition-colors hover:text-[#1B365D] hover:underline"
                        >
                          {val}
                        </a>
                      ) : (
                        <p key={val} className="font-editorial text-lg font-medium text-[#141413]">
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

        <footer className="mt-20 border-t border-[#141413] pb-12 pt-6 text-sm text-[#5C5953]">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <p>
              {t.contact.footer.replace(/\{year\}/g, String(new Date().getFullYear()))}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="inline-flex items-center gap-1.5">
                <span>
                  {lang === 'zh' ? '網頁設計與開發：' : 'Designed & Developed by '}
                  <a
                    href={DEVELOPER_MAILTO}
                    title={`寄信聯絡陳奕廷 (${DEVELOPER_EMAIL})`}
                    className="font-medium text-[#141413] underline decoration-[#ABA79E] underline-offset-4 transition-colors hover:text-[#1B365D] hover:decoration-[#141413]"
                  >
                    {lang === 'zh' ? '陳奕廷' : 'Yiting Chen'}
                  </a>
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy('developer-email', DEVELOPER_EMAIL)}
                  title={
                    isDevEmailCopied
                      ? lang === 'zh'
                        ? '已複製信箱'
                        : 'Email copied'
                      : lang === 'zh'
                        ? `複製信箱 (${DEVELOPER_EMAIL})`
                        : `Copy email (${DEVELOPER_EMAIL})`
                  }
                  aria-label={
                    lang === 'zh'
                      ? `複製陳奕廷信箱 ${DEVELOPER_EMAIL}`
                      : `Copy Yiting Chen's email ${DEVELOPER_EMAIL}`
                  }
                  className="inline-flex items-center gap-1 p-0.5 text-[#5C5953] transition-colors hover:text-[#141413]"
                >
                  {isDevEmailCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-[#1B365D]" aria-hidden />
                      <span className="text-xs text-[#1B365D]">
                        {lang === 'zh' ? '已複製' : 'Copied'}
                      </span>
                    </>
                  ) : (
                    <Mail className="h-3.5 w-3.5" aria-hidden />
                  )}
                </button>
              </span>

              <span aria-hidden="true" className="text-[#D4D1C8]">
                ·
              </span>

              <a
                href="#top"
                className="text-[#141413] transition-colors hover:text-[#1B365D] hover:underline"
              >
                {lang === 'zh' ? '回到頂部 ↑' : 'Back to top ↑'}
              </a>
            </div>
          </div>
        </footer>
      </section>
    </>
  );
}

export const BottomSections = memo(BottomSectionsComponent);
