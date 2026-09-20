import { health } from '../api/streams.js';
import { BACKEND_BASE_URL } from '../api/client.js';
import useFetch from '../hooks/useFetch.js';
import Spinner from '../components/Spinner.jsx';
import ErrorState from '../components/ErrorState.jsx';
import './SettingsPage.css';

export default function SettingsPage({ backendUrl = BACKEND_BASE_URL }) {
  const { data, loading, error, refetch } = useFetch(health, { deps: [] });

  return (
    <section className="settings">
      <header className="page-header">
        <h1 className="page-title">Settings</h1>
      </header>

      <div className="settings__card">
        <h2 className="settings__heading">Backend</h2>
        <p className="settings__desc">
          This is the base URL the frontend calls for all API requests. Configure it in
          <code className="settings__code"> .env.development </code> via
          <code className="settings__code"> VITE_API_BASE_URL</code>.
        </p>
        <div className="settings__row">
          <span className="settings__label">Active base URL</span>
          <code className="settings__value">{backendUrl}</code>
        </div>
        <div className="settings__row">
          <span className="settings__label">Backend status</span>
          {loading && <Spinner label="Checking…" />}
          {error && (
            <div className="settings__status settings__status--down">
              <span className="settings__dot" /> Unreachable — start the API server
            </div>
          )}
          {data && (
            <div className="settings__status settings__status--ok">
              <span className="settings__dot" /> Live · service: {data.service || 'StreamX API'}
            </div>
          )}
        </div>
        {error ? (
          <button className="settings__retry" onClick={refetch}>
            Retry health check
          </button>
        ) : null}
      </div>
    </section>
  );
}
