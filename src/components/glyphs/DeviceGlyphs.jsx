/**
 * Beamline Device Glyphs — SVG icon components for layout editor.
 *
 * Each glyph:
 *  - Accepts { status, size, label } props
 *  - status: 'ok' | 'warning' | 'alarm' | 'disconnected' | 'disabled'
 *  - Uses color to indicate state, shape to indicate type
 */

const STATUS_COLORS = {
  ok:           '#22c55e',
  warning:      '#eab308',
  alarm:        '#ef4444',
  disconnected: '#6b7280',
  disabled:     '#374151',
};

const stroke = (status) => STATUS_COLORS[status] || STATUS_COLORS.ok;
const fill = (status, alpha = 0.15) => {
  const hex = STATUS_COLORS[status] || STATUS_COLORS.ok;
  // Convert hex to rgba
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

// ─── BPM (circle + crosshair) ──────────────────────────────────────────
export function BPMGlyph({ status = 'ok', size = 40 }) {
  const s = stroke(status), f = fill(status), c = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={c} cy={c} r={c - 3} fill={f} stroke={s} strokeWidth={2} />
      <line x1={c} y1={4} x2={c} y2={size - 4} stroke={s} strokeWidth={1.5} />
      <line x1={4} y1={c} x2={size - 4} y2={c} stroke={s} strokeWidth={1.5} />
    </svg>
  );
}

// ─── Quadrupole (square + focusing) ─────────────────────────────────────
export function QuadrupoleGlyph({ status = 'ok', size = 40, focusing = true }) {
  const s = stroke(status), f = fill(status), p = 4, w = size - 8;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect x={p} y={p} width={w} height={w} rx={3} fill={f} stroke={s} strokeWidth={2} />
      {focusing ? (
        <>
          <line x1={p + 4} y1={p + 4} x2={size - p - 4} y2={size - p - 4} stroke={s} strokeWidth={1.5} />
          <line x1={size - p - 4} y1={p + 4} x2={p + 4} y2={size - p - 4} stroke={s} strokeWidth={1.5} />
        </>
      ) : (
        <text x={size / 2} y={size / 2 + 5} textAnchor="middle" fill={s} fontSize={16} fontWeight="bold">+</text>
      )}
    </svg>
  );
}

// ─── Dipole / Bending Magnet (rect + curved arrow) ─────────────────────
export function DipoleGlyph({ status = 'ok', size = 40 }) {
  const s = stroke(status), f = fill(status);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect x={4} y={8} width={size - 8} height={size - 16} rx={3} fill={f} stroke={s} strokeWidth={2} />
      <path d={`M${10},${size / 2} Q${size / 2},${8} ${size - 10},${size / 2}`} fill="none" stroke={s} strokeWidth={1.5} markerEnd="url(#arrow)" />
      <defs>
        <marker id="arrow" viewBox="0 0 6 6" refX={5} refY={3} markerWidth={6} markerHeight={6} orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={s} />
        </marker>
      </defs>
    </svg>
  );
}

// ─── Corrector Magnet (small square + arrow) ────────────────────────────
export function CorrectorGlyph({ status = 'ok', size = 40, direction = 'h' }) {
  const s = stroke(status), f = fill(status), c = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect x={8} y={8} width={size - 16} height={size - 16} rx={2} fill={f} stroke={s} strokeWidth={2} />
      {direction === 'h' ? (
        <line x1={12} y1={c} x2={size - 12} y2={c} stroke={s} strokeWidth={2} markerEnd="url(#corr-arr)" />
      ) : (
        <line x1={c} y1={12} x2={c} y2={size - 12} stroke={s} strokeWidth={2} markerEnd="url(#corr-arr)" />
      )}
      <defs>
        <marker id="corr-arr" viewBox="0 0 6 6" refX={5} refY={3} markerWidth={5} markerHeight={5} orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={s} />
        </marker>
      </defs>
    </svg>
  );
}

// ─── Motor (rectangle + shaft) ──────────────────────────────────────────
export function MotorGlyph({ status = 'ok', size = 40 }) {
  const s = stroke(status), f = fill(status), c = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect x={4} y={8} width={size - 16} height={size - 16} rx={3} fill={f} stroke={s} strokeWidth={2} />
      <line x1={size - 12} y1={c} x2={size - 4} y2={c} stroke={s} strokeWidth={3} />
      <circle cx={size - 4} cy={c} r={2} fill={s} />
      <text x={c - 4} y={c + 4} textAnchor="middle" fill={s} fontSize={10} fontWeight="bold">M</text>
    </svg>
  );
}

// ─── Camera (lens icon) ─────────────────────────────────────────────────
export function CameraGlyph({ status = 'ok', size = 40 }) {
  const s = stroke(status), f = fill(status), c = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect x={4} y={8} width={size - 8} height={size - 16} rx={4} fill={f} stroke={s} strokeWidth={2} />
      <circle cx={c} cy={c} r={8} fill="none" stroke={s} strokeWidth={1.5} />
      <circle cx={c} cy={c} r={3} fill={s} />
    </svg>
  );
}

// ─── Power Supply (rect + lightning) ────────────────────────────────────
export function PowerSupplyGlyph({ status = 'ok', size = 40 }) {
  const s = stroke(status), f = fill(status), c = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect x={4} y={4} width={size - 8} height={size - 8} rx={3} fill={f} stroke={s} strokeWidth={2} />
      <path d={`M${c - 3},${8} L${c + 1},${c} L${c - 2},${c} L${c + 3},${size - 8}`} fill="none" stroke={s} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Vacuum Gauge (circle + P) ──────────────────────────────────────────
export function VacuumGlyph({ status = 'ok', size = 40 }) {
  const s = stroke(status), f = fill(status), c = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={c} cy={c} r={c - 3} fill={f} stroke={s} strokeWidth={2} />
      <text x={c} y={c + 5} textAnchor="middle" fill={s} fontSize={14} fontWeight="bold">P</text>
    </svg>
  );
}

// ─── Valve (two triangles) ──────────────────────────────────────────────
export function ValveGlyph({ status = 'ok', size = 40, open = true }) {
  const s = stroke(status), f = open ? fill(status) : fill('alarm', 0.3), c = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <polygon points={`4,8 ${c},${c} 4,${size - 8}`} fill={f} stroke={s} strokeWidth={2} />
      <polygon points={`${size - 4},8 ${c},${c} ${size - 4},${size - 8}`} fill={f} stroke={s} strokeWidth={2} />
    </svg>
  );
}

// ─── RF Cavity (pill + wave) ────────────────────────────────────────────
export function RFCavityGlyph({ status = 'ok', size = 40 }) {
  const s = stroke(status), f = fill(status), c = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <ellipse cx={c} cy={c} rx={c - 4} ry={c - 8} fill={f} stroke={s} strokeWidth={2} />
      <path d={`M${10},${c} Q${c - 4},${c - 6} ${c},${c} Q${c + 4},${c + 6} ${size - 10},${c}`} fill="none" stroke={s} strokeWidth={1.5} />
    </svg>
  );
}

// ─── Screen / Profile Monitor (rect + grid) ────────────────────────────
export function ScreenGlyph({ status = 'ok', size = 40 }) {
  const s = stroke(status), f = fill(status), c = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect x={6} y={6} width={size - 12} height={size - 12} rx={2} fill={f} stroke={s} strokeWidth={2} />
      <line x1={c} y1={6} x2={c} y2={size - 6} stroke={s} strokeWidth={0.5} strokeDasharray="2,2" />
      <line x1={6} y1={c} x2={size - 6} y2={c} stroke={s} strokeWidth={0.5} strokeDasharray="2,2" />
    </svg>
  );
}

// ─── Faraday Cup (cup shape) ────────────────────────────────────────────
export function FaradayCupGlyph({ status = 'ok', size = 40 }) {
  const s = stroke(status), f = fill(status);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <path d={`M8,8 L8,${size - 10} Q${size / 2},${size - 4} ${size - 8},${size - 10} L${size - 8},8`} fill={f} stroke={s} strokeWidth={2} />
      <text x={size / 2} y={size / 2 + 4} textAnchor="middle" fill={s} fontSize={12} fontWeight="bold">I</text>
    </svg>
  );
}

// ─── Beam Pipe (horizontal line + arrow) ────────────────────────────────
export function BeamPipeGlyph({ status = 'ok', size = 40 }) {
  const s = stroke(status), c = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <line x1={4} y1={c} x2={size - 4} y2={c} stroke={s} strokeWidth={3} />
      <polygon points={`${size - 8},${c - 5} ${size - 2},${c} ${size - 8},${c + 5}`} fill={s} />
    </svg>
  );
}

// ─── Modulator (rect + wave) ────────────────────────────────────────────
export function ModulatorGlyph({ status = 'ok', size = 40 }) {
  const s = stroke(status), f = fill(status), c = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect x={4} y={6} width={size - 8} height={size - 12} rx={4} fill={f} stroke={s} strokeWidth={2} />
      <path d={`M${10},${c} Q${14},${c - 6} ${18},${c} Q${22},${c + 6} ${26},${c} Q${30},${c - 6} ${34},${c}`} fill="none" stroke={s} strokeWidth={1.5} />
    </svg>
  );
}

// ─── Cooling / Chiller ──────────────────────────────────────────────────
export function CoolingGlyph({ status = 'ok', size = 40 }) {
  const s = stroke(status), f = fill(status), c = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={c} cy={c} r={c - 3} fill={f} stroke={s} strokeWidth={2} />
      {/* snowflake pattern */}
      <line x1={c} y1={8} x2={c} y2={size - 8} stroke={s} strokeWidth={1.5} />
      <line x1={8} y1={c} x2={size - 8} y2={c} stroke={s} strokeWidth={1.5} />
      <line x1={12} y1={12} x2={size - 12} y2={size - 12} stroke={s} strokeWidth={1} />
      <line x1={size - 12} y1={12} x2={12} y2={size - 12} stroke={s} strokeWidth={1} />
    </svg>
  );
}

// ─── I/O Module ─────────────────────────────────────────────────────────
export function IOGlyph({ status = 'ok', size = 40 }) {
  const s = stroke(status), f = fill(status);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect x={6} y={4} width={size - 12} height={size - 8} rx={3} fill={f} stroke={s} strokeWidth={2} />
      {[0.25, 0.5, 0.75].map((frac) => (
        <circle key={frac} cx={size * frac} cy={size - 8} r={2} fill={s} />
      ))}
      <text x={size / 2} y={size / 2 + 3} textAnchor="middle" fill={s} fontSize={9} fontWeight="bold">I/O</text>
    </svg>
  );
}

// ─── MPS / Safety ───────────────────────────────────────────────────────
export function MPSGlyph({ status = 'ok', size = 40 }) {
  const s = stroke(status), f = fill(status), c = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <polygon points={`${c},4 ${size - 4},${size - 4} 4,${size - 4}`} fill={f} stroke={s} strokeWidth={2} strokeLinejoin="round" />
      <text x={c} y={size - 10} textAnchor="middle" fill={s} fontSize={12} fontWeight="bold">!</text>
    </svg>
  );
}

// ─── Synch / Timing ─────────────────────────────────────────────────────
export function SynchGlyph({ status = 'ok', size = 40 }) {
  const s = stroke(status), f = fill(status), c = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={c} cy={c} r={c - 3} fill={f} stroke={s} strokeWidth={2} />
      <line x1={c} y1={c} x2={c} y2={10} stroke={s} strokeWidth={2} />
      <line x1={c} y1={c} x2={c + 8} y2={c + 2} stroke={s} strokeWidth={1.5} />
    </svg>
  );
}

// ─── Generic Device ─────────────────────────────────────────────────────
export function GenericGlyph({ status = 'ok', size = 40, label = '?' }) {
  const s = stroke(status), f = fill(status), c = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect x={4} y={4} width={size - 8} height={size - 8} rx={4} fill={f} stroke={s} strokeWidth={2} />
      <text x={c} y={c + 4} textAnchor="middle" fill={s} fontSize={12} fontWeight="bold">{label}</text>
    </svg>
  );
}

// ─── Glyph registry ─────────────────────────────────────────────────────

const GLYPH_MAP = {
  bpm:          BPMGlyph,
  quadrupole:   QuadrupoleGlyph,
  dipole:       DipoleGlyph,
  corrector:    CorrectorGlyph,
  motor:        MotorGlyph,
  mot:          MotorGlyph,
  camera:       CameraGlyph,
  cam:          CameraGlyph,
  adcamera:     CameraGlyph,
  ps:           PowerSupplyGlyph,
  'power-supply': PowerSupplyGlyph,
  mag:          PowerSupplyGlyph,
  vac:          VacuumGlyph,
  vacuum:       VacuumGlyph,
  valve:        ValveGlyph,
  rf:           RFCavityGlyph,
  cavity:       RFCavityGlyph,
  screen:       ScreenGlyph,
  'faraday-cup': FaradayCupGlyph,
  beam:         BeamPipeGlyph,
  modulator:    ModulatorGlyph,
  cooling:      CoolingGlyph,
  cool:         CoolingGlyph,
  io:           IOGlyph,
  mps:          MPSGlyph,
  synch:        SynchGlyph,
  tektronix:    GenericGlyph,
};

/** Get glyph component by device family/template/type string */
export function getGlyph(type) {
  return GLYPH_MAP[type] || GenericGlyph;
}

/** All available glyph types for the palette */
export const GLYPH_TYPES = [
  { type: 'motor',        label: 'Motor',         icon: '⚙' },
  { type: 'camera',       label: 'Camera',        icon: '📷' },
  { type: 'bpm',          label: 'BPM',           icon: '📡' },
  { type: 'ps',           label: 'Power Supply',  icon: '⚡' },
  { type: 'vac',          label: 'Vacuum Gauge',  icon: '💨' },
  { type: 'valve',        label: 'Valve',         icon: '🔸' },
  { type: 'quadrupole',   label: 'Quadrupole',    icon: '🧲' },
  { type: 'dipole',       label: 'Dipole',        icon: '↩' },
  { type: 'corrector',    label: 'Corrector',     icon: '→' },
  { type: 'rf',           label: 'RF Cavity',     icon: '📡' },
  { type: 'modulator',    label: 'Modulator',     icon: '📡' },
  { type: 'cooling',      label: 'Cooling',       icon: '❄' },
  { type: 'io',           label: 'I/O',           icon: '🔌' },
  { type: 'mps',          label: 'MPS',           icon: '🛡' },
  { type: 'synch',        label: 'Sync',          icon: '🔄' },
  { type: 'screen',       label: 'Screen',        icon: '🖵' },
  { type: 'faraday-cup',  label: 'Faraday Cup',   icon: '⚡' },
  { type: 'beam',         label: 'Beam Pipe',     icon: '→' },
];

export { STATUS_COLORS };
