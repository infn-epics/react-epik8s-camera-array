/**
 * ActionButtonWidget — Write a fixed value to a PV on click.
 * Phoebus equivalent: Action Button
 *
 * Config: { pv_name, label, value, confirm, confirm_message, foreground, background, fontSize }
 */
export default function ActionButtonWidget({ config, client }) {
  const execute = () => {
    if (!client || !config.pv_name) return;
    if (config.confirm) {
      if (!window.confirm(config.confirm_message || 'Are you sure?')) return;
    }
    const v = isNaN(Number(config.value)) ? config.value : Number(config.value);
    client.put(config.pv_name, v);
  };

  const style = {
    fontSize: config.fontSize ? `${config.fontSize}px` : undefined,
    color: config.foreground || undefined,
    background: config.background || undefined,
  };

  return (
    <div className="phoebus-action-button">
      <button className="action-btn" onClick={execute} style={style}>
        {config.label || 'Execute'}
      </button>
    </div>
  );
}
