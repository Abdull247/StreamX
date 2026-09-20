import { useState } from 'react';
import { xvideosHome, xvideosBest } from '../api/streams.js';
import useFetch from '../hooks/useFetch.js';
import VideoCard from '../components/VideoCard.jsx';
import Spinner from '../components/Spinner.jsx';
import ErrorState from '../components/ErrorState.jsx';

const TABS = [
  { id: 'best', label: '🔥 Best' },
  { id: 'new', label: '🆕 New' }
];

export default function BrowsePage() {
  const [tab, setTab] = useState('best');

  const fn =
    tab === 'best'
      ? () => xvideosBest({ page: 0, limit: 48 })
      : () => xvideosHome({ page: 0, limit: 48 });

  const { data, loading, error, refetch } = useFetch(fn, { deps: [tab] });

  const items = (data && data.items) || [];

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
            <VideoCard key={item.id ?? item.link ?? i} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
