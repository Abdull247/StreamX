import { useCallback, useEffect, useRef, useState } from 'react';
import { cacheGet, cacheSet } from '../utils/cache.js';

/**
 * Cache-first fetch hook.
 * - Reads from cache immediately (no network) when a hit exists.
 * - Always refetches in the background to keep data fresh (unless `staleOnce`).
 * - Returns { data, loading, error, fromCache, refetch, run }.
 *
 * Usage:
 *   const { data, loading } = useCacheFetch(
 *     () => xvideosHome({ page, limit, provider }),
 *     { key: cacheKey('home', { provider }), deps: [provider] }
 *   );
 */
export default function useCacheFetch(fn, { key, deps = [], cacheTtlMs, onSuccess = null, onError = null } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fromCache, setFromCache] = useState(false);

  const fnRef = useRef(fn);
  fnRef.current = fn;
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const execute = useCallback(async () => {
    if (!key) return null;

    // 1) cache hit → show instantly, no network
    const hit = cacheGet(key);
    let result = null;
    if (hit) {
      setData(hit);
      setFromCache(true);
      result = hit;
    }

    // 2) always fetch fresh in the background
    setLoading(true);
    setError(null);
    try {
      const fresh = await fnRef.current();
      setData(fresh);
      setFromCache(false);
      cacheSet(key, fresh, cacheTtlMs);
      if (onSuccessRef.current) onSuccessRef.current(fresh);
      result = fresh;
    } catch (err) {
      // keep showing cached data if we had it; otherwise surface error
      if (!hit) {
        setError(err);
        if (onErrorRef.current) onErrorRef.current(err);
      }
    } finally {
      setLoading(false);
    }
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, cacheTtlMs]);

  useEffect(() => {
    if (key) execute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const refetch = useCallback(() => execute(), [execute]);

  return { data, loading, error, fromCache, refetch, run: execute };
}
