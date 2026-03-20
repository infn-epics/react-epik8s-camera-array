/**
 * BeamlineLayout — Graphical beamline layout editor using React Flow.
 *
 * Features:
 *  - Device nodes with SVG glyphs
 *  - Connections (edges) between devices
 *  - Drag/drop, pan, zoom
 *  - Device palette for adding elements
 *  - Element palette for non-device beamline elements
 *  - Layout save/load (JSON, localStorage)
 *  - Real-time PV status coloring
 *  - Click → open widget detail
 */
import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useApp } from '../../context/AppContext.jsx';
import { getGlyph, GLYPH_TYPES, STATUS_COLORS } from '../glyphs/DeviceGlyphs.jsx';
import { usePv } from '../../hooks/usePv.js';
import { groupDevicesBy } from '../../models/device.js';
import { familyToWidgetType, getWidgetComponent } from '../../widgets/registry.js';
import { deviceToWidgetConfig } from '../../models/dashboard.js';
import WidgetFrame from '../../widgets/WidgetFrame.jsx';

// ─── Layout persistence ─────────────────────────────────────────────────
const LS_LAYOUT_KEY = 'epik8s-beamline-layout';

function loadLayout(beamline, zone) {
  try {
    const all = JSON.parse(localStorage.getItem(LS_LAYOUT_KEY) || '{}');
    const key = `${beamline}:${zone || 'all'}`;
    return all[key] || null;
  } catch { return null; }
}

function saveLayout(beamline, zone, data) {
  try {
    const all = JSON.parse(localStorage.getItem(LS_LAYOUT_KEY) || '{}');
    const key = `${beamline}:${zone || 'all'}`;
    all[key] = data;
    localStorage.setItem(LS_LAYOUT_KEY, JSON.stringify(all));
  } catch { /* ignore */ }
}

// ─── Device Node Component ──────────────────────────────────────────────

function DeviceNode({ data }) {
  const { pvwsClient } = useApp();
  const statusPv = data.pvPrefix ? `${data.pvPrefix}:STATUS` : null;
  const pvVal = usePv(pvwsClient, statusPv);

  // Derive status from PV severity
  let status = 'ok';
  if (!pvVal && statusPv) status = 'disconnected';
  else if (pvVal?.severity === 2) status = 'alarm';
  else if (pvVal?.severity === 1) status = 'warning';

  const GlyphComp = getGlyph(data.glyphType || data.family || 'generic');
  const glyphSize = data.glyphSize || 36;

  return (
    <div
      className={`bll-node bll-node--${status}`}
      style={{ minWidth: data.width || 80, minHeight: data.height || 56 }}
      title={data.pvPrefix || data.label}
    >
      <Handle type="target" position={Position.Left} className="bll-handle" />
      <div className="bll-node-glyph">
        <GlyphComp status={status} size={glyphSize} />
      </div>
      <div className="bll-node-info">
        <span className="bll-node-label">{data.label}</span>
        {data.sublabel && <span className="bll-node-sublabel">{data.sublabel}</span>}
      </div>
      {status === 'alarm' && <span className="bll-node-alarm-badge">⚠</span>}
      <Handle type="source" position={Position.Right} className="bll-handle" />
    </div>
  );
}

// ─── Annotation Node (labels, beampipe segments, etc.) ──────────────────

function AnnotationNode({ data }) {
  if (data.annotationType === 'beam') {
    return (
      <div className="bll-beam-segment" style={{ width: data.width || 120, height: 6 }}>
        <Handle type="target" position={Position.Left} className="bll-handle" />
        <Handle type="source" position={Position.Right} className="bll-handle" />
      </div>
    );
  }
  return (
    <div className="bll-annotation" style={{ fontSize: data.fontSize || 14 }}>
      {data.label || 'Label'}
    </div>
  );
}

// ─── Group Node ─────────────────────────────────────────────────────────

function GroupNode({ data }) {
  return (
    <div className="bll-group" style={{ width: data.width || 300, height: data.height || 200 }}>
      <div className="bll-group-label">{data.label || 'Group'}</div>
    </div>
  );
}

const nodeTypes = {
  device: DeviceNode,
  annotation: AnnotationNode,
  group: GroupNode,
};

// ─── Main Layout Component ──────────────────────────────────────────────

export default function BeamlineLayout() {
  const { config, devices, pvwsClient, zones } = useApp();
  const beamline = config?.beamline || 'default';
  const reactFlowWrapper = useRef(null);

  // Layout state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [editMode, setEditMode] = useState(true);
  const [showPalette, setShowPalette] = useState(true);
  const [selectedZone, setSelectedZone] = useState('');
  const [dirty, setDirty] = useState(false);
  const [detailDevice, setDetailDevice] = useState(null);

  // Load layout on mount or zone change
  useEffect(() => {
    const saved = loadLayout(beamline, selectedZone);
    if (saved) {
      setNodes(saved.nodes || []);
      setEdges(saved.edges || []);
      setDirty(false);
    } else {
      // Auto-generate from devices if no saved layout
      autoLayout(selectedZone);
    }
  }, [beamline, selectedZone]);

  // Auto-layout devices in a line
  const autoLayout = useCallback((zone) => {
    const filtered = zone ? devices.filter((d) => d.zone === zone || d.allZones?.includes(zone)) : devices;
    const newNodes = filtered.map((dev, i) => ({
      id: dev.id,
      type: 'device',
      position: { x: 120 + i * 140, y: 200 },
      data: {
        label: dev.name,
        sublabel: dev.iocName,
        family: dev.family,
        glyphType: dev.template || dev.family,
        pvPrefix: dev.pvPrefix,
        deviceId: dev.id,
        width: 90,
        height: 60,
      },
    }));
    // Auto-connect sequentially
    const newEdges = newNodes.slice(1).map((n, i) => ({
      id: `e-${newNodes[i].id}-${n.id}`,
      source: newNodes[i].id,
      target: n.id,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#4488ff', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#4488ff' },
    }));
    setNodes(newNodes);
    setEdges(newEdges);
    setDirty(false);
  }, [devices, setNodes, setEdges]);

  // Connect
  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge({
      ...params,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#4488ff', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#4488ff' },
    }, eds));
    setDirty(true);
  }, [setEdges]);

  const onNodesDragStop = useCallback(() => setDirty(true), []);

  // Save
  const handleSave = useCallback(() => {
    saveLayout(beamline, selectedZone, { nodes, edges });
    setDirty(false);
  }, [beamline, selectedZone, nodes, edges]);

  // Export JSON
  const handleExport = useCallback(() => {
    const data = {
      beamline,
      zone: selectedZone || 'all',
      elements: nodes.map((n) => ({
        id: n.id,
        type: n.type,
        device: n.data.deviceId || null,
        label: n.data.label,
        glyphType: n.data.glyphType,
        x: Math.round(n.position.x),
        y: Math.round(n.position.y),
        width: n.data.width,
        height: n.data.height,
      })),
      connections: edges.map((e) => ({ from: e.source, to: e.target })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `beamline-layout-${beamline}-${selectedZone || 'all'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [beamline, selectedZone, nodes, edges]);

  // Import JSON
  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          const imported = (data.elements || []).map((el) => ({
            id: el.id || `el-${Math.random().toString(36).slice(2, 8)}`,
            type: el.type || 'device',
            position: { x: el.x || 0, y: el.y || 0 },
            data: {
              label: el.label || el.device || '?',
              deviceId: el.device,
              glyphType: el.glyphType || 'generic',
              width: el.width || 90,
              height: el.height || 60,
            },
          }));
          const importedEdges = (data.connections || []).map((c, i) => ({
            id: `e-import-${i}`,
            source: c.from,
            target: c.to,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#4488ff', strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#4488ff' },
          }));
          setNodes(imported);
          setEdges(importedEdges);
          setDirty(true);
        } catch (err) {
          alert('Invalid layout JSON: ' + err.message);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [setNodes, setEdges]);

  // Add element from palette
  const addFromPalette = useCallback((glyphType, label) => {
    const id = `el-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newNode = {
      id,
      type: 'device',
      position: { x: 200 + Math.random() * 200, y: 150 + Math.random() * 150 },
      data: {
        label: label || glyphType,
        glyphType,
        deviceId: null,
        width: 90,
        height: 60,
      },
    };
    setNodes((nds) => [...nds, newNode]);
    setDirty(true);
  }, [setNodes]);

  // Add non-device elements
  const addAnnotation = useCallback((annotationType) => {
    const id = `ann-${Date.now()}`;
    setNodes((nds) => [...nds, {
      id,
      type: 'annotation',
      position: { x: 200, y: 100 },
      data: { label: annotationType === 'beam' ? '' : 'Label', annotationType, width: annotationType === 'beam' ? 200 : undefined },
    }]);
    setDirty(true);
  }, [setNodes]);

  const addGroup = useCallback(() => {
    const id = `grp-${Date.now()}`;
    setNodes((nds) => [...nds, {
      id,
      type: 'group',
      position: { x: 100, y: 100 },
      data: { label: 'Group', width: 300, height: 200 },
      style: { zIndex: -1 },
    }]);
    setDirty(true);
  }, [setNodes]);

  // Delete selected
  const deleteSelected = useCallback(() => {
    setNodes((nds) => nds.filter((n) => !n.selected));
    setEdges((eds) => eds.filter((e) => !e.selected));
    setDirty(true);
  }, [setNodes, setEdges]);

  // Node click → detail view
  const onNodeClick = useCallback((_, node) => {
    if (!editMode && node.data.deviceId) {
      const dev = devices.find((d) => d.id === node.data.deviceId);
      if (dev) setDetailDevice(dev);
    }
  }, [editMode, devices]);

  // Node double click → detail in edit mode too
  const onNodeDoubleClick = useCallback((_, node) => {
    if (node.data.deviceId) {
      const dev = devices.find((d) => d.id === node.data.deviceId);
      if (dev) setDetailDevice(dev);
    }
  }, [devices]);

  // Available devices not yet placed
  const unplacedDevices = useMemo(() => {
    const placedIds = new Set(nodes.filter((n) => n.data.deviceId).map((n) => n.data.deviceId));
    let filtered = devices;
    if (selectedZone) filtered = filtered.filter((d) => d.zone === selectedZone || d.allZones?.includes(selectedZone));
    return filtered.filter((d) => !placedIds.has(d.id));
  }, [devices, nodes, selectedZone]);

  // Add existing device from device list
  const addDevice = useCallback((dev) => {
    setNodes((nds) => [...nds, {
      id: dev.id,
      type: 'device',
      position: { x: 200 + Math.random() * 300, y: 150 + Math.random() * 200 },
      data: {
        label: dev.name,
        sublabel: dev.iocName,
        family: dev.family,
        glyphType: dev.template || dev.family,
        pvPrefix: dev.pvPrefix,
        deviceId: dev.id,
        width: 90,
        height: 60,
      },
    }]);
    setDirty(true);
  }, [setNodes]);

  return (
    <div className="bll-container">
      {/* Toolbar */}
      <div className="bll-toolbar">
        <div className="bll-toolbar-left">
          <select className="filter-select" value={selectedZone} onChange={(e) => setSelectedZone(e.target.value)}>
            <option value="">All zones</option>
            {zones.map((z) => <option key={z} value={z}>{z}</option>)}
          </select>
          <button className={`toolbar-btn ${editMode ? 'active' : ''}`} onClick={() => setEditMode((e) => !e)}>
            {editMode ? '🔒 Lock' : '🔓 Edit'}
          </button>
          {editMode && (
            <button className={`toolbar-btn ${showPalette ? 'active' : ''}`} onClick={() => setShowPalette((s) => !s)}>
              🎨 Palette
            </button>
          )}
        </div>
        <div className="bll-toolbar-right">
          {editMode && (
            <>
              <button className="bl-btn bl-btn--sm" onClick={deleteSelected} title="Delete selected">🗑 Delete</button>
              <button className="bl-btn bl-btn--sm" onClick={() => autoLayout(selectedZone)} title="Auto-arrange">↻ Auto</button>
            </>
          )}
          <button className="bl-btn bl-btn--sm" onClick={handleImport} title="Import layout">📥 Import</button>
          <button className="bl-btn bl-btn--sm" onClick={handleExport} title="Export layout">📤 Export</button>
          <button className="bl-btn bl-btn--sm bl-btn--primary" onClick={handleSave} disabled={!dirty}>
            💾 Save{dirty ? ' *' : ''}
          </button>
        </div>
      </div>

      <div className="bll-main" ref={reactFlowWrapper}>
        {/* Palette sidebar */}
        {editMode && showPalette && (
          <div className="bll-palette">
            {/* Glyph elements */}
            <div className="bll-palette-section">
              <div className="bll-palette-title">Elements</div>
              <div className="bll-palette-grid">
                {GLYPH_TYPES.map((g) => (
                  <button key={g.type} className="bll-palette-item" onClick={() => addFromPalette(g.type, g.label)} title={g.label}>
                    <span className="bll-palette-icon">{g.icon}</span>
                    <span className="bll-palette-label">{g.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Annotations */}
            <div className="bll-palette-section">
              <div className="bll-palette-title">Annotations</div>
              <div className="bll-palette-grid">
                <button className="bll-palette-item" onClick={() => addAnnotation('label')}>
                  <span className="bll-palette-icon">🏷</span>
                  <span className="bll-palette-label">Label</span>
                </button>
                <button className="bll-palette-item" onClick={() => addAnnotation('beam')}>
                  <span className="bll-palette-icon">→</span>
                  <span className="bll-palette-label">Beam</span>
                </button>
                <button className="bll-palette-item" onClick={addGroup}>
                  <span className="bll-palette-icon">▢</span>
                  <span className="bll-palette-label">Group</span>
                </button>
              </div>
            </div>

            {/* Devices from YAML */}
            {unplacedDevices.length > 0 && (
              <div className="bll-palette-section">
                <div className="bll-palette-title">Devices ({unplacedDevices.length})</div>
                <div className="bll-palette-devlist">
                  {unplacedDevices.slice(0, 30).map((dev) => (
                    <button key={dev.id} className="bll-palette-dev" onClick={() => addDevice(dev)} title={`${dev.pvPrefix} (${dev.family})`}>
                      <span className="bll-palette-dev-icon">{dev.family === 'cam' ? '📷' : dev.family === 'mot' ? '⚙' : '🔧'}</span>
                      <span className="bll-palette-dev-name">{dev.name}</span>
                    </button>
                  ))}
                  {unplacedDevices.length > 30 && <span className="bll-palette-more">+{unplacedDevices.length - 30} more</span>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* React Flow canvas */}
        <div className="bll-canvas">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={editMode ? onNodesChange : undefined}
            onEdgesChange={editMode ? onEdgesChange : undefined}
            onConnect={editMode ? onConnect : undefined}
            onNodeDragStop={onNodesDragStop}
            onNodeClick={onNodeClick}
            onNodeDoubleClick={onNodeDoubleClick}
            nodeTypes={nodeTypes}
            nodesDraggable={editMode}
            nodesConnectable={editMode}
            elementsSelectable={editMode}
            fitView
            snapToGrid
            snapGrid={[10, 10]}
            deleteKeyCode={editMode ? 'Delete' : null}
            attributionPosition="bottom-left"
          >
            <Background color="#333" gap={20} size={1} />
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                if (node.type === 'group') return '#333';
                return '#4488ff';
              }}
              style={{ background: '#111' }}
            />
            <Panel position="top-right">
              <div className="bll-legend">
                {Object.entries(STATUS_COLORS).map(([key, color]) => (
                  <span key={key} className="bll-legend-item">
                    <span className="bll-legend-dot" style={{ background: color }} />
                    {key}
                  </span>
                ))}
              </div>
            </Panel>
          </ReactFlow>
        </div>
      </div>

      {/* Device detail modal */}
      {detailDevice && (
        <div className="widget-modal-overlay" onClick={() => setDetailDevice(null)}>
          <div className="widget-modal bll-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="widget-modal-header">
              <span className="widget-title">{detailDevice.name}</span>
              <button className="widget-btn" onClick={() => setDetailDevice(null)}>✕</button>
            </div>
            <div className="widget-modal-body">
              <DeviceDetail device={detailDevice} client={pvwsClient} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Device Detail Widget ───────────────────────────────────────────────

function DeviceDetail({ device, client }) {
  const widgetType = familyToWidgetType(device.family);
  const Component = getWidgetComponent(widgetType);
  const config = {
    ...deviceToWidgetConfig(device),
    viewMode: 'detail',
  };
  const widget = { id: `detail-${device.id}`, type: widgetType, config };

  return (
    <WidgetFrame widget={widget} editMode={false} client={client}>
      <Component config={config} client={client} />
    </WidgetFrame>
  );
}
