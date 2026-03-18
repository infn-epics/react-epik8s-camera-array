import { useState, useEffect, useRef } from 'react';
import CameraGrid from './components/CameraGrid';
import ConnectionStatus from './components/ConnectionStatus';
import { loadCamerasFromConfig } from './services/configLoader';
import PvwsClient from './services/pvws';
import { usePvwsStatus } from './hooks/usePv';

const DEFAULT_ROWS = 3;
const DEFAULT_COLS = 3;

function getInitialParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    rows: parseInt(params.get('rows'), 10) || DEFAULT_ROWS,
    cols: parseInt(params.get('cols'), 10) || DEFAULT_COLS,
    pvwsUrl: params.get('pvws') || `ws://${window.location.hostname}/pvws/pv`,
    valuesPath: params.get('values') || '/values.yaml',
  };
}

export default function App() {
  const initial = useRef(getInitialParams());
  const [rows, setRows] = useState(initial.current.rows);
  const [cols, setCols] = useState(initial.current.cols);
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // PVWS client — single instance
  const clientRef = useRef(null);
  if (!clientRef.current) {
    clientRef.current = new PvwsClient(initial.current.pvwsUrl);
  }
  const client = clientRef.current;
  const connected = usePvwsStatus(client);

  // Connect on mount
  useEffect(() => {
    client.connect();
    return () => client.disconnect();
  }, [client]);

  // Load config
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadCamerasFromConfig(initial.current.valuesPath)
      .then(({ cameras: cams }) => {
        if (!cancelled) {
          setCameras(cams);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner" />
        <p>Loading camera configuration…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-error">
        <h2>Configuration Error</h2>
        <p>{error}</p>
        <p>
          Make sure <code>values.yaml</code> is available in the public folder
          or specify <code>?values=/path/to/values.yaml</code>.
        </p>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Top bar */}
      <header className="app-header">
        <h1>EPIK8s Camera Array</h1>

        <div className="header-controls">
          <ConnectionStatus connected={connected} />

          <button
            className="settings-btn"
            onClick={() => setSettingsOpen((o) => !o)}
          >
            ⚙ Grid
          </button>

          {settingsOpen && (
            <div className="settings-panel">
              <label>
                Rows
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={rows}
                  onChange={(e) => setRows(Math.max(1, Math.min(10, +e.target.value)))}
                />
              </label>
              <label>
                Cols
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={cols}
                  onChange={(e) => setCols(Math.max(1, Math.min(10, +e.target.value)))}
                />
              </label>
              <span className="cam-count">{cameras.length} camera(s) detected</span>
            </div>
          )}
        </div>
      </header>

      {/* Grid */}
      <main className="app-main">
        {cameras.length === 0 ? (
          <div className="no-cameras">
            <p>No cameras with <code>stream_enable: true</code> found in configuration.</p>
          </div>
        ) : (
          <CameraGrid rows={rows} cols={cols} cameras={cameras} client={client} />
        )}
      </main>
    </div>
  );
}
