export interface ChalkboardItem {
  id: string;
  /** Storage chalkboards/{id}.webp (1800px 高清保留細小粉筆數學符號) 或 public/ 靜態路徑 */
  imageUrl: string;
  titleZh: string;
  titleEn: string;
  /** 物理公式或推導重點說明 */
  formulaNote: string;
  courseOrTopic?: string;
  year?: string;
  featuredInHero?: boolean;
  order: number;
}

/**
 * 預設種子資料：即使尚未進入 /admin 新增更多照片，首頁與黑板藝廊立即擁有核心量子穿隧手稿主題。
 * 將馬副校長黑板實拍原圖存為 public/chalkboard-quantum-tunneling.jpg 或透過 /admin 上傳即自動呈現高清原圖。
 */
export const DEFAULT_CHALKBOARDS: ChalkboardItem[] = [
  {
    id: 'quantum-tunneling-barrier',
    imageUrl: '/chalkboard-quantum-tunneling.webp',
    titleZh: '量子穿隧效應與矩形位能障穿透係數推導',
    titleEn: 'Quantum Tunneling & STM Barrier Transmission Derivation',
    formulaNote: 'T = |F/A|² = [1 + V₀² sinh²(κL) / 4E(V₀ − E)]⁻¹',
    courseOrTopic: 'Quantum Mechanics / Scanning Tunneling Microscopy',
    year: '2025',
    featuredInHero: true,
    order: 1,
  },
];

function isSafeImagePath(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('/') || /^https?:\/\//i.test(trimmed)) return trimmed;
  return '';
}

export function normalizeChalkboardsFromJson(raw: unknown): ChalkboardItem[] {
  if (!Array.isArray(raw)) return [];
  const items: ChalkboardItem[] = [];

  for (let i = 0; i < raw.length; i += 1) {
    const entry = raw[i];
    if (!entry || typeof entry !== 'object') continue;
    const obj = entry as Record<string, unknown>;
    const imageUrl = isSafeImagePath(obj.imageUrl);
    if (!imageUrl) continue;

    const id =
      typeof obj.id === 'string' && obj.id.trim()
        ? obj.id.trim()
        : `chalkboard-${i + 1}`;
    const titleZh =
      typeof obj.titleZh === 'string' && obj.titleZh.trim()
        ? obj.titleZh.trim()
        : typeof obj.titleEn === 'string' && obj.titleEn.trim()
          ? obj.titleEn.trim()
          : '親筆黑板物理推導手稿';
    const titleEn =
      typeof obj.titleEn === 'string' && obj.titleEn.trim()
        ? obj.titleEn.trim()
        : titleZh;
    const formulaNote =
      typeof obj.formulaNote === 'string' ? obj.formulaNote.trim() : '';
    const courseOrTopic =
      typeof obj.courseOrTopic === 'string' && obj.courseOrTopic.trim()
        ? obj.courseOrTopic.trim()
        : undefined;
    const year =
      typeof obj.year === 'string' && obj.year.trim()
        ? obj.year.trim()
        : typeof obj.year === 'number' && Number.isFinite(obj.year)
          ? String(Math.trunc(obj.year))
          : undefined;
    const featuredInHero = Boolean(obj.featuredInHero);
    const order =
      typeof obj.order === 'number' && Number.isFinite(obj.order)
        ? Math.trunc(obj.order)
        : i + 1;

    items.push({
      id,
      imageUrl,
      titleZh,
      titleEn,
      formulaNote,
      courseOrTopic,
      year,
      featuredInHero,
      order,
    });
  }

  return items.sort((a, b) => a.order - b.order);
}
