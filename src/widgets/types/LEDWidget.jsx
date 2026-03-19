import { usePv } from '../../hooks/usePv.js';

/**
 * LEDWidget — Status indicator LED bound to a PV.
 * Phoebus equivalent: LED
 *
 * Config: { pv_name, on_color, off_color, threshold, shape, showLabel }
 */
export default function LEDWidget({ config, client }) {
  const pv = usePv(client, config.pv_name);
  const val = pv?.value;
  const num = typeof val === 'number' ? val : parseFloat(val);
  const isOn = !isNaN(num) && num > (config.threshold ?? 0.5);

  const color = isOn
    ? (config.on_color || '#34d399')
    : (config.off_color || '#ef4444');

  const shape = config.shape || 'circle';
  const borderRadius = shape === 'circle' ? '50%' : '4px';

  return (
    <div className="phoebus-led">
      <div
        className="led-indicator"
        style={{
          width: 28,
          height: 28,
          borderRadius,
          background: color,
          boxShadow: isOn ? `0 0 8px ${color}` : 'none',
        }}
      />
      {config.showLabel !== false && (
        <span className="led-label">
          {config.pv_name ? config.pv_name.split(':').pop() : ''}
        </span>
      )}
    </div>
  );
}
