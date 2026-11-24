export const PUBLICATIONS_COLLECTION = 'siteData' as const;
export const PUBLICATIONS_DOC_ID = 'publications' as const;
export const FIRESTORE_PUBLICATIONS_DOC =
  `${PUBLICATIONS_COLLECTION}/${PUBLICATIONS_DOC_ID}` as const;

export const CHALKBOARDS_DOC_ID = 'chalkboards' as const;
export const FIRESTORE_CHALKBOARDS_DOC =
  `${PUBLICATIONS_COLLECTION}/${CHALKBOARDS_DOC_ID}` as const;

export const PUBLICATIONS_CACHE_TAG = 'publications' as const;
export const CHALKBOARDS_CACHE_TAG = 'chalkboards' as const;
export const STORAGE_COVERS_PREFIX = 'publications/covers' as const;
export const STORAGE_CHALKBOARDS_PREFIX = 'chalkboards' as const;
