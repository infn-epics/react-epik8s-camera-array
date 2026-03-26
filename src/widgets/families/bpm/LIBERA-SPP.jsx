import { useEffect, useMemo, useRef, useState } from 'react';
import { PvDisplay, PvInput } from '../../../components/common/PvControls.jsx';
import { usePv } from '../../../hooks/usePv.js';

function decodeBase64Bytes(b64) {
  if (!b64 || typeof b64 !== 'string') return null;
  try {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
    return out;
  } catch {
    return null;
  }
}

function decodeTypedArrayLE(bytes, type) {
  if (!bytes) return [];
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const out = [];

  if (type === 'f64') {
    for (let i = 0; i + 8 <= bytes.byteLength; i += 8) out.push(view.getFloat64(i, true));
    return out;
  }
  if (type === 'f32') {
    for (let i = 0; i + 4 <= bytes.byteLength; i += 4) out.push(view.getFloat32(i, true));
    return out;
  }
  if (type === 'i32') {
    for (let i = 0; i + 4 <= bytes.byteLength; i += 4) out.push(view.getInt32(i, true));
    return out;
  }
  if (type === 'i16') {
    for (let i = 0; i + 2 <= bytes.byteLength; i += 2) out.push(view.getInt16(i, true));
    return out;
  }
  if (type === 'i8') {
    for (let i = 0; i < bytes.byteLength; i += 1) out.push(view.getInt8(i));
    return out;
  }

  return [];
}

function toNumericArray(pv) {
  const value = pv?.value;
  if (Array.isArray(value)) {
    return value.filter((v) => typeof v === 'number' && Number.isFinite(v));
  }
  if (ArrayBuffer.isView(value)) {
    return Array.from(value).filter((v) => typeof v === 'number' && Number.isFinite(v));
  }

  // PVWS encodes numeric waveform arrays as Base64 typed payloads.
  if (pv?.b64dbl) return decodeTypedArrayLE(decodeBase64Bytes(pv.b64dbl), 'f64');
  if (pv?.b64flt) return decodeTypedArrayLE(decodeBase64Bytes(pv.b64flt), 'f32');
  if (pv?.b64int) return decodeTypedArrayLE(decodeBase64Bytes(pv.b64int), 'i32');
  if (pv?.b64srt) return decodeTypedArrayLE(decodeBase64Bytes(pv.b64srt), 'i16');
  if (pv?.b64byt) return decodeTypedArrayLE(decodeBase64Bytes(pv.b64byt), 'i8');

  return [];
}

function waveformStats(pv) {
  const samples = toNumericArray(pv);
  const hasData = samples.length > 1;
  const min = hasData ? Math.min(...samples) : 0;
  const max = hasData ? Math.max(...samples) : 0;
  const span = max - min || 1;
  const points = hasData
    ? samples
        .map((v, i) => {
          const x = (i / (samples.length - 1)) * 100;
          const y = 100 - ((v - min) / span) * 100;
          return `${x},${y}`;
        })
        .join(' ')
    : '';
  return { samples, hasData, min, max, points };
}

function WaveformCard({ label, pv, color = '#60a5fa', onOpenGraph }) {
  const { samples, hasData, min, max, points } = waveformStats(pv);

  return (
    <div className="bpm-wave-card" title={pv?.pv || ''}>
      <div className="bpm-wave-head">
        <span className="bpm-wave-label">{label}</span>
        <span className="bpm-wave-head-right">
          <span className="bpm-wave-meta">n={samples.length}</span>
          <button type="button" className="bpm-wave-open" onClick={onOpenGraph} title={`Open ${label} graph`}>
            📈
          </button>
        </span>
      </div>
      <div className="bpm-wave-plot">
        {hasData ? (
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="bpm-wave-svg">
            <polyline points={points} className="bpm-wave-line" style={{ stroke: color }} />
          </svg>
        ) : (
          <span className="bpm-wave-empty">no waveform</span>
        )}
      </div>
      <div className="bpm-wave-stats">
        <span>min {min.toFixed(0)}</span>
        <span>max {max.toFixed(0)}</span>
      </div>
    </div>
  );
}

function ActionButton({ client, pvName, label, className = '' }) {
  return (
    <button
      type="button"
      className={`bpm-lspp-btn ${className}`.trim()}
      onClick={() => client?.put?.(pvName, 1)}
      title={pvName}
    >
      {label}
    </button>
  );
}

function ModeToggle({ client, pvPrefix }) {
  const modePv = `${pvPrefix}:ADC:ADC_IGNORE_TRIG_MONITOR`;
  const setPv = `${pvPrefix}:ADC:ADC_IGNORE_TRIG_SP`;
  const mode = usePv(client, modePv);
  const current = Number(mode?.value) || 0;
  const manual = current >= 1;

  return (
    <button
      type="button"
      className={`bpm-lspp-btn ${manual ? 'active' : ''}`}
      onClick={() => client?.put?.(setPv, manual ? 0 : 1)}
      title={`${setPv} (${manual ? 'manual' : 'auto'})`}
    >
      {manual ? 'Manual' : 'Auto'}
    </button>
  );
}

export default function LiberaSppWidget({ config, client }) {
  const [openWave, setOpenWave] = useState('');
  const [openXY, setOpenXY] = useState(false);
  const [modalOffset, setModalOffset] = useState({ wave: { x: 0, y: 0 }, xy: { x: 20, y: 20 } });
  const dragRef = useRef(null);
  const historyRef = useRef({ x: [], y: [] });
  const pvPrefix = config.pvPrefix || '';
  const precision = config.precision ?? 2;
  const format = config.format || 'decimal';
  const showUnits = config.showUnits !== false;

  const sa = useMemo(() => ({
    x: `${pvPrefix}:SA:SA_X_MONITOR`,
    y: `${pvPrefix}:SA:SA_Y_MONITOR`,
    q: `${pvPrefix}:SA:SA_Q_MONITOR`,
    status: `${pvPrefix}:SA:SA_STATUS_MONITOR`,
    count: `${pvPrefix}:SA:SA_COUNTER_MONITOR`,
    reset: `${pvPrefix}:ENV:ENV_RESET_COUNTER_CMD`,
    thrRb: `${pvPrefix}:ENV:ENV_ADCSP_THRESHOLD_MONITOR`,
    thrSp: `${pvPrefix}:ENV:ENV_ADCSP_THRESHOLD_SP`,
  }), [pvPrefix]);

  const adc = useMemo(() => ({
    a: `${pvPrefix}:ADC:ADC_A_MONITOR`,
    b: `${pvPrefix}:ADC:ADC_B_MONITOR`,
    c: `${pvPrefix}:ADC:ADC_C_MONITOR`,
    d: `${pvPrefix}:ADC:ADC_D_MONITOR`,
    count: `${pvPrefix}:ADC:ADC_FINISHED_MONITOR`,
    acquire: `${pvPrefix}:ADC:ADC_ON_NEXT_TRIG_CMD`,
  }), [pvPrefix]);

  const adcA = usePv(client, adc.a);
  const adcB = usePv(client, adc.b);
  const adcC = usePv(client, adc.c);
  const adcD = usePv(client, adc.d);
  const saX = usePv(client, sa.x);
  const saY = usePv(client, sa.y);

  useEffect(() => {
    const x = Number(saX?.value);
    const y = Number(saY?.value);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    const hist = historyRef.current;
    hist.x = [...hist.x, x].slice(-300);
    hist.y = [...hist.y, y].slice(-300);
  }, [saX?.value, saY?.value]);

  const beginDrag = (kind, event) => {
    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;
    const origin = modalOffset[kind];

    const onMove = (e) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      setModalOffset((prev) => ({
        ...prev,
        [kind]: { x: origin.x + dx, y: origin.y + dy },
      }));
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      dragRef.current = null;
    };

    dragRef.current = { onMove, onUp };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  useEffect(() => () => {
    if (!dragRef.current) return;
    window.removeEventListener('mousemove', dragRef.current.onMove);
    window.removeEventListener('mouseup', dragRef.current.onUp);
  }, []);

  const waveDefs = [
    { key: 'A', label: 'ADC A', pv: adcA, color: '#e00000' },
    { key: 'B', label: 'ADC B', pv: adcB, color: '#0000e0' },
    { key: 'C', label: 'ADC C', pv: adcC, color: '#00e0e0' },
    { key: 'D', label: 'ADC D', pv: adcD, color: '#e0e000' },
  ];
  const selectedWave = waveDefs.find((w) => w.key === openWave) || null;
  const selectedStats = selectedWave ? waveformStats(selectedWave.pv) : null;

  const xSeries = historyRef.current.x;
  const ySeries = historyRef.current.y;
  const xyHasData = xSeries.length > 1 && ySeries.length > 1;
  const xyMin = xyHasData ? Math.min(...xSeries, ...ySeries) : 0;
  const xyMax = xyHasData ? Math.max(...xSeries, ...ySeries) : 0;
  const xySpan = xyMax - xyMin || 1;
  const toSeriesPoints = (series) => (
    series
      .map((v, i) => {
        const x = (i / (series.length - 1)) * 100;
        const y = 100 - ((v - xyMin) / xySpan) * 100;
        return `${x},${y}`;
      })
      .join(' ')
  );
  const xPoints = xyHasData ? toSeriesPoints(xSeries) : '';
  const yPoints = xyHasData ? toSeriesPoints(ySeries) : '';

  return (
    <div className="bpm-widget-body bpm-lspp-widget">
      <div className="bpm-lspp-grid">
        <PvDisplay client={client} pvName={sa.x} label="X" precision={precision} format={format} showUnit={showUnits} unit="mm" />
        <PvDisplay client={client} pvName={sa.y} label="Y" precision={precision} format={format} showUnit={showUnits} unit="mm" />
        <PvDisplay client={client} pvName={sa.q} label="Q" precision={precision} format={format} showUnit={showUnits} unit="pC" />
      </div>

      <div className="bpm-lspp-row">
        <PvDisplay client={client} pvName={sa.status} label="SA Status" precision={0} format="string" showUnit={false} />
        <PvDisplay client={client} pvName={sa.count} label="SA Count" precision={0} format="decimal" showUnit={false} />
        <div className="bpm-lspp-actions">
          <button type="button" className="bpm-lspp-btn" onClick={() => setOpenXY(true)} title="Open X/Y graph">
            📉 X/Y
          </button>
          <ActionButton client={client} pvName={sa.reset} label="Reset Counter" />
        </div>
      </div>

      <div className="bpm-lspp-row">
        <PvDisplay client={client} pvName={sa.thrRb} label="Threshold" precision={0} format="decimal" showUnit={false} />
        <PvInput client={client} pvName={sa.thrSp} label="Set" step={1} />
      </div>

      <div className="bpm-lspp-divider" />

      <div className="bpm-lspp-grid">
        {waveDefs.map((w) => (
          <WaveformCard
            key={w.key}
            label={w.label}
            pv={w.pv}
            color={w.color}
            onOpenGraph={() => setOpenWave(w.key)}
          />
        ))}
      </div>

      <div className="bpm-lspp-row">
        <PvDisplay client={client} pvName={adc.count} label="ADC Count" precision={0} format="decimal" showUnit={false} />
        <ModeToggle client={client} pvPrefix={pvPrefix} />
        <ActionButton client={client} pvName={adc.acquire} label="Acquire" className="accent" />
      </div>

      {selectedWave && selectedStats && (
        <div className="bpm-wave-modal-backdrop" onClick={() => setOpenWave('')}>
          <div
            className="bpm-wave-modal"
            style={{ transform: `translate(calc(-50% + ${modalOffset.wave.x}px), calc(-50% + ${modalOffset.wave.y}px))` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bpm-wave-modal-head bpm-wave-modal-head--draggable" onMouseDown={(e) => beginDrag('wave', e)}>
              <strong>{selectedWave.label} waveform</strong>
              <button type="button" className="bpm-wave-modal-close" onClick={() => setOpenWave('')}>
                Close
              </button>
            </div>
            <div className="bpm-wave-modal-plot">
              {selectedStats.hasData ? (
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="bpm-wave-svg">
                  <polyline points={selectedStats.points} className="bpm-wave-line" style={{ stroke: selectedWave.color }} />
                </svg>
              ) : (
                <span className="bpm-wave-empty">no waveform</span>
              )}
            </div>
            <div className="bpm-wave-modal-stats">
              <span>samples {selectedStats.samples.length}</span>
              <span>min {selectedStats.min.toFixed(0)}</span>
              <span>max {selectedStats.max.toFixed(0)}</span>
            </div>
          </div>
        </div>
      )}

      {openXY && (
        <div className="bpm-wave-modal-backdrop" onClick={() => setOpenXY(false)}>
          <div
            className="bpm-wave-modal"
            style={{ transform: `translate(calc(-50% + ${modalOffset.xy.x}px), calc(-50% + ${modalOffset.xy.y}px))` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bpm-wave-modal-head bpm-wave-modal-head--draggable" onMouseDown={(e) => beginDrag('xy', e)}>
              <strong>X/Y trend</strong>
              <button type="button" className="bpm-wave-modal-close" onClick={() => setOpenXY(false)}>
                Close
              </button>
            </div>
            <div className="bpm-wave-modal-plot">
              {xyHasData ? (
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="bpm-wave-svg">
                  <polyline points={xPoints} className="bpm-wave-line" style={{ stroke: '#e00000' }} />
                  <polyline points={yPoints} className="bpm-wave-line" style={{ stroke: '#0000e0' }} />
                </svg>
              ) : (
                <span className="bpm-wave-empty">no X/Y history yet</span>
              )}
            </div>
            <div className="bpm-wave-modal-stats">
              <span>X {Number(saX?.value).toFixed(Number.isFinite(Number(saX?.value)) ? 3 : 0)}</span>
              <span>Y {Number(saY?.value).toFixed(Number.isFinite(Number(saY?.value)) ? 3 : 0)}</span>
              <span>samples {xSeries.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
