import { useState, useEffect, useRef } from 'react';
import { createBackendWs } from '../../services/backendWs.js';
import { useDraggable } from '../../hooks/useDraggable.js';

const MAX_EVENTS = 1000;

const SEVERITY_ICON = {
  delete: '🗑',
  restart: '🔄',
  scale: '📏',
  sync: '🔁',
  error: '❌',
  info: 'ℹ️',
};

const RESOURCE_ICON = {
  application: '📦',
  deployment: '🚀',
  statefulset: '🗄',
  pod: '🫛',
  service: '🌐',
};

function formatEvent(ev) {
  const rIcon = RESOURCE_ICON[ev.resource] || '📋';
  const aIcon = SEVERITY_ICON[ev.action] || '⚡';
  let detail = '';
  if (ev.replicas !== undefined) detail = ` → ${ev.replicas} replicas`;
  if (ev.deployments?.length) detail = ` (${ev.deployments.join(', ')})`;
  return `${aIcon} ${rIcon} ${ev.action.toUpperCase()} ${ev.resource} "${ev.name}"${detail}`;
}

export default function SystemConsole({ detached, onDetach, onClose }) {
  const [events, setEvents] = useState([]);
  const [connected, setConnected] = useState(false);
  const [filter, setFilter] = useState('');
  const listRef = useRef(null);
  const { panelRef, onHeaderMouseDown } = useDraggable(detached);

  useEffect(() => {
    const ws = createBackendWs('/ws/system');

    const unMsg = ws.onMessage((ev) => {
      if (ev.type !== 'system') return;
      setEvents(prev => {
        const next = [...prev, ev];
        return next.length > MAX_EVENTS ? next.slice(-MAX_EVENTS) : next;
      });
    });

    const unSt = ws.onStatus(setConnected);

    return () => { unMsg(); unSt(); ws.close(); };
  }, []);

  // Auto-scroll
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [events]);

  const filtered = filter
    ? events.filter(ev =>
        ev.action.includes(filter) ||
        ev.resource.includes(filter) ||
        ev.name.toLowerCase().includes(filter.toLowerCase())
      )
    : events;

  return (
    <div ref={panelRef} className={`console-panel system-console ${detached ? 'console-detached' : ''}`}>
      <div className="console-header" onMouseDown={onHeaderMouseDown}>
        <span className="console-title">
          🖥 System
          <span className={`console-conn ${connected ? 'on' : 'off'}`} />
        </span>
        <div className="console-actions">
          <input
            className="console-filter"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Filter…"
          />
          <button
            className="console-btn"
            onClick={() => setEvents([])}
            title="Clear"
          >
            🗑
          </button>
          {!detached && (
            <button className="console-btn" onClick={onDetach} title="Pop out">⧉</button>
          )}
          <button className="console-btn" onClick={onClose} title="Close">✕</button>
        </div>
      </div>
      <div className="console-body console-mono" ref={listRef}>
        {filtered.length === 0 && (
          <div className="console-empty">No system events yet</div>
        )}
        {filtered.map((ev, i) => (
          <div key={i} className={`sys-event sys-${ev.action}`}>
            <span className="sys-time">{new Date(ev.ts).toLocaleTimeString()}</span>
            <span className="sys-ns">[{ev.namespace}]</span>
            <span className="sys-text">{formatEvent(ev)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
