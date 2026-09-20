import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { xvideosSearch } from '../api/streams.js';
import useCacheFetch from '../hooks/useCacheFetch.js';
import { cacheKey, cacheGet, cacheSet } from '../utils/cache.js';
import { useProvider } from '../utils/providerContext.js';
import VideoCard from '../components/VideoCard.jsx';
import SearchBar from '../components/SearchBar.jsx';
import LoadMore from '../components/LoadMore.jsx';
import Spinner from '../components/Spinner.jsx';
import ErrorState from '../components/ErrorState.jsx';

const SORTS = ['relevance', 'views', 'rating', 'date'];
const QUALITIES = ['', 'hd', '1080p', '720p'];

export default function SearchPage({ onOpenVideo }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { provider } = useProvider();
  const providerId = provider?.id || 'xvideos';

  const q = searchParams.get('q') || '';
  const sort = searchParams.get('sort') || 'relevance';
  const quality = searchParams.get('quality') || '';

  const [items, setItems] = useState(() => {
    if (!q) return [];
    const cached = cacheGet(cacheKey('search', { q, sort, quality, provider: providerId }));
    return (cached && cached.items) || [];
  });
  const [page, setPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const { data, loading, error, refetch } = useCacheFetch(
    () =>
      q
        ? xvideosSearch({ q, page: 0, limit: 48, sort, quality, provider: providerId })
        : Promise.resolve(null),
    {
      key: q ? cacheKey('search', { q, sort, quality, provider: providerId }) : null,
      cacheTtlMs: 5 * 60 * 1000,
      deps: [q, sort, quality, providerId],
      onSuccess: (res) => {
        setItems((res && res.items) || []);
        setPage(0);
      }
    }
  );

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const next = page + 1;
      const pk = cacheKey('search', { q, sort, quality, provider: providerId, page: next });
      let res = cacheGet(pk);
      if (!res) {
        res = await xvideosSearch({ q, page: next, limit: 48, sort, quality, provider: providerId });
        cacheSet(pk, res, 5 * 60 * 1000);
      }
      setItems((prev) => {
        const seen = new Set(prev.map((it) => it.id ?? it.link));
        return prev.concat((res.items || []).filter((it) => !seen.has(it.id ?? it.link)));
      });
      setPage(next);
    } catch (e) {
      console.error('loadMore failed', e);
    } finally {
      setLoadingMore(false);
    }
  };

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  };

  return (
    <section className="search-page">
      <header className="page-header">
        <h1 className="page-title">Search</h1>
      </header>

      <SearchBar
        onSearch={(val) => setParam('q', val.trim())}
        placeholder="Search videos across sites…"
        initial={q}
        autoFocus={!q}
      />

      {q && (
        <div className="filters" style={{ marginTop: 16 }}>
          {SORTS.map((s) => (
            <button
              key={s}
              className={'chip' + (sort === s ? ' is-active' : '')}
              onClick={() => setParam('sort', s === 'relevance' ? '' : s)}
            >
              {s}
            </button>
          ))}
          <span style={{ width: 6 }} />
          {QUALITIES.map((qu) => (
            <button
              key={qu || 'all'}
              className={'chip' + (quality === qu ? ' is-active' : '')}
              onClick={() => setParam('quality', qu)}
            >
              {qu || 'all'}
            </button>
          ))}
        </div>
      )}

      {loading && !items.length && <Spinner label="Searching…" />}
      {error && !items.length && <ErrorState error={error} onRetry={refetch} title="Search failed" />}

      {q && !loading && !error && (
        <>
          {items.length ? (
            <>
              <p className="muted" style={{ fontSize: '0.85rem', margin: '12px 0' }}>
                {items.length} results for “{q}”
              </p>
              <div className="video-grid">
                {items.map((item, i) => (
                  <VideoCard key={item.id ?? item.link ?? i} item={item} onOpen={onOpenVideo} />
                ))}
              </div>
            </>
          ) : (
            <p className="empty">No results for “{q}”.</p>
          )}
        </>
      )}

      {q && !loading && !error && items.length > 0 && (
        <LoadMore loading={loadingMore} onLoadMore={loadMore} hasMore={items.length > 0} />
      )}
    </section>
  );
}
