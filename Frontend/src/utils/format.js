// Small formatting helpers shared across views.

export function formatViews(raw) {
  const str = String(raw ?? '0').replace(/,/g, '').trim();
  const n = Number(str);
  if (!str || Number.isNaN(n)) return str || '0';
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

export function formatDuration(raw) {
  const str = String(raw ?? '').trim();
  if (!str) return '';
  if (/:/.test(str)) return str; // already hh:mm:ss / mm:ss
  const sec = Number(str);
  if (!Number.isNaN(sec) && sec >= 0) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    const pad = (v) => String(v).padStart(2, '0');
    return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
  }
  return str;
}

export function toHttps(url = '') {
  if (!url) return '';
  return url.startsWith('http://') ? 'https://' + url.slice(7) : url;
}
