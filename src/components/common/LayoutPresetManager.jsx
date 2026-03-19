import { useState, useEffect, useRef } from 'react';
import {
  listPresets,
  savePreset,
  loadPreset,
  deletePreset,
  renamePreset,
} from '../../services/layoutPersistence.js';

/**
 * LayoutPresetManager - Dropdown UI for saving, loading, renaming, and deleting
 * named layout presets. Appears as a toolbar button that opens a popover.
 *
 * Props:
 *  - viewName: view identifier (e.g. 'instrumentation')
 *  - currentLayout: the current layout array to save
 *  - onApply: callback(layout) to apply a loaded preset
 */
export default function LayoutPresetManager({ viewName, currentLayout, onApply }) {
  const [open, setOpen] = useState(false);
  const [presets, setPresets] = useState([]);
  const [newName, setNewName] = useState('');
  const [renamingIdx, setRenamingIdx] = useState(-1);
  const [renameValue, setRenameValue] = useState('');
  const popoverRef = useRef(null);

  // Refresh preset list when opening
  useEffect(() => {
    if (open) {
      setPresets(listPresets(viewName));
    }
  }, [open, viewName]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setOpen(false);
        setRenamingIdx(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleSave = () => {
    const name = newName.trim();
    if (!name || !currentLayout) return;
    savePreset(viewName, name, currentLayout);
    setNewName('');
    setPresets(listPresets(viewName));
  };

  const handleLoad = (name) => {
    const layout = loadPreset(viewName, name);
    if (layout && onApply) {
      onApply(layout);
      setOpen(false);
    }
  };

  const handleDelete = (name) => {
    deletePreset(viewName, name);
    setPresets(listPresets(viewName));
  };

  const handleRenameStart = (idx, name) => {
    setRenamingIdx(idx);
    setRenameValue(name);
  };

  const handleRenameConfirm = (oldName) => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== oldName) {
      renamePreset(viewName, oldName, trimmed);
      setPresets(listPresets(viewName));
    }
    setRenamingIdx(-1);
    setRenameValue('');
  };

  return (
    <div className="preset-manager" ref={popoverRef}>
      <button
        className={`toolbar-btn ${open ? 'active' : ''}`}
        onClick={() => setOpen((o) => !o)}
        title="Layout presets"
      >
        💾 Layouts
      </button>

      {open && (
        <div className="preset-popover">
          <div className="preset-header">Layout Presets</div>

          {/* Save new */}
          <div className="preset-save-row">
            <input
              type="text"
              className="preset-input"
              placeholder="Preset name…"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              maxLength={40}
            />
            <button
              className="preset-btn preset-btn--save"
              onClick={handleSave}
              disabled={!newName.trim()}
              title="Save current layout"
            >
              Save
            </button>
          </div>

          {/* Preset list */}
          {presets.length === 0 ? (
            <div className="preset-empty">No saved presets</div>
          ) : (
            <ul className="preset-list">
              {presets.map((name, idx) => (
                <li key={name} className="preset-item">
                  {renamingIdx === idx ? (
                    <input
                      type="text"
                      className="preset-input preset-rename-input"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRenameConfirm(name);
                        if (e.key === 'Escape') setRenamingIdx(-1);
                      }}
                      onBlur={() => handleRenameConfirm(name)}
                      autoFocus
                      maxLength={40}
                    />
                  ) : (
                    <>
                      <span
                        className="preset-name"
                        onClick={() => handleLoad(name)}
                        title={`Load "${name}"`}
                      >
                        {name}
                      </span>
                      <div className="preset-actions">
                        <button
                          className="preset-btn preset-btn--icon"
                          onClick={() => handleRenameStart(idx, name)}
                          title="Rename"
                        >
                          ✏
                        </button>
                        <button
                          className="preset-btn preset-btn--icon preset-btn--danger"
                          onClick={() => handleDelete(name)}
                          title="Delete"
                        >
                          ✕
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
