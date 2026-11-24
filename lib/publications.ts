export interface Publication {
  /** 穩定唯一識別碼（Notion page ID，選填以向下相容舊資料） */
  id?: string;
  title: string;
  year: number;
  journal: string;
  doi: string;
  citations: number;
  is_star: string;
  highlight: string;
  cover_url: string;
  file_img: string;
  /** 作者字串（逗號分隔）；展示時會高亮馬老師姓名 */
  authors?: string;
  /** 研究亮點，建議以 | 分隔多句，前端轉為列點 */
  takeaway?: string;
  /** 可展開閱讀的較長摘要／說明 */
  abstract_excerpt?: string;
  /** 僅 DOI 本體（如 10.1016/j.cej.2023.144789），供 Altmetric 等外連 */
  altmetric_id?: string;
}

const YEAR_REGEX = /\b((?:19|20)\d{2})\b/;
const DOI_PREFIX_REGEX = /^https?:\/\/(?:dx\.)?doi\.org\/(.+)$/i;
const BARE_DOI_REGEX = /^10\.\d{4,9}\/[^\s]+$/;

/** 常見國際期刊大小寫正規化映射表（修正 Scopus/Notion 匯入時的駝峰或縮寫小寫錯誤） */
const JOURNAL_CASE_MAP: Record<string, string> = {
  chemistryselect: 'ChemistrySelect',
  'rsc advances': 'RSC Advances',
  chemnanomat: 'ChemNanoMat',
  crystengcomm: 'CrystEngComm',
  'acs omega': 'ACS Omega',
  'acs applied materials and interfaces': 'ACS Applied Materials and Interfaces',
  'acs applied materials & interfaces': 'ACS Applied Materials & Interfaces',
  'acs applied nano materials': 'ACS Applied Nano Materials',
  'acs applied energy materials': 'ACS Applied Energy Materials',
  'acs sustainable chemistry and engineering': 'ACS Sustainable Chemistry and Engineering',
  'acs sustainable chemistry & engineering': 'ACS Sustainable Chemistry & Engineering',
};

export function normalizeJournalName(raw: unknown): string {
  const trimmed = String(raw ?? '').replace(/\s+/g, ' ').trim();
  if (!trimmed) return 'Unknown';
  return JOURNAL_CASE_MAP[trimmed.toLowerCase()] ?? trimmed;
}

/** 將作者字串中的 Unicode 連字號（U+2010–U+2015 / U+2212）統一轉為標準 ASCII `-`，防止中文語系下變形為全形寬距 */
export function normalizeAuthorsString(raw: unknown): string | undefined {
  if (typeof raw !== 'string') return undefined;
  const cleaned = raw
    .replace(/\s*[\u2010-\u2015\u2212]\s*/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned || undefined;
}

function sanitizeHttpUrl(value: unknown): string {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : '';
}

function normalizeDoiUrl(value: unknown): string {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (BARE_DOI_REGEX.test(trimmed)) {
    return `https://doi.org/${trimmed}`;
  }
  return sanitizeHttpUrl(trimmed);
}

function parseSafeYear(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const rounded = Math.trunc(value);
    return rounded >= 1900 && rounded <= 2100 ? rounded : 0;
  }
  const str = String(value ?? '').trim();
  if (!str) return 0;
  const match = str.match(YEAR_REGEX);
  if (match) return Number.parseInt(match[1], 10);
  const parsed = Number.parseInt(str, 10);
  return Number.isFinite(parsed) && parsed >= 1900 && parsed <= 2100 ? parsed : 0;
}

function parseSafeCitations(value: unknown): number {
  const normalized = typeof value === 'string' ? value.replace(/,/g, '').trim() : value;
  const parsed = Number(normalized ?? 0);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
}

/** 從完整 DOI 網址或裸 DOI 擷取乾淨的 DOI 本體（去除查詢參數、雜湊並解碼 %2F） */
export function extractDoiIdentifier(doiUrl: string): string | undefined {
  const trimmed = doiUrl.trim();
  if (!trimmed) return undefined;
  let candidate = trimmed;
  const match = trimmed.match(DOI_PREFIX_REGEX);
  if (match && match[1]) {
    candidate = match[1].trim();
  }
  candidate = candidate.split(/[?#]/)[0].trim().replace(/[./;,]+$/, '');
  try {
    candidate = decodeURIComponent(candidate);
  } catch {
    /* 保留原字串 */
  }
  return BARE_DOI_REGEX.test(candidate) ? candidate : undefined;
}

/** 取得單篇論文的穩定識別鍵，避免無 DOI 或重複 DOI 時發生衝突 */
export function getPublicationKey(pub: Publication, fallbackIndex?: number): string {
  if (pub.id?.trim()) return pub.id.trim();
  if (pub.doi?.trim()) return pub.doi.trim().toLowerCase();
  const base = `${pub.year}-${pub.title.trim().toLowerCase()}`;
  return fallbackIndex !== undefined ? `${base}-${fallbackIndex}` : base;
}

/** 根據論文引用次數即時計算 H-index */
export function computeHIndex(list: Publication[]): number {
  if (list.length === 0) return 0;
  const sortedCitations = list
    .map((p) => (Number.isFinite(p.citations) && p.citations > 0 ? p.citations : 0))
    .sort((a, b) => b - a);
  let h = 0;
  for (let i = 0; i < sortedCitations.length; i += 1) {
    if (sortedCitations[i] >= i + 1) {
      h = i + 1;
    } else {
      break;
    }
  }
  return h;
}

/** 從遠端 JSON 或本地快取還原時正規化欄位，防止 NaN / 異常型別污染 UI */
export function normalizePublicationsFromJson(data: unknown): Publication[] {
  if (!Array.isArray(data)) return [];
  return data
    .filter((item): item is Record<string, unknown> => item !== null && typeof item === 'object')
    .map((pub) => {
      const id = typeof pub.id === 'string' && pub.id.trim() ? pub.id.trim() : undefined;
      const doi = normalizeDoiUrl(pub.doi);
      const authors = normalizeAuthorsString(pub.authors);
      const takeaway = typeof pub.takeaway === 'string' && pub.takeaway.trim() ? pub.takeaway.trim() : undefined;
      const rawAbstract = pub.abstract_excerpt ?? pub.abstractExcerpt;
      const abstract_excerpt =
        typeof rawAbstract === 'string' && rawAbstract.trim() ? rawAbstract.trim() : undefined;
      const rawAltmetric = pub.altmetric_id ?? pub.altmetricId;
      const altmetric_id =
        typeof rawAltmetric === 'string' && rawAltmetric.trim()
          ? rawAltmetric.trim()
          : extractDoiIdentifier(doi);

      return {
        ...(id ? { id } : {}),
        title: String(pub.title ?? '').trim() || 'Untitled',
        year: parseSafeYear(pub.year),
        journal: normalizeJournalName(pub.journal),
        doi,
        citations: parseSafeCitations(pub.citations),
        is_star: String(pub.is_star ?? '否').trim(),
        highlight: String(pub.highlight ?? '').trim(),
        cover_url: sanitizeHttpUrl(pub.cover_url),
        file_img: sanitizeHttpUrl(pub.file_img),
        ...(authors ? { authors } : {}),
        ...(takeaway ? { takeaway } : {}),
        ...(abstract_excerpt ? { abstract_excerpt } : {}),
        ...(altmetric_id ? { altmetric_id } : {}),
      };
    });
}

export const publications: Publication[] = [
  {
    "title": "MoS2-GO hybrid sensor: A discerning approach for detecting harmful H2S gas at room temperature",
    year: 2023,
    "journal": "Chemical Engineering Journal",
    "doi": "https://doi.org/10.1016/j.cej.2023.144789",
    "citations": 66,
    "is_star": "否",
    "highlight": "⭐ 重點關注",
    "cover_url": "https://ars.els-cdn.com/content/image/1-s2.0-S1385894723035209-ga1.jpg",
    "file_img": "https://ars.els-cdn.com/content/image/X13858947.jpg",
    "altmetric_id": "10.1016/j.cej.2023.144789"
  },
  {
    "title": "Exploiting the capabilities of MoS2-WO3 heterojunction sensors for harmful NO2 gas detection at low temperature",
    year: 2024,
    "journal": "Ceramics International",
    "doi": "https://doi.org/10.1016/j.ceramint.2024.02.084",
    "citations": 11,
    "is_star": "否",
    "highlight": "📄 一般論文",
    "cover_url": "https://ars.els-cdn.com/content/image/X02728842.jpg",
    "file_img": "https://ars.els-cdn.com/content/image/X02728842.jpg",
    "altmetric_id": "10.1016/j.ceramint.2024.02.084"
  },
  {
    "title": "Enhancing the Hydrogen Evolution Performance of Tungsten Diphosphide on Carbon Fiber through Ruthenium Modification",
    year: 2024,
    "journal": "ACS Applied Materials and Interfaces",
    "doi": "https://doi.org/10.1021/acsami.3c17114",
    "citations": 4,
    "is_star": "否",
    "highlight": "📄 一般論文",
    "cover_url": "https://pubs.acs.org/cms/10.1021/acsami.3c17114/asset/images/medium/am3c17114_0007.gif",
    "file_img": "https://pubs.acs.org/cms/10.1021/aamick.2024.16.issue-10/asset/19267426-e519-6742-ce51-267426ce5192/aamick.2024.16.issue-10.largecover.jpg",
    "altmetric_id": "10.1021/acsami.3c17114"
  },
  {
    "title": "Doping-free bandgap tuning in one-dimensional Magnéli-phase nanorods of Mo4O11",
    year: 2016,
    "journal": "Nanoscale",
    "doi": "https://doi.org/10.1039/c5nr08118a",
    "citations": 46,
    "is_star": "是",
    "highlight": "📄 一般論文",
    "cover_url": "https://pubs.rsc.org/en/Image/Get?imageInfo.ImageType=GA&imageInfo.ImageIdentifier.ManuscriptID=C5NR08118A&imageInfo.ImageIdentifier.Year=2016",
    "file_img": "https://pubs.rsc.org/en/Image/Get?imageInfo.ImageType=CoverIssue&imageInfo.ImageIdentifier.SerCode=nr&imageInfo.ImageIdentifier.IssueId=NR018009&imageInfo.ImageIdentifier.Year=2026",
    "altmetric_id": "10.1039/c5nr08118a"
  },
  {
    "title": "Investigations on silver/polyaniline electrodes for electrochemical supercapacitors",
    year: 2012,
    "journal": "Physical Chemistry Chemical Physics",
    "doi": "https://doi.org/10.1039/c2cp41757j",
    "citations": 136,
    "is_star": "否",
    "highlight": "🔥 國際標竿",
    "cover_url": "https://pubs.rsc.org/en/Image/Get?imageInfo.ImageType=GA&imageInfo.ImageIdentifier.ManuscriptID=C2CP41757J&imageInfo.ImageIdentifier.Year=2012",
    "file_img": "https://pubs.rsc.org/en/Image/Get?imageInfo.ImageType=CoverIssue&imageInfo.ImageIdentifier.SerCode=cp&imageInfo.ImageIdentifier.IssueId=CP028010&imageInfo.ImageIdentifier.Year=2026",
    "altmetric_id": "10.1039/c2cp41757j"
  },
  {
    "title": "Impact of Nanosize on Supercapacitance: Study of 1D Nanorods and 2D Thin-Films of Nickel Oxide",
    year: 2016,
    "journal": "ACS Applied Materials and Interfaces",
    "doi": "https://doi.org/10.1021/acsami.6b00487",
    "citations": 92,
    "is_star": "是",
    "highlight": "⭐ 重點關注",
    "cover_url": "https://pubs.acs.org/cms/10.1021/acsami.6b00487/asset/images/medium/am-2016-004878_0002.gif",
    "file_img": "https://pubs.acs.org/cms/10.1021/aamick.2016.8.issue-15/asset/15655aff-b415-55af-3b41-655aff3b4156/aamick.2016.8.issue-15.largecover.jpg",
    "altmetric_id": "10.1021/acsami.6b00487"
  },
  {
    title: 'One-dimensional metal-oxide nanostructures: Recent developments in synthesis, characterization, and applications',
    year: 2012,
    journal: 'Advanced Functional Materials',
    doi: 'https://doi.org/10.1002/adfm.201201008',
    citations: 773,
    is_star: '是',
    highlight: '🔥 國際標竿',
    cover_url:
      'https://advanced.onlinelibrary.wiley.com/cms/asset/06e41a15-f1fd-440b-a574-6875dd9f9307/adfm.v22.16.cover.gif',
    file_img:
      'https://advanced.onlinelibrary.wiley.com/cms/asset/06e41a15-f1fd-440b-a574-6875dd9f9307/adfm.v22.16.cover.gif',
    authors:
      'Yuan-Ron Ma*, S. X. Ouyang, N. S. Xu, S. P. Lau, J. H. Lee, G. L. Chen, I. Bello',
    takeaway:
      '領域內廣被引用的 1D 金屬氧化物綜述，建立合成—表徵—應用的完整敘事 | 為後續奈米線／奈米棒研究提供方法論參考',
    abstract_excerpt:
      '本綜述整理一維金屬氧化物在合成策略、結構表徵與元件應用上的進展，並討論量產與可靠度上的挑戰；適合作為進入此研究主線的入口文獻。',
    altmetric_id: '10.1002/adfm.201201008',
  },
  {
    "title": "Efficient electrochromic properties of high-density and large-area arrays of one-dimensional NiO nanorods",
    year: 2013,
    "journal": "Solar Energy Materials and Solar Cells",
    "doi": "https://doi.org/10.1016/j.solmat.2013.01.003",
    "citations": 110,
    "is_star": "是",
    "highlight": "🔥 國際標竿",
    "cover_url": "https://ars.els-cdn.com/content/image/1-s2.0-S0927024813X00030-cov150h.gif",
    "file_img": "https://ars.els-cdn.com/content/image/1-s2.0-S0927024813X00030-cov150h.gif",
    "altmetric_id": "10.1016/j.solmat.2013.01.003"
  },
  {
    title: 'Synthesis and characterization of Ru doped CuO thin films for supercapacitor based on Bronsted acidic ionic liquid',
    year: 2011,
    journal: 'Electrochimica Acta',
    doi: 'https://doi.org/10.1016/j.electacta.2010.11.046',
    citations: 155,
    is_star: '否',
    highlight: '🔥 國際標竿',
    cover_url: 'https://ars.els-cdn.com/content/image/1-s2.0-S0013468611X00026-cov150h.gif',
    file_img: 'https://ars.els-cdn.com/content/image/1-s2.0-S0013468611X00026-cov150h.gif',
    authors: 'C. W. Kung, H. W. Chen, Y. C. Lin, Yuan-Ron Ma, H. C. Shih, K. C. Ho',
    takeaway:
      '以 Ru 修飾 CuO 薄膜並結合 Bronsted 酸性離子液體電解質，提升超電容之電化學表現 | 展示可放大的薄膜製程思路',
    abstract_excerpt:
      '探討 Ru 摻雜對 CuO 薄膜形貌與電容行為的影響，並在離子液體系統下評估循環穩定度與功率密度，為過渡金屬氧化物電極提供實驗參考。',
    altmetric_id: '10.1016/j.electacta.2010.11.046',
  },
  {
    title: 'X-ray diffraction and Raman scattering studies on large-area array and nanobranched structure of 1D MoO2 nanorods',
    year: 2007,
    journal: 'Nanotechnology',
    doi: 'https://doi.org/10.1088/0957-4484/18/11/115717',
    citations: 166,
    is_star: '否',
    highlight: '🔥 國際標竿',
    cover_url: '',
    file_img: '',
    authors: 'Yuan-Ron Ma, J. H. Lee, Y. C. Lin, H. W. Chen, C. W. Kung',
    takeaway:
      '以大面積陣列與奈米分枝結構解析 1D MoO2 之 XRD／Raman 特徵 | 建立結構—訊號對照，利於後續元件化設計',
    abstract_excerpt:
      '利用 X 光繞射與拉曼光譜比對不同形貌之 MoO2 一維結構，釐清應力與表面效應對聲子模態的影響，並討論大面積可製程性。',
    altmetric_id: '10.1088/0957-4484/18/11/115717',
  }
];
