// App shell: routes + layout with sticky bottom navigation.
import { Routes, Route, useLocation } from 'react-router-dom';
import BottomNav from './components/BottomNav.jsx';
import HomePage from './pages/HomePage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import BrowsePage from './pages/BrowsePage.jsx';
import VideoPage from './pages/VideoPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import { BACKEND_BASE_URL } from './api/client.js';

export default function App() {
  const location = useLocation();
  const showNav = !location.pathname.startsWith('/video/');

  const handleSearch = (q) => {
    if (q && q.trim()) window.location.hash = `#/search?q=${encodeURIComponent(q.trim())}`;
  };

  return (
    <div className="app-shell">
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage onSearch={handleSearch} />} />
          <Route path="/search" element={<SearchPage onSearch={handleSearch} />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/video/:link" element={<VideoPage />} />
          <Route path="/settings" element={<SettingsPage backendUrl={BACKEND_BASE_URL} />} />
          <Route path="*" element={<HomePage onSearch={handleSearch} />} />
        </Routes>
      </main>
      {showNav && <BottomNav />}
    </div>
  );
}
