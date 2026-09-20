import { formatViews } from '../utils/format.js';
import './VideoCard.css';

/**
 * Video card. `onOpen` is called when the card is clicked (routes to details).
 * Original-source link is provided as an escape hatch.
 */
export default function VideoCard({ item, onClick, onOpen }) {
  const thumb = item.thumb;
  const isHls = item.streams && item.streams.hls;
  const link = item.link || item.url;
  const title = item.title || item.name || 'Untitled';

  const handleActivate = () => {
    if (onOpen) onOpen(item);
    else if (onClick) onClick(item);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleActivate();
    }
  };

  return (
    <article
      className="video-card"
      role="button"
      tabIndex={0}
      onClick={handleActivate}
      onKeyDown={handleKey}
    >
      <div className="video-card__thumb">
        {thumb ? (
          <img
            src={thumb}
            alt={title}
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="video-card__placeholder" />
        )}
        {item.duration || item.duration_seconds ? (
          <span className="video-card__badge video-card__duration">
            {formatDurationString(item.duration || item.duration_seconds)}
          </span>
        ) : null}
        {isHls ? <span className="video-card__badge video-card__hls">HLS</span> : null}
      </div>

      <div className="video-card__body">
        <h3 className="video-card__title">{title}</h3>
        <div className="video-card__meta">
          <span className="video-card__views">
            {item.views ? formatViews(item.views) + ' views' : ''}
          </span>
          {item.uploader ? (
            <span className="video-card__uploader">{item.uploader}</span>
          ) : null}
        </div>
        {link ? (
          <div className="video-card__visit">
            <a
              href={link}
              target="_blank"
              rel="noreferrer noopener"
              onClick={(e) => e.stopPropagation()}
            >
              Open original ↗
            </a>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function formatDurationString(raw) {
  const str = String(raw ?? '').trim();
  if (/:/.test(str)) return str;
  const sec = Number(str);
  if (Number.isNaN(sec) || sec < 0) return str;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const pad = (v) => String(v).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}
