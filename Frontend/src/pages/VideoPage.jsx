import { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { xvideosDetails, xvideosRecommendations } from '../api/streams.js';
import useFetch from '../hooks/useFetch.js';
import VideoCard from '../components/VideoCard.jsx';
import HlsPlayer from '../components/HlsPlayer.jsx';
import Spinner from '../components/Spinner.jsx';
import ErrorState from '../components/ErrorState.jsx';
import { formatViews, formatDuration } from '../utils/format.js';
import './VideoPage.css';

export default function VideoPage() {
  const { link } = useParams();

  // The route passes the encoded video URL as :link
  const videoUrl = (() => {
    try {
      return link ? decodeURIComponent(link) : '';
    } catch {
      return '';
    }
  })();

  const { data, loading, error, refetch } = useFetch(
    () => (videoUrl ? xvideosDetails({ url: videoUrl }) : Promise.resolve(null)),
    { deps: [videoUrl] }
  );

  // Recommendations: embedded `related` from /details initially,
  // "More" button fetches /recommendations and appends.
  const [related, setRelated] = useState([]);
  const [recLoading, setRecLoading] = useState(false);
  const [recError, setRecError] = useState(null);
  const [recFetched, setRecFetched] = useState(false);
  const [recLoaded, setRecLoaded] = useState(false); // whether the button has been pressed

  // When fresh details arrive, seed from the embedded `related` list.
  const seedRelated = useCallback((v) => {
    if (v && Array.isArray(v.related)) {
      setRelated(v.related);
      setRecFetched(true);
      setRecLoaded(false);
    }
  }, []);

  const v = data;
  const thumbs = (v && v.thumbs) || {};
  const mainThumb = v?.thumb || thumbs.main;
  const streams = v?.streams || {};
  const hlsUrl = streams.hls;
  const isXvideos = !videoUrl || /\bxvideos\.com\b/i.test(videoUrl);

  const loadMoreRecommendations = async () => {
    setRecLoading(true);
    setRecError(null);
    setRecLoaded(true);
    try {
      const res = await xvideosRecommendations({ url: videoUrl });
      const items = (res && res.items) || [];
      setRelated((prev) => {
        // dedupe by id/link so appended items don't repeat
        const seen = new Set(prev.map((it) => it.id ?? it.link));
        const merged = prev.concat(items.filter((it) => !seen.has(it.id ?? it.link)));
        setRecFetched(true);
        return merged;
      });
    } catch (err) {
      setRecError(err);
    } finally {
      setRecLoading(false);
    }
  };

  return (
    <section className="video-page">
      <header className="page-header">
        <h1 className="page-title page-title--center">Now Playing</h1>
      </header>

      {loading && <Spinner label="Loading video…" />}
      {error && <ErrorState error={error} onRetry={refetch} title="Couldn’t load video" />}

      {v && (
        <article className="video-detail">
          <div className="video-detail__player">
            {hlsUrl ? (
              <HlsPlayer src={hlsUrl} poster={mainThumb} className="video-detail__video" />
            ) : (
              <div className="video-detail__thumb-wrap">
                <img src={mainThumb} alt={v.title} referrerPolicy="no-referrer" />
                <span className="video-detail__badge">HLS not available on this site</span>
              </div>
            )}
          </div>

          <div className="video-detail__info">
            <h2 className="video-detail__title">{v.title}</h2>

            <div className="video-detail__meta">
              {v.duration_seconds ? (
                <span className="meta-item">
                  <b>Length</b> {formatDuration(v.duration_seconds)}
                </span>
              ) : null}
              {v.views ? (
                <span className="meta-item">
                  <b>Views</b> {formatViews(v.views)}
                </span>
              ) : null}
              {v.uploader ? (
                <span className="meta-item">
                  <b>Uploader</b>{' '}
                  {v.uploader_url ? (
                    <a href={v.uploader_url} target="_blank" rel="noreferrer noopener">
                      {v.uploader}
                    </a>
                  ) : (
                    v.uploader
                  )}
                </span>
              ) : null}
              {v.upload_date ? (
                <span className="meta-item">
                  <b>Uploaded</b> {v.upload_date}
                </span>
              ) : null}
            </div>

            {v.description ? <p className="video-detail__desc">{v.description}</p> : null}

            {v.tags && v.tags.length ? (
              <div className="video-detail__tags">
                {v.tags.map((tag, i) => (
                  <span key={i} className="chip">{tag}</span>
                ))}
              </div>
            ) : null}

            <div className="video-detail__actions">
              <a
                className="video-detail__open"
                href={v.source || videoUrl}
                target="_blank"
                rel="noreferrer noopener"
              >
                Open on source ↗
              </a>
            </div>
          </div>

          {/* Recommended videos */}
          <div className="video-detail__related">
            <div className="video-detail__related-head">
              <h3>Recommended videos</h3>
              {related.length ? (
                <span className="muted video-detail__related-count">{related.length}</span>
              ) : null}
            </div>

            {seedRelated && !recLoaded && v?.related?.length > 0 && (
              <div className="video-grid">
                {v.related.map((item, i) => (
                  <VideoCard key={item.id ?? item.link ?? i} item={item} />
                ))}
              </div>
            )}

            {/* If the user hit "More", show the accumulated list */}
            {recLoaded &&
              (related.length ? (
                <div className="video-grid">
                  {related.map((item, i) => (
                    <VideoCard key={item.id ?? item.link ?? i} item={item} />
                  ))}
                </div>
              ) : (
                <p className="empty">No related videos found.</p>
              ))}

            {recLoading && <Spinner label="Loading more recommendations…" />}
            {recError && <ErrorState error={recError} onRetry={loadMoreRecommendations} title="Couldn’t load recommendations" />}

            {/* Recommendations endpoint available only for xvideos */}
            {isXvideos && !recLoading && (
              <div className="load-more">
                <button
                  className="load-more__btn"
                  onClick={loadMoreRecommendations}
                  disabled={recLoading}
                >
                  {recLoaded ? 'Load more recommendations' : 'Show more recommendations'}
                </button>
              </div>
            )}
          </div>
        </article>
      )}

      {!v && !loading && !error && videoUrl && (
        <div className="video-detail__nonxv">
          <p className="muted">
            This link isn’t from xvideos, so video details aren’t available here.
          </p>
          <a className="video-detail__open" href={videoUrl} target="_blank" rel="noreferrer noopener">
            Open original ↗
          </a>
        </div>
      )}
    </section>
  );
}
