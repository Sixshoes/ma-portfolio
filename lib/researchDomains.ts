import type { Publication } from './publications';

export type ResearchDomainConfig = {
  id: string;
  index: number;
  roman: 'I' | 'II' | 'III' | 'IV' | 'V';
  /** 礦物圖鑑五色譜（用於環狀圖扇區、六角徽章與期刊視覺識別） */
  color: string;
  /** 黑板藍圖展櫃粉筆點綴色（鵝黃 #F3DF87 / 珊瑚粉紅 #E88D84） */
  chalkColor: string;
  labelZh: string;
  labelEn: string;
  /** 藍圖展櫃頂部之物理公式／晶格標註 */
  formulaTag: string;
  /** 展開抽屜與藍圖展櫃顯示的可點擊核心材料／物理關鍵字標籤 */
  keywords: Array<{ label: string; query: string }>;
  /** 點擊「篩選此領域相關論文」時比對標題／期刊／亮點／摘要的關鍵詞清單（任一命中即納入） */
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
      'wo3',
      'tungsten oxide',
      'moo3',
      'optical modulation',
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
      'electrochemical',
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
      'band gap',
      'topological',
      'ultraviolet',
      'laser',
      'luminescence',
    ],
  },
];

export function getResearchDomainById(id: string | null): ResearchDomainConfig | null {
  if (!id) return null;
  return RESEARCH_DOMAINS.find((d) => d.id === id) ?? null;
}

export function publicationMatchesDomain(
  pub: Publication,
  domain: ResearchDomainConfig,
): boolean {
  const haystack = `${pub.title} ${pub.journal} ${pub.takeaway ?? ''} ${pub.abstract_excerpt ?? ''}`.toLowerCase();
  return domain.matchTerms.some((term) => haystack.includes(term));
}

export function computeDomainStats(publications: Publication[]) {
  return RESEARCH_DOMAINS.map((domain) => {
    let count = 0;
    let citations = 0;
    for (const pub of publications) {
      if (publicationMatchesDomain(pub, domain)) {
        count += 1;
        citations += pub.citations;
      }
    }
    return {
      domain,
      count,
      citations,
    };
  });
}
