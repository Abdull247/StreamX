import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { xvideosSearch } from '../api/streams.js';
import useFetch from '../hooks/useFetch.js';
import VideoCard from '../components/VideoCard.jsx';
import SearchBar from '../components/SearchBar.jsx';
import Spinner from '../components/Spinner.jsx';
import ErrorState from '../components/ErrorState.jsx';

const SORTS = ['relevance', 'views', 'rating', 'date'];
const QUALITIES = ['', 'hd', '1080p', '720p'];

export default function SearchPage({ onSearch }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const sort = searchParams.get('sort') || 'relevance';
  const quality = searchParams.get('quality') || '';

  const { data, loading, error, refetch } = useFetch(
    () =>
      q
        ? xvideosSearch({ q, page: 0, limit: 48, sort, quality })
        : Promise.resolve(null),
    { deps: [q, sort, quality] }
  );

  const items = (data && data.items) || [];

  // keep page title-ish state in sync
  useEffect(() => {
    if (!q && !searchParams.has('q')) {
      // nothing typed yet
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

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

      {loading && <Spinner label="Searching…" />}
      {error && <ErrorState error={error} onRetry={refetch} title="Search failed" />}

      {q && !loading && !error && (
        <>
          {items.length ? (
            <>
              <p className="muted" style={{ fontSize: '0.85rem', margin: '12px 0' }}>
                {items.length} results for “{q}”
              </p>
              <div className="video-grid">
                {items.map((item, i) => (
                  <VideoCard key={item.id ?? item.link ?? i} item={item} />
                ))}
              </div>
            </>
          ) : (
            <p className="empty">No results for “{q}”.</p>
          )}
        </>
      )}
    </section>
  );
}
