import { useState, forwardRef, cloneElement, Children } from 'react';
import { getWidgetType } from './registry.js';
import { usePv } from '../hooks/usePv.js';

/**
 * WidgetFrame — container for every widget in the dashboard grid.
 *
 * Provides: drag handle, essential/detail toggle (device widgets)
 * or collapse/expand (non-device), detail modal, hide,
 * configure panel toggle, connection LED, alarm border.
 */
const WidgetFrame = forwardRef(function WidgetFrame(
  { widget, editMode, onRemove, onConfigure, onUpdateConfig, client, children, className, style, ...rest },
  ref,
) {
  const [collapsed, setCollapsed] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [localViewMode, setLocalViewMode] = useState(widget.config?.viewMode || 'essential');

  const typeDef = getWidgetType(widget.type);
  const title = widget.config?.title || typeDef?.name || widget.type;
  const subtitle = widget.config?.subtitle || '';
  const icon = typeDef?.icon || '🔧';

  // Does this widget type support essential/detail viewMode?
  const hasViewMode = typeDef?.properties?.some(p => p.key === 'viewMode');
  const currentMode = onUpdateConfig
    ? (widget.config?.viewMode || 'essential')
    : localViewMode;

  const toggleViewMode = () => {
    const newMode = currentMode === 'essential' ? 'detail' : 'essential';
    if (onUpdateConfig) {
      onUpdateConfig(widget.id, { ...widget.config, viewMode: newMode });
    } else {
      setLocalViewMode(newMode);
    }
  };

  // Build effective config with current viewMode
  const effectiveConfig = hasViewMode
    ? { ...widget.config, viewMode: currentMode }
    : widget.config;

  // Determine the connection PV to monitor
  const connectionPv = getConnectionPv(widget, typeDef);
  const pvMsg = usePv(client, connectionPv);

  // Connection state: null = no PV, 'connected' | 'disconnected'
  const hasPv = !!connectionPv;
  const isConnected = hasPv && pvMsg != null;
  const severity = pvMsg?.severity || 'NONE';

  // Alarm border class
  const alarmClass =
    severity === 'MAJOR' ? 'widget--alarm-major' :
    severity === 'MINOR' ? 'widget--alarm-minor' :
    severity === 'INVALID' ? 'widget--alarm-invalid' : '';

  // LED color
  const ledClass = !hasPv ? '' :
    isConnected ? 'widget-led--connected' : 'widget-led--disconnected';

  return (
    <div
      ref={ref}
      className={`widget ${alarmClass} ${collapsed ? 'widget--collapsed' : ''} ${className || ''}`}
      style={style}
      {...rest}
    >
      {/* Header with drag handle */}
      <div className="widget-header widget-drag-handle">
        <div className="widget-title-area">
          {hasPv && <span className={`widget-led ${ledClass}`} title={isConnected ? `Connected (${connectionPv})` : `Disconnected (${connectionPv})`} />}
          <span className="widget-icon">{icon}</span>
          <span className="widget-title">{title}</span>
          {subtitle && <span className="widget-subtitle">{subtitle}</span>}
        </div>
        <div className="widget-actions">
          {editMode && onConfigure && (
            <button className="widget-btn" onClick={() => onConfigure(widget)} title="Configure">
              ⚙
            </button>
          )}
          <button
            className="widget-btn"
            onClick={() => setShowDetail(true)}
            title="Detail view"
          >
            ⤢
          </button>
          {hasViewMode ? (
            <button
              className={`widget-btn ${currentMode === 'detail' ? 'widget-btn--active' : ''}`}
              onClick={toggleViewMode}
              title={currentMode === 'essential' ? 'Switch to Detail' : 'Switch to Essential'}
            >
              {currentMode === 'essential' ? '◫' : '☰'}
            </button>
          ) : (
            <button
              className="widget-btn"
              onClick={() => setCollapsed((c) => !c)}
              title={collapsed ? 'Expand' : 'Collapse'}
            >
              {collapsed ? '▼' : '▲'}
            </button>
          )}
          {editMode && onRemove && (
            <button className="widget-btn widget-btn--danger" onClick={() => onRemove(widget.id)} title="Remove">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      {!collapsed && (
        <div className="widget-body">
          {Children.map(children, (child) =>
            child && typeof child === 'object'
              ? cloneElement(child, { config: effectiveConfig })
              : child
          )}
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && (
        <div className="widget-modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="widget-modal" onClick={(e) => e.stopPropagation()}>
            <div className="widget-modal-header">
              <span className="widget-title">{icon} {title}</span>
              <button className="widget-btn" onClick={() => setShowDetail(false)}>✕</button>
            </div>
            <div className="widget-modal-body">
              {Children.map(children, (child) =>
                child && typeof child === 'object'
                  ? cloneElement(child, { config: { ...effectiveConfig, viewMode: 'detail' } })
                  : child
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

/**
 * Determine the PV to monitor for connection status.
 * - Single-PV widgets: use config.pv_name
 * - Device widgets: use pvPrefix + typeDef.connectionSuffix
 * - No PV configured: return null
 */
function getConnectionPv(widget, typeDef) {
  const cfg = widget.config || {};
  // Single PV widgets (pv_name)
  if (cfg.pv_name) return cfg.pv_name;
  // Device widgets (pvPrefix + suffix)
  if (cfg.pvPrefix) {
    const suffix = typeDef?.connectionSuffix ?? '';
    return cfg.pvPrefix + suffix;
  }
  return null;
}

export default WidgetFrame;
