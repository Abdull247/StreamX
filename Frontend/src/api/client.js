// API client. Reads the backend base URL from Vite env.
// Falls back to a sensible dev default when the var is unset.

const envBaseUrl =
  (import.meta.env && import.meta.env.VITE_API_BASE_URL) || '';

export const BACKEND_BASE_URL = (envBaseUrl || 'http://localhost:3001').replace(/\/+$/, '');

const DEFAULT_TIMEOUT_MS = 20000;

/**
 * Core fetch wrapper used by all endpoint helpers.
 * - Builds absolute URL: BACKEND_BASE_URL + path
 * - Optional query object -> URLSearchParams
 * - Optional JSON body -> POST { headers JSON, body }
 * - Timeout + uniform error handling
 */
async function request(path, { query, body, timeout = DEFAULT_TIMEOUT_MS } = {}) {
  const url = new URL(BACKEND_BASE_URL + path);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const init = {
      method: body ? 'POST' : 'GET',
      headers: body ? { 'Content-Type': 'application/json' } : {},
      signal: controller.signal
    };
    if (body) init.body = JSON.stringify(body);

    const res = await fetch(url.toString(), init);
    let data = null;
    try {
      data = await res.json();
    } catch {
      data = await res.text();
    }

    if (!res.ok) {
      const message =
        (data && typeof data === 'object' && data.error) ||
        `Request failed with status ${res.status}`;
      throw new Error(message);
    }

    return data;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeout}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export { request };
