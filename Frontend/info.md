# StreamX Frontend

The React + Vite frontend for the StreamX multi-site video API.

## Stack
- **React 18** + **react-router-dom** (client-side routing)
- **Vite 5** build tool (dev server on `:5173`)
- **Plain CSS** — design tokens via CSS custom properties in `src/styles/global.css` (no CSS framework)

## Features
- Bottom navigation (Home / Browse / Search / Settings) with safe-area padding
- Latest videos feed (xvideos home) + Best / New browsing
- Search with sort (relevance/views/rating/date) and quality filters
- Video details page with HLS player (when available) + recommendations
- Settings page that shows the live backend status and the active base URL

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
├── App.jsx              # routes + layout shell
├── main.jsx             # React entry
├── api/
│   ├── client.js        # fetch wrapper (reads VITE_API_BASE_URL)
│   └── streams.js       # xvideos / enkuddi / health endpoint helpers
├── hooks/
│   └── useFetch.js      # data-fetching hook
├── components/          # BottomNav, VideoCard, SearchBar, Spinner, ErrorState
├── pages/               # Home, Search, Browse, Video, Settings
├── styles/global.css    # theme tokens + layout
└── utils/format.js      # views/duration formatting
```
