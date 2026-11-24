/** 國家科學院數據圖鑑 × 講堂親筆黑板手稿特仕版：溫潤圓角、有機流線與雙版語意化規範 */
export const uiTokens = {
  sectionTitle:
    'font-editorial text-3xl font-semibold tracking-[-0.02em] leading-[1.15] text-[var(--app-ink)] sm:text-4xl',
  sectionHeaderRule: 'border-b border-[var(--app-rule)] pb-5',
  sectionDesc: 'text-sm leading-relaxed text-[var(--app-muted)]',
  buttonPrimary:
    'rounded-full border border-[var(--app-ink)] bg-[var(--app-ink)] text-[var(--app-bg)] font-medium transition-all duration-200 hover:bg-[var(--app-accent)] hover:border-[var(--app-accent)] hover:shadow-sm',
  buttonOutline:
    'rounded-full border border-[var(--app-rule)] bg-[var(--app-surface-card)] text-[var(--app-ink)] font-medium transition-all duration-200 hover:border-[var(--app-ink)] hover:bg-[var(--app-hover)]',
  fieldSelect:
    'custom-select appearance-none rounded-xl border border-[var(--app-rule)] bg-[var(--app-surface-card)] py-1.5 pl-3 pr-8 text-sm text-[var(--app-ink)] transition-colors focus:border-[var(--app-accent)] focus:outline-none cursor-pointer [&_option]:bg-[var(--app-bg)] [&_option]:text-[var(--app-ink)] [&_optgroup]:bg-[var(--app-bg)] [&_optgroup]:text-[var(--app-muted)]',
} as const;
