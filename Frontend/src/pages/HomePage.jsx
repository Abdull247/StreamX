import { useState } from 'react';
import { xvideosHome } from '../api/streams.js';
import { BACKEND_BASE_URL } from '../api/client.js';
import useCacheFetch from '../hooks/useCacheFetch.js';
import { cacheKey, cacheGet, cacheSet } from '../utils/cache.js';
import { useProvider } from '../utils/providerContext.js';
import VideoCard from '../components/VideoCard.jsx';
import SearchBar from '../components/SearchBar.jsx';
import LoadMore from '../components/LoadMore.jsx';
import Spinner from '../components/Spinner.jsx';
import ErrorState from '../components/ErrorState.jsx';

const PAGE_SIZE = 24;

export default function HomePage({ onSearch, onOpenVideo }) {
  const { provider } = useProvider();
  const providerId = provider?.id || 'xvideos';

  const [items, setItems] = useState(() => {
    const cached = cacheGet(cacheKey('home', { provider: providerId }));
    return (cached && cached.items) || [];
  });
  const [page, setPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const { data, loading, error, refetch } = useCacheFetch(
    () => xvideosHome({ page: 0, limit: PAGE_SIZE, provider: providerId }),
    {
      key: providerId ? cacheKey('home', { provider: providerId }) : null,
      cacheTtlMs: 5 * 60 * 1000,
      deps: [providerId],
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
      const pk = cacheKey('home', { provider: providerId, page: next });
      let res = cacheGet(pk);
      if (!res) {
        res = await xvideosHome({ page: next, limit: PAGE_SIZE, provider: providerId });
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

  const hasMore = items.length > 0;

  return (
    <section className="home">
      <header className="page-header">
        <h1 className="page-title">Home</h1>
      </header>

      <SearchBar onSearch={onSearch} placeholder="Search StreamX…" />

      {loading && !items.length && <Spinner label="Loading videos…" />}
      {error && !items.length && <ErrorState error={error} onRetry={refetch} title="Couldn’t load home feed" />}

      {items.length ? (
        <div className="video-grid" style={{ marginTop: 16 }}>
          {items.map((item, i) => (
            <VideoCard key={item.id ?? item.link ?? i} item={item} onOpen={onOpenVideo} />
          ))}
        </div>
      ) : (
        !loading && !error && (
          <p className="empty">No videos yet. Make sure the backend is running.
          <br /><span className="muted" style={{ fontSize: '0.8rem' }}>API base: {BACKEND_BASE_URL}</span></p>
        )
      )}

      <LoadMore loading={loadingMore} onLoadMore={loadMore} hasMore={hasMore} />
    </section>
  );
}
