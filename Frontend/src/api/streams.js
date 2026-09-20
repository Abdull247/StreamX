// Endpoint helpers for the StreamX API.
// Mirrors the server routes: /api/health, /api/xvideos/*, /api/enkuddi/*
import { request } from './client.js';

export const health = () =>
  request('/api/health');

// --- xvideos ---

export const xvideosHome = ({ page = 0, limit = 48 } = {}) =>
  request('/api/xvideos/home', { query: { page, limit } });

export const xvideosBest = ({ page = 0, limit = 48 } = {}) =>
  request('/api/xvideos/best', { query: { page, limit } });

export const xvideosSearch = ({
  q,
  page = 0,
  limit = 48,
  sort = 'relevance',
  quality = '',
  duration = '',
  date = ''
} = {}) =>
  request('/api/xvideos/search', {
    query: { q, page, limit, sort, quality, duration, date }
  });

export const xvideosCategory = ({ cat, page = 0, limit = 48 } = {}) =>
  request('/api/xvideos/category', { query: { cat, page, limit } });

export const xvideosDetails = ({ url, eid } = {}) =>
  request('/api/xvideos/details', { query: { url, eid } });

export const xvideosRecommendations = ({ url } = {}) =>
  request('/api/xvideos/recommendations', { query: { url } });

// --- enkuddi ---

export const enkuddiHome = ({ page = 1, limit = 24 } = {}) =>
  request('/api/enkuddi/home', { query: { page, limit } });

export const enkuddiSearch = ({ q, page = 1, limit = 24 } = {}) =>
  request('/api/enkuddi/search', { query: { q, page, limit } });
