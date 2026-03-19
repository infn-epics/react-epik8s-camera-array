import { usePv } from '../../hooks/usePv.js';

/**
 * ComboBoxWidget — Select a value from a list and write to PV.
 * Phoebus equivalent: Combo Box
 *
 * Config: { pv_name, items (text, newline-separated), foreground, background, fontSize }
 */
export default function ComboBoxWidget({ config, client }) {
  const pv = usePv(client, config.pv_name);
  const val = pv?.value;
  const items = (config.items || '').split('\n').map(s => s.trim()).filter(Boolean);

  const handleChange = (e) => {
    if (!client || !config.pv_name) return;
    const v = e.target.value;
    const num = Number(v);
    client.put(config.pv_name, isNaN(num) ? v : num);
  };

  const style = {
    fontSize: config.fontSize ? `${config.fontSize}px` : undefined,
    color: config.foreground || undefined,
    background: config.background || undefined,
  };

  return (
    <div className="phoebus-combo-box" style={style}>
      <select className="combo-select" value={val ?? ''} onChange={handleChange}>
        {items.length === 0 && <option value="">—</option>}
        {items.map((item) => (
          <option key={item} value={item}>{item}</option>
        ))}
      </select>
    </div>
  );
}
