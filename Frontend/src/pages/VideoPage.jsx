import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { xvideosDetails, xvideosRecommendations } from '../api/streams.js';
import useCacheFetch from '../hooks/useCacheFetch.js';
import { cacheKey, cacheGet, cacheSet } from '../utils/cache.js';
import { useProvider } from '../utils/providerContext.js';
import VideoCard from '../components/VideoCard.jsx';
import HlsPlayer from '../components/HlsPlayer.jsx';
import Spinner from '../components/Spinner.jsx';
import ErrorState from '../components/ErrorState.jsx';
import { formatViews, formatDuration } from '../utils/format.js';
import './VideoPage.css';

export default function VideoPage() {
  const { link } = useParams();
  const { provider } = useProvider();
  const providerId = provider?.id || 'xvideos';

  const videoUrl = (() => {
    try {
      return link ? decodeURIComponent(link) : '';
    } catch {
      return '';
    }
  })();

  const isXvideos = !videoUrl || /\bxvideos\.com\b/i.test(videoUrl);

  const { data: v, loading, error, refetch } = useCacheFetch(
    () => (videoUrl ? xvideosDetails({ url: videoUrl, provider: providerId }) : Promise.resolve(null)),
    {
      key: videoUrl ? cacheKey('details', { url: videoUrl, provider: providerId }) : null,
      cacheTtlMs: 5 * 60 * 1000,
      deps: [videoUrl, providerId]
    }
  );

  const thumbs = (v && v.thumbs) || {};
  const mainThumb = v?.thumb || thumbs.main;
  const streams = v?.streams || {};
  const hlsUrl = streams.hls;

  return (
    <section className="video-page">
      <header className="page-header">
        <h1 className="page-title page-title--center">Now Playing</h1>
      </header>

      {loading && !v && <Spinner label="Loading video…" />}
      {error && !v && <ErrorState error={error} onRetry={refetch} title="Couldn’t load video" />}

      {!isXvideos && !v && !loading && !error && (
        <div className="video-detail__nonxv">
          <p className="muted">
            This provider doesn’t expose a rich details page yet. Open it on the source instead.
          </p>
          <a className="video-detail__open" href={videoUrl} target="_blank" rel="noreferrer noopener">
            Open original ↗
          </a>
        </div>
      )}

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

          <Recommendations
            videoUrl={videoUrl}
            providerId={providerId}
            embedded={v.related}
            onOpenVideo={(item) => {
              const dest = item.link || item.url;
              if (dest) {
                // reuse existing in-app navigation by linking back into the router
                window.location.href = `/#/video/${encodeURIComponent(dest)}`;
              }
            }}
          />
        </article>
      )}
    </section>
  );
}

function Recommendations({ videoUrl, providerId, embedded = [], onOpenVideo }) {
  const recKey = videoUrl ? cacheKey('recommendations', { url: videoUrl, provider: providerId }) : null;

  const loadMore = useCallback(async () => {
    if (!videoUrl || !recKey) return;
    const existing = cacheGet(recKey);
    if (existing) return existing;
    const res = await xvideosRecommendations({ url: videoUrl, provider: providerId });
    cacheSet(recKey, res, 5 * 60 * 1000);
    return res;
  }, [videoUrl, providerId, recKey]);

  const items = (loadMore && embedded) || embedded || [];

  return (
    <div className="video-detail__related">
      <div className="video-detail__related-head">
        <h3>Recommended videos</h3>
        <span className="muted video-detail__related-count">from {providerId}</span>
      </div>

      {items.length ? (
        <div className="video-grid">
          {items.map((item, i) => (
            <VideoCard key={item.id ?? item.link ?? i} item={item} onOpen={onOpenVideo} />
          ))}
        </div>
      ) : (
        <p className="empty">No related videos found.</p>
      )}

      <div className="load-more">
        <button className="load-more__btn" onClick={loadMore}>
          Show more recommendations
        </button>
      </div>
    </div>
  );
}
