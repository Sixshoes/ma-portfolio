/** 深炭灰底 (#1C1C1C)、香檳金點綴、襯線標題（globals .font-heading-serif） */
export const uiTokens = {
  sectionTitle:
    'font-heading-serif text-4xl md:text-6xl lg:text-7xl text-stone-50 tracking-tight',
  titleLight: 'font-heading-serif font-normal text-[#d4af37] tracking-wide',
  titleBold: 'font-heading-serif font-semibold text-stone-100',
  sectionEyebrow:
    'text-[10px] font-mono uppercase tracking-[0.2em] text-stone-500 border border-stone-700/60 bg-stone-900/40 rounded-full px-4 py-2',
  sectionDesc: 'font-mono text-[10px] uppercase tracking-[0.2em] text-stone-300',
  /** 玻璃擬物卡片：略提亮、細邊框與內發光感 */
  surfaceCard:
    'rounded-3xl border border-white/15 bg-white/[0.06] backdrop-blur-lg shadow-[0_10px_40px_rgba(0,0,0,0.5)]',
  surfaceCardHover:
    'hover:border-[#d4af37]/50 hover:bg-white/[0.08] hover:shadow-[0_20px_50px_rgba(212,175,55,0.08)] transition-all duration-500',
  buttonPrimary:
    'bg-gradient-to-r from-[#e5c158] to-[#c2994a] text-stone-900 font-medium border border-[#f5e1a4]/50 shadow-[0_4px_15px_rgba(212,175,55,0.25)]',
  buttonPrimaryStrong:
    'bg-gradient-to-r from-[#d4b27f] via-[#b9975a] to-[#c9a86c] text-stone-950 border border-[#8f7038]/35 shadow-[0_10px_28px_rgba(0,0,0,0.3)]',
  buttonGhost:
    'border border-stone-700/70 bg-stone-900/30 text-stone-300 hover:text-[#d4c4a8] hover:border-[#a8906a]/45 transition-colors',
  pubFigureSurface:
    'bg-gradient-to-b from-slate-900/80 via-slate-900/50 to-slate-950/60 border border-stone-800/50',
  fieldSelect:
    'appearance-none bg-slate-900/80 border border-stone-700/70 text-stone-200 px-6 py-3 pr-12 rounded-full text-sm font-mono focus:outline-none focus:border-[#9a8260]/55 focus:ring-1 focus:ring-[#9a8260]/30 transition-all cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]',
  sectionDivider: 'border-t border-stone-700/50',
  titleAccentBar: 'mx-auto h-px w-24 rounded-full bg-gradient-to-r from-[#b08d52]/70 via-stone-500/40 to-stone-600/50',
  metaMono: 'font-mono text-xs uppercase tracking-widest text-stone-400',
  footerLegal:
    'text-[11px] font-mono tracking-[0.18em] text-stone-400 [font-variant-numeric:lining-nums]',
  footerCredit: 'mt-2.5 text-[10px] font-mono tracking-[0.14em] text-stone-600',
  pubBadgeOverlay:
    'rounded border border-stone-700/50 bg-slate-950/80 font-mono uppercase tracking-widest text-stone-300 backdrop-blur-sm',
} as const;
