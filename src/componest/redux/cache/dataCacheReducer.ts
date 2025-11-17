/**
 * Universal Data Caching System (Optimized for Electron)
 *
 * For Electron apps, cache duration is SHORT (1-2 minutes) because:
 * - Each Electron instance has its own cache
 * - No way to sync between instances
 * - Need frequent auto-refresh to stay updated
 */

export const CACHE_DATA = 'CACHE_DATA';
export const INVALIDATE_CACHE = 'INVALIDATE_CACHE';
export const CLEAR_ALL_CACHE = 'CLEAR_ALL_CACHE';

export interface CacheEntry {
  data: any;
  lastFetched: string;
  expiresAt: string;
}

export interface DataCacheState {
  machines: CacheEntry | null;
  materials: CacheEntry | null;
  products: CacheEntry | null;
  customers: CacheEntry | null;
  operators: CacheEntry | null;
  materialTypes: CacheEntry | null;
  machineTypes: CacheEntry | null;
  productTypes: CacheEntry | null;
  steps: CacheEntry | null;
  analytics: CacheEntry | null;
}

// ✅ ELECTRON OPTIMIZATION: Shorter cache duration for auto-refresh
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes (was 10 minutes)

const initialState: DataCacheState = {
  machines: null,
  materials: null,
  products: null,
  customers: null,
  operators: null,
  materialTypes: null,
  machineTypes: null,
  productTypes: null,
  steps: null,
  analytics: null,
};

export const dataCacheReducer = (
  state = initialState,
  action: any
): DataCacheState => {
  switch (action.type) {
    case CACHE_DATA:
      const { dataType, data } = action.payload;
      const now = new Date();
      const expiresAt = new Date(now.getTime() + CACHE_DURATION);

      return {
        ...state,
        [dataType]: {
          data,
          lastFetched: now.toISOString(),
          expiresAt: expiresAt.toISOString(),
        },
      };

    case INVALIDATE_CACHE:
      const { dataTypes } = action.payload;
      const updates: Partial<DataCacheState> = {};

      dataTypes.forEach((type: string) => {
        updates[type as keyof DataCacheState] = null;
      });

      return {
        ...state,
        ...updates,
      };

    case CLEAR_ALL_CACHE:
      return initialState;

    default:
      return state;
  }
};

// Action Creators
export const cacheData = (dataType: keyof DataCacheState, data: any) => ({
  type: CACHE_DATA,
  payload: { dataType, data },
});

export const invalidateCache = (dataTypes: (keyof DataCacheState)[]) => ({
  type: INVALIDATE_CACHE,
  payload: { dataTypes },
});

export const clearAllCache = () => ({
  type: CLEAR_ALL_CACHE,
});

// Helper to check if cache is valid
export const isCacheValid = (cacheEntry: CacheEntry | null): boolean => {
  if (!cacheEntry) return false;

  const now = new Date().getTime();
  const expiresAt = new Date(cacheEntry.expiresAt).getTime();

  return now < expiresAt;
};

// ✅ NEW: Get cache age in seconds
export const getCacheAge = (cacheEntry: CacheEntry | null): number => {
  if (!cacheEntry) return Infinity;

  const now = new Date().getTime();
  const lastFetched = new Date(cacheEntry.lastFetched).getTime();

  return Math.floor((now - lastFetched) / 1000);
};
