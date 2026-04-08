export const uiTokens = {
  sectionTitle: 'text-4xl md:text-7xl text-white',
  titleLight: 'font-display font-light text-amber-400/90 tracking-wide',
  titleBold: 'font-display font-bold tracking-tight',
  sectionEyebrow:
    'text-[10px] font-mono uppercase tracking-[0.2em] text-teal-300/80 border border-teal-400/20 bg-teal-500/5 rounded-full px-4 py-2',
  /** 區塊副標（純文字、無邊框，與 sectionEyebrow 同字重） */
  sectionDesc:
    'font-mono text-[10px] uppercase tracking-[0.2em] text-teal-400/80',
  surfaceCard:
    'bg-gradient-to-b from-[#0D1528]/95 to-[#0A1223]/95 backdrop-blur-md border border-white/[0.08] rounded-3xl shadow-[0_12px_36px_rgba(0,0,0,0.3)]',
  surfaceCardHover:
    'hover:border-amber-400/35 hover:shadow-[0_20px_50px_rgba(251,191,36,0.14)] transition-all duration-500',
  buttonPrimary:
    'bg-gradient-to-r from-amber-300 to-amber-400 text-[#080C16] border border-amber-200/60 shadow-[0_10px_30px_rgba(251,191,36,0.25)]',
  buttonPrimaryStrong:
    'bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 text-[#080C16] border border-amber-100/70 shadow-[0_14px_36px_rgba(251,191,36,0.32)]',
  buttonGhost:
    'border border-white/15 bg-white/[0.03] text-slate-300 hover:text-amber-300 hover:border-amber-400/40 transition-colors',
  /** 論文圖卡背景：比純白更融入深色主題 */
  pubFigureSurface:
    'bg-gradient-to-b from-[#141c2e] via-[#0f1524] to-[#0a101c] border border-white/[0.08]',
  /** 篩選下拉：與 ghost 鈕同系 */
  fieldSelect:
    'appearance-none bg-[#0B101E]/90 border border-white/[0.1] text-slate-200 px-6 py-3 pr-12 rounded-full text-sm font-mono focus:outline-none focus:border-teal-400/45 focus:ring-1 focus:ring-teal-400/35 transition-all cursor-pointer backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]',
  /** 區塊與區塊之間的淡分隔（與 About 一致） */
  sectionDivider: 'border-t border-white/[0.05]',
  /** 標題下的琥珀—青綠裝飾線 */
  titleAccentBar: 'mx-auto h-1 w-24 rounded-full bg-gradient-to-r from-amber-500 to-teal-500 opacity-50',
  /** 表單／聯絡小標 */
  metaMono: 'font-mono text-xs uppercase tracking-widest text-slate-500',
  /** 頁尾版權主行 */
  footerLegal: 'text-[10px] font-mono uppercase tracking-[0.3em] text-slate-500',
  /** 頁尾開發者／次行 */
  footerCredit: 'mt-2 text-[10px] font-mono uppercase tracking-[0.3em] text-slate-600',
  /** 論文圖卡左上角類型標籤 */
  pubBadgeOverlay:
    'rounded border border-white/15 bg-[#080C16]/75 font-mono uppercase tracking-widest text-slate-200 backdrop-blur-md',
} as const;
