/**
 * 現有 218 篇外連圖片一次性健檢、破圖清洗與自家 Firebase Storage WebP 搬移腳本
 *
 * 使用範例：
 *   1) 安全預覽健檢（不更動資料庫）：
 *      npm run migrate:images -- --dry-run
 *
 *   2) 健檢並輸出清洗後的 JSON（免 Service Account，可直接進 /admin 按「匯入 JSON」）：
 *      npm run migrate:images -- --dry-run --export-json cleaned-papers.json
 *
 *   3) 搭配 ELSEVIER_API_KEY 補抓 10.1016/* 圖解摘要並自動轉存 Storage、寫回 Firestore：
 *      npm run migrate:images -- --apply --backfill
 *
 * 環境變數（自動讀取 .env.local 與 .env）：
 *   - NEXT_PUBLIC_FIREBASE_PROJECT_ID
 *   - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
 *   - ELSEVIER_API_KEY（選填，補抓 10.1016/* fx1 原圖）
 *   - GOOGLE_APPLICATION_CREDENTIALS 或 FIREBASE_SERVICE_ACCOUNT_JSON（僅 --apply 寫入 Firebase 時需要）
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { FIRESTORE_PUBLICATIONS_DOC } from '../lib/constants';
import {
  doiToSlug,
  fetchAndValidateImageUrl,
  fetchFigureCandidateByDoi,
  isGenericCoverOrLogoUrl,
  isProjectStorageUrl,
  uploadWebpToFirebaseStorage,
} from '../lib/figureFetcher';
import {
  computeHIndex,
  normalizePublicationsFromJson,
  type Publication,
} from '../lib/publications';

const LEGACY_PORTAL_URL = 'https://sixshoes.github.io/Ma-Research-Portal/papers.json';

type ServiceAccount = {
  client_email: string;
  private_key: string;
  project_id?: string;
  token_uri?: string;
};

type CliOptions = {
  apply: boolean;
  backfill: boolean;
  exportJsonPath: string | null;
  source: string | null;
  limit: number | null;
  concurrency: number;
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
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = {
    apply: false,
    backfill: false,
    exportJsonPath: null,
    source: null,
    limit: null,
    concurrency: 4,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--apply') opts.apply = true;
    else if (arg === '--dry-run') opts.apply = false;
    else if (arg === '--backfill') opts.backfill = true;
    else if (arg === '--export-json' && argv[i + 1]) {
      opts.exportJsonPath = argv[++i];
    } else if (arg === '--source' && argv[i + 1]) {
      opts.source = argv[++i];
    } else if (arg === '--limit' && argv[i + 1]) {
      const n = Number.parseInt(argv[++i], 10);
      if (Number.isFinite(n) && n > 0) opts.limit = n;
    } else if (arg === '--concurrency' && argv[i + 1]) {
      const n = Number.parseInt(argv[++i], 10);
      if (Number.isFinite(n) && n >= 1 && n <= 12) opts.concurrency = n;
    }
  }
  return opts;
}

function loadServiceAccount(): ServiceAccount | null {
  const inlineJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (inlineJson) {
    return JSON.parse(inlineJson) as ServiceAccount;
  }
  const credPath =
    process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim() ||
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH?.trim();
  if (credPath && fs.existsSync(credPath)) {
    return JSON.parse(fs.readFileSync(credPath, 'utf8')) as ServiceAccount;
  }
  return null;
}

/** 零額外相依：以 Node 內建 crypto 簽發 Google OAuth2 Service Account JWT 換取 Access Token */
async function getGoogleAccessToken(sa: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const tokenUri = sa.token_uri ?? 'https://oauth2.googleapis.com/token';
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const claim = Buffer.from(
    JSON.stringify({
      iss: sa.client_email,
      scope:
        'https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/devstorage.read_write',
      aud: tokenUri,
      iat: now,
      exp: now + 3600,
    }),
  ).toString('base64url');

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(`${header}.${claim}`);
  const signature = signer.sign(sa.private_key, 'base64url');
  const assertion = `${header}.${claim}.${signature}`;

  const res = await fetch(tokenUri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });
  if (!res.ok) {
    throw new Error(`Google OAuth2 認證失敗（HTTP ${res.status}）：${await res.text()}`);
  }
  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) throw new Error('Google OAuth2 未回傳 access_token');
  return data.access_token;
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
  if ('arrayValue' in val) {
    return (val.arrayValue.values ?? []).map((item) => decodeFirestoreValue(item));
  }
  if ('mapValue' in val) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val.mapValue.fields ?? {})) {
      out[k] = decodeFirestoreValue(v);
    }
    return out;
  }
  return undefined;
}

function encodeFirestoreValue(val: unknown): FirestoreValue {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'string') return { stringValue: val };
  if (typeof val === 'boolean') return { booleanValue: val };
  if (typeof val === 'number') {
    return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
  }
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map((item) => encodeFirestoreValue(item)) } };
  }
  if (typeof val === 'object') {
    const fields: Record<string, FirestoreValue> = {};
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      if (v !== undefined) fields[k] = encodeFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

async function loadPublications(
  sourceArg: string | null,
  projectId: string | undefined,
): Promise<{ items: Publication[]; origin: string }> {
  // 1. 明確指定本機 JSON 檔
  if (sourceArg && sourceArg !== 'firestore' && sourceArg !== 'portal') {
    const full = path.resolve(process.cwd(), sourceArg);
    const raw = JSON.parse(fs.readFileSync(full, 'utf8')) as unknown;
    const arr = Array.isArray(raw) ? raw : (raw as { items?: unknown }).items;
    return { items: normalizePublicationsFromJson(arr), origin: full };
  }

  // 2. 優先讀取 Firestore siteData/publications
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

  // 3. 退回同工作區 ../Ma-Research-Portal/papers.json 或線上 B 站
  const siblingPortal = path.resolve(process.cwd(), '..', 'Ma-Research-Portal', 'papers.json');
  if (sourceArg !== 'portal' && fs.existsSync(siblingPortal)) {
    const raw = JSON.parse(fs.readFileSync(siblingPortal, 'utf8')) as unknown;
    return { items: normalizePublicationsFromJson(raw), origin: siblingPortal };
  }

  const res = await fetch(LEGACY_PORTAL_URL);
  if (!res.ok) throw new Error(`無法載入論文來源（HTTP ${res.status}）`);
  const raw = (await res.json()) as unknown;
  return { items: normalizePublicationsFromJson(raw), origin: LEGACY_PORTAL_URL };
}

async function writeBundleToFirestore(
  projectId: string,
  accessToken: string,
  items: Publication[],
): Promise<void> {
  const totalCitations = items.reduce((sum, p) => sum + p.citations, 0);
  const hIndex = computeHIndex(items);
  const payload = {
    schemaVersion: 3,
    updatedAt: new Date().toISOString(),
    updatedBy: 'scripts/migrate-publication-images.ts',
    totalPapers: items.length,
    totalCitations,
    hIndex,
    items,
  };

  const encoded = encodeFirestoreValue(payload);
  const fields = 'mapValue' in encoded ? encoded.mapValue.fields ?? {} : {};
  const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
    projectId,
  )}/databases/(default)/documents/${FIRESTORE_PUBLICATIONS_DOC}`;

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
  });

  if (!res.ok) {
    throw new Error(`寫回 Firestore 失敗（HTTP ${res.status}）：${await res.text()}`);
  }
}

async function main() {
  loadDotEnvFiles();
  const opts = parseArgs(process.argv.slice(2));
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim();
  const elsevierKey = process.env.ELSEVIER_API_KEY?.trim();

  console.log('=== ma-portfolio 論文圖片健檢與 Firebase Storage 搬移工具 ===');
  console.log(`模式: ${opts.apply ? 'APPLY（正式上傳並寫回 Firestore）' : 'DRY-RUN（安全預覽，不改寫遠端）'}`);
  console.log(`Elsevier API Key: ${elsevierKey ? '已設定（可補抓 10.1016/* fx1）' : '未設定（使用免金鑰公開檢驗）'}`);

  let accessToken: string | null = null;
  if (opts.apply) {
    if (!projectId || !bucket) {
      throw new Error('執行 --apply 需要設定 NEXT_PUBLIC_FIREBASE_PROJECT_ID 與 NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET。');
    }
    const sa = loadServiceAccount();
    if (!sa) {
      throw new Error(
        '執行 --apply 需要設定 GOOGLE_APPLICATION_CREDENTIALS 或 FIREBASE_SERVICE_ACCOUNT_JSON（若不想設私鑰，請改用 --dry-run --export-json cleaned-papers.json 再於 /admin 匯入）。',
      );
    }
    accessToken = await getGoogleAccessToken(sa);
  }

  const { items: allItems, origin } = await loadPublications(opts.source, projectId);
  const targetCount = opts.limit ? Math.min(opts.limit, allItems.length) : allItems.length;
  console.log(`來源: ${origin}（共 ${allItems.length} 篇，本次處理 ${targetCount} 篇）\n`);

  const stats = {
    kept: 0,
    migrated: 0,
    backfilled: 0,
    clearedGeneric: 0,
    clearedBroken: 0,
    noImage: 0,
  };

  const nextItems: Publication[] = allItems.map((p) => ({ ...p }));
  let cursor = 0;

  async function worker() {
    while (cursor < targetCount) {
      const idx = cursor++;
      const pub = nextItems[idx];
      const cover = pub.cover_url?.trim() ?? '';
      const slug = doiToSlug(pub.doi || pub.id || `${pub.year}-${idx}`);

      // 清空舊的重複期刊封面備援欄，確保單檔精簡且不以通用封面填塞
      if (pub.file_img) {
        pub.file_img = '';
      }

      // 1. 已屬於本專案 Firebase Storage：直接保留
      if (cover && isProjectStorageUrl(cover, projectId)) {
        stats.kept += 1;
        continue;
      }

      // 2. 判定為通用期刊封面／Logo：先清空，若啟用 --backfill 可嘗試 Elsevier 補抓
      let clearedAsGeneric = false;
      let validWebp: { webp: Buffer; width: number; height: number } | null = null;
      let fetchedViaBackfill = false;

      if (cover && isGenericCoverOrLogoUrl(cover)) {
        clearedAsGeneric = true;
      } else if (cover) {
        validWebp = await fetchAndValidateImageUrl(cover);
      }

      // 3. 若無存活單篇圖，且開啟 --backfill + 具備 10.1016/* DOI + Elsevier Key，補抓 fx1
      if (
        !validWebp &&
        opts.backfill &&
        elsevierKey &&
        pub.doi.toLowerCase().includes('10.1016/')
      ) {
        const fetched = await fetchFigureCandidateByDoi(pub.doi, elsevierKey);
        if (fetched.result) {
          validWebp = fetched.result;
          fetchedViaBackfill = true;
        }
      }

      if (validWebp) {
        if (opts.apply && bucket && accessToken) {
          const uploaded = await uploadWebpToFirebaseStorage({
            bucket,
            slug,
            webp: validWebp.webp,
            authHeader: `Bearer ${accessToken}`,
          });
          pub.cover_url = uploaded.downloadUrl;
        }
        if (fetchedViaBackfill) {
          stats.backfilled += 1;
          console.log(`[BACKFILL] #${idx + 1} (${pub.year}) ${validWebp.width}x${validWebp.height} → ${slug}.webp`);
        } else {
          stats.migrated += 1;
          console.log(`[MIGRATE ] #${idx + 1} (${pub.year}) ${validWebp.width}x${validWebp.height} → ${slug}.webp`);
        }
      } else if (clearedAsGeneric) {
        pub.cover_url = '';
        stats.clearedGeneric += 1;
      } else if (cover) {
        pub.cover_url = '';
        stats.clearedBroken += 1;
        console.log(`[CLEANED ] #${idx + 1} (${pub.year}) 死鏈／假圖已清空: ${cover.slice(0, 72)}`);
      } else {
        pub.cover_url = '';
        stats.noImage += 1;
      }
    }
  }

  await Promise.all(Array.from({ length: opts.concurrency }, () => worker()));

  if (opts.apply && projectId && accessToken) {
    await writeBundleToFirestore(projectId, accessToken, nextItems);
    console.log(`\n✓ 已成功寫回 Firestore: ${projectId}/${FIRESTORE_PUBLICATIONS_DOC}`);
  }

  if (opts.exportJsonPath) {
    const outPath = path.resolve(process.cwd(), opts.exportJsonPath);
    fs.writeFileSync(outPath, JSON.stringify(nextItems, null, 2), 'utf8');
    console.log(`\n✓ 已輸出清洗後 JSON 至: ${outPath}`);
  }

  const estimatedBytes = Buffer.byteLength(JSON.stringify({ items: nextItems }), 'utf8');
  const pct = ((estimatedBytes / (1024 * 1024)) * 100).toFixed(1);

  console.log('\n================ 統計報表 ================');
  console.log(`掃描總篇數:         ${targetCount}`);
  console.log(`自家 Storage 保留:  ${stats.kept}`);
  console.log(`存活圖可搬移/已搬:  ${stats.migrated}`);
  console.log(`Elsevier API 補抓:  ${stats.backfilled}`);
  console.log(`清除通用封面/Logo:  ${stats.clearedGeneric}`);
  console.log(`清除 403/404 破圖:  ${stats.clearedBroken}`);
  console.log(`原即純文字無圖:     ${stats.noImage}`);
  console.log(`預估單文件體積:     ${(estimatedBytes / 1024).toFixed(1)} KB (${pct}% of 1 MiB)`);
  console.log('=========================================');
}

main().catch((err) => {
  console.error('\n✗ 腳本執行失敗:', err instanceof Error ? err.message : err);
  process.exit(1);
});
