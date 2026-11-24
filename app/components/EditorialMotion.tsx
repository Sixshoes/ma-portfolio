'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { animate, motion, useInView, useReducedMotion } from 'motion/react';

/** 全站統一雜誌級五次方減速曲線（俐落無果凍反彈） */
export const EDITORIAL_EASE = [0.22, 1, 0.36, 1] as const;

type InkRuleProps = {
  thick?: boolean;
  dark?: boolean;
  delay?: number;
  immediate?: boolean;
  className?: string;
};

/** 鋼筆尺規水平繪線：由左向右平滑繪出，viewport once 不重複閃爍 */
export function InkRule({
  thick = false,
  dark = false,
  delay = 0,
  immediate = false,
  className = '',
}: InkRuleProps) {
  const reduce = useReducedMotion();
  const barClass = thick
    ? 'h-[2px] w-full bg-[var(--app-ink)]'
    : dark
      ? 'h-px w-full bg-[var(--app-ink)]'
      : 'h-px w-full bg-[var(--app-rule)]';

  if (reduce) {
    return <div aria-hidden="true" className={`${barClass} ${className}`.trim()} />;
  }

  return (
    <motion.div
      aria-hidden="true"
      initial={{ scaleX: 0 }}
      {...(immediate
        ? { animate: { scaleX: 1 } }
        : {
            whileInView: { scaleX: 1 },
            viewport: { once: true, margin: '-60px' },
          })}
      transition={{ duration: 0.7, delay, ease: EDITORIAL_EASE }}
      style={{ transformOrigin: 'left' }}
      className={`${barClass} ${className}`.trim()}
    />
  );
}

type MaskedTextRevealProps = {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  immediate?: boolean;
  className?: string;
  innerClassName?: string;
};

/** 活字遮罩揭幕：外包 overflow-hidden，內層文字自裁切線平順升起 */
export function MaskedTextReveal({
  children,
  delay = 0.12,
  duration = 0.63,
  immediate = true,
  className = '',
  innerClassName = '',
}: MaskedTextRevealProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <span className={`block ${className}`.trim()}>
        <span className={`block ${innerClassName}`.trim()}>{children}</span>
      </span>
    );
  }

  return (
    <span className={`block overflow-hidden pb-[0.06em] ${className}`.trim()}>
      <motion.span
        initial={{ y: '105%', opacity: 0.01 }}
        {...(immediate
          ? { animate: { y: '0%', opacity: 1 } }
          : {
              whileInView: { y: '0%', opacity: 1 },
              viewport: { once: true, margin: '-60px' },
            })}
        transition={{ duration, delay, ease: EDITORIAL_EASE }}
        className={`block will-change-transform ${innerClassName}`.trim()}
      >
        {children}
      </motion.span>
    </span>
  );
}

type RollingNumberProps = {
  value: number | string;
  delay?: number;
  duration?: number;
  locale?: string;
  className?: string;
};

function parseNumericStat(value: number | string): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  const cleaned = value.trim().replace(/,/g, '');
  if (!/^\d+$/.test(cleaned)) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

/** 精密等寬滾動跳表：以隱藏終值鎖定寬度並搭 tabular-nums，計數過程零左右晃動 */
export function RollingNumber({
  value,
  delay = 0.25,
  duration = 0.85,
  locale = 'en-US',
  className = '',
}: RollingNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();

  const numericTarget = useMemo(() => parseNumericStat(value), [value]);
  const finalLabel = useMemo(() => {
    if (numericTarget !== null) return numericTarget.toLocaleString(locale);
    return String(value);
  }, [numericTarget, value, locale]);

  const [displayValue, setDisplayValue] = useState<number>(() =>
    numericTarget !== null && reduce ? numericTarget : 0,
  );
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (numericTarget === null) return;
    if (reduce) {
      setDisplayValue(numericTarget);
      hasAnimatedRef.current = true;
      return;
    }
    if (!inView) return;

    const startFrom = hasAnimatedRef.current ? displayValue : 0;
    const effectiveDelay = hasAnimatedRef.current ? 0 : delay;
    hasAnimatedRef.current = true;

    const controls = animate(startFrom, numericTarget, {
      duration,
      delay: effectiveDelay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplayValue(Math.round(latest)),
    });

    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, numericTarget, reduce, delay, duration]);

  if (numericTarget === null) {
    return (
      <span ref={ref} className={`[font-variant-numeric:tabular-nums] ${className}`.trim()}>
        {finalLabel}
      </span>
    );
  }

  return (
    <span
      ref={ref}
      className={`inline-grid [font-variant-numeric:tabular-nums] ${className}`.trim()}
    >
      {/* 鎖定最終寬度，徹底杜絕跳表過程的水平排版抖動 */}
      <span aria-hidden="true" className="invisible col-start-1 row-start-1 select-none">
        {finalLabel}
      </span>
      <span className="col-start-1 row-start-1">
        {reduce ? finalLabel : displayValue.toLocaleString(locale)}
      </span>
    </span>
  );
}
