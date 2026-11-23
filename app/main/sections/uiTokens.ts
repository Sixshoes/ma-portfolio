/** 歐美名校期刊白底風（象牙紙白 #FAF8F4、墨黑襯線 #141311、古銅暖金細線 #9A742E） */
export const uiTokens = {
  sectionKicker:
    'font-mono text-xs font-medium uppercase tracking-[0.22em] text-[#8a6522]',
  sectionTitle:
    'font-heading-serif text-4xl md:text-5xl lg:text-6xl text-[#141311] tracking-tight leading-[1.08]',
  titleLight: 'font-heading-serif font-normal italic text-[#8a6522]',
  titleBold: 'font-heading-serif font-semibold text-[#141311]',
  sectionEyebrow:
    'text-xs font-mono uppercase tracking-[0.16em] text-[#57524b] border border-[#ddd5c7] bg-[#f3efe7] rounded-full px-4 py-2',
  sectionDesc: 'font-sans text-sm md:text-base text-[#57524b] leading-relaxed',
  /** 期刊畫冊感白卡 */
  surfaceCard:
    'rounded-2xl border border-[#e5dfd5] bg-white shadow-[0_2px_16px_rgba(20,19,17,0.04)]',
  surfaceCardSolid:
    'rounded-2xl border border-[#e5dfd5] bg-white shadow-[0_2px_12px_rgba(20,19,17,0.04)]',
  surfaceCardHover:
    'hover:border-[#c9b386] hover:shadow-[0_14px_34px_rgba(20,19,17,0.07)] transition-all duration-300',
  buttonPrimary:
    'bg-[#181614] text-[#faf8f4] font-medium border border-[#181614] hover:bg-[#8a6522] hover:border-[#8a6522] transition-colors',
  buttonPrimaryStrong:
    'bg-[#181614] text-[#faf8f4] border border-[#181614] shadow-[0_8px_24px_rgba(20,19,17,0.14)] hover:bg-[#8a6522] hover:border-[#8a6522] transition-all',
  buttonGhost:
    'border border-[#d8cfc0] bg-white text-[#292622] hover:text-[#7f5d1e] hover:border-[#9a742e] hover:bg-[#fbf9f4] transition-colors',
  /** 純白畫框：讓白底科學圖文摘要與期刊封面自然融合，無黑底白貼紙感 */
  pubFigureSurface: 'bg-white border border-[#eae4d9]',
  fieldSelect:
    'custom-select appearance-none bg-white border border-[#dcd4c7] text-[#141311] px-4 py-2.5 pr-10 rounded-full text-sm font-mono focus:outline-none focus:border-[#9a742e] focus:ring-2 focus:ring-[#9a742e]/15 transition-all cursor-pointer',
  sectionDivider: 'border-t border-[#e5dfd5]',
  titleAccentBar: 'mx-auto h-px w-20 bg-gradient-to-r from-transparent via-[#9a742e]/60 to-transparent',
  metaMono: 'font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-[#6b655d]',
  footerLegal:
    'text-xs font-mono tracking-[0.12em] text-[#57524b] [font-variant-numeric:lining-nums]',
  footerCredit: 'mt-2 text-xs font-mono tracking-[0.1em] text-[#787168]',
  pubBadgeOverlay:
    'rounded border border-[#e5dfd5] bg-[#faf8f4]/92 font-mono uppercase tracking-wider text-[#57524b] backdrop-blur-sm',
} as const;
