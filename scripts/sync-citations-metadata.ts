/**
 * 論文引用數、DOI、標題與作者名單批次健檢與更新腳本（Crossref + OpenAlex）
 *
 * 使用範例：
 *   1) 安全健檢（不改任何檔案，輸出完整統計與過時清單）：
 *      npm run sync:metadata -- --dry-run
 *
 *   2) 健檢並輸出可直接進 /admin 匯入的升級版 JSON（去重、補 DOI、修缺字標題、依 Crossref 下限更新引用、補齊作者）：
 *      npm run sync:metadata -- --dry-run --export-json upgraded-papers.json
 *
 *   3) 若想改用 OpenAlex 較廣口徑更新引用數：
 *      npm run sync:metadata -- --dry-run --mode openalex --export-json upgraded-papers.json
 *
 *   4) 同時輸出完整 Markdown 健檢報告：
 *      npm run sync:metadata -- --dry-run --report-md citation-audit.md
 */

import fs from 'node:fs';
import path from 'node:path';
import { FIRESTORE_PUBLICATIONS_DOC } from '../lib/constants';
import {
  syncPublicationsMetadata,
  type CitationSyncPolicy,
  type MetadataSyncReport,
} from '../lib/metadataSync';
import { normalizePublicationsFromJson, type Publication } from '../lib/publications';

const LEGACY_PORTAL_URL = 'https://sixshoes.github.io/Ma-Research-Portal/papers.json';

type CliOptions = {
  mode: CitationSyncPolicy;
  fillAuthors: boolean;
  fixAnomalies: boolean;
  exportJsonPath: string | null;
  reportMdPath: string | null;
  source: string | null;
};

function loadDotEnvFiles(): void {
  for (const fileName of ['.env.local', '.env']) {
    const fullPath = path.resolve(process.cwd(), fileName);
    if (!fs.existsSync(fullPath)) continue;
    const raw = fs.readFileSync(fullPath, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = {
    mode: 'crossref-floor',
    fillAuthors: true,
    fixAnomalies: true,
    exportJsonPath: null,
    reportMdPath: null,
    source: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--mode' && argv[i + 1]) {
      const v = argv[++i];
      if (v === 'crossref-floor' || v === 'openalex' || v === 'keep') opts.mode = v;
    } else if (arg === '--no-authors') {
      opts.fillAuthors = false;
    } else if (arg === '--no-fix') {
      opts.fixAnomalies = false;
    } else if (arg === '--export-json' && argv[i + 1]) {
      opts.exportJsonPath = argv[++i];
    } else if (arg === '--report-md' && argv[i + 1]) {
      opts.reportMdPath = argv[++i];
    } else if (arg === '--source' && argv[i + 1]) {
      opts.source = argv[++i];
    }
  }
  return opts;
}

type FirestoreValue =
  | { stringValue: string }
  | { integerValue: string }
  | { doubleValue: number }
  | { booleanValue: boolean }
  | { nullValue: null }
  | { arrayValue: { values?: FirestoreValue[] } }
  | { mapValue: { fields?: Record<string, FirestoreValue> } };

function decodeFirestoreValue(val: FirestoreValue | undefined): unknown {
  if (!val || typeof val !== 'object') return undefined;
  if ('stringValue' in val) return val.stringValue;
  if ('integerValue' in val) return Number(val.integerValue);
  if ('doubleValue' in val) return val.doubleValue;
  if ('booleanValue' in val) return val.booleanValue;
  if ('nullValue' in val) return null;
  if ('arrayValue' in val) return (val.arrayValue.values ?? []).map(decodeFirestoreValue);
  if ('mapValue' in val) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val.mapValue.fields ?? {})) {
      out[k] = decodeFirestoreValue(v);
    }
    return out;
  }
  return undefined;
}

async function loadSourcePapers(
  sourceArg: string | null,
  projectId: string | undefined,
): Promise<{ items: Publication[]; origin: string }> {
  if (sourceArg && sourceArg !== 'firestore' && sourceArg !== 'portal') {
    const full = path.resolve(process.cwd(), sourceArg);
    const raw = JSON.parse(fs.readFileSync(full, 'utf8')) as unknown;
    const arr = Array.isArray(raw) ? raw : (raw as { items?: unknown }).items;
    return { items: normalizePublicationsFromJson(arr), origin: full };
  }

  if (projectId && sourceArg !== 'portal') {
    const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
      projectId,
    )}/databases/(default)/documents/${FIRESTORE_PUBLICATIONS_DOC}`;
    const res = await fetch(url);
    if (res.ok) {
      const doc = (await res.json()) as { fields?: Record<string, FirestoreValue> };
      if (doc.fields) {
        const decoded = decodeFirestoreValue({ mapValue: { fields: doc.fields } }) as Record<
          string,
          unknown
        >;
        const items = normalizePublicationsFromJson(decoded.items);
        if (items.length > 0) {
          return { items, origin: `Firestore (${projectId}/${FIRESTORE_PUBLICATIONS_DOC})` };
        }
      }
    }
  }

  const siblingPortal = path.resolve(process.cwd(), '..', 'Ma-Research-Portal', 'papers.json');
  if (sourceArg !== 'portal' && fs.existsSync(siblingPortal)) {
    const raw = JSON.parse(fs.readFileSync(siblingPortal, 'utf8')) as unknown;
    return { items: normalizePublicationsFromJson(raw), origin: siblingPortal };
  }

  const res = await fetch(LEGACY_PORTAL_URL);
  if (!res.ok) throw new Error(`無法載入論文來源（HTTP ${res.status}）`);
  return { items: normalizePublicationsFromJson(await res.json()), origin: LEGACY_PORTAL_URL };
}

function buildMarkdownReport(
  report: MetadataSyncReport,
  origin: string,
  mode: CitationSyncPolicy,
  initialAuthorsCount: number,
  finalAuthorsCount: number,
): string {
  const lines: string[] = [
    '# ma-portfolio 論文引用數、DOI 與作者名單健檢報告',
    '',
    `- **檢查日期**：${new Date().toISOString().slice(0, 10)}`,
    `- **資料來源**：\`${origin}\``,
    `- **比對策略**：\`${mode}\`（以 Crossref 為最保守引用下限，輔以 OpenAlex 交叉比對）`,
    '',
    '## 一、整體統計總覽',
    '',
    '| 指標 | 原始資料 | 校正升級後 | OpenAlex 參考 |',
    '| :--- | :---: | :---: | :---: |',
    `| 論文篇數 | ${report.totalBefore} | ${report.totalAfter}（去重 ${report.dedupedCount} 筆） | — |`,
    `| 總引用次數 | ${report.localTotalCitations.toLocaleString('en-US')} | **${report.updatedTotalCitations.toLocaleString('en-US')}** | ${report.openalexTotalCitations.toLocaleString('en-US')} |`,
    `| H-Index | ${report.localHIndex} | **${report.updatedHIndex}** | ${report.openalexHIndex} |`,
    `| DOI 有效核對率 | — | Crossref ${report.matchedCrossref} 筆 / OpenAlex ${report.matchedOpenAlex} 筆 | 100% 有效 |`,
    `| 補齊缺失 DOI | — | ${report.doiRecoveredCount} 筆 | — |`,
    `| 修復殘缺標題 | — | ${report.titlesFixedCount} 筆 | — |`,
    `| 完整作者名單覆蓋率 | ${initialAuthorsCount} 篇 | **${finalAuthorsCount} / ${report.totalAfter} 篇**（本次新補 ${report.authorsFilledCount} 篇） | — |`,
    `| 確定過時（低於 Crossref 下限） | **${report.outdatedVsCrossref.length} 篇** | 已更新 ${report.citationsUpdatedCount} 篇 | — |`,
    '',
    '## 二、抓出的異常、重複與提醒條目',
    '',
  ];

  if (report.anomalies.length === 0) {
    lines.push('無異常條目。');
  } else {
    lines.push('| 類型 | 年份 | 論文標題 | 說明 |');
    lines.push('| :--- | :---: | :--- | :--- |');
    for (const a of report.anomalies) {
      const safeTitle = a.title.replace(/\|/g, '\\|');
      const safeDetail = a.detail.replace(/\|/g, '\\|');
      lines.push(`| \`${a.kind}\` | ${a.year} | ${safeTitle} | ${safeDetail} |`);
    }
  }

  lines.push(
    '',
    `## 三、確定過時的論文完整清單（站上數字 < Crossref 下限，共 ${report.outdatedVsCrossref.length} 篇）`,
    '',
    '| 年份 | 站上目前 | Crossref 下限 | OpenAlex | 差值 | 論文標題 | DOI |',
    '| :---: | :---: | :---: | :---: | :---: | :--- | :--- |',
  );

  for (const item of report.outdatedVsCrossref) {
    const cr = item.crossrefCitations ?? 0;
    const diff = cr - item.localCitations;
    const safeTitle = item.title.replace(/\|/g, '\\|');
    const doiShort = item.doi.replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '');
    lines.push(
      `| ${item.year} | ${item.localCitations} | **${cr}** | ${item.openalexCitations ?? '-'} | +${diff} | ${safeTitle} | \`${doiShort}\` |`,
    );
  }

  lines.push('');
  return lines.join('\n');
}

async function main() {
  loadDotEnvFiles();
  const opts = parseArgs(process.argv.slice(2));
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();

  console.log('=== ma-portfolio 引用數、DOI 與作者名單健檢同步工具 ===');
  const { items: rawItems, origin } = await loadSourcePapers(opts.source, projectId);
  console.log(`來源: ${origin}（共 ${rawItems.length} 篇），模式: ${opts.mode}\n`);

  const initialAuthorsCount = rawItems.filter((p) => Boolean(p.authors?.trim())).length;
  const { items: upgraded, report } = await syncPublicationsMetadata(rawItems, {
    citationPolicy: opts.mode,
    fillAuthors: opts.fillAuthors,
    fixKnownAnomalies: opts.fixAnomalies,
  });
  const finalAuthorsCount = upgraded.filter((p) => Boolean(p.authors?.trim())).length;

  console.log('================ 健檢統計 ================');
  console.log(`篇數變化:          ${report.totalBefore} -> ${report.totalAfter}（合併重複 ${report.dedupedCount} 筆）`);
  console.log(`Crossref / OA 命中: ${report.matchedCrossref} / ${report.matchedOpenAlex}`);
  console.log(`補回缺失 DOI:       ${report.doiRecoveredCount} 筆`);
  console.log(`修復殘缺標題:       ${report.titlesFixedCount} 筆`);
  console.log(`作者名單覆蓋:       ${initialAuthorsCount} -> ${finalAuthorsCount} / ${report.totalAfter} 篇（新補 ${report.authorsFilledCount} 篇）`);
  console.log(`低於 Crossref 下限: ${report.outdatedVsCrossref.length} 篇（更新 ${report.citationsUpdatedCount} 篇）`);
  console.log(`總引用數變化:       ${report.localTotalCitations} (H=${report.localHIndex}) -> ${report.updatedTotalCitations} (H=${report.updatedHIndex}) [OpenAlex=${report.openalexTotalCitations}, H=${report.openalexHIndex}]`);
  console.log('==========================================');

  if (opts.exportJsonPath) {
    const outPath = path.resolve(process.cwd(), opts.exportJsonPath);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(upgraded, null, 2), 'utf8');
    console.log(`\n✓ 已輸出升級版 JSON（可直接於 /admin 匯入）：${outPath}`);
  }

  if (opts.reportMdPath) {
    const mdPath = path.resolve(process.cwd(), opts.reportMdPath);
    fs.mkdirSync(path.dirname(mdPath), { recursive: true });
    fs.writeFileSync(
      mdPath,
      buildMarkdownReport(report, origin, opts.mode, initialAuthorsCount, finalAuthorsCount),
      'utf8',
    );
    console.log(`✓ 已輸出完整 Markdown 健檢報告：${mdPath}`);
  }
}

main().catch((err) => {
  console.error('\n✗ 健檢同步失敗:', err instanceof Error ? err.message : err);
  process.exit(1);
});
