// App shell: routes + layout with sticky bottom navigation.
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import BottomNav from './components/BottomNav.jsx';
import HomePage from './pages/HomePage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import BrowsePage from './pages/BrowsePage.jsx';
import VideoPage from './pages/VideoPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import { BACKEND_BASE_URL } from './api/client.js';

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const showNav = !location.pathname.startsWith('/video/');

  const handleSearch = (q) => {
    if (q && q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  const goToVideo = (item) => {
    const link = item?.link || item?.url;
    if (link) navigate(`/video/${encodeURIComponent(link)}`);
  };

  return (
    <div className="app-shell">
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage onSearch={handleSearch} onOpenVideo={goToVideo} />} />
          <Route path="/search" element={<SearchPage onOpenVideo={goToVideo} />} />
          <Route path="/browse" element={<BrowsePage onOpenVideo={goToVideo} />} />
          <Route path="/video/:link" element={<VideoPage />} />
          <Route path="/settings" element={<SettingsPage backendUrl={BACKEND_BASE_URL} />} />
          <Route path="*" element={<HomePage onSearch={handleSearch} onOpenVideo={goToVideo} />} />
        </Routes>
      </main>
      {showNav && <BottomNav />}
    </div>
  );
}
