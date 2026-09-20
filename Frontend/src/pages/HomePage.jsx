import { Link } from 'react-router-dom';
import { xvideosHome } from '../api/streams.js';
import { BACKEND_BASE_URL } from '../api/client.js';
import useFetch from '../hooks/useFetch.js';
import VideoCard from '../components/VideoCard.jsx';
import SearchBar from '../components/SearchBar.jsx';
import Spinner from '../components/Spinner.jsx';
import ErrorState from '../components/ErrorState.jsx';

export default function HomePage({ onSearch }) {
  const { data, loading, error, refetch } = useFetch(
    () => xvideosHome({ page: 0, limit: 24 }),
    { deps: [] }
  );

  const items = (data && data.items) || [];
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
                <VideoCard key={item.id ?? item.link ?? i} item={item} />
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

      <div className="load-more" style={{ marginTop: 20 }}>
        <Link className="load-more__btn" to="/browse">Browse more</Link>
      </div>
    </section>
  );
}
