import { usePv } from '../../hooks/usePv.js';

/**
 * PvControlWidget — control a PV with slider, toggle, button, or input.
 *
 * Config: { pvName, controlType, min, max, step, onValue, offValue, onLabel, offLabel }
 */
export default function PvControlWidget({ config, client }) {
  const pv = usePv(client, config.pvName);
  const val = pv?.value;
  const controlType = config.controlType || 'slider';

  const write = (v) => {
    if (client && config.pvName) client.put(config.pvName, v);
  };

  return (
    <div className="pv-control-widget">
      {controlType === 'slider' && (
        <div className="pv-control-slider">
          <input
            type="range"
            min={config.min ?? 0}
            max={config.max ?? 100}
            step={config.step ?? 1}
            value={val ?? config.min ?? 0}
            onChange={(e) => write(parseFloat(e.target.value))}
          />
          <span className="pv-control-readback">
            {typeof val === 'number' ? val.toFixed(2) : val ?? '---'}
          </span>
        </div>
      )}

      {controlType === 'toggle' && (
        <button
          className={`pv-control-toggle ${val === (config.onValue ?? 1) ? 'on' : 'off'}`}
          onClick={() => write(val === (config.onValue ?? 1) ? (config.offValue ?? 0) : (config.onValue ?? 1))}
        >
          {val === (config.onValue ?? 1) ? (config.onLabel || 'ON') : (config.offLabel || 'OFF')}
        </button>
      )}

      {controlType === 'button' && (
        <div className="pv-control-buttons">
          <button className="btn btn-primary" onClick={() => write(config.onValue ?? 1)}>
            {config.onLabel || 'ON'}
          </button>
          <button className="btn btn-secondary" onClick={() => write(config.offValue ?? 0)}>
            {config.offLabel || 'OFF'}
          </button>
        </div>
      )}

      {controlType === 'input' && (
        <form
          className="pv-control-input"
          onSubmit={(e) => {
            e.preventDefault();
            const v = parseFloat(e.target.elements.val.value);
            if (!isNaN(v)) write(v);
          }}
        >
          <input name="val" type="number" defaultValue={val ?? ''} key={val} step={config.step || 'any'} />
          <button type="submit" className="btn btn-primary">Set</button>
        </form>
      )}
    </div>
  );
}
