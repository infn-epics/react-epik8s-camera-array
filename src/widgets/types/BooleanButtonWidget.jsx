import { usePv } from '../../hooks/usePv.js';

/**
 * BooleanButtonWidget — Toggle a boolean PV ON/OFF.
 * Phoebus equivalent: Boolean Button
 *
 * Config: { pv_name, on_label, off_label, on_value, off_value, on_color, off_color }
 */
export default function BooleanButtonWidget({ config, client }) {
  const pv = usePv(client, config.pv_name);
  const val = pv?.value;
  const onVal = config.on_value ?? 1;
  const offVal = config.off_value ?? 0;
  const isOn = val === onVal || val === String(onVal);

  const toggle = () => {
    if (!client || !config.pv_name) return;
    client.put(config.pv_name, isOn ? offVal : onVal);
  };

  const bgColor = isOn
    ? (config.on_color || '#34d399')
    : (config.off_color || '#6b7280');

  return (
    <div className="phoebus-boolean-button">
      <button
        className="boolean-btn"
        onClick={toggle}
        style={{ background: bgColor, color: '#fff', fontSize: config.fontSize ? `${config.fontSize}px` : undefined }}
      >
        {isOn ? (config.on_label || 'ON') : (config.off_label || 'OFF')}
      </button>
    </div>
  );
}
