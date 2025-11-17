import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheConfig {
  ttl?: number; // Time to live in milliseconds (default: 5 minutes)
  autoRefresh?: boolean;
  onError?: (error: Error) => void;
}

interface CacheEntry<T> {
  data: T | null;
  timestamp: number;
  isLoading: boolean;
  error: Error | null;
  isOffline?: boolean;
  usingStaleCache?: boolean;
}

/**
 * Hook to cache API data and prevent multiple calls
 * Data is cached and reused until TTL expires
 */
export const useDataCache = <T = any>(
  key: string,
  fetchFunction: () => Promise<T>,
  config: CacheConfig = {}
) => {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes default
    autoRefresh = false,
    onError
  } = config;

  const [cache, setCache] = useState<CacheEntry<T>>(() => {
    // Check localStorage for cached data
    const stored = localStorage.getItem(`cache_${key}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const age = Date.now() - parsed.timestamp;

        // Return cached data if still valid
        if (age < ttl) {
          return {
            data: parsed.data,
            timestamp: parsed.timestamp,
            isLoading: false,
            error: null
          };
        }
      } catch (e) {
        console.error('Cache parse error:', e);
      }
    }

    return {
      data: null,
      timestamp: 0,
      isLoading: false,
      error: null
    };
  });

  const isFetchingRef = useRef(false);
  const mountedRef = useRef(true);

  // Fetch data from API
  const fetchData = useCallback(async (force = false) => {
    // Prevent duplicate calls
    if (isFetchingRef.current) {
      console.log(`[Cache] Already fetching ${key}, skipping...`);
      return;
    }

    // Check if offline
    if (!navigator.onLine) {
      console.warn(`[Cache] Offline - cannot fetch ${key}`);

      // If we have cached data (even if stale), use it
      if (cache.data) {
        console.log(`[Cache] Using stale cached data for ${key} (offline mode)`);
        setCache(prev => ({
          ...prev,
          isOffline: true,
          usingStaleCache: true,
          error: null
        }));
        return;
      }

      // No cached data and offline
      setCache(prev => ({
        ...prev,
        isOffline: true,
        error: new Error('No internet connection. Please check your network.')
      }));
      return;
    }

    // Check if cache is still valid
    const age = Date.now() - cache.timestamp;
    if (!force && cache.data && age < ttl) {
      console.log(`[Cache] Using cached data for ${key} (age: ${Math.round(age / 1000)}s)`);
      return;
    }

    isFetchingRef.current = true;
    setCache(prev => ({ ...prev, isLoading: true, error: null, isOffline: false, usingStaleCache: false }));

    try {
      console.log(`[Cache] Fetching fresh data for ${key}...`);
      const data = await fetchFunction();

      if (!mountedRef.current) return;

      const newCache: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        isLoading: false,
        error: null,
        isOffline: false,
        usingStaleCache: false
      };

      setCache(newCache);

      // Store in localStorage
      try {
        localStorage.setItem(`cache_${key}`, JSON.stringify({
          data,
          timestamp: newCache.timestamp
        }));
      } catch (e) {
        console.warn('Failed to cache in localStorage:', e);
      }

      console.log(`[Cache] Successfully cached ${key}`);
    } catch (error) {
      if (!mountedRef.current) return;

      const err = error instanceof Error ? error : new Error('Unknown error');

      // If error occurred but we have cached data, use stale cache
      if (cache.data) {
        console.warn(`[Cache] Error fetching ${key}, using stale cache`, err);
        setCache(prev => ({
          ...prev,
          isLoading: false,
          usingStaleCache: true,
          error: null // Don't show error if we have fallback data
        }));
      } else {
        setCache(prev => ({
          ...prev,
          isLoading: false,
          error: err
        }));
      }

      if (onError) {
        onError(err);
      }

      console.error(`[Cache] Error fetching ${key}:`, err);
    } finally {
      isFetchingRef.current = false;
    }
  }, [key, fetchFunction, ttl, cache.timestamp, cache.data, onError]);

  // Auto-fetch on mount if no cached data
  useEffect(() => {
    if (!cache.data && !cache.isLoading && !cache.error) {
      fetchData();
    }

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Auto-refresh if enabled
  useEffect(() => {
    if (!autoRefresh || !cache.data) return;

    const interval = setInterval(() => {
      fetchData(true);
    }, ttl);

    return () => clearInterval(interval);
  }, [autoRefresh, ttl, cache.data, fetchData]);

  // Clear cache
  const clearCache = useCallback(() => {
    setCache({
      data: null,
      timestamp: 0,
      isLoading: false,
      error: null
    });
    localStorage.removeItem(`cache_${key}`);
    console.log(`[Cache] Cleared cache for ${key}`);
  }, [key]);

  // Refresh data
  const refresh = useCallback(() => {
    console.log(`[Cache] Manual refresh for ${key}`);
    return fetchData(true);
  }, [fetchData, key]);

  // Check if cache is stale
  const isStale = useCallback(() => {
    const age = Date.now() - cache.timestamp;
    return age >= ttl;
  }, [cache.timestamp, ttl]);

  return {
    data: cache.data,
    isLoading: cache.isLoading,
    error: cache.error,
    isOffline: cache.isOffline || false,
    usingStaleCache: cache.usingStaleCache || false,
    refresh,
    clearCache,
    isStale: isStale(),
    cacheAge: cache.timestamp ? Date.now() - cache.timestamp : 0
  };
};
