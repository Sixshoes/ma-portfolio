'use client';

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  type Firestore,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  type FirebaseStorage,
} from 'firebase/storage';
import {
  CHALKBOARDS_DOC_ID,
  PUBLICATIONS_COLLECTION,
  PUBLICATIONS_DOC_ID,
  STORAGE_CHALKBOARDS_PREFIX,
} from '@/lib/constants';
import {
  normalizeChalkboardsFromJson,
  type ChalkboardItem,
} from '@/lib/chalkboards';
import {
  computeHIndex,
  normalizePublicationsFromJson,
  type Publication,
} from '@/lib/publications';

export { CHALKBOARDS_DOC_ID, PUBLICATIONS_COLLECTION, PUBLICATIONS_DOC_ID };

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim() ?? '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim() ?? '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() ?? '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim() ?? '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?.trim() ?? '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim() ?? '',
};

export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.authDomain);
}

export function isFirebaseStorageConfigured(): boolean {
  return isFirebaseConfigured() && Boolean(firebaseConfig.storageBucket);
}

export type FirebaseServices = {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  storage: FirebaseStorage;
  googleProvider: GoogleAuthProvider;
};

let cachedServices: FirebaseServices | null = null;

export function getFirebaseServices(): FirebaseServices {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase 尚未設定環境變數，請參考 FIREBASE_SETUP.md。');
  }
  if (cachedServices) return cachedServices;

  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);
  const googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });

  cachedServices = { app, auth, db, storage, googleProvider };
  return cachedServices;
}

export type PublicationsBundleDoc = {
  schemaVersion: number;
  updatedAt: string;
  updatedBy: string;
  totalPapers: number;
  totalCitations: number;
  hIndex: number;
  items: Publication[];
};

function generateClientId(prefix = 'id'): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

const ALLOWED_PUBLICATION_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);

const ALLOWED_CHALKBOARD_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
]);

function extensionFromMime(mime: string): string {
  switch (mime.toLowerCase()) {
    case 'image/webp':
      return 'webp';
    case 'image/png':
      return 'png';
    case 'image/gif':
      return 'gif';
    case 'image/avif':
      return 'avif';
    default:
      return 'jpg';
  }
}

function sanitizePublicationForFirestore(pub: Publication): Publication {
  const citations =
    Number.isFinite(pub.citations) && pub.citations > 0 ? Math.floor(pub.citations) : 0;
  const clean: Publication = {
    id: pub.id?.trim() || generateClientId('pub'),
    title: pub.title.trim(),
    year: Number.isFinite(pub.year) ? Math.trunc(pub.year) : 0,
    journal: pub.journal.trim(),
    doi: pub.doi.trim(),
    citations,
    is_star: pub.is_star === '是' ? '是' : '否',
    highlight:
      citations >= 100
        ? '🔥 國際標竿'
        : citations >= 50
          ? '⭐ 重點關注'
          : '📄 一般論文',
    cover_url: pub.cover_url.trim(),
    file_img: pub.file_img.trim(),
  };

  if (pub.authors?.trim()) clean.authors = pub.authors.trim();
  if (pub.takeaway?.trim()) clean.takeaway = pub.takeaway.trim();
  if (pub.abstract_excerpt?.trim()) clean.abstract_excerpt = pub.abstract_excerpt.trim();
  if (pub.altmetric_id?.trim()) clean.altmetric_id = pub.altmetric_id.trim();

  return clean;
}

export async function loadPublicationsBundleFromFirestore(): Promise<PublicationsBundleDoc | null> {
  const { db } = getFirebaseServices();
  const snap = await getDoc(doc(db, PUBLICATIONS_COLLECTION, PUBLICATIONS_DOC_ID));
  if (!snap.exists()) return null;

  const raw = snap.data() as Partial<PublicationsBundleDoc>;
  const items = normalizePublicationsFromJson(raw.items ?? []);
  return {
    schemaVersion: typeof raw.schemaVersion === 'number' ? raw.schemaVersion : 3,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : '',
    updatedBy: typeof raw.updatedBy === 'string' ? raw.updatedBy : '',
    totalPapers: items.length,
    totalCitations: items.reduce((sum, p) => sum + p.citations, 0),
    hIndex: computeHIndex(items),
    items,
  };
}

export async function savePublicationsBundleToFirestore(
  items: Publication[],
  updatedByEmail: string,
): Promise<PublicationsBundleDoc> {
  const { db } = getFirebaseServices();
  const normalized = normalizePublicationsFromJson(items);
  const sorted = [...normalized].sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year;
    if (b.citations !== a.citations) return b.citations - a.citations;
    return a.title.localeCompare(b.title);
  });

  const cleanItems = sorted.map(sanitizePublicationForFirestore);
  const totalCitations = sorted.reduce((sum, p) => sum + p.citations, 0);
  const hIndex = computeHIndex(sorted);

  const payload = {
    schemaVersion: 3,
    updatedAt: new Date().toISOString(),
    updatedBy: updatedByEmail,
    totalPapers: cleanItems.length,
    totalCitations,
    hIndex,
    items: cleanItems,
  };

  await setDoc(doc(db, PUBLICATIONS_COLLECTION, PUBLICATIONS_DOC_ID), payload);

  return {
    ...payload,
    items: cleanItems,
  };
}

/**
 * 上傳前於瀏覽器端自動等比縮放並轉為 WebP，
 * 讓 Firebase Storage 容量極省（每張約 40–120 KB）且官網載入飛快。
 */
export async function compressImageToWebp(
  file: File,
  maxDimension = 1400,
  quality = 0.84,
): Promise<{ blob: Blob; contentType: string; extension: string }> {
  // GIF 保留原檔（部分期刊圖文摘要為動態 GIF）
  if (file.type === 'image/gif') {
    return { blob: file, contentType: 'image/gif', extension: 'gif' };
  }

  const fallbackMime = ALLOWED_PUBLICATION_IMAGE_TYPES.has(file.type) ? file.type : 'image/jpeg';
  const fallbackExt = extensionFromMime(fallbackMime);

  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new window.Image();

    img.onload = () => {
      try {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          const ratio = Math.min(maxDimension / width, maxDimension / height);
          width = Math.max(1, Math.round(width * ratio));
          height = Math.max(1, Math.round(height * ratio));
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          resolve({ blob: file, contentType: fallbackMime, extension: fallbackExt });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl);
            if (blob && blob.size > 0) {
              const actualType =
                blob.type && ALLOWED_PUBLICATION_IMAGE_TYPES.has(blob.type)
                  ? blob.type
                  : 'image/webp';
              resolve({
                blob,
                contentType: actualType,
                extension: extensionFromMime(actualType),
              });
            } else {
              resolve({ blob: file, contentType: fallbackMime, extension: fallbackExt });
            }
          },
          'image/webp',
          quality,
        );
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('無法解析此圖片檔案，請確認格式為 JPG / PNG / WebP / GIF。'));
    };

    img.src = objectUrl;
  });
}

export async function uploadPublicationImage(
  file: File,
  folder: 'covers' | 'journals',
  customSlug?: string,
): Promise<string> {
  if (!isFirebaseStorageConfigured()) {
    throw new Error('尚未設定 NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET。');
  }
  if (!ALLOWED_PUBLICATION_IMAGE_TYPES.has(file.type)) {
    throw new Error('僅支援點陣圖片格式（JPG / PNG / WebP / GIF / AVIF），不支援 SVG。');
  }
  if (file.size > 12 * 1024 * 1024) {
    throw new Error('原始圖片超過 12 MB，請先縮小後再上傳。');
  }

  const { storage } = getFirebaseServices();
  const { blob, contentType, extension } = await compressImageToWebp(file);
  if (blob.size >= 5 * 1024 * 1024) {
    throw new Error('壓縮後圖片仍達 5 MB 上限（storage.rules 限制），請縮小尺寸或改用 JPG／WebP。');
  }

  const safeCustom = customSlug
    ? customSlug
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80)
    : '';

  const safeStem =
    file.name
      .replace(/\.[^.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'figure';

  // 加上時間戳版本後綴，避免使用者在編輯視窗上傳預覽後按「取消」覆蓋線上既有圖片
  const fileName = safeCustom
    ? `${safeCustom}-${Date.now()}.${extension}`
    : `${Date.now()}-${safeStem}.${extension}`;
  const objectPath = `publications/${folder}/${fileName}`;
  const storageRef = ref(storage, objectPath);

  await uploadBytes(storageRef, blob, {
    contentType,
    cacheControl: 'public, max-age=31536000, immutable',
  });

  return getDownloadURL(storageRef);
}

export type ChalkboardsBundleDoc = {
  schemaVersion: number;
  updatedAt: string;
  updatedBy: string;
  items: ChalkboardItem[];
};

function sanitizeChalkboardForFirestore(
  item: ChalkboardItem,
  idx: number,
): Record<string, string | number | boolean> {
  const clean: Record<string, string | number | boolean> = {
    id: item.id?.trim() || generateClientId('chalkboard'),
    imageUrl: item.imageUrl.trim(),
    titleZh: item.titleZh.trim() || '親筆黑板物理推導手稿',
    titleEn: item.titleEn.trim() || item.titleZh.trim() || 'Chalkboard Derivation',
    formulaNote: item.formulaNote.trim(),
    featuredInHero: Boolean(item.featuredInHero),
    order: Number.isFinite(item.order) ? Math.trunc(item.order) : idx + 1,
  };
  if (item.courseOrTopic?.trim()) clean.courseOrTopic = item.courseOrTopic.trim();
  if (item.year?.trim()) clean.year = item.year.trim();
  return clean;
}

export async function loadChalkboardsBundleFromFirestore(): Promise<ChalkboardsBundleDoc | null> {
  const { db } = getFirebaseServices();
  const snap = await getDoc(doc(db, PUBLICATIONS_COLLECTION, CHALKBOARDS_DOC_ID));
  if (!snap.exists()) return null;

  const raw = snap.data() as Partial<ChalkboardsBundleDoc>;
  const items = normalizeChalkboardsFromJson(raw.items ?? []);
  return {
    schemaVersion: typeof raw.schemaVersion === 'number' ? raw.schemaVersion : 1,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : '',
    updatedBy: typeof raw.updatedBy === 'string' ? raw.updatedBy : '',
    items,
  };
}

export async function saveChalkboardsBundleToFirestore(
  items: ChalkboardItem[],
  updatedByEmail: string,
): Promise<ChalkboardsBundleDoc> {
  const { db } = getFirebaseServices();
  const normalized = normalizeChalkboardsFromJson(items).map((item, idx) => ({
    ...item,
    order: idx + 1,
  }));
  const cleanItems = normalized.map(sanitizeChalkboardForFirestore);

  const payload = {
    schemaVersion: 1,
    updatedAt: new Date().toISOString(),
    updatedBy: updatedByEmail,
    items: cleanItems,
  };

  await setDoc(doc(db, PUBLICATIONS_COLLECTION, CHALKBOARDS_DOC_ID), payload);

  return {
    ...payload,
    items: normalized,
  };
}

/**
 * 黑板手稿照片上傳至 Firebase Storage chalkboards/{id}.webp：
 * 最大邊長放寬至 1800px、品質 0.86，確保細小粉筆上下標數學符號清晰銳利。
 */
export async function uploadChalkboardImage(
  file: File,
  customId?: string,
): Promise<{ downloadUrl: string; id: string }> {
  if (!isFirebaseStorageConfigured()) {
    throw new Error('尚未設定 NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET。');
  }
  if (!ALLOWED_CHALKBOARD_IMAGE_TYPES.has(file.type)) {
    throw new Error('黑板照片僅支援 JPG / PNG / WebP / AVIF 格式，不支援 SVG。');
  }
  if (file.size > 20 * 1024 * 1024) {
    throw new Error('原始照片超過 20 MB，請先縮小後再上傳。');
  }

  const { storage } = getFirebaseServices();
  const { blob, contentType, extension } = await compressImageToWebp(file, 1800, 0.86);
  if (blob.size >= 8 * 1024 * 1024) {
    throw new Error('壓縮後照片仍達 8 MB 上限（storage.rules 限制），請縮小解析度後重試。');
  }

  const safeId =
    (customId ?? '')
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 72) || `chalkboard-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const objectPath = `${STORAGE_CHALKBOARDS_PREFIX}/${safeId}.${extension}`;
  const storageRef = ref(storage, objectPath);

  await uploadBytes(storageRef, blob, {
    contentType,
    cacheControl: 'public, max-age=31536000, immutable',
  });

  const downloadUrl = await getDownloadURL(storageRef);
  return { downloadUrl, id: safeId };
}
