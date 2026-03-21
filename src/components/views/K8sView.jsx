/**
 * K8sView — Manage ArgoCD applications and Kubernetes resources
 * for the beamline namespace.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useApp } from '../../context/AppContext.jsx';
import {
  buildBackendUrl, setBackendUrl, getBackendUrl, checkBackendHealth,
  listApplications, syncApplication, restartApplication,
  listPods, getPodLogs, deletePod,
  listServices, listConfigMaps, listDeployments, listStatefulSets,
  scaleDeployment,
} from '../../services/k8sApi.js';

const TABS = [
  { key: 'apps', label: '📦 Applications', icon: '📦' },
  { key: 'pods', label: '🐳 Pods', icon: '🐳' },
  { key: 'services', label: '🔌 Services', icon: '🔌' },
  { key: 'deployments', label: '🚀 Deployments', icon: '🚀' },
  { key: 'configmaps', label: '📋 ConfigMaps', icon: '📋' },
  { key: 'statefulsets', label: '💾 StatefulSets', icon: '💾' },
];

export default function K8sView() {
  const { token, isAuthenticated } = useAuth();
  const { config } = useApp();

  const [tab, setTab] = useState('apps');
  const [healthy, setHealthy] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionMsg, setActionMsg] = useState(null);

  // Pod logs
  const [logsOpen, setLogsOpen] = useState(null); // pod name
  const [logsText, setLogsText] = useState('');
  const [logsLoading, setLogsLoading] = useState(false);
  const logsRef = useRef(null);

  // Scale dialog
  const [scaleTarget, setScaleTarget] = useState(null);
  const [scaleReplicas, setScaleReplicas] = useState(1);

  /* ── Init backend URL ───────────────────── */
  useEffect(() => {
    if (!getBackendUrl() && config) {
      const url = buildBackendUrl(config);
      if (url) setBackendUrl(url);
    }
  }, [config]);

  useEffect(() => {
    checkBackendHealth().then(setHealthy);
  }, []);

  /* ── Data fetching ──────────────────────── */
  const fetchTab = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      let result;
      switch (tab) {
        case 'apps': result = await listApplications(token); break;
        case 'pods': result = await listPods(token); break;
        case 'services': result = await listServices(token); break;
        case 'deployments': result = await listDeployments(token); break;
        case 'configmaps': result = await listConfigMaps(token); break;
        case 'statefulsets': result = await listStatefulSets(token); break;
        default: return;
      }
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tab, token, isAuthenticated]);

  useEffect(() => {
    fetchTab();
  }, [fetchTab]);

  /* ── Actions ────────────────────────────── */
  const flash = (msg) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(null), 4000);
  };

  const handleSync = async (name) => {
    try {
      await syncApplication(name, token);
      flash(`Synced ${name}`);
      fetchTab();
    } catch (err) { flash(`Sync failed: ${err.message}`); }
  };

  const handleRestart = async (name) => {
    try {
      await restartApplication(name, token);
      flash(`Restarted ${name}`);
      fetchTab();
    } catch (err) { flash(`Restart failed: ${err.message}`); }
  };

  const handleDeletePod = async (podName) => {
    if (!window.confirm(`Delete pod ${podName}? It will be rescheduled.`)) return;
    try {
      await deletePod(podName, token);
      flash(`Deleted pod ${podName}`);
      fetchTab();
    } catch (err) { flash(`Delete failed: ${err.message}`); }
  };

  const handleScale = async () => {
    if (!scaleTarget) return;
    try {
      await scaleDeployment(scaleTarget, scaleReplicas, token);
      flash(`Scaled ${scaleTarget} to ${scaleReplicas}`);
      setScaleTarget(null);
      fetchTab();
    } catch (err) { flash(`Scale failed: ${err.message}`); }
  };

  const handleLogs = async (podName) => {
    setLogsOpen(podName);
    setLogsLoading(true);
    setLogsText('');
    try {
      const result = await getPodLogs(podName, token, { tailLines: 500 });
      setLogsText(typeof result === 'string' ? result : (result?.logs || JSON.stringify(result, null, 2)));
    } catch (err) {
      setLogsText(`Error fetching logs: ${err.message}`);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    if (logsRef.current) logsRef.current.scrollTop = logsRef.current.scrollHeight;
  }, [logsText]);

  /* ── Helpers ────────────────────────────── */
  const items = Array.isArray(data) ? data : (data?.items || []);

  const healthBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'healthy' || s === 'synced' || s === 'running') return 'k8s-badge--ok';
    if (s === 'degraded' || s === 'outofsync' || s === 'pending') return 'k8s-badge--warn';
    if (s === 'missing' || s === 'unknown' || s === 'failed' || s === 'error') return 'k8s-badge--err';
    return '';
  };

  /* ── Guard ──────────────────────────────── */
  if (!isAuthenticated) {
    return (
      <div className="k8s-view">
        <div className="tickets-empty">
          <div className="tickets-empty-icon">☸</div>
          <h3>Kubernetes</h3>
          <p>Authenticate with a PAT in Settings to manage cluster resources.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="k8s-view">
      {/* Header */}
      <div className="k8s-header">
        <h2>☸ Kubernetes — {config?.namespace || 'namespace'}</h2>
        <div className="k8s-header-right">
          <span className={`k8s-health ${healthy === true ? 'k8s-health--ok' : healthy === false ? 'k8s-health--err' : ''}`}>
            {healthy === true ? '● Backend OK' : healthy === false ? '○ Backend unreachable' : '… Checking'}
          </span>
          <button className="bl-btn bl-btn--sm" onClick={fetchTab}>↻ Refresh</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="k8s-tabs">
        {TABS.map(t => (
          <button key={t.key}
            className={`k8s-tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {actionMsg && <div className="bl-editor-flash bl-editor-flash--ok">{actionMsg}</div>}
      {error && <div className="bl-editor-flash bl-editor-flash--err">{error}</div>}

      {/* Tab content */}
      <div className="k8s-content">
        {loading ? (
          <div className="tickets-loading">⟳ Loading…</div>
        ) : tab === 'apps' ? (
          <AppsTable items={items} onSync={handleSync} onRestart={handleRestart} healthBadge={healthBadge} />
        ) : tab === 'pods' ? (
          <PodsTable items={items} onLogs={handleLogs} onDelete={handleDeletePod} healthBadge={healthBadge} />
        ) : tab === 'services' ? (
          <ResourceTable items={items} columns={['name', 'type', 'clusterIP', 'ports']} />
        ) : tab === 'deployments' ? (
          <DeploymentsTable items={items} onScale={(name, cur) => { setScaleTarget(name); setScaleReplicas(cur || 1); }} healthBadge={healthBadge} />
        ) : tab === 'configmaps' ? (
          <ResourceTable items={items} columns={['name', 'data']} />
        ) : tab === 'statefulsets' ? (
          <ResourceTable items={items} columns={['name', 'replicas', 'ready']} />
        ) : null}
      </div>

      {/* Logs drawer */}
      {logsOpen && (
        <div className="k8s-logs-drawer">
          <div className="k8s-logs-header">
            <span>📜 Logs — {logsOpen}</span>
            <button className="widget-btn" onClick={() => setLogsOpen(null)}>✕</button>
          </div>
          <pre className="k8s-logs-body" ref={logsRef}>
            {logsLoading ? '⟳ Loading logs…' : logsText || '(no output)'}
          </pre>
        </div>
      )}

      {/* Scale dialog */}
      {scaleTarget && (
        <div className="widget-modal-overlay" onClick={() => setScaleTarget(null)}>
          <div className="widget-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 360 }}>
            <div className="widget-modal-header">
              <span className="widget-title">Scale {scaleTarget}</span>
              <button className="widget-btn" onClick={() => setScaleTarget(null)}>✕</button>
            </div>
            <div className="widget-modal-body">
              <div className="bl-tpl-field">
                <label className="bl-tpl-field-label">Replicas</label>
                <input type="number" min={0} max={20} className="settings-input"
                  value={scaleReplicas} onChange={e => setScaleReplicas(Number(e.target.value))} />
              </div>
              <div className="bll-picker-actions">
                <button className="bl-btn bl-btn--sm" onClick={() => setScaleTarget(null)}>Cancel</button>
                <button className="bl-btn bl-btn--sm bl-btn--primary" onClick={handleScale}>Scale</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Sub-tables ─────────────────────────────────────────────────────────── */

function AppsTable({ items, onSync, onRestart, healthBadge }) {
  if (!items.length) return <div className="tickets-empty-list">No applications found.</div>;
  return (
    <table className="k8s-table">
      <thead>
        <tr><th>Name</th><th>Health</th><th>Sync</th><th>Repo</th><th>Actions</th></tr>
      </thead>
      <tbody>
        {items.map(app => {
          const name = app.metadata?.name || app.name || '?';
          const health = app.status?.health?.status || app.health || '';
          const sync = app.status?.sync?.status || app.sync || '';
          const repo = app.spec?.source?.repoURL || app.repo || '';
          return (
            <tr key={name}>
              <td className="k8s-cell-name">{name}</td>
              <td><span className={`k8s-badge ${healthBadge(health)}`}>{health}</span></td>
              <td><span className={`k8s-badge ${healthBadge(sync)}`}>{sync}</span></td>
              <td className="k8s-cell-url">{repo}</td>
              <td className="k8s-cell-actions">
                <button className="bl-btn bl-btn--xs" onClick={() => onSync(name)} title="Sync">🔄</button>
                <button className="bl-btn bl-btn--xs" onClick={() => onRestart(name)} title="Restart">♻</button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function PodsTable({ items, onLogs, onDelete, healthBadge }) {
  if (!items.length) return <div className="tickets-empty-list">No pods found.</div>;
  return (
    <table className="k8s-table">
      <thead>
        <tr><th>Pod</th><th>Status</th><th>Restarts</th><th>Age</th><th>Actions</th></tr>
      </thead>
      <tbody>
        {items.map(pod => {
          const name = pod.metadata?.name || pod.name || '?';
          const phase = pod.status?.phase || pod.phase || '';
          const restarts = pod.status?.containerStatuses?.[0]?.restartCount ?? pod.restarts ?? '';
          const started = pod.metadata?.creationTimestamp || pod.createdAt || '';
          return (
            <tr key={name}>
              <td className="k8s-cell-name">{name}</td>
              <td><span className={`k8s-badge ${healthBadge(phase)}`}>{phase}</span></td>
              <td>{restarts}</td>
              <td>{started ? new Date(started).toLocaleString() : ''}</td>
              <td className="k8s-cell-actions">
                <button className="bl-btn bl-btn--xs" onClick={() => onLogs(name)} title="View Logs">📜</button>
                <button className="bl-btn bl-btn--xs bl-btn--danger" onClick={() => onDelete(name)} title="Delete">🗑</button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function DeploymentsTable({ items, onScale, healthBadge }) {
  if (!items.length) return <div className="tickets-empty-list">No deployments found.</div>;
  return (
    <table className="k8s-table">
      <thead>
        <tr><th>Deployment</th><th>Replicas</th><th>Ready</th><th>Updated</th><th>Actions</th></tr>
      </thead>
      <tbody>
        {items.map(dep => {
          const name = dep.metadata?.name || dep.name || '?';
          const replicas = dep.status?.replicas ?? dep.spec?.replicas ?? dep.replicas ?? '';
          const ready = dep.status?.readyReplicas ?? dep.ready ?? '';
          const updated = dep.status?.updatedReplicas ?? '';
          return (
            <tr key={name}>
              <td className="k8s-cell-name">{name}</td>
              <td>{replicas}</td>
              <td><span className={`k8s-badge ${ready === replicas ? 'k8s-badge--ok' : 'k8s-badge--warn'}`}>{ready}/{replicas}</span></td>
              <td>{updated}</td>
              <td className="k8s-cell-actions">
                <button className="bl-btn bl-btn--xs" onClick={() => onScale(name, replicas)} title="Scale">⚖</button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function ResourceTable({ items, columns }) {
  if (!items.length) return <div className="tickets-empty-list">No resources found.</div>;
  const getVal = (item, col) => {
    // Try metadata.name first, then direct
    if (col === 'name') return item.metadata?.name || item.name || '';
    if (col === 'type') return item.spec?.type || item.type || '';
    if (col === 'clusterIP') return item.spec?.clusterIP || item.clusterIP || '';
    if (col === 'ports') {
      const ports = item.spec?.ports || item.ports || [];
      return ports.map(p => `${p.port}${p.targetPort ? ':' + p.targetPort : ''}/${p.protocol || 'TCP'}`).join(', ');
    }
    if (col === 'data') {
      const keys = Object.keys(item.data || item.metadata?.data || {});
      return keys.length ? keys.join(', ') : '—';
    }
    if (col === 'replicas') return item.status?.replicas ?? item.spec?.replicas ?? '';
    if (col === 'ready') return item.status?.readyReplicas ?? '';
    return item[col] ?? '';
  };

  return (
    <table className="k8s-table">
      <thead>
        <tr>{columns.map(c => <th key={c}>{c}</th>)}</tr>
      </thead>
      <tbody>
        {items.map((item, i) => (
          <tr key={getVal(item, 'name') || i}>
            {columns.map(c => <td key={c}>{getVal(item, c)}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
