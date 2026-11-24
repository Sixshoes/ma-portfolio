'use client';

import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';
import { Check, Copy, Download, Mail } from 'lucide-react';
import { EDITORIAL_EASE, InkRule } from '@/app/components/EditorialMotion';
import { RadialRankGauge } from '@/app/components/RadialRankGauge';
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
  const reduceMotion = useReducedMotion();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const impactGridRef = useRef<HTMLDivElement>(null);
  // 監測外層卡片網格而非 scaleX(0) 進度條，徹底杜絕東華 #1 黃條停留於 0% 空白
  const isImpactInView = useInView(impactGridRef, { once: true, amount: 0.05 });
  const isZh = lang === 'zh';

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
      ratio: Number(impactData.ndhu.hIndex.ratio),
      ratioPct: Math.min(100, Math.round(Number(impactData.ndhu.hIndex.ratio) * 100)),
      gaugeColor: '#F3DF87',
    },
    {
      key: 'fgu' as const,
      index: '02.',
      name: t.impact.fgu,
      location: t.impact.fguLocation,
      metrics: impactData.fgu,
      ratio: Number(impactData.fgu.hIndex.ratio),
      ratioPct: Math.min(100, Math.round(Number(impactData.fgu.hIndex.ratio) * 100)),
      gaugeColor: '#E88D84',
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
      {/* 學術影響力：東華 #1 與佛大 #2 270° 圓弧排名儀表環雙展櫃 */}
      <section
        id="impact"
        className="scroll-mt-16 bg-[var(--app-bg)] py-20 md:py-24"
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="pb-4">
            <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
              <h2 className={uiTokens.sectionTitle}>
                {lang === 'en'
                  ? `${t.impact.title} ${t.impact.subtitle}`
                  : `${t.impact.title}${t.impact.subtitle}`}
              </h2>
              <p className="rounded-full bg-[var(--app-hover)] px-3.5 py-1 text-sm text-[var(--app-muted)]">
                {t.impact.source}
              </p>
            </div>
            <p className="mt-2.5 text-sm text-[var(--app-muted)]">
              {isZh
                ? '註：本區採 AD Scientific Index（Google Scholar 基準），與首頁總覽之 Scopus 資料庫統計口徑（H-Index 52）不同。'
                : 'Note: Metrics below follow AD Scientific Index (Google Scholar), whereas the overview stats above are sourced from Scopus (H-Index 52).'}
            </p>
          </div>
          <InkRule thick className="mb-8" />

          <div ref={impactGridRef} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {institutions.map((inst, idx) => (
              <motion.div
                key={inst.key}
                initial={reduceMotion ? false : { opacity: 0.92, y: 6 }}
                animate={isImpactInView || reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0.92, y: 6 }}
                transition={{
                  duration: reduceMotion ? 0 : 0.3,
                  delay: reduceMotion ? 0 : idx * 0.04,
                  ease: EDITORIAL_EASE,
                }}
                className="overflow-hidden rounded-[26px] border border-[#2C473C] bg-[#16231E] p-6 text-[#F4F1EA] shadow-[0_20px_48px_-24px_rgba(16,28,23,0.55)] sm:p-7"
              >
                <div className="mb-6 flex flex-col items-start gap-2.5 border-b border-[#2B4339] pb-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div>
                    <span className="font-mono text-xs uppercase tracking-wider text-[#A7C4B8]">
                      {inst.index} {inst.location}
                    </span>
                    <h3 className="font-editorial mt-1 text-xl font-semibold text-[#F4F1EA] sm:text-2xl">
                      {inst.name}
                    </h3>
                  </div>
                  <span
                    className="shrink-0 rounded-full border px-3.5 py-1 font-mono text-sm font-semibold"
                    style={{
                      borderColor: `${inst.gaugeColor}55`,
                      color: inst.gaugeColor,
                      backgroundColor: `${inst.gaugeColor}14`,
                    }}
                  >
                    {t.impact.ratio} {inst.metrics.hIndex.ratio}
                  </span>
                </div>

                {/* 圓弧儀表環 ＋ 關鍵排名指標並列 */}
                <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
                  <RadialRankGauge
                    universityRank={inst.metrics.uniRank}
                    ratio={inst.ratio}
                    accentColor={inst.gaugeColor}
                    label={isZh ? '全校排名' : 'UNI RANK'}
                  />

                  <div className="w-full flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-[#1D2F28] p-3.5">
                        <div className="text-xs text-[#A7C4B8]">{t.impact.worldRank}</div>
                        <div className="font-editorial mt-1 text-[1.65rem] font-semibold text-[#F4F1EA] [font-variant-numeric:tabular-nums]">
                          {inst.metrics.worldRank}
                        </div>
                      </div>
                      <div className="rounded-2xl bg-[#1D2F28] p-3.5">
                        <div className="text-xs text-[#A7C4B8]">{t.impact.countryRank}</div>
                        <div className="font-editorial mt-1 text-[1.65rem] font-semibold text-[#F4F1EA] [font-variant-numeric:tabular-nums]">
                          #{inst.metrics.countryRank}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-[#1D2F28] p-4">
                      <div className="mb-2.5 flex items-baseline justify-between gap-2 text-sm">
                        <span className="font-medium text-[#F4F1EA]">{t.impact.hIndex}</span>
                        <span className="font-mono text-xs text-[#A7C4B8]">
                          {t.impact.total}{' '}
                          <strong className="text-[#F4F1EA]">{inst.metrics.hIndex.total}</strong> ·{' '}
                          {t.impact.last5}{' '}
                          <strong style={{ color: inst.gaugeColor }}>
                            {inst.metrics.hIndex.last5}
                          </strong>
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-[#2B4339]">
                        <motion.div
                          initial={reduceMotion ? { scaleX: 1 } : { scaleX: 0 }}
                          animate={{ scaleX: isImpactInView || reduceMotion ? 1 : 0 }}
                          transition={{
                            duration: reduceMotion ? 0 : 0.72,
                            delay: reduceMotion ? 0 : 0.08 + idx * 0.06,
                            ease: EDITORIAL_EASE,
                          }}
                          style={{
                            transformOrigin: 'left',
                            width: `${inst.ratioPct}%`,
                            backgroundColor: inst.gaugeColor,
                          }}
                          className="h-full rounded-full will-change-transform"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 聯絡方式與頁尾 */}
      <section
        id="contact"
        className="scroll-mt-16 bg-[var(--app-bg-alt)] pb-8 pt-20 md:pt-24"
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <h2 className={uiTokens.sectionTitle}>
              {lang === 'en'
                ? `${t.contact.title} ${t.contact.subtitle}`
                : `${t.contact.title}${t.contact.subtitle}`}
            </h2>

            <button
              type="button"
              onClick={onDownloadVCard}
              title={t.contact.vcardModal.downloadTooltip}
              className={`${uiTokens.buttonOutline} inline-flex items-center gap-2 px-5 py-2.5 text-base`}
            >
              <Download className="h-4 w-4" aria-hidden />
              {t.contact.vcard}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {contactItems.map(({ key, label, values, hrefs, copyValue }) => {
              const isCopied = copiedField === key;
              return (
                <div
                  key={key}
                  className="atlas-card flex flex-col justify-between p-6"
                >
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <span className="rounded-full bg-[var(--app-hover)] px-3 py-0.5 text-sm font-medium text-[var(--app-muted)]">
                      {label}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(key, copyValue)}
                      aria-label={`${t.contact.copyAction} ${label}`}
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-sm text-[var(--app-muted)] transition-colors hover:bg-[var(--app-hover)] hover:text-[var(--app-ink)]"
                    >
                      {isCopied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-[var(--app-accent)]" aria-hidden />
                          <span className="text-[var(--app-accent)]">{t.contact.copiedAction}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" aria-hidden />
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
                          className="font-editorial break-words text-xl font-medium text-[var(--app-ink)] transition-colors hover:text-[var(--app-accent)] hover:underline"
                        >
                          {val}
                        </a>
                      ) : (
                        <p key={val} className="font-editorial text-xl font-medium text-[var(--app-ink)]">
                          {val}
                        </p>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <footer className="mt-16 border-t border-[var(--app-rule)] pb-12 pt-6 text-base text-[var(--app-muted)]">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <p>
                {t.contact.footer.replace(/\{year\}/g, String(new Date().getFullYear()))}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="inline-flex items-center gap-1.5">
                  <span>
                    {isZh ? '網頁設計與開發：' : 'Designed & Developed by '}
                    <a
                      href={DEVELOPER_MAILTO}
                      title={`寄信聯絡陳奕廷 (${DEVELOPER_EMAIL})`}
                      className="font-medium text-[var(--app-ink)] underline decoration-[var(--app-rule)] underline-offset-4 transition-colors hover:text-[var(--app-accent)] hover:decoration-[var(--app-ink)]"
                    >
                      {isZh ? '陳奕廷' : 'Yiting Chen'}
                    </a>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy('developer-email', DEVELOPER_EMAIL)}
                    title={
                      isDevEmailCopied
                        ? isZh
                          ? '已複製信箱'
                          : 'Email copied'
                        : isZh
                          ? `複製信箱 (${DEVELOPER_EMAIL})`
                          : `Copy email (${DEVELOPER_EMAIL})`
                    }
                    aria-label={
                      isZh
                        ? `複製陳奕廷信箱 ${DEVELOPER_EMAIL}`
                        : `Copy Yiting Chen's email ${DEVELOPER_EMAIL}`
                    }
                    className="inline-flex items-center gap-1 rounded-full p-1 text-[var(--app-muted)] transition-colors hover:bg-[var(--app-hover)] hover:text-[var(--app-ink)]"
                  >
                    {isDevEmailCopied ? (
                      <>
                        <Check className="h-4 w-4 text-[var(--app-accent)]" aria-hidden />
                        <span className="text-sm text-[var(--app-accent)]">
                          {isZh ? '已複製' : 'Copied'}
                        </span>
                      </>
                    ) : (
                      <Mail className="h-4 w-4" aria-hidden />
                    )}
                  </button>
                </span>

                <span aria-hidden="true" className="text-[var(--app-rule)]">
                  ·
                </span>

                <a
                  href="#top"
                  className="rounded-full px-2.5 py-1 text-[var(--app-ink)] transition-colors hover:bg-[var(--app-hover)] hover:text-[var(--app-accent)]"
                >
                  {isZh ? '回到頂部 ↑' : 'Back to top ↑'}
                </a>
              </div>
            </div>
          </footer>
        </div>
      </section>
    </>
  );
}

export const BottomSections = memo(BottomSectionsComponent);
