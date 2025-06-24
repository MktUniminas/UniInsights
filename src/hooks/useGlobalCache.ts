import { useState, useEffect, useCallback } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface GlobalCacheState {
  [key: string]: CacheEntry<any>;
}

// Global cache that persists during the session
let globalCache: GlobalCacheState = {};
let cacheListeners: Set<() => void> = new Set();

// Auto-refresh interval (10 seconds)
let refreshInterval: NodeJS.Timeout | null = null;

const notifyListeners = () => {
  cacheListeners.forEach(listener => listener());
};

export const useGlobalCache = () => {
  const [, forceUpdate] = useState({});

  const triggerUpdate = useCallback(() => {
    forceUpdate({});
  }, []);

  useEffect(() => {
    cacheListeners.add(triggerUpdate);
    return () => {
      cacheListeners.delete(triggerUpdate);
    };
  }, [triggerUpdate]);

  const setCache = useCallback(<T>(key: string, data: T, ttlMinutes = 10) => {
    const ttl = ttlMinutes * 60 * 1000; // Convert to milliseconds
    globalCache[key] = {
      data,
      timestamp: Date.now(),
      ttl
    };
    notifyListeners();
  }, []);

  const getCache = useCallback(<T>(key: string): T | null => {
    const entry = globalCache[key];
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      delete globalCache[key];
      return null;
    }

    return entry.data as T;
  }, []);

  const clearCache = useCallback((pattern?: string) => {
    if (pattern) {
      Object.keys(globalCache).forEach(key => {
        if (key.includes(pattern)) {
          delete globalCache[key];
        }
      });
    } else {
      globalCache = {};
    }
    notifyListeners();
  }, []);

  const updateCache = useCallback(<T>(key: string, updater: (current: T | null) => T) => {
    const current = getCache<T>(key);
    const updated = updater(current);
    setCache(key, updated);
  }, [getCache, setCache]);

  // Start auto-refresh if not already running
  useEffect(() => {
    if (!refreshInterval) {
      refreshInterval = setInterval(() => {
        // Check for expired entries and notify if any data needs refresh
        const now = Date.now();
        let hasExpired = false;
        
        Object.keys(globalCache).forEach(key => {
          const entry = globalCache[key];
          if (now - entry.timestamp > entry.ttl) {
            delete globalCache[key];
            hasExpired = true;
          }
        });

        if (hasExpired) {
          notifyListeners();
        }
      }, 10000); // Check every 10 seconds
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
      }
    };
  }, []);

  return {
    setCache,
    getCache,
    clearCache,
    updateCache,
    cacheKeys: Object.keys(globalCache)
  };
};

// Hook for API calls with global cache
export const useApiWithCache = <T>(
  key: string,
  apiCall: () => Promise<{ success: boolean; data: T; error?: string }>,
  dependencies: any[] = [],
  ttlMinutes = 10
) => {
  const { getCache, setCache } = useGlobalCache();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Try to get from cache first
  const cachedData = getCache<T>(key);
  const [data, setData] = useState<T | null>(cachedData);

  const fetchData = useCallback(async (forceRefresh = false) => {
    // If we have cached data and not forcing refresh, don't fetch
    if (!forceRefresh && cachedData) {
      setData(cachedData);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await apiCall();
      
      if (response.success) {
        setData(response.data);
        setCache(key, response.data, ttlMinutes);
      } else {
        setError(response.error || 'Erro desconhecido');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro na requisição');
    } finally {
      setLoading(false);
    }
  }, [key, apiCall, setCache, ttlMinutes, cachedData]);

  // Only fetch if we don't have cached data
  useEffect(() => {
    if (!cachedData) {
      fetchData();
    }
  }, dependencies);

  // Update data when cache changes
  useEffect(() => {
    const newCachedData = getCache<T>(key);
    if (newCachedData && newCachedData !== data) {
      setData(newCachedData);
    }
  }, [key, getCache, data]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchData(true),
    isFromCache: !!cachedData
  };
};