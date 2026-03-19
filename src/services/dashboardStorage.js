/**
 * Dashboard persistence — localStorage + JSON export/import.
 *
 * Stores dashboards under "epik8s-dashboards" key.
 * Each dashboard is a full JSON object with widgets and layout.
 */

const STORAGE_KEY = 'epik8s-dashboards';
const ACTIVE_KEY = 'epik8s-active-dashboard';

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAll(dashboards) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dashboards));
  } catch {
    console.warn('[DashboardStorage] Storage full');
  }
}

/** Get all dashboards as an array, sorted by updatedAt desc. */
export function listDashboards() {
  const all = readAll();
  return Object.values(all).sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
  );
}

/** Get a single dashboard by id. */
export function getDashboard(id) {
  return readAll()[id] || null;
}

/** Save (create or update) a dashboard. */
export function saveDashboard(dashboard) {
  const all = readAll();
  all[dashboard.id] = { ...dashboard, updatedAt: new Date().toISOString() };
  writeAll(all);
}

/** Delete a dashboard. */
export function deleteDashboard(id) {
  const all = readAll();
  delete all[id];
  writeAll(all);
  // Clear active if deleted
  if (getActiveDashboardId() === id) {
    setActiveDashboardId(null);
  }
}

/** Get the active (last-viewed) dashboard id. */
export function getActiveDashboardId() {
  try {
    return localStorage.getItem(ACTIVE_KEY) || null;
  } catch {
    return null;
  }
}

/** Set the active dashboard id. */
export function setActiveDashboardId(id) {
  try {
    if (id) localStorage.setItem(ACTIVE_KEY, id);
    else localStorage.removeItem(ACTIVE_KEY);
  } catch { /* ignore */ }
}

/**
 * Export a dashboard as a downloadable JSON file.
 */
export function exportDashboard(dashboard) {
  const json = JSON.stringify(dashboard, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${dashboard.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Import a dashboard from a JSON file.
 * Returns the parsed dashboard object (caller should save it).
 * @param {File} file
 * @returns {Promise<Object>}
 */
export function importDashboard(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data.id || !data.name || !Array.isArray(data.widgets)) {
          reject(new Error('Invalid dashboard JSON: missing id, name, or widgets'));
          return;
        }
        resolve(data);
      } catch (e) {
        reject(new Error(`Failed to parse JSON: ${e.message}`));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Export all dashboards as a single JSON file.
 */
export function exportAllDashboards() {
  const all = listDashboards();
  const json = JSON.stringify(all, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'epik8s-dashboards.json';
  a.click();
  URL.revokeObjectURL(url);
}
