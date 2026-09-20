import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Data-fetching hook.
 * - auto: fetch on mount and whenever `deps` change
 * - auto=false: expose run() for manual/event-triggered fetches
 * - onSuccess(data): callback invoked after a successful fetch (for derived state)
 * - returns { data, loading, error, refetch, run }
 */
export default function useFetch(
  fn,
  { auto = true, deps = [], initialData = null, onSuccess = null } = {}
) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(Boolean(auto));
  const [error, setError] = useState(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  const run = useCallback(
    async (args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await fnRef.current(args);
        setData(result);
        if (onSuccessRef.current) onSuccessRef.current(result);
        return result;
      } catch (err) {
        setError(err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (!auto) return;
    let cancelled = false;
    setLoading(true);
    fnRef
      .current()
      .then((res) => {
        if (cancelled) return;
        setData(res);
        if (onSuccessRef.current) onSuccessRef.current(res);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const refetch = useCallback(() => run(), [run]);

  return { data, loading, error, refetch, run };
}
