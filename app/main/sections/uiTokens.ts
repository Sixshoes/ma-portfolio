/** 方案 A：冷調實驗室紙張灰白（#F6F7F8 / #FFFFFF / #DCE2E8）＋ 深普魯士藍（#0F4C81）瑞士學術系統 */
export const uiTokens = {
  sectionKicker:
    'font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-[#0F4C81]',
  sectionTitle:
    'text-3xl font-semibold tracking-[-0.025em] leading-[1.12] text-[#11161C] sm:text-4xl md:text-[2.5rem]',
  titleLight: 'font-semibold text-[#11161C]',
  titleBold: 'font-semibold text-[#11161C]',
  sectionEyebrow:
    'text-xs font-mono tracking-[0.12em] text-[#5A6775]',
  sectionDesc: 'font-sans text-sm md:text-[15px] text-[#5A6775] leading-relaxed',
  surfaceCard:
    'rounded-lg border border-[#DCE2E8] bg-[#FFFFFF]',
  surfaceCardSolid:
    'rounded-lg border border-[#DCE2E8] bg-[#FFFFFF]',
  surfaceCardHover:
    'hover:border-[#0F4C81]/45 transition-colors duration-150',
  buttonPrimary:
    'bg-[#0F4C81] text-white font-medium border border-[#0F4C81] hover:bg-[#0B3A63] hover:border-[#0B3A63] transition-colors duration-150',
  buttonPrimaryStrong:
    'bg-[#0F4C81] text-white border border-[#0F4C81] hover:bg-[#0B3A63] hover:border-[#0B3A63] transition-colors duration-150',
  buttonGhost:
    'border border-[#C5CFD8] bg-[#FFFFFF] text-[#11161C] hover:border-[#0F4C81] hover:text-[#0F4C81] transition-colors duration-150',
  fieldSelect:
    'custom-select appearance-none bg-[#FFFFFF] border border-[#DCE2E8] text-[#11161C] px-3.5 py-2 pr-8 rounded-md text-xs font-mono focus:outline-none focus:border-[#0F4C81] transition-colors cursor-pointer hover:border-[#9AA8B8]',
  sectionDivider: 'border-t border-[#DCE2E8]',
  metaMono: 'font-mono text-[11px] uppercase tracking-[0.14em] text-[#5A6775]',
  footerLegal:
    'text-xs font-mono tracking-[0.06em] text-[#5A6775] [font-variant-numeric:lining-nums]',
} as const;
