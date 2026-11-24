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
  /** 主要歸類比對關鍵詞清單（互斥歸類確保各領域篇數加總精準等於全站總篇數） */
  matchTerms: string[];
};

export const RESEARCH_DOMAINS: ResearchDomainConfig[] = [
  {
    id: '1d-nanomaterials',
    index: 0,
    roman: 'I',
    color: '#1B4965',
    chalkColor: '#F3DF87',
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
    matchTerms: [
      'nanorod',
      'nanowire',
      'nanotube',
      'one-dimensional',
      '1d ',
      '1d-',
      'nanobelt',
      'nanoneedle',
      'nanofiber',
      'nanocolumn',
      'nanostructur',
      'nanoparticle',
      'nanoflower',
      'wo3',
      'moo3',
      'zno',
      'nio',
      'tio2',
      'tungsten oxide',
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
    matchTerms: [
      'ferromagnet',
      'magnetic',
      'magnon',
      'spin',
      'cri3',
      'monolayer',
      'two-dimensional',
      '2d ',
      '2d-',
      'van der waals',
      'graphene',
      'mos2',
      'mxene',
      'layered',
      'ws2',
    ],
  },
  {
    id: 'electrochromism',
    index: 2,
    roman: 'III',
    color: '#C88A2B',
    chalkColor: '#E88D84',
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
    matchTerms: [
      'electrochrom',
      'smart window',
      'optical modulation',
      'coloration',
      'bleaching',
    ],
  },
  {
    id: 'supercapacitors',
    index: 3,
    roman: 'IV',
    color: '#9E3B33',
    chalkColor: '#F3DF87',
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
    matchTerms: [
      'supercapacitor',
      'supercapacitance',
      'pseudocapacit',
      'energy storage',
      'capacitance',
      'battery',
      'batteries',
      'lithium-ion',
      'sodium-ion',
      'electrochemical performance',
      'charge storage',
      'electrode',
    ],
  },
  {
    id: 'quantum-computer',
    index: 4,
    roman: 'V',
    color: '#4A586E',
    chalkColor: '#E88D84',
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
    matchTerms: [
      'quantum',
      'qubit',
      'exciton',
      'photodetector',
      'topological',
      'band gap',
      'bandgap',
      'photoluminescence',
      'luminescence',
      'ultraviolet',
      'laser',
      'raman',
      'optical propert',
      'plasmonic',
      'dielectric',
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
  matchTerms: [],
};

export const ALL_DONUT_DOMAINS: ResearchDomainConfig[] = [
  ...RESEARCH_DOMAINS,
  OTHER_MATERIALS_DOMAIN,
];

/** 依應用專一性決定互斥主領域順序（電致變色 → 超級電容 → 量子光電 → 二維鐵磁 → 一維奈米 → 光電催化與薄膜） */
const PRIMARY_CLASSIFICATION_ORDER = [
  'electrochromism',
  'supercapacitors',
  'quantum-computer',
  '2d-ferromagnetic',
  '1d-nanomaterials',
] as const;

export function getResearchDomainById(id: string | null): ResearchDomainConfig | null {
  if (!id) return null;
  return ALL_DONUT_DOMAINS.find((d) => d.id === id) ?? null;
}

/** 將每篇論文唯一歸入單一主領域，確保環狀圖扇區加總與全站總篇數 100% 精準一致 */
export function classifyPublicationPrimaryDomain(pub: Publication): string {
  const haystack = `${pub.title} ${pub.journal} ${pub.takeaway ?? ''} ${pub.abstract_excerpt ?? ''}`.toLowerCase();
  for (const domainId of PRIMARY_CLASSIFICATION_ORDER) {
    const domain = RESEARCH_DOMAINS.find((d) => d.id === domainId);
    if (domain && domain.matchTerms.some((term) => haystack.includes(term))) {
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
