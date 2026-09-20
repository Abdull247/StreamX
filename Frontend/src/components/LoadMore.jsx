import './LoadMore.css';

/**
 * "Load more" pagination button. Appends next-page results via `onLoadMore`.
 * Hidden while loading; spinner-ish label when busy.
 */
export default function LoadMore({ loading, onLoadMore, hasMore = true, label = 'Load more' }) {
  if (!hasMore) return null;
  return (
    <div className="load-more">
      <button className="load-more__btn" onClick={onLoadMore} disabled={loading}>
        {loading ? 'Loading…' : label}
      </button>
    </div>
  );
}
