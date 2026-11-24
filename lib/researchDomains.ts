import type { Publication } from './publications';

export type ResearchDomainConfig = {
  id: string;
  index: number;
  roman: 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI';
  /** 礦物圖鑑色譜（用於環狀圖扇區、六角徽章與期刊視覺識別） */
  color: string;
  /** 黑板藍圖展櫃粉筆點綴色（鵝黃 #F3DF87 / 珊瑚粉紅 #E88D84） */
  chalkColor: string;
  labelZh: string;
  labelEn: string;
  /** 藍圖展櫃頂部之物理公式／晶格標註 */
  formulaTag: string;
  /** 展開抽屜與藍圖展櫃顯示的可點擊核心材料／物理關鍵字標籤 */
  keywords: Array<{ label: string; query: string }>;
  /** 主要歸類比對正則清單（使用單字邊界防止 spin→spinel、nio→anion、electrode→electrodeposition 誤判） */
  matchPatterns: RegExp[];
};

export const RESEARCH_DOMAINS: ResearchDomainConfig[] = [
  {
    id: '1d-nanomaterials',
    index: 0,
    roman: 'I',
    color: '#1B4965',
    chalkColor: '#7FB3D5',
    labelZh: '一維奈米材料',
    labelEn: '1D Nanomaterials',
    formulaTag: 'ZnO · WO₃ [001] Nanorods',
    keywords: [
      { label: 'Nanorods', query: 'nanorod' },
      { label: 'Nanowires', query: 'nanowire' },
      { label: 'Nanotubes', query: 'nanotube' },
      { label: 'ZnO', query: 'zno' },
      { label: 'NiO', query: 'nio' },
    ],
    matchPatterns: [
      /\bnanorod/i,
      /\bnanowire/i,
      /\bnanotube/i,
      /\bone-dimensional\b/i,
      /\b1d\b/i,
      /\bnanobelt/i,
      /\bnanoneedle/i,
      /\bnanofiber/i,
      /\bnanocolumn/i,
      /\bnanobranched\b/i,
      /\bnanostructur/i,
      /\b(?:wo3|moo3|moo2|zno|nio|tio2|cuo)\b/i,
      /\btungsten oxide\b/i,
    ],
  },
  {
    id: '2d-ferromagnetic',
    index: 1,
    roman: 'II',
    color: '#2A6F68',
    chalkColor: '#8ED1C6',
    labelZh: '二維鐵磁材料',
    labelEn: '2D Ferromagnetic Materials',
    formulaTag: 'CrI₃ · CrTe₂ · 2D Spin ↑↑',
    keywords: [
      { label: 'Ferromagnetic', query: 'ferromagnet' },
      { label: 'Magnetic', query: 'magnetic' },
      { label: 'CrI3', query: 'cri3' },
      { label: '2D Layered', query: '2d' },
      { label: 'Spin / Magnon', query: 'magnon' },
    ],
    matchPatterns: [
      /\bferromagnet/i,
      /\bantiferromagnet/i,
      /\bmagnet(?:ic|ism|ization|o)\b/i,
      /\bmagnon/i,
      /\bspintronic/i,
      /\bspin\b(?!-?coat)/i,
      /\bcri3\b/i,
      /\bcrte2\b/i,
      /\bvan der waals\b/i,
      /\b(?:two-dimensional|2d)\b.*\b(?:magnet|spin|ferro|monolayer)/i,
      /\bmonolayer\b/i,
    ],
  },
  {
    id: 'electrochromism',
    index: 2,
    roman: 'III',
    color: '#C88A2B',
    chalkColor: '#F3DF87',
    labelZh: '電致變色',
    labelEn: 'Electrochromism',
    formulaTag: 'WO₃ + xLi⁺ + xe⁻ ⇄ LiₓWO₃',
    keywords: [
      { label: 'Electrochromic', query: 'electrochromic' },
      { label: 'WO3', query: 'wo3' },
      { label: 'Smart Windows', query: 'smart window' },
      { label: 'MoO3', query: 'moo3' },
      { label: 'Optical Modulation', query: 'optical' },
    ],
    matchPatterns: [
      /\belectrochrom/i,
      /\bsmart window/i,
      /\boptical modulation\b/i,
      /\bcoloration efficiency\b/i,
      /\bphotochrom/i,
    ],
  },
  {
    id: 'supercapacitors',
    index: 3,
    roman: 'IV',
    color: '#9E3B33',
    chalkColor: '#E88D84',
    labelZh: '超級電容器',
    labelEn: 'Supercapacitors',
    formulaTag: 'C = εA / d · Pseudocapacitance',
    keywords: [
      { label: 'Supercapacitor', query: 'supercapacitor' },
      { label: 'Pseudocapacitive', query: 'pseudocapacit' },
      { label: 'Energy Storage', query: 'energy storage' },
      { label: 'Electrode', query: 'electrode' },
      { label: 'Battery', query: 'battery' },
    ],
    matchPatterns: [
      /\bsupercapacit/i,
      /\bpseudocapacit/i,
      /\benergy storage\b/i,
      /\bcapacitance\b/i,
      /\bbatter(?:y|ies)\b/i,
      /\blithium-ion\b/i,
      /\bsodium-ion\b/i,
      /\bcharge storage\b/i,
      /\bsymmetric(?:al)?\s+(?:cell|device|capacitor)/i,
      /\belectrochemical performance\b/i,
    ],
  },
  {
    id: 'quantum-computer',
    index: 4,
    roman: 'V',
    color: '#4A586E',
    chalkColor: '#A9BCD6',
    labelZh: '量子電腦',
    labelEn: 'Quantum Computer',
    formulaTag: 'T = |F/A|² · |ψ⟩ = α|0⟩ + β|1⟩',
    keywords: [
      { label: 'Quantum', query: 'quantum' },
      { label: 'Photodetector', query: 'photodetector' },
      { label: 'Exciton', query: 'exciton' },
      { label: 'Band Gap', query: 'band gap' },
      { label: 'Ultraviolet', query: 'ultraviolet' },
    ],
    matchPatterns: [
      /\bquantum\b/i,
      /\bqubit/i,
      /\bexciton/i,
      /\bphotodetector/i,
      /\btopological\b/i,
      /\btunneling\b/i,
      /\bphotoluminescence\b/i,
      /\bluminescence\b/i,
      /\bultraviolet\b/i,
      /\blaser\b/i,
      /\bplasmonic/i,
      /\bphotonic/i,
    ],
  },
];

/** 第六扇區：涵蓋能源電催化、光催化、氣體感測與表面薄膜，使環狀圖各類加總精準等於全站總篇數 */
export const OTHER_MATERIALS_DOMAIN: ResearchDomainConfig = {
  id: 'catalysis-thin-films',
  index: 5,
  roman: 'VI',
  color: '#6E7F74',
  chalkColor: '#BFD3C8',
  labelZh: '光電催化與薄膜',
  labelEn: 'Catalysis & Thin Films',
  formulaTag: 'HER · OER · Surface Science',
  keywords: [
    { label: 'Electrocatalyst', query: 'electrocatal' },
    { label: 'Photocatalytic', query: 'photocatal' },
    { label: 'Gas Sensor', query: 'sensor' },
  ],
  matchPatterns: [],
};

export const ALL_DONUT_DOMAINS: ResearchDomainConfig[] = [
  ...RESEARCH_DOMAINS,
  OTHER_MATERIALS_DOMAIN,
];

/** 依應用專一性決定互斥主領域順序（電致變色 → 超級電容 → 二維鐵磁 → 量子光電 → 一維奈米 → 光電催化與薄膜） */
const PRIMARY_CLASSIFICATION_ORDER = [
  'electrochromism',
  'supercapacitors',
  '2d-ferromagnetic',
  'quantum-computer',
  '1d-nanomaterials',
] as const;

export function getResearchDomainById(id: string | null): ResearchDomainConfig | null {
  if (!id) return null;
  return ALL_DONUT_DOMAINS.find((d) => d.id === id) ?? null;
}

/** 將每篇論文唯一歸入單一主領域，確保環狀圖扇區加總與全站總篇數 100% 精準一致 */
export function classifyPublicationPrimaryDomain(pub: Publication): string {
  const haystack = `${pub.title} ${pub.journal} ${pub.takeaway ?? ''} ${pub.abstract_excerpt ?? ''}`;
  // 氣體感測／電催化／光催化／水分解優先歸類至第六類「光電催化與薄膜」，避免被材料名稱劫持
  const isCatalysisOrSensor =
    /\b(?:gas\s+sens|chemiresist|h2s|no2\s+gas|electrocatal|photocatal|water\s+splitting|oxygen\s+evolution|hydrogen\s+evolution|photodegradation|dye\s+degradation)\b/i.test(
      pub.title,
    );
  if (isCatalysisOrSensor && !/\b(?:electrochrom|supercapacit|ferromagnet|quantum)\b/i.test(pub.title)) {
    return OTHER_MATERIALS_DOMAIN.id;
  }

  for (const domainId of PRIMARY_CLASSIFICATION_ORDER) {
    const domain = RESEARCH_DOMAINS.find((d) => d.id === domainId);
    if (domain && domain.matchPatterns.some((pattern) => pattern.test(haystack))) {
      return domain.id;
    }
  }
  return OTHER_MATERIALS_DOMAIN.id;
}

export function publicationMatchesDomain(
  pub: Publication,
  domain: ResearchDomainConfig,
): boolean {
  return classifyPublicationPrimaryDomain(pub) === domain.id;
}

/** 計算全站 6 扇區互斥分佈（供首頁環狀圖使用，總和精準等於 publications.length） */
export function computeDonutDomainStats(publications: Publication[]) {
  const counts = new Map<string, { count: number; citations: number }>();
  for (const d of ALL_DONUT_DOMAINS) {
    counts.set(d.id, { count: 0, citations: 0 });
  }
  for (const pub of publications) {
    const domainId = classifyPublicationPrimaryDomain(pub);
    const bucket = counts.get(domainId);
    if (bucket) {
      bucket.count += 1;
      bucket.citations += pub.citations;
    }
  }
  return ALL_DONUT_DOMAINS.map((domain) => {
    const bucket = counts.get(domain.id) ?? { count: 0, citations: 0 };
    return {
      domain,
      count: bucket.count,
      citations: bucket.citations,
    };
  });
}

/** 計算五大代表性藍圖展櫃統計（與環狀圖前五大扇區採完全一致之主領域歸類） */
export function computeDomainStats(publications: Publication[]) {
  return computeDonutDomainStats(publications).slice(0, RESEARCH_DOMAINS.length);
}
