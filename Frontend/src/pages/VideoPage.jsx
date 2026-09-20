import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { xvideosDetails, xvideosRecommendations } from '../api/streams.js';
import useFetch from '../hooks/useFetch.js';
import VideoCard from '../components/VideoCard.jsx';
import Spinner from '../components/Spinner.jsx';
import ErrorState from '../components/ErrorState.jsx';
import { formatViews, formatDuration, toHttps } from '../utils/format.js';
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

  const [showRelated, setShowRelated] = useState(false);
  const [relData, setRelData] = useState(null);
  const [relLoading, setRelLoading] = useState(false);

  const loadRelated = async () => {
    setShowRelated(true);
    setRelLoading(true);
    try {
      const res = await xvideosRecommendations({ url: videoUrl });
      setRelData(res);
    } finally {
      setRelLoading(false);
    }
  };

  const v = data;
  const thumbs = (v && v.thumbs) || {};
  const mainThumb = v?.thumb || thumbs.main;
  const streams = v?.streams || {};
  const hlsUrl = streams.hls;

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
              <video controls autoPlay poster={mainThumb} className="video-detail__video">
                <source src={toHttps(hlsUrl)} type="application/x-mpegURL" />
                Your browser doesn’t support HLS playback.
              </video>
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
              <button className="video-detail__related-toggle" onClick={loadRelated}>
                Recommendations
              </button>
            </div>
          </div>

          {showRelated && (
            <div className="video-detail__related">
              <h3>Related videos</h3>
              {relLoading && <Spinner label="Loading recommendations…" />}
              {relData && relData.items && (
                <div className="video-grid">
                  {relData.items.map((item, i) => (
                    <VideoCard key={item.id ?? item.link ?? i} item={item} />
                  ))}
                </div>
              )}
            </div>
          )}
        </article>
      )}
    </section>
  );
}
