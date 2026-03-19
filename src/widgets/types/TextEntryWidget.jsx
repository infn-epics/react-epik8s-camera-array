import { useState, useRef } from 'react';
import { usePv } from '../../hooks/usePv.js';

/**
 * TextEntryWidget — Write a value to a PV.
 * Phoebus equivalent: Text Entry
 *
 * Config: { pv_name, format, placeholder, foreground, background, fontSize }
 */
export default function TextEntryWidget({ config, client }) {
  const pv = usePv(client, config.pv_name);
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const inputRef = useRef(null);

  const currentVal = pv?.value;
  const display = currentVal != null ? String(currentVal) : '';

  const write = (raw) => {
    if (!client || !config.pv_name) return;
    let v = raw;
    if (config.format === 'float') v = parseFloat(raw);
    else if (config.format === 'integer') v = parseInt(raw, 10);
    if (config.format !== 'string' && isNaN(v)) return;
    client.put(config.pv_name, v);
  };

  const startEdit = () => {
    setInputVal(display);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const commit = () => {
    if (inputVal !== display) write(inputVal);
    setEditing(false);
  };

  const style = {
    fontSize: config.fontSize ? `${config.fontSize}px` : undefined,
    color: config.foreground || undefined,
    background: config.background || undefined,
  };

  return (
    <div className="phoebus-text-entry" style={style}>
      {editing ? (
        <input
          ref={inputRef}
          className="text-entry-input"
          type={config.format === 'string' ? 'text' : 'number'}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
          onBlur={commit}
          autoFocus
          placeholder={config.placeholder || ''}
          step={config.format === 'float' ? 'any' : '1'}
        />
      ) : (
        <div className="text-entry-display" onClick={startEdit} title="Click to edit">
          {display || <span className="text-entry-placeholder">{config.placeholder || 'Click to set…'}</span>}
        </div>
      )}
    </div>
  );
}
