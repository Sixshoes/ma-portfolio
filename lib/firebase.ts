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
  PUBLICATIONS_COLLECTION,
  PUBLICATIONS_DOC_ID,
} from '@/lib/constants';
import {
  computeHIndex,
  normalizePublicationsFromJson,
  type Publication,
} from '@/lib/publications';

export { PUBLICATIONS_COLLECTION, PUBLICATIONS_DOC_ID };

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

function sanitizePublicationForFirestore(pub: Publication): Record<string, string | number> {
  const clean: Record<string, string | number> = {
    id: pub.id?.trim() || crypto.randomUUID(),
    title: pub.title.trim(),
    year: Number.isFinite(pub.year) ? Math.trunc(pub.year) : 0,
    journal: pub.journal.trim(),
    doi: pub.doi.trim(),
    citations: Number.isFinite(pub.citations) && pub.citations > 0 ? Math.floor(pub.citations) : 0,
    is_star: pub.is_star === '是' ? '是' : '否',
    highlight:
      pub.citations >= 100
        ? '🔥 國際標竿'
        : pub.citations >= 50
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
    items: sorted,
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
          resolve({ blob: file, contentType: file.type || 'image/jpeg', extension: 'jpg' });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl);
            if (blob && blob.size > 0) {
              resolve({ blob, contentType: 'image/webp', extension: 'webp' });
            } else {
              resolve({ blob: file, contentType: file.type || 'image/jpeg', extension: 'jpg' });
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
  if (!file.type.startsWith('image/')) {
    throw new Error('請上傳圖片檔案（JPG / PNG / WebP / GIF）。');
  }
  if (file.size > 12 * 1024 * 1024) {
    throw new Error('原始圖片超過 12 MB，請先縮小後再上傳。');
  }

  const { storage } = getFirebaseServices();
  const { blob, contentType, extension } = await compressImageToWebp(file);

  const safeCustom = customSlug
    ? customSlug
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 96)
    : '';

  const safeStem =
    file.name
      .replace(/\.[^.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'figure';

  const fileName = safeCustom ? `${safeCustom}.${extension}` : `${Date.now()}-${safeStem}.${extension}`;
  const objectPath = `publications/${folder}/${fileName}`;
  const storageRef = ref(storage, objectPath);

  await uploadBytes(storageRef, blob, {
    contentType,
    cacheControl: 'public, max-age=31536000, immutable',
  });

  return getDownloadURL(storageRef);
}
