/** 深邃黑曜石建築美學系統（Obsidian #080807 · 1px 細線網格 · 克制香檳金） */
export const uiTokens = {
  sectionKicker:
    'font-mono text-[11px] font-medium uppercase tracking-[0.26em] text-[#c8a464]',
  sectionTitle:
    'font-heading-serif text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] text-[#f5f3ef] tracking-[-0.02em] leading-[1.08]',
  titleLight: 'font-heading-serif font-normal italic text-[#e2c992]',
  titleBold: 'font-heading-serif font-semibold text-[#f5f3ef]',
  sectionEyebrow:
    'text-xs font-mono tracking-[0.12em] text-[#9b958c]',
  sectionDesc: 'font-sans text-sm md:text-base text-[#a39e95] leading-relaxed',
  /** 建築精雕面板（頂部微高光細線 + 極致克制圓角） */
  surfaceCard:
    'rounded-xl border border-white/[0.085] bg-[#100f0e] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_18px_50px_rgba(0,0,0,0.45)]',
  surfaceCardSolid:
    'rounded-xl border border-white/[0.085] bg-[#100f0e]',
  surfaceCardHover:
    'hover:border-[#c8a464]/40 hover:bg-[#131210] transition-colors duration-300',
  buttonPrimary:
    'bg-[#f5f3ef] text-[#080807] font-medium border border-[#f5f3ef] hover:bg-[#e5cea0] hover:border-[#e5cea0] transition-colors',
  buttonPrimaryStrong:
    'bg-[#f5f3ef] text-[#080807] border border-[#f5f3ef] hover:bg-[#e5cea0] hover:border-[#e5cea0] transition-all duration-300',
  buttonGhost:
    'border border-white/[0.14] bg-transparent text-[#e8e4dc] hover:border-[#c8a464]/70 hover:text-[#e5cea0] hover:bg-white/[0.03] transition-colors',
  /** 美術館裝裱內框：深色外斜角 + 溫潤象牙紙白畫框，讓白底科學圖宛如展覽圖版 */
  pubPlateOuter:
    'rounded-lg border border-white/[0.09] bg-[#161513] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]',
  pubFigureSurface:
    'rounded-[5px] bg-[#f7f5f0] border border-black/10',
  fieldSelect:
    'custom-select appearance-none bg-[#0d0c0b] border border-white/[0.12] text-[#f5f3ef] px-4 py-2 pr-9 rounded-lg text-xs font-mono focus:outline-none focus:border-[#c8a464]/70 transition-colors cursor-pointer hover:border-white/[0.22]',
  sectionDivider: 'border-t border-white/[0.08]',
  titleAccentBar: 'h-px w-16 bg-gradient-to-r from-[#c8a464] to-transparent',
  metaMono: 'font-mono text-[11px] uppercase tracking-[0.18em] text-[#8f8980]',
  footerLegal:
    'text-xs font-mono tracking-[0.14em] text-[#8f8980] [font-variant-numeric:lining-nums]',
  footerCredit: 'mt-2 text-xs font-mono tracking-[0.12em] text-[#6d6860]',
  pubBadgeOverlay:
    'rounded-sm border border-black/10 bg-[#141311]/88 font-mono uppercase tracking-widest text-[#e5cea0] backdrop-blur-sm',
} as const;
