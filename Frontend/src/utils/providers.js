import { clientGet } from '../api/client.js';

const STORAGE_KEY = 'streamx.defaultProvider';

const FALLBACK_PROVIDERS = [
  { id: 'xvideos', name: 'Xvideos', label: 'xvideos.com', baseUrl: 'https://www.xvideos.com' },
  { id: 'enkuddi', name: 'Enkuddi', label: 'enkuddi.com', baseUrl: 'https://enkuddi.com' }
];

let cachedProviders = null;

export async function fetchProviders() {
  if (cachedProviders) return cachedProviders;
  try {
    const res = await clientGet('/api/providers');
    const list = res && Array.isArray(res.providers) ? res.providers : null;
    if (list && list.length) {
      cachedProviders = list;
      return list;
    }
  } catch {
    /* backend not reachable — fall through to fallback */
  }
  cachedProviders = FALLBACK_PROVIDERS;
  return FALLBACK_PROVIDERS;
}

export function getDefaultProviderId() {
  try {
    return localStorage.getItem(STORAGE_KEY) || 'xvideos';
  } catch {
    return 'xvideos';
  }
}

export function setDefaultProviderId(id) {
  try {
    localStorage.setItem(STORAGE_KEY, id || 'xvideos');
  } catch {}
  return id || 'xvideos';
}

export async function getDefaultProvider() {
  const id = getDefaultProviderId();
  const list = await fetchProviders();
  return list.find((p) => p.id === id) || list[0] || { id: 'xvideos' };
}
