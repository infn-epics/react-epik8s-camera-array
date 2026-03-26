import { useEffect, useMemo, useRef, useState } from 'react';
import { PvDisplay, PvInput } from '../../../components/common/PvControls.jsx';
import { usePv } from '../../../hooks/usePv.js';

function CmdButton({ client, pvName, label, className = '' }) {
  return (
    <button
      type="button"
      className={`widget-action-btn ${className}`.trim()}
      onClick={() => client?.put?.(pvName, 1)}
      title={pvName}
    >
      {label}
    </button>
  );
}

function resolveEnumChoices(pvMsg) {
  if (!pvMsg) return [];
  const c = pvMsg.choices || pvMsg.enumStrings || pvMsg.enum_strs || pvMsg.labels;
  return Array.isArray(c) ? c.map((v) => String(v)) : [];
}

function EnumWrite({ client, pvName, label, options = [] }) {
  const pv = usePv(client, pvName);
  const enumChoices = resolveEnumChoices(pv);
  const effectiveOptions = enumChoices.length ? enumChoices : options;
  const [selected, setSelected] = useState(effectiveOptions[0] || '');

  useEffect(() => {
    if (!effectiveOptions.length) return;
    const raw = pv?.value;
    if (typeof raw === 'string' && effectiveOptions.includes(raw)) {
      setSelected(raw);
      return;
    }
    const idx = typeof raw === 'number' ? raw : parseInt(raw, 10);
    if (Number.isInteger(idx) && idx >= 0 && idx < effectiveOptions.length) {
      setSelected(effectiveOptions[idx]);
      return;
    }
    setSelected((prev) => (effectiveOptions.includes(prev) ? prev : effectiveOptions[0]));
  }, [pv?.value, effectiveOptions]);

  const submit = () => {
    if (!client?.put || !pvName || !selected) return;
    if (enumChoices.length) {
      const idx = enumChoices.indexOf(selected);
      if (idx >= 0) {
        client.put(pvName, idx);
        return;
      }
    }
    client.put(pvName, selected);
  };

  return (
    <div className="pv-input-group" title={pvName}>
      <label className="pv-label">{label}</label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 6 }}>
        <select className="pv-input" value={selected} onChange={(e) => setSelected(e.target.value)}>
          {effectiveOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <button type="button" className="widget-action-btn" onClick={submit}>
          Set
        </button>
      </div>
    </div>
  );
}

function seriesPoints(series, min, span) {
  if (series.length < 2) return '';
  return series
    .map((v, i) => {
      const x = (i / (series.length - 1)) * 100;
      const y = 100 - ((v - min) / span) * 100;
      return `${x},${y}`;
    })
    .join(' ');
}

function useAcquisitionTrend({ pvPrefix, client, maxLen = 360 }) {
  const in0 = usePv(client, `${pvPrefix}:ANALOG_IN0_VOLT_MONITOR`);
  const in1 = usePv(client, `${pvPrefix}:ANALOG_IN1_VOLT_MONITOR`);
  const in2 = usePv(client, `${pvPrefix}:ANALOG_IN2_VOLT_MONITOR`);
  const in3 = usePv(client, `${pvPrefix}:ANALOG_IN3_VOLT_MONITOR`);
  const hist = useRef({ in0: [], in1: [], in2: [], in3: [] });

  useEffect(() => {
    const samples = [
      Number(in0?.value),
      Number(in1?.value),
      Number(in2?.value),
      Number(in3?.value),
    ];
    if (samples.some((v) => !Number.isFinite(v))) return;
    hist.current.in0 = [...hist.current.in0, samples[0]].slice(-maxLen);
    hist.current.in1 = [...hist.current.in1, samples[1]].slice(-maxLen);
    hist.current.in2 = [...hist.current.in2, samples[2]].slice(-maxLen);
    hist.current.in3 = [...hist.current.in3, samples[3]].slice(-maxLen);
  }, [in0?.value, in1?.value, in2?.value, in3?.value]);

  return useMemo(() => {
    const all = [
      ...hist.current.in0,
      ...hist.current.in1,
      ...hist.current.in2,
      ...hist.current.in3,
    ];
    if (!all.length) {
      return {
        min: 0,
        max: 1,
        p0: '',
        p1: '',
        p2: '',
        p3: '',
        n: 0,
        series0: [],
        series1: [],
        series2: [],
        series3: [],
      };
    }
    const lo = Math.min(...all);
    const hi = Math.max(...all);
    const span = hi - lo || 1;
    return {
      min: lo,
      max: hi,
      p0: seriesPoints(hist.current.in0, lo, span),
      p1: seriesPoints(hist.current.in1, lo, span),
      p2: seriesPoints(hist.current.in2, lo, span),
      p3: seriesPoints(hist.current.in3, lo, span),
      n: hist.current.in0.length,
      series0: hist.current.in0,
      series1: hist.current.in1,
      series2: hist.current.in2,
      series3: hist.current.in3,
    };
  }, [in0?.value, in1?.value, in2?.value, in3?.value]);
}

function TrendChart({ trend, height = 150 }) {
  const { n, p0, p1, p2, p3 } = trend;
  return (
    <div style={{ height, borderRadius: 8, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
      {n > 1 ? (
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
          <polyline points={p0} fill="none" stroke="#0000e0" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          <polyline points={p1} fill="none" stroke="#ff7f00" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          <polyline points={p2} fill="none" stroke="#00c27a" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          <polyline points={p3} fill="none" stroke="#e00000" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        </svg>
      ) : (
        <div style={{ height: '100%', display: 'grid', placeItems: 'center', opacity: 0.8, fontSize: '0.8em' }}>
          waiting for samples
        </div>
      )}
    </div>
  );
}

function AcquisitionTrend({ trend, onOpen }) {
  const { min, max, n } = trend;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78em', marginBottom: 6 }}>
        <span>Live Inputs Trend</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ opacity: 0.8 }}>n={n}</span>
          <button type="button" className="widget-action-btn" onClick={onOpen}>Graph</button>
        </span>
      </div>
      <TrendChart trend={trend} height={150} />
      <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', fontSize: '0.75em', opacity: 0.8 }}>
        <span>min {min.toFixed(3)} V</span>
        <span>max {max.toFixed(3)} V</span>
      </div>
    </div>
  );
}

function AnalogTab({ pvPrefix, client, precision, numberFormat, showUnits }) {
  return (
    <div className="llrf-tab-body">
      <div className="llrf-section-title">Analog Inputs</div>
      <div className="llrf-field-row">
        <PvDisplay client={client} pvName={`${pvPrefix}:ANALOG_IN0_VOLT_MONITOR`} label="IN0" precision={precision} format={numberFormat} showUnit={showUnits} unit="V" />
        <PvDisplay client={client} pvName={`${pvPrefix}:ANALOG_IN1_VOLT_MONITOR`} label="IN1" precision={precision} format={numberFormat} showUnit={showUnits} unit="V" />
      </div>
      <div className="llrf-field-row">
        <PvDisplay client={client} pvName={`${pvPrefix}:ANALOG_IN2_VOLT_MONITOR`} label="IN2" precision={precision} format={numberFormat} showUnit={showUnits} unit="V" />
        <PvDisplay client={client} pvName={`${pvPrefix}:ANALOG_IN3_VOLT_MONITOR`} label="IN3" precision={precision} format={numberFormat} showUnit={showUnits} unit="V" />
      </div>

      <div className="llrf-section-title">Analog Outputs</div>
      <div className="llrf-field-row">
        <PvInput client={client} pvName={`${pvPrefix}:ANALOG_OUT0_VOLT_SP`} label="OUT0 (V)" step={0.01} />
        <PvInput client={client} pvName={`${pvPrefix}:ANALOG_OUT1_VOLT_SP`} label="OUT1 (V)" step={0.01} />
      </div>
      <div className="llrf-field-row">
        <PvInput client={client} pvName={`${pvPrefix}:ANALOG_OUT2_VOLT_SP`} label="OUT2 (V)" step={0.01} />
        <PvInput client={client} pvName={`${pvPrefix}:ANALOG_OUT3_VOLT_SP`} label="OUT3 (V)" step={0.01} />
      </div>
    </div>
  );
}

function AcquisitionTab({ pvPrefix, client, precision, numberFormat, showUnits }) {
  const trend = useAcquisitionTrend({ pvPrefix, client });
  const [openTrend, setOpenTrend] = useState(false);
  const [trendOffset, setTrendOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef(null);

  const beginDrag = (event) => {
    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;
    const origin = trendOffset;

    const onMove = (e) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      setTrendOffset({ x: origin.x + dx, y: origin.y + dy });
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

  return (
    <div className="llrf-tab-body">
      <div className="llrf-section-title">Acquisition Status</div>
      <div className="llrf-field-row">
        <PvDisplay client={client} pvName={`${pvPrefix}:ACQ_STATUS`} label="Status" precision={0} format="string" showUnit={false} />
        <PvDisplay client={client} pvName={`${pvPrefix}:ACQ_SAMPL_RATE_STATUS`} label="Sample Rate" precision={0} format="string" showUnit={false} />
        <PvDisplay client={client} pvName={`${pvPrefix}:ACQ_DECIMATION_STATUS`} label="Decimation" precision={0} format="string" showUnit={false} />
      </div>

      <div className="llrf-section-title">Trigger</div>
      <div className="llrf-field-row">
        <PvInput client={client} pvName={`${pvPrefix}:ACQ_TRIGGER_LEVEL_SP`} label="Level" step={0.001} />
        <PvInput client={client} pvName={`${pvPrefix}:ACQ_TRIGGER_DELAY_SP`} label="Delay" step={1} />
        <PvInput client={client} pvName={`${pvPrefix}:ACQ_TRIGGER_HYST_SP`} label="Hyst" step={0.001} />
      </div>
      <div className="llrf-field-row">
        <EnumWrite
          client={client}
          pvName={`${pvPrefix}:ACQ_TRIGGER_SRC_CMD`}
          label="Trigger Source"
          options={['EXT_PE', 'EXT_NE', 'INT', 'NOW']}
        />
        <EnumWrite
          client={client}
          pvName={`${pvPrefix}:OUT_SS_CHANNEL_CMD`}
          label="Single-Shot Ch"
          options={['CH1', 'CH2', 'CH3', 'CH4']}
        />
      </div>
      <div className="llrf-field-row">
        <PvDisplay client={client} pvName={`${pvPrefix}:ACQ_TRIGGER_LEVEL_MONITOR`} label="Level RB" precision={precision} format={numberFormat} showUnit={showUnits} />
        <PvDisplay client={client} pvName={`${pvPrefix}:ACQ_TRIGGER_DELAY_MONITOR`} label="Delay RB" precision={0} format={numberFormat} showUnit={false} />
        <PvDisplay client={client} pvName={`${pvPrefix}:ACQ_TRIGGER_HYST_MONITOR`} label="Hyst RB" precision={precision} format={numberFormat} showUnit={showUnits} />
      </div>

      <div className="llrf-section-title">Acquisition Setup</div>
      <div className="llrf-field-row">
        <EnumWrite
          client={client}
          pvName={`${pvPrefix}:ACQ_SAMPL_RATE_CMD`}
          label="Sample Rate"
          options={['125 MHz', '15.625 MHz', '1.953 MHz', '122 kHz']}
        />
        <EnumWrite
          client={client}
          pvName={`${pvPrefix}:ACQ_DECIMATION_CMD`}
          label="Decimation"
          options={['1', '8', '64', '1024']}
        />
        <EnumWrite
          client={client}
          pvName={`${pvPrefix}:ACQ_AVERAGING_CMD`}
          label="Averaging"
          options={['Off', 'On']}
        />
      </div>
      <div className="llrf-field-row">
        <EnumWrite
          client={client}
          pvName={`${pvPrefix}:IN1_GAIN_CMD`}
          label="IN1 Gain"
          options={['Low', 'High']}
        />
        <EnumWrite
          client={client}
          pvName={`${pvPrefix}:IN2_GAIN_CMD`}
          label="IN2 Gain"
          options={['Low', 'High']}
        />
      </div>

      <div className="llrf-section-title">Commands</div>
      <div className="llrf-field-row">
        <CmdButton client={client} pvName={`${pvPrefix}:START_CONT_ACQ_CMD`} label="Start Cont" className="on" />
        <CmdButton client={client} pvName={`${pvPrefix}:START_SS_ACQ_CMD`} label="Single Shot" className="accent" />
        <CmdButton client={client} pvName={`${pvPrefix}:STOP_ACQ_CMD`} label="Stop" className="off" />
      </div>
      <div className="llrf-field-row">
        <CmdButton client={client} pvName={`${pvPrefix}:RESET_ACQ_CMD`} label="Reset" />
        <div />
        <PvDisplay client={client} pvName={`${pvPrefix}:ACQ_TRIGGER_SRC_STATUS`} label="Trig Src" precision={0} format="string" showUnit={false} />
      </div>

      <div className="llrf-section-title">Waveform / Trend</div>
      <AcquisitionTrend trend={trend} onOpen={() => setOpenTrend(true)} />

      {openTrend && (
        <div className="bpm-wave-modal-backdrop" onClick={() => setOpenTrend(false)}>
          <div
            className="bpm-wave-modal"
            style={{ transform: `translate(calc(-50% + ${trendOffset.x}px), calc(-50% + ${trendOffset.y}px))` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bpm-wave-modal-head bpm-wave-modal-head--draggable" onMouseDown={beginDrag}>
              <strong>STEMlab125 Inputs Trend</strong>
              <button type="button" className="bpm-wave-modal-close" onClick={() => setOpenTrend(false)}>
                Close
              </button>
            </div>
            <div className="bpm-wave-modal-plot">
              <TrendChart trend={trend} height={240} />
            </div>
            <div className="bpm-wave-modal-stats">
              <span>samples {trend.n}</span>
              <span>min {trend.min.toFixed(3)} V</span>
              <span>max {trend.max.toFixed(3)} V</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoTab({ pvPrefix, client }) {
  return (
    <div className="llrf-tab-body">
      <div className="llrf-section-title">Device</div>
      <div className="llrf-field-row">
        <PvDisplay client={client} pvName={`${pvPrefix}:IMDL`} label="Model" precision={0} format="string" showUnit={false} />
        <PvDisplay client={client} pvName={`${pvPrefix}:DVDR`} label="Driver" precision={0} format="string" showUnit={false} />
      </div>
      <div className="llrf-field-row">
        <PvDisplay client={client} pvName={`${pvPrefix}:IFW`} label="FW" precision={0} format="string" showUnit={false} />
        <PvDisplay client={client} pvName={`${pvPrefix}:DRIVER_VERSION`} label="Driver Ver" precision={0} format="string" showUnit={false} />
      </div>

      <div className="llrf-section-title">Output Enables</div>
      <div className="llrf-field-row">
        <PvDisplay client={client} pvName={`${pvPrefix}:OUT1_ENABLE_STATUS`} label="OUT1" precision={0} format="string" showUnit={false} />
        <PvDisplay client={client} pvName={`${pvPrefix}:OUT2_ENABLE_STATUS`} label="OUT2" precision={0} format="string" showUnit={false} />
      </div>
    </div>
  );
}

export default function Stemlab125Widget({ config, client }) {
  const [tab, setTab] = useState('analog');
  const pvPrefix = config.pvPrefix || '';
  const precision = config.precision ?? 3;
  const numberFormat = config.format || 'decimal';
  const showUnits = config.showUnits !== false;

  const tabs = [
    { id: 'analog', label: 'Analog' },
    { id: 'acq', label: 'Acq' },
    { id: 'info', label: 'Info' },
  ];

  return (
    <div className="llrf-widget-body llrf-detail">
      <div className="llrf-status-bar">
        <strong>STEMlab125</strong>
        <span style={{ opacity: 0.8 }}>{pvPrefix || 'no prefix'}</span>
      </div>

      <div className="motor-tabs">
        {tabs.map((t) => (
          <button key={t.id} className={`motor-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'analog' && (
        <AnalogTab
          pvPrefix={pvPrefix}
          client={client}
          precision={precision}
          numberFormat={numberFormat}
          showUnits={showUnits}
        />
      )}
      {tab === 'acq' && (
        <AcquisitionTab
          pvPrefix={pvPrefix}
          client={client}
          precision={precision}
          numberFormat={numberFormat}
          showUnits={showUnits}
        />
      )}
      {tab === 'info' && <InfoTab pvPrefix={pvPrefix} client={client} />}
    </div>
  );
}
