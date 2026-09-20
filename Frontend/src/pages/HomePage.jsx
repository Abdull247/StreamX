import { useCallback } from 'react';
import { xvideosHome } from '../api/streams.js';
import { BACKEND_BASE_URL } from '../api/client.js';
import useCacheFetch from '../hooks/useCacheFetch.js';
import { cacheKey } from '../utils/cache.js';
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

  const { data, loading, error, fromCache, refetch } = useCacheFetch(
    () => xvideosHome({ page: 0, limit: PAGE_SIZE, provider: providerId }),
    {
      key: providerId ? cacheKey('home', { provider: providerId }) : null,
      cacheTtlMs: 5 * 60 * 1000,
      deps: [providerId]
    }
  );

  const items = (data && data.items) || [];

  return (
    <section className="home">
      <header className="page-header">
        <h1 className="page-title">Home</h1>
        {fromCache && (
          <span className="muted" style={{ fontSize: '0.78rem' }}>cached · {provider?.label}</span>
        )}
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
        !loading && !error && <p className="empty">No videos yet. Make sure the backend is running.</p>
      )}

      {data && !loading && fromCache && (
        <div className="muted" style={{ marginTop: 16, fontSize: '0.85rem', textAlign: 'center' }}>
          Showing cached results — API base: {BACKEND_BASE_URL}
        </div>
      )}
    </section>
  );
}
