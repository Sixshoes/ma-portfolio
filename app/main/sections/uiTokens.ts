/** 學術沉穩主題：深灰藍底、香檳金點綴、襯線標題（見 globals .font-heading-serif） */
export const uiTokens = {
  sectionTitle:
    'font-heading-serif text-4xl md:text-6xl lg:text-7xl text-stone-100 tracking-tight',
  titleLight: 'font-heading-serif font-normal text-[#c4a77d] tracking-wide',
  titleBold: 'font-heading-serif font-semibold text-stone-100',
  sectionEyebrow:
    'text-[10px] font-mono uppercase tracking-[0.2em] text-stone-500 border border-stone-700/60 bg-stone-900/40 rounded-full px-4 py-2',
  sectionDesc: 'font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500',
  /** 通透卡片：弱邊框、少漸層 */
  surfaceCard:
    'rounded-3xl border border-stone-800/60 bg-slate-900/25 shadow-[0_12px_40px_rgba(0,0,0,0.2)]',
  surfaceCardHover:
    'hover:border-stone-700/80 hover:bg-slate-900/40 hover:shadow-[0_16px_48px_rgba(0,0,0,0.28)] transition-all duration-300',
  buttonPrimary:
    'bg-gradient-to-r from-[#c9a86c] to-[#b08d52] text-stone-950 border border-[#a67c3d]/40 shadow-[0_8px_24px_rgba(0,0,0,0.25)]',
  buttonPrimaryStrong:
    'bg-gradient-to-r from-[#d4b27f] via-[#b9975a] to-[#c9a86c] text-stone-950 border border-[#8f7038]/35 shadow-[0_10px_28px_rgba(0,0,0,0.3)]',
  buttonGhost:
    'border border-stone-700/70 bg-stone-900/30 text-stone-300 hover:text-[#d4c4a8] hover:border-[#a8906a]/45 transition-colors',
  pubFigureSurface:
    'bg-gradient-to-b from-slate-900/80 via-slate-900/50 to-slate-950/60 border border-stone-800/50',
  fieldSelect:
    'appearance-none bg-slate-900/80 border border-stone-700/70 text-stone-200 px-6 py-3 pr-12 rounded-full text-sm font-mono focus:outline-none focus:border-[#9a8260]/55 focus:ring-1 focus:ring-[#9a8260]/30 transition-all cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]',
  sectionDivider: 'border-t border-stone-800/60',
  titleAccentBar: 'mx-auto h-px w-24 rounded-full bg-gradient-to-r from-[#b08d52]/70 via-stone-500/40 to-stone-600/50',
  metaMono: 'font-mono text-xs uppercase tracking-widest text-stone-500',
  footerLegal: 'text-[10px] font-mono uppercase tracking-[0.3em] text-stone-500',
  footerCredit: 'mt-2 text-[10px] font-mono uppercase tracking-[0.3em] text-stone-600',
  pubBadgeOverlay:
    'rounded border border-stone-700/50 bg-slate-950/80 font-mono uppercase tracking-widest text-stone-300 backdrop-blur-sm',
} as const;
