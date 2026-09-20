import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

/**
 * HLS-aware <video>. Uses hls.js on browsers without native HLS (Chrome/Firefox)
 * and falls back to native playback where supported (Safari).
 */
export default function HlsPlayer({ src, poster, className, controls = true, autoPlay = false }) {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    // Safari / native HLS
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      return;
    }

    // hls.js supported
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      const onError = () => setError(new Error('Failed to load HLS stream'));
      hls.on(Hls.Events.ERROR, onError);
      return () => {
        hls.off(Hls.Events.ERROR, onError);
        hls.destroy();
      };
    }

    // Neither native nor hls.js
    setError(new Error('HLS playback is not supported in this browser'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  if (!src) return null;

  if (error) {
    return (
      <div className="video-detail__hls-error">
        <span className="video-detail__badge">HLS unavailable</span>
        <p className="muted">{error.message}</p>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      className={className}
      controls={controls}
      autoPlay={autoPlay}
      poster={poster}
      playsInline
      preload="metadata"
    />
  );
}
