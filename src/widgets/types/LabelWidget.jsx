/**
 * LabelWidget — Static text label (no PV binding).
 * Phoebus equivalent: Label
 *
 * Config: { text, horizontal_alignment, foreground, background, fontSize }
 */
export default function LabelWidget({ config }) {
  const style = {
    textAlign: config.horizontal_alignment || 'left',
    fontSize: config.fontSize ? `${config.fontSize}px` : undefined,
    color: config.foreground || undefined,
    background: config.background || undefined,
  };

  return (
    <div className="phoebus-label" style={style}>
      {config.text || 'Label'}
    </div>
  );
}
