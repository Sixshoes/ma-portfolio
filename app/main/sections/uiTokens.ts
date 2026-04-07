export const uiTokens = {
  sectionTitle: 'text-4xl md:text-7xl text-white',
  titleLight: 'font-display font-light text-amber-400/90 tracking-wide',
  titleBold: 'font-display font-bold tracking-tight',
  sectionEyebrow:
    'text-[10px] font-mono uppercase tracking-[0.2em] text-teal-300/80 border border-teal-400/20 bg-teal-500/5 rounded-full px-4 py-2',
  surfaceCard:
    'bg-gradient-to-b from-[#0D1528]/95 to-[#0A1223]/95 backdrop-blur-md border border-white/[0.08] rounded-3xl shadow-[0_12px_36px_rgba(0,0,0,0.3)]',
  surfaceCardHover:
    'hover:border-amber-400/35 hover:shadow-[0_20px_50px_rgba(251,191,36,0.14)] transition-all duration-500',
  buttonPrimary:
    'bg-gradient-to-r from-amber-300 to-amber-400 text-[#080C16] border border-amber-200/60 shadow-[0_10px_30px_rgba(251,191,36,0.25)]',
  buttonGhost:
    'border border-white/15 bg-white/[0.03] text-slate-300 hover:text-amber-300 hover:border-amber-400/40 transition-colors',
} as const;
