import { usePv } from '../../hooks/usePv.js';

/**
 * TextUpdateWidget — Displays a PV value (read-only), just the text.
 * Phoebus equivalent: Text Update
 *
 * Config: { pv_name, precision, units, format, alarm_sensitive,
 *           foreground, background, fontSize }
 */
export default function TextUpdateWidget({ config, client }) {
  const pv = usePv(client, config.pv_name);
  const val = pv?.value;

  let display = '---';
  if (val !== null && val !== undefined) {
    const num = typeof val === 'number' ? val : parseFloat(val);
    if (!isNaN(num)) {
      switch (config.format) {
        case 'exponential':
          display = num.toExponential(config.precision ?? 2);
          break;
        case 'hex':
          display = '0x' + Math.round(num).toString(16).toUpperCase();
          break;
        default:
          display = num.toFixed(config.precision ?? 2);
      }
    } else {
      display = String(val);
    }
  }

  const style = {
    fontSize: config.fontSize ? `${config.fontSize}px` : undefined,
    color: config.foreground || undefined,
    background: config.background || undefined,
  };

  return (
    <div className="phoebus-text-update" style={style}>
      <span className="text-update-value">{display}</span>
      {config.units && <span className="text-update-unit">{config.units}</span>}
    </div>
  );
}
