// Thin fetch wrapper around the StreamX backend.
// Base URL comes from VITE_API_BASE_URL (see .env.example), defaulting to
// http://localhost:3001. Optionally passes a `provider` param on GET requests.
export const BACKEND_BASE_URL =
  (import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  'http://localhost:3001';

export async function clientGet(path, params = {}) {
  const query = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') query.set(k, v);
  });
  const qs = query.toString();
  const res = await fetch(`${BACKEND_BASE_URL}${path}${qs ? '?' + qs : ''}`, {
    headers: { Accept: 'application/json' }
  });
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body && body.error) message = body.error;
    } catch {}
    throw new Error(message);
  }
  return res.json();
}

export async function clientPost(path, body = {}) {
  const res = await fetch(`${BACKEND_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body || {})
  });
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const json = await res.json();
      if (json && json.error) message = json.error;
    } catch {}
    throw new Error(message);
  }
  return res.json();
}

export { BACKEND_BASE_URL as BACKEND_BASE_URL };
