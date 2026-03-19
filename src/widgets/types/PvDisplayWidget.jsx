import { usePv } from '../../hooks/usePv.js';

/**
 * PvDisplayWidget — displays a single PV value with alarm severity.
 *
 * Config: { pvName, units, precision, showAlarm, fontSize }
 */
export default function PvDisplayWidget({ config, client }) {
  const pv = usePv(client, config.pvName);
  const val = pv?.value;
  const severity = pv?.severity || 'NONE';

  let display = '---';
  if (val !== null && val !== undefined) {
    display = typeof val === 'number'
      ? val.toFixed(config.precision ?? 2)
      : String(val);
  }

  const sevClass = severity !== 'NONE' ? `pv-severity--${severity.toLowerCase()}` : '';
  const sizeClass = `pv-display--${config.fontSize || 'medium'}`;

  return (
    <div className={`pv-display-widget ${sevClass} ${sizeClass}`}>
      <div className="pv-display-value">{display}</div>
      {config.units && <div className="pv-display-unit">{config.units}</div>}
      {config.showAlarm && severity !== 'NONE' && (
        <div className={`pv-display-alarm pv-alarm--${severity.toLowerCase()}`}>
          {severity}
        </div>
      )}
    </div>
  );
}
