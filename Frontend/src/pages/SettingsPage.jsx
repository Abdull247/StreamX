import { useState, useEffect } from 'react';
import { fetchProviders, getDefaultProviderId, setDefaultProviderId } from '../utils/providers.js';
import { cacheClear } from '../utils/cache.js';
import './SettingsPage.css';

export default function SettingsPage({ backendUrl }) {
  const [providers, setProviders] = useState([]);
  const [selected, setSelected] = useState(() => getDefaultProviderId());
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [cleared, setCleared] = useState(false);
  const [health, setHealth] = useState(null);

  // Load provider list
  useEffect(() => {
    let mounted = true;
    fetchProviders()
      .then((list) => {
        if (mounted) {
          setProviders(list);
          setLoadingProviders(false);
        }
      })
      .catch(() => {
        if (mounted) setLoadingProviders(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Backend health
  useEffect(() => {
    let mounted = true;
    fetch(`${backendUrl}/api/health`)
      .then((r) => (r.ok ? r.json() : null))
      .then((h) => h && mounted && setHealth(h))
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [backendUrl]);

  const changeProvider = (id) => {
    setSelected(setDefaultProviderId(id));
  };

  const clearCache = () => {
    cacheClear();
    setCleared(true);
    setTimeout(() => setCleared(false), 2000);
  };

  return (
    <section className="settings">
      <header className="page-header">
        <h1 className="page-title">Settings</h1>
      </header>

      <div className="setting-card">
        <h3>Default provider</h3>
        <p className="muted">
          The whole app (Home, Browse, Search, Details) will use this source for its endpoints.
        </p>

        {loadingProviders ? (
          <p className="muted">Loading providers…</p>
        ) : providers.length ? (
          <div className="provider-options">
            {providers.map((p) => (
              <label key={p.id} className={'provider-option' + (selected === p.id ? ' is-active' : '')}>
                <input
                  type="radio"
                  name="provider"
                  value={p.id}
                  checked={selected === p.id}
                  onChange={() => changeProvider(p.id)}
                />
                <span className="provider-option__name">{p.name}</span>
                <span className="provider-option__label">{p.label}</span>
              </label>
            ))}
          </div>
        ) : (
          <p className="muted">Couldn’t load providers from the backend.</p>
        )}
      </div>

      <div className="setting-card">
        <h3>Cache</h3>
        <p className="muted">
          Cached listings and details avoid refetching when navigating between pages.
        </p>
        <button className="btn btn--ghost" onClick={clearCache}>
          {cleared ? 'Cache cleared ✓' : 'Clear cache'}
        </button>
      </div>

      <div className="setting-card">
        <h3>About</h3>
        <p className="muted">API base URL: <code>{backendUrl}</code></p>
        {health ? (
          <p className="muted">
            Backend: <span className="ok">{health.status}</span> · {health.service}
          </p>
        ) : (
          <p className="muted">Backend: <span className="bad">unreachable</span></p>
        )}
      </div>
    </section>
  );
}
