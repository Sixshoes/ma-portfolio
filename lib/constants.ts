export const PUBLICATIONS_COLLECTION = 'siteData' as const;
export const PUBLICATIONS_DOC_ID = 'publications' as const;
export const FIRESTORE_PUBLICATIONS_DOC =
  `${PUBLICATIONS_COLLECTION}/${PUBLICATIONS_DOC_ID}` as const;

export const PUBLICATIONS_CACHE_TAG = 'publications' as const;
export const STORAGE_COVERS_PREFIX = 'publications/covers' as const;
