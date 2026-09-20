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
    setTimeout(() => setCleared(false), 2500);
  };

  return (
    <section className="settings">
      <header className="page-header">
        <h1 className="page-title">Settings</h1>
      </header>

      <div className="settings__card">
        <h3 className="settings__heading">Default provider</h3>
        <p className="settings__desc">
          The whole app (Home, Browse, Search, Details) will use this source.
        </p>

        {loadingProviders ? (
          <p className="settings__desc">Loading providers…</p>
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
          <p className="settings__desc">Couldn’t load providers from the backend.</p>
        )}
      </div>

      <div className="settings__card">
        <h3 className="settings__heading">Cache</h3>
        <p className="settings__desc">
          Cached listings and details avoid refetching when navigating between pages.
        </p>
        <button className="settings__retry" onClick={clearCache}>
          {cleared ? 'Cache cleared ✓' : 'Clear cache'}
        </button>
      </div>

      <div className="settings__card">
        <h3 className="settings__heading">About</h3>
        <div className="settings__row">
          <span className="settings__label">API base URL</span>
          <span className="settings__value">{backendUrl}</span>
        </div>
        <div className="settings__row">
          <span className="settings__label">Backend status</span>
          <span className={'settings__status ' + (health ? 'settings__status--ok' : 'settings__status--down')}>
            <span className="settings__dot" />
            {health ? health.status : 'offline'}
          </span>
        </div>
      </div>
    </section>
  );
}
