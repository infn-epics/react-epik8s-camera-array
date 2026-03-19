/**
 * Layout persistence using localStorage.
 *
 * Layouts are stored per view + zone/filter key.
 * Key format: "epik8s-layout:<view>:<scope>"
 *
 * Named presets are stored separately:
 * Key format: "epik8s-presets:<view>"  →  { name: layout[] }
 */

const STORAGE_PREFIX = 'epik8s-layout';
const PRESETS_PREFIX = 'epik8s-presets';

function makeKey(view, scope = 'default') {
  return `${STORAGE_PREFIX}:${view}:${scope}`;
}

function presetsKey(view) {
  return `${PRESETS_PREFIX}:${view}`;
}

/**
 * Save layout to localStorage.
 * @param {string} view - View name (camera, instrumentation, beamline)
 * @param {string} scope - Zone or filter context
 * @param {Array} layout - react-grid-layout layout array
 */
export function saveLayout(view, scope, layout) {
  try {
    const key = makeKey(view, scope);
    localStorage.setItem(key, JSON.stringify(layout));
  } catch {
    // quota exceeded or private browsing — silently ignore
  }
}

/**
 * Load layout from localStorage.
 * @returns {Array|null} Layout array or null if not found
 */
export function loadLayout(view, scope) {
  try {
    const key = makeKey(view, scope);
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

/**
 * Remove a saved layout.
 */
export function clearLayout(view, scope) {
  try {
    const key = makeKey(view, scope);
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

/**
 * Generate automatic layout for a list of devices.
 * Places widgets in a grid, respecting column count.
 * @param {Array} devices - Device objects with id
 * @param {number} cols - Grid columns (default 12)
 * @param {Object} sizeMap - Map of device family to {w, h} defaults
 * @returns {Array} react-grid-layout compatible layout
 */
export function generateAutoLayout(devices, cols = 12, sizeMap = {}) {
  const defaultSize = { w: 3, h: 4 };
  const layout = [];
  let x = 0;
  let y = 0;
  let rowHeight = 0;

  for (const dev of devices) {
    const size = sizeMap[dev.family] || sizeMap[dev.type] || defaultSize;
    const w = Math.min(size.w, cols);
    const h = size.h;

    // Wrap to next row if doesn't fit
    if (x + w > cols) {
      x = 0;
      y += rowHeight;
      rowHeight = 0;
    }

    layout.push({
      i: dev.id,
      x,
      y,
      w,
      h,
      minW: 2,
      minH: 2,
    });

    x += w;
    rowHeight = Math.max(rowHeight, h);
  }

  return layout;
}

/* ===== Named layout presets ===== */

/**
 * Get all saved preset names for a view.
 * @returns {string[]} Sorted preset names
 */
export function listPresets(view) {
  try {
    const data = localStorage.getItem(presetsKey(view));
    return data ? Object.keys(JSON.parse(data)).sort() : [];
  } catch {
    return [];
  }
}

/**
 * Save the current layout as a named preset.
 */
export function savePreset(view, name, layout) {
  try {
    const key = presetsKey(view);
    const existing = JSON.parse(localStorage.getItem(key) || '{}');
    existing[name] = layout;
    localStorage.setItem(key, JSON.stringify(existing));
  } catch {
    // storage full
  }
}

/**
 * Load a named preset layout.
 * @returns {Array|null}
 */
export function loadPreset(view, name) {
  try {
    const key = presetsKey(view);
    const existing = JSON.parse(localStorage.getItem(key) || '{}');
    return existing[name] || null;
  } catch {
    return null;
  }
}

/**
 * Delete a named preset.
 */
export function deletePreset(view, name) {
  try {
    const key = presetsKey(view);
    const existing = JSON.parse(localStorage.getItem(key) || '{}');
    delete existing[name];
    localStorage.setItem(key, JSON.stringify(existing));
  } catch {
    // ignore
  }
}

/**
 * Rename a preset.
 */
export function renamePreset(view, oldName, newName) {
  try {
    const key = presetsKey(view);
    const existing = JSON.parse(localStorage.getItem(key) || '{}');
    if (existing[oldName]) {
      existing[newName] = existing[oldName];
      delete existing[oldName];
      localStorage.setItem(key, JSON.stringify(existing));
    }
  } catch {
    // ignore
  }
}
