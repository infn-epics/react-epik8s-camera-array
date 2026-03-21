import { useState, useCallback } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import DashboardGrid from '../layout/DashboardGrid.jsx';
import { useLayout } from '../../hooks/useLayout.js';
import { getWidgetComponent as getWidgetComp, familyToWidgetType } from '../../widgets/registry.js';
import { widgetSizeMap } from '../../widgets/registry.js';
import WidgetFrame from '../../widgets/WidgetFrame.jsx';
import { deviceToWidgetConfig } from '../../models/dashboard.js';
import SearchFilter from '../common/SearchFilter.jsx';
import RoleGuard from '../common/RoleGuard.jsx';

/**
 * InstrumentationView - Filterable/groupable device dashboard.
 * Uses the new widget system from src/widgets/.
 */
export default function InstrumentationView() {
  const { devices, pvwsClient } = useApp();
  const [filtered, setFiltered] = useState(devices);
  const [hiddenIds, setHiddenIds] = useState(new Set());
  const [editMode, setEditMode] = useState(false);

  const visibleDevices = filtered.filter((d) => !hiddenIds.has(d.id));
  const { layout, onLayoutChange, resetLayout } = useLayout(
    'instrumentation',
    'all',
    visibleDevices,
    12,
  );

  const handleFilter = useCallback((result) => {
    setFiltered(result);
  }, []);

  const hideWidget = (id) => {
    setHiddenIds((prev) => new Set(prev).add(id));
  };

  const showAll = () => setHiddenIds(new Set());

  return (
    <div className="instrumentation-view">
      <div className="view-toolbar">
        <span className="view-toolbar-title">Instrumentation</span>
        <div className="toolbar-controls">
          <SearchFilter devices={devices} onFilter={handleFilter} />
          <RoleGuard require="operator">
            <button
              className={`toolbar-btn ${editMode ? 'active' : ''}`}
              onClick={() => setEditMode((e) => !e)}
            >
              {editMode ? '🔒 Lock' : '🔓 Edit'}
            </button>
          </RoleGuard>
          <button className="toolbar-btn" onClick={resetLayout} title="Reset to auto layout">
            ↻ Reset
          </button>
          {hiddenIds.size > 0 && (
            <button className="toolbar-btn" onClick={showAll}>
              Show all ({hiddenIds.size} hidden)
            </button>
          )}
        </div>
      </div>

      <div className="view-content">
        {visibleDevices.length === 0 ? (
          <div className="view-empty">
            <p>No devices match the current filter.</p>
          </div>
        ) : (
          <DashboardGrid
            layout={layout}
            onLayoutChange={onLayoutChange}
            isDraggable={editMode}
            isResizable={editMode}
          >
            {visibleDevices.map((device) => {
              const widgetType = familyToWidgetType(device.family);
              const Component = getWidgetComp(widgetType);
              const config = deviceToWidgetConfig(device);
              const widget = { id: device.id, type: widgetType, config };
              return (
                <div key={device.id}>
                  <WidgetFrame
                    widget={widget}
                    editMode={editMode}
                    client={pvwsClient}
                    onRemove={() => hideWidget(device.id)}
                  >
                    <Component
                      config={config}
                      client={pvwsClient}
                    />
                  </WidgetFrame>
                </div>
              );
            })}
          </DashboardGrid>
        )}
      </div>
    </div>
  );
}
