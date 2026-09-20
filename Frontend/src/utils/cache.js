/**
 * Tiny async-aware cache.
 * - In-memory Map for the fastest hits (survives the whole session).
 * - sessionStorage fallback so navigating between pages/back-forward
 *   within the tab session doesn't re-fetch.
 * - TTL per entry; clear() drops everything (used by Settings).
 */

const MEMORY = new Map();
const STORAGE_KEY = 'streamx.cache.v1';
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

function now() {
  return Date.now();
}

export function cacheKey(namespace, params = {}) {
  const stable = JSON.stringify(params || {});
  return `${namespace}:${stable}`;
}

function writeMemory(key, value, expiresAt) {
  MEMORY.set(key, { value, expiresAt });
}

function tryStorage() {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function writeStorage(key, value, expiresAt) {
  const store = tryStorage();
  if (!store) return;
  try {
    const raw = store.getItem(STORAGE_KEY);
    const all = raw ? JSON.parse(raw) : {};
    all[key] = { value, expiresAt };
    store.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    /* quota / private mode — fall back to memory only */
  }
}

function readStorage(key) {
  const store = tryStorage();
  if (!store) return null;
  try {
    const raw = store.getItem(STORAGE_KEY);
    if (!raw) return null;
    const all = JSON.parse(raw);
    return all[key] || null;
  } catch {
    return null;
  }
}

export function cacheGet(key) {
  const mem = MEMORY.get(key);
  if (mem && mem.expiresAt > now()) return mem.value;
  if (mem) MEMORY.delete(key);

  const stored = readStorage(key);
  if (stored && stored.expiresAt > now()) {
    // warm memory from storage
    writeMemory(key, stored.value, stored.expiresAt);
    return stored.value;
  }
  if (stored) {
    // expired in storage
    try {
      const store = tryStorage();
      const raw = store.getItem(STORAGE_KEY);
      const all = raw ? JSON.parse(raw) : {};
      delete all[key];
      store.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch {}
  }
  return null;
}

export function cacheSet(key, value, ttlMs = DEFAULT_TTL_MS) {
  const expiresAt = now() + ttlMs;
  writeMemory(key, value, expiresAt);
  writeStorage(key, value, expiresAt);
  return value;
}

export function cacheClear() {
  MEMORY.clear();
  try {
    const store = tryStorage();
    if (store) store.removeItem(STORAGE_KEY);
  } catch {}
}
