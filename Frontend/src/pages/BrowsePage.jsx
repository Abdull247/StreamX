import { useState, useCallback } from 'react';
import { xvideosHome, xvideosBest, enkuddiHome } from '../api/streams.js';
import useFetch from '../hooks/useFetch.js';
import VideoCard from '../components/VideoCard.jsx';
import LoadMore from '../components/LoadMore.jsx';
import Spinner from '../components/Spinner.jsx';
import ErrorState from '../components/ErrorState.jsx';

const TABS = [
  { id: 'best', label: '🔥 Best' },
  { id: 'new', label: '🆕 New' },
  { id: 'enkuddi', label: '🅴 Enkuddi' }
];

export default function BrowsePage({ onOpenVideo }) {
  const [tab, setTab] = useState('best');
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const pageRef = useRef(0);

  const fn = useCallback(() => {
    if (tab === 'enkuddi') return enkuddiHome({ page: 1, limit: 24 });
    if (tab === 'new') return xvideosHome({ page: 0, limit: 48 });
    return xvideosBest({ page: 0, limit: 48 });
  }, [tab]);

  const { data, loading, error, refetch } = useFetch(fn, {
    deps: [tab],
    onSuccess: (res) => {
      setItems((res && res.items) || []);
      setPage(0);
      pageRef.current = 0;
    }
  });

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const next = pageRef.current + 1;
      let res;
      if (tab === 'enkuddi') res = await enkuddiHome({ page: next, limit: 24 });
      else if (tab === 'new') res = await xvideosHome({ page: next, limit: 48 });
      else res = await xvideosBest({ page: next, limit: 48 });

      setItems((prev) => {
        const seen = new Set(prev.map((it) => it.id ?? it.link));
        return prev.concat((res.items || []).filter((it) => !seen.has(it.id ?? it.link)));
      });
      setPage(next);
      pageRef.current = next;
    } catch (e) {
      console.error('loadMore failed', e);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <section className="browse">
      <header className="page-header">
        <h1 className="page-title">Browse</h1>
      </header>

      <div className="filters">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={'chip' + (tab === t.id ? ' is-active' : '')}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && <Spinner label="Loading…" />}
      {error && <ErrorState error={error} onRetry={refetch} title="Couldn’t load browse feed" />}

      {!loading && !error && (
        <div className="video-grid">
          {items.map((item, i) => (
            <VideoCard key={item.id ?? item.link ?? i} item={item} onOpen={onOpenVideo} />
          ))}
        </div>
      )}

      <LoadMore loading={loadingMore} onLoadMore={loadMore} hasMore={items.length > 0} />
    </section>
  );
}
