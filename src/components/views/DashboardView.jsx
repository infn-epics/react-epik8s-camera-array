import { useState, useCallback, useMemo } from 'react';
import { useDashboard } from '../../context/DashboardContext.jsx';
import { useApp } from '../../context/AppContext.jsx';
import DashboardGrid from '../../components/layout/DashboardGrid.jsx';
import WidgetFrame from '../../widgets/WidgetFrame.jsx';
import WidgetConfigPanel from '../../widgets/WidgetConfigPanel.jsx';
import WidgetPicker from '../../widgets/WidgetPicker.jsx';
import { getWidgetComponent } from '../../widgets/registry.js';
import { exportDashboard, importDashboard } from '../../services/dashboardStorage.js';

/**
 * DashboardView — main dashboard editor/viewer.
 * Renders the active dashboard with drag/drop widgets,
 * add widget picker, configuration panel, and export/import.
 */
export default function DashboardView() {
  const {
    activeDashboard,
    editMode, setEditMode,
    addWidget, updateWidgetConfig, removeWidget, updateLayout,
    updateDashboard, refreshList,
  } = useDashboard();
  const { pvwsClient, devices } = useApp();

  const [showPicker, setShowPicker] = useState(false);
  const [configWidget, setConfigWidget] = useState(null);
  const [renaming, setRenaming] = useState(false);
  const [nameInput, setNameInput] = useState('');

  const layout = useMemo(() => {
    if (!activeDashboard) return [];
    return activeDashboard.widgets.map((w) => ({
      i: w.id,
      x: w.layout.x,
      y: w.layout.y,
      w: w.layout.w,
      h: w.layout.h,
      minW: w.layout.minW || 2,
      minH: w.layout.minH || 2,
    }));
  }, [activeDashboard]);

  const handleLayoutChange = useCallback((newLayout) => {
    updateLayout(newLayout);
  }, [updateLayout]);

  const handleAddWidget = useCallback((type, config) => {
    addWidget(type, config);
  }, [addWidget]);

  const handleConfigSave = useCallback((widgetId, newConfig) => {
    updateWidgetConfig(widgetId, newConfig);
  }, [updateWidgetConfig]);

  const handleExport = () => {
    if (activeDashboard) exportDashboard(activeDashboard);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const dash = await importDashboard(file);
        updateDashboard(dash);
        refreshList();
      } catch (err) {
        alert(`Import failed: ${err.message}`);
      }
    };
    input.click();
  };

  const startRename = () => {
    setNameInput(activeDashboard?.name || '');
    setRenaming(true);
  };

  const confirmRename = () => {
    if (nameInput.trim() && activeDashboard) {
      updateDashboard({ ...activeDashboard, name: nameInput.trim() });
    }
    setRenaming(false);
  };

  if (!activeDashboard) {
    return (
      <div className="view-empty dashboard-empty">
        <div className="empty-icon">📊</div>
        <h2>No Dashboard Selected</h2>
        <p>Select or create a dashboard from the sidebar.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-view">
      {/* Dashboard toolbar */}
      <div className="view-toolbar">
        <div className="dashboard-title-area">
          {renaming ? (
            <input
              className="dashboard-name-input"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') confirmRename(); if (e.key === 'Escape') setRenaming(false); }}
              onBlur={confirmRename}
              autoFocus
            />
          ) : (
            <span className="view-toolbar-title" onDoubleClick={startRename}>
              {activeDashboard.name}
            </span>
          )}
          {activeDashboard.description && (
            <span className="dashboard-description">{activeDashboard.description}</span>
          )}
        </div>

        <div className="toolbar-controls">
          <button className="toolbar-btn toolbar-btn--accent" onClick={() => setShowPicker(true)}>
            + Add Widget
          </button>
          <button
            className={`toolbar-btn ${editMode ? 'active' : ''}`}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? '🔒 Lock' : '🔓 Edit'}
          </button>
          <button className="toolbar-btn" onClick={handleExport} title="Export dashboard JSON">
            ⬇ Export
          </button>
          <button className="toolbar-btn" onClick={handleImport} title="Import dashboard JSON">
            ⬆ Import
          </button>
          <span className="toolbar-divider" />
          <span className="widget-count">{activeDashboard.widgets.length} widgets</span>
        </div>
      </div>

      {/* Widget grid */}
      <div className="view-content">
        {activeDashboard.widgets.length === 0 ? (
          <div className="view-empty">
            <p>This dashboard is empty. Click <strong>+ Add Widget</strong> to get started.</p>
          </div>
        ) : (
          <DashboardGrid
            layout={layout}
            onLayoutChange={handleLayoutChange}
            isDraggable={editMode}
            isResizable={editMode}
          >
            {activeDashboard.widgets.map((widget) => {
              const Component = getWidgetComponent(widget.type);
              return (
                <div key={widget.id}>
                  <WidgetFrame
                    widget={widget}
                    editMode={editMode}
                    client={pvwsClient}
                    onRemove={removeWidget}
                    onConfigure={setConfigWidget}
                    onUpdateConfig={handleConfigSave}
                  >
                    <Component
                      config={widget.config}
                      client={pvwsClient}
                    />
                  </WidgetFrame>
                </div>
              );
            })}
          </DashboardGrid>
        )}
      </div>

      {/* Widget Picker */}
      {showPicker && (
        <WidgetPicker
          onAdd={handleAddWidget}
          onClose={() => setShowPicker(false)}
          devices={devices}
        />
      )}

      {/* Config Panel */}
      {configWidget && (
        <WidgetConfigPanel
          widget={configWidget}
          onSave={handleConfigSave}
          onClose={() => setConfigWidget(null)}
        />
      )}
    </div>
  );
}
