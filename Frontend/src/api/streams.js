// Stream endpoint helpers. Each accepts an optional `provider` field so the
// app-wide default source can be passed through; the backend routes by suffix.

import { clientGet, clientPost } from './client.js';

/** XVIDEOS */

export function xvideosHome({ page = 0, limit = 24, provider } = {}) {
  return clientGet('/api/xvideos/home', { page, limit, provider });
}

export function xvideosSearch({ q, page = 0, limit = 24, sort, quality, provider } = {}) {
  return clientGet('/api/xvideos/search', { q, page, limit, sort, quality, provider });
}

export function xvideosBest({ page = 0, limit = 24, provider } = {}) {
  return clientGet('/api/xvideos/best', { page, limit, provider });
}

export function xvideosCategory({ cat, page = 0, limit = 24, provider } = {}) {
  return clientGet('/api/xvideos/category', { cat, page, limit, provider });
}

export function xvideosDetails({ url, provider } = {}) {
  return clientGet('/api/xvideos/details', { url, provider });
}

export function xvideosRecommendations({ url, provider } = {}) {
  return clientGet('/api/xvideos/recommendations', { url, provider });
}

/** ENKUDDI */

export function enkuddiHome({ page = 1, limit = 24, provider } = {}) {
  return clientGet('/api/enkuddi/home', { page, limit, provider });
}

export function enkuddiSearch({ q, page = 1, limit = 24, provider } = {}) {
  return clientGet('/api/enkuddi/search', { q, page, limit, provider });
}
