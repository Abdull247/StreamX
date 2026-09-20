import { useState } from 'react';
import { xvideosHome } from '../api/streams.js';
import { BACKEND_BASE_URL } from '../api/client.js';
import useFetch from '../hooks/useFetch.js';
import VideoCard from '../components/VideoCard.jsx';
import SearchBar from '../components/SearchBar.jsx';
import LoadMore from '../components/LoadMore.jsx';
import Spinner from '../components/Spinner.jsx';
import ErrorState from '../components/ErrorState.jsx';

const PAGE_SIZE = 24;

export default function HomePage({ onSearch, onOpenVideo }) {
  const [page, setPage] = useState(0);
  const [items, setItems] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);

  const { data, loading, error, refetch } = useFetch(
    () => xvideosHome({ page: 0, limit: PAGE_SIZE }),
    {
      deps: [],
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
      const res = await xvideosHome({ page: next, limit: PAGE_SIZE });
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

  const backendOk = Boolean(data);

  return (
    <section className="home">
      <header className="page-header">
        <h1 className="page-title">Home</h1>
      </header>

      <SearchBar onSearch={onSearch} placeholder="Search StreamX…" />

      {loading && <Spinner label="Loading videos…" />}
      {error && <ErrorState error={error} onRetry={refetch} title="Couldn’t load home feed" />}

      {!loading && !error && (
        <>
          {items.length ? (
            <div className="video-grid" style={{ marginTop: 16 }}>
              {items.map((item, i) => (
                <VideoCard key={item.id ?? item.link ?? i} item={item} onOpen={onOpenVideo} />
              ))}
            </div>
          ) : (
            <p className="empty">No videos yet. Make sure the backend is running.</p>
          )}

          {!backendOk ? (
            <div className="muted" style={{ marginTop: 16, fontSize: '0.85rem', textAlign: 'center' }}>
              API base: {BACKEND_BASE_URL}
            </div>
          ) : null}
        </>
      )}

      <LoadMore loading={loadingMore} onLoadMore={loadMore} hasMore={items.length > 0} />
    </section>
  );
}
