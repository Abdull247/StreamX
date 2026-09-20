// Minimal scroll-position store.
// - We record window scrollY keyed by the current location (pathname + search).
// - After navigation (esp. back), we restore the saved position once content
//   has settled instead of jumping to the top.

const store = new Map();

export function saveScroll(key, y) {
  store.set(key, y);
}

export function getScroll(key) {
  return store.get(key) ?? 0;
}

export function clearScroll(key) {
  store.delete(key);
}

export function restoreScroll(key, fallback = 0) {
  const y = getScroll(key);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    window.scrollTo({ top: y || fallback, left: 0, behavior: 'auto' });
  }));
}
