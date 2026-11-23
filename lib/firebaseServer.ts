import { normalizePublicationsFromJson, type Publication } from '@/lib/publications';

const FIRESTORE_COLLECTION = 'siteData';
const FIRESTORE_DOC_ID = 'publications';

type FirestoreValue =
  | { stringValue: string }
  | { integerValue: string }
  | { doubleValue: number }
  | { booleanValue: boolean }
  | { nullValue: null }
  | { timestampValue: string }
  | { arrayValue: { values?: FirestoreValue[] } }
  | { mapValue: { fields?: Record<string, FirestoreValue> } };

function decodeFirestoreValue(val: FirestoreValue | undefined): unknown {
  if (!val || typeof val !== 'object') return undefined;
  if ('stringValue' in val) return val.stringValue;
  if ('integerValue' in val) return Number(val.integerValue);
  if ('doubleValue' in val) return val.doubleValue;
  if ('booleanValue' in val) return val.booleanValue;
  if ('timestampValue' in val) return val.timestampValue;
  if ('nullValue' in val) return null;
  if ('arrayValue' in val) {
    return (val.arrayValue.values ?? []).map((item) => decodeFirestoreValue(item));
  }
  if ('mapValue' in val) {
    const out: Record<string, unknown> = {};
    const fields = val.mapValue.fields ?? {};
    for (const [k, v] of Object.entries(fields)) {
      out[k] = decodeFirestoreValue(v);
    }
    return out;
  }
  return undefined;
}

export type ServerPublicationsResult = {
  items: Publication[];
  source: 'firebase' | 'portal';
  updatedAt?: string;
};

/**
 * 透過 Firestore 公開 REST API 讀取單一彙總文件 siteData/publications（僅耗 1 次讀取）。
 * 不需要 Service Account 私鑰，且直接整合 Next.js ISR 與 revalidateTag('publications')。
 */
export async function fetchPublicationsFromFirestoreServer(
  revalidateSeconds = 3600,
): Promise<{ items: Publication[]; updatedAt?: string } | null> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  if (!projectId) return null;

  const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
    projectId,
  )}/databases/(default)/documents/${FIRESTORE_COLLECTION}/${FIRESTORE_DOC_ID}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(url, {
      next: { revalidate: revalidateSeconds, tags: ['publications'] },
      signal: controller.signal,
    });
    if (!res.ok) return null;

    const doc = (await res.json()) as { fields?: Record<string, FirestoreValue> };
    if (!doc.fields) return null;

    const decoded = decodeFirestoreValue({ mapValue: { fields: doc.fields } }) as Record<
      string,
      unknown
    >;
    const items = normalizePublicationsFromJson(decoded.items);
    if (items.length === 0) return null;

    return {
      items,
      updatedAt: typeof decoded.updatedAt === 'string' ? decoded.updatedAt : undefined,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export function getServerAdminWhitelist(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? '';
  return raw
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * 透過 Google 官方 Identity Toolkit accounts:lookup 驗證 Firebase ID Token，
 * 同時確認 emailVerified 與管理者白名單，完全無需在 Vercel 存放私鑰。
 */
export async function verifyAdminFirebaseToken(
  idToken: string,
): Promise<{ ok: true; email: string } | { ok: false; status: number; error: string }> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, status: 500, error: 'Server missing NEXT_PUBLIC_FIREBASE_API_KEY.' };
  }

  const whitelist = getServerAdminWhitelist();
  if (whitelist.length === 0) {
    return { ok: false, status: 500, error: 'Server missing ADMIN_EMAILS whitelist.' };
  }

  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
        cache: 'no-store',
      },
    );

    if (!res.ok) {
      return { ok: false, status: 401, error: 'Invalid or expired Firebase ID token.' };
    }

    const data = (await res.json()) as {
      users?: Array<{ email?: string; emailVerified?: boolean; disabled?: boolean }>;
    };
    const user = data.users?.[0];
    if (!user || user.disabled || !user.email || !user.emailVerified) {
      return { ok: false, status: 403, error: 'Unverified or disabled account.' };
    }

    const normalizedEmail = user.email.trim().toLowerCase();
    if (!whitelist.includes(normalizedEmail)) {
      return { ok: false, status: 403, error: 'Email is not in ADMIN_EMAILS whitelist.' };
    }

    return { ok: true, email: normalizedEmail };
  } catch {
    return { ok: false, status: 502, error: 'Failed to contact Google Identity Toolkit.' };
  }
}
