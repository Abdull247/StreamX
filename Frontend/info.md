# StreamX Frontend

The React + Vite frontend for the StreamX multi-site video API.

## Stack
- **React 18** + **react-router-dom** (client-side routing)
- **Vite 5** build tool (dev server on `:5173`)
- **Plain CSS** — design tokens via CSS custom properties in `src/styles/global.css` (no CSS framework)
- **hls.js** — cross-browser HLS playback (Chrome/Firefox + Safari)

## Features
- Bottom navigation (Home / Browse / Search / Settings) with safe-area padding
- Latest videos feed (xvideos home) + Best / New / Enkuddi browsing
- Search with sort (relevance/views/rating/date) and quality filters
- **Video details page** consuming the backend:
  - `/api/xvideos/details` → title, length, views, uploader, date, description, tags, player streams, and an embedded `related` list
  - `/api/xvideos/recommendations` → dedicated recommended list, appended via a "Show more" button
  - HLS player via **hls.js** (falls back to native playback on Safari)
- Click a video card anywhere to open its details page
- "Load more" pagination on Home / Browse / Search
- **Providers** — a config-driven list exposed by `GET /api/providers`. In Settings you pick a default source; the whole app (Home, Browse, Search, Details) then calls the endpoints for that provider.
- **Caching** — listings & details are cached (in-memory + sessionStorage, 5-min TTL) so navigating between pages doesn't re-fetch; Settings has a "Clear cache" button.
- **Scroll preservation** — a `ScrollManager` records each page's scroll position and restores it when you come back (back/forward), instead of jumping to top.
- Settings page shows the live backend status and the active base URL.

## Setup
```bash
# 1. Create your env file (see .env.example)
cp .env.example .env.development
# 2. Set your backend base URL in it, e.g.
#    VITE_API_BASE_URL=http://localhost:3001

# 3. Install + run
npm install
npm run dev
```

Open `http://localhost:5173`. The dev server proxies `/api` to the backend, and
the app also calls `VITE_API_BASE_URL` directly for all requests.

## Env vars
| Var | Purpose | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Backend base URL the frontend calls for all API requests | `http://localhost:3001` |

## Directory layout
```
src/
├── App.jsx              # routes + layout shell + provider context + ScrollManager
├── main.jsx             # React entry
├── api/
│   ├── client.js        # fetch wrapper (reads VITE_API_BASE_URL; clientGet/clientPost)
│   └── streams.js       # xvideos / enkuddi / health endpoint helpers (provider-aware)
├── hooks/
│   ├── useFetch.js      # simple data-fetching hook (onSuccess, refetch)
│   └── useCacheFetch.js # cache-first fetch (memory + sessionStorage, background refresh)
├── components/          # BottomNav, VideoCard, SearchBar, Spinner, ErrorState, HlsPlayer, LoadMore, ScrollManager
├── pages/               # Home, Search, Browse, Video, Settings
├── styles/global.css    # theme tokens + layout
└── utils/
    ├── format.js        # views/duration formatting
    ├── cache.js         # in-memory + sessionStorage cache w/ TTL + clear()
    ├── providers.js     # fetch providers + default selection (localStorage)
    ├── providerContext.js # React context for the active provider
    └── scroll.js        # scroll-position store + restore
```

## API
`GET /api/providers` → `{ default, providers: [...] }`, each provider `{ id, name, label, baseUrl, type }`.
