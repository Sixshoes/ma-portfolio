/** 路線一：《經典書卷雜誌風》晝夜雙版語意化印刷尺規與字體排版規範（零圓角、零卡片陰影） */
export const uiTokens = {
  sectionTitle:
    'font-editorial text-3xl font-semibold tracking-[-0.02em] leading-[1.15] text-[var(--app-ink)] sm:text-4xl',
  sectionHeaderRule: 'border-b-2 border-[var(--app-ink)] pb-4',
  sectionDesc: 'text-sm leading-relaxed text-[var(--app-muted)]',
  buttonPrimary:
    'rounded-none border border-[var(--app-ink)] bg-[var(--app-ink)] text-[var(--app-bg)] font-medium transition-colors duration-150 hover:bg-[var(--app-accent)] hover:border-[var(--app-accent)]',
  buttonOutline:
    'rounded-none border border-[var(--app-ink)] bg-transparent text-[var(--app-ink)] font-medium transition-colors duration-150 hover:bg-[var(--app-hover)]',
  fieldSelect:
    'custom-select appearance-none rounded-none border-0 border-b border-[var(--app-ink)] bg-transparent py-1.5 pl-1 pr-7 text-sm text-[var(--app-ink)] transition-colors focus:border-[var(--app-accent)] focus:outline-none cursor-pointer [&_option]:bg-[var(--app-bg)] [&_option]:text-[var(--app-ink)] [&_optgroup]:bg-[var(--app-bg)] [&_optgroup]:text-[var(--app-muted)]',
} as const;
