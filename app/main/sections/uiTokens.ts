/** 統一深炭暖黑底 (#161514)、香檳金點綴與符合無障礙對比的文字階調 */
export const uiTokens = {
  sectionTitle:
    'font-heading-serif text-4xl md:text-6xl lg:text-7xl text-stone-50 tracking-tight',
  titleLight: 'font-heading-serif font-normal text-[#d4af37] tracking-wide',
  titleBold: 'font-heading-serif font-semibold text-stone-100',
  sectionEyebrow:
    'text-xs font-mono uppercase tracking-[0.18em] text-stone-300 border border-stone-700/70 bg-stone-900/60 rounded-full px-4 py-2',
  sectionDesc: 'font-mono text-xs uppercase tracking-[0.18em] text-stone-300',
  /** 暖炭黑玻璃卡片 */
  surfaceCard:
    'rounded-3xl border border-stone-700/45 bg-stone-900/55 backdrop-blur-lg shadow-[0_10px_36px_rgba(0,0,0,0.45)]',
  /** 手機版：無 backdrop-blur，降低 GPU 負擔 */
  surfaceCardSolid:
    'rounded-3xl border border-stone-700/45 bg-[#1d1b19] shadow-[0_10px_36px_rgba(0,0,0,0.45)]',
  surfaceCardHover:
    'hover:border-[#d4af37]/45 hover:bg-stone-900/75 hover:shadow-[0_18px_44px_rgba(212,175,55,0.08)] transition-all duration-300',
  buttonPrimary:
    'bg-gradient-to-r from-[#e5c158] to-[#c2994a] text-stone-950 font-medium border border-[#f5e1a4]/50 shadow-[0_4px_15px_rgba(212,175,55,0.25)]',
  buttonPrimaryStrong:
    'bg-gradient-to-r from-[#dcc08e] via-[#c4a265] to-[#d1b177] text-stone-950 border border-[#8f7038]/40 shadow-[0_10px_28px_rgba(0,0,0,0.35)] hover:brightness-105',
  buttonGhost:
    'border border-stone-700/75 bg-stone-900/60 text-stone-200 hover:text-[#e8dcc4] hover:border-[#c4a77d]/55 hover:bg-stone-800/60 transition-colors',
  pubFigureSurface:
    'bg-gradient-to-b from-stone-900/90 via-stone-950/75 to-[#11100f] border border-stone-800/70',
  fieldSelect:
    'appearance-none bg-[#1b1917] border border-stone-700/75 text-stone-100 px-5 py-2.5 pr-11 rounded-full text-sm font-mono focus:outline-none focus:border-[#c4a77d]/65 focus:ring-1 focus:ring-[#c4a77d]/35 transition-all cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]',
  sectionDivider: 'border-t border-stone-800/70',
  titleAccentBar: 'mx-auto h-px w-24 rounded-full bg-gradient-to-r from-[#b08d52]/70 via-stone-500/40 to-stone-600/50',
  metaMono: 'font-mono text-xs uppercase tracking-widest text-stone-400',
  footerLegal:
    'text-xs font-mono tracking-[0.14em] text-stone-400 [font-variant-numeric:lining-nums]',
  footerCredit: 'mt-2.5 text-xs font-mono tracking-[0.12em] text-stone-400',
  pubBadgeOverlay:
    'rounded border border-stone-700/60 bg-stone-950/85 font-mono uppercase tracking-wider text-stone-200 backdrop-blur-sm',
} as const;
