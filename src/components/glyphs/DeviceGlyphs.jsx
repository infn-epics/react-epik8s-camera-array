/**
 * Beamline Device Glyphs — Professional SVG icon library for layout editor.
 *
 * 48×48 viewBox icons for accelerator & beamline components.
 * Each glyph accepts { status, size } props.
 * Status is indicated by the DeviceNode container; glyphs dim for disconnected/disabled.
 */

// ─── Status colors (used by layout nodes for border/background) ─────────
export const STATUS_COLORS = {
  ok:           '#22c55e',
  warning:      '#eab308',
  alarm:        '#ef4444',
  disconnected: '#6b7280',
  disabled:     '#374151',
};

// ─── SVG icon wrapper ───────────────────────────────────────────────────
function SvgIcon({ svg, size = 48, status = 'ok' }) {
  const dim = status === 'disconnected' || status === 'disabled';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={dim ? { opacity: status === 'disabled' ? 0.25 : 0.45, filter: 'grayscale(0.8)' } : undefined}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

// ─── SVG content library ────────────────────────────────────────────────
// All icons use a 48×48 viewBox with type-specific colors.
// currentColor inherits from the container's CSS color property.

const SVG = {

// ═══════════════ X-RAY SOURCES & OPTICS ═══════════════

undulator: `<g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
  <rect x="4" y="18" width="40" height="6" rx="1.5" fill="rgba(224,75,74,0.18)" stroke="#E24B4A"/>
  <rect x="4" y="24" width="40" height="6" rx="1.5" fill="rgba(56,139,212,0.18)" stroke="#185FA5"/>
  <line x1="11" y1="18" x2="11" y2="30"/><line x1="19" y1="18" x2="19" y2="30"/>
  <line x1="27" y1="18" x2="27" y2="30"/><line x1="35" y1="18" x2="35" y2="30"/>
  <text x="7" y="22.5" font-size="5" fill="#E24B4A" stroke="none" font-family="monospace">N S N S</text>
  <text x="7" y="32.5" font-size="5" fill="#185FA5" stroke="none" font-family="monospace">S N S N</text>
  <line x1="44" y1="24" x2="48" y2="20" stroke="#F5A623" stroke-width="1.2" opacity="0.9"/>
  <line x1="44" y1="24" x2="48" y2="24" stroke="#F5A623" stroke-width="1.2" opacity="0.7"/>
  <line x1="44" y1="24" x2="48" y2="28" stroke="#F5A623" stroke-width="1.2" opacity="0.5"/>
</g>`,

wiggler: `<g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
  <rect x="4" y="17" width="40" height="7" rx="1.5" fill="rgba(224,75,74,0.18)" stroke="#E24B4A" stroke-width="1.8"/>
  <rect x="4" y="24" width="40" height="7" rx="1.5" fill="rgba(56,139,212,0.18)" stroke="#185FA5" stroke-width="1.8"/>
  <line x1="14" y1="17" x2="14" y2="31"/><line x1="24" y1="17" x2="24" y2="31"/><line x1="34" y1="17" x2="34" y2="31"/>
  <line x1="44" y1="24" x2="48" y2="19" stroke="#F5A623" stroke-width="1.5" opacity="0.9"/>
  <line x1="44" y1="24" x2="48" y2="24" stroke="#F5A623" stroke-width="1.5" opacity="0.6"/>
  <line x1="44" y1="24" x2="48" y2="29" stroke="#F5A623" stroke-width="1.5" opacity="0.4"/>
</g>`,

'bending-magnet': `<g fill="none" stroke="currentColor" stroke-width="1.4">
  <path d="M8 28 Q24 4 40 28" fill="rgba(83,74,183,0.12)" stroke="#534AB7" stroke-width="1.6"/>
  <path d="M8 34 Q24 10 40 34" fill="rgba(83,74,183,0.08)" stroke="#534AB7" stroke-width="1"/>
  <line x1="4" y1="24" x2="8" y2="28" stroke="#FF6B35" stroke-width="1.8" stroke-linecap="round"/>
  <line x1="40" y1="28" x2="44" y2="24" stroke="#4A9EFF" stroke-width="1.8" stroke-linecap="round"/>
  <line x1="24" y1="16" x2="24" y2="10" stroke="#F5A623" stroke-width="1.2" opacity="0.8"/>
  <line x1="21" y1="15" x2="19" y2="10" stroke="#F5A623" stroke-width="1" opacity="0.5"/>
  <line x1="27" y1="15" x2="29" y2="10" stroke="#F5A623" stroke-width="1" opacity="0.5"/>
</g>`,

'mirror-flat': `<g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
  <polygon points="6,34 42,18 42,22 6,38" fill="rgba(181,212,244,0.25)" stroke="#185FA5" stroke-width="1.5"/>
  <line x1="6" y1="36" x2="42" y2="20" stroke="#185FA5" stroke-width="0.5" stroke-dasharray="2 2"/>
  <line x1="4" y1="24" x2="18" y2="28" stroke="#FF6B35" stroke-width="1.6"/>
  <line x1="18" y1="28" x2="32" y2="22" stroke="#4A9EFF" stroke-width="1.6"/>
</g>`,

'mirror-toroid': `<g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
  <path d="M6 38 Q24 12 42 22" fill="rgba(181,212,244,0.2)" stroke="#185FA5" stroke-width="1.6"/>
  <path d="M6 40 Q24 16 42 26" fill="none" stroke="#185FA5" stroke-width="0.5" stroke-dasharray="2 2"/>
  <line x1="4" y1="26" x2="14" y2="32" stroke="#FF6B35" stroke-width="1.6"/>
  <line x1="30" y1="24" x2="40" y2="18" stroke="#4A9EFF" stroke-width="1.6"/>
</g>`,

'kb-mirror': `<g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
  <polygon points="8,38 40,30 40,34 8,42" fill="rgba(29,158,117,0.15)" stroke="#1D9E75" stroke-width="1.4"/>
  <polygon points="8,22 8,30 16,30 16,22" fill="rgba(29,158,117,0.15)" stroke="#1D9E75" stroke-width="1.4" transform="rotate(-8,12,26)"/>
  <line x1="4" y1="24" x2="14" y2="28" stroke="#FF6B35" stroke-width="1.5"/>
  <line x1="14" y1="28" x2="26" y2="34" stroke="#4A9EFF" stroke-width="1.5"/>
  <circle cx="34" cy="32" r="2" fill="#4A9EFF" opacity="0.7"/>
</g>`,

dcm: `<g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
  <rect x="8" y="14" width="32" height="8" rx="2" fill="rgba(175,169,236,0.2)" stroke="#534AB7" stroke-width="1.5"/>
  <rect x="8" y="26" width="32" height="8" rx="2" fill="rgba(175,169,236,0.2)" stroke="#534AB7" stroke-width="1.5"/>
  <line x1="4" y1="18" x2="12" y2="18" stroke="#FF6B35" stroke-width="1.6"/>
  <line x1="12" y1="18" x2="20" y2="30" stroke="#FF6B35" stroke-width="1.3" stroke-dasharray="2 1.5"/>
  <line x1="20" y1="30" x2="36" y2="30" stroke="#4A9EFF" stroke-width="1.6"/>
  <text x="10" y="21.5" font-size="5" fill="#534AB7" stroke="none" font-family="monospace">Si111</text>
  <text x="10" y="33.5" font-size="5" fill="#534AB7" stroke="none" font-family="monospace">Si111</text>
</g>`,

'multilayer-mono': `<g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
  <rect x="6" y="26" width="36" height="3" rx="0.5" fill="rgba(83,74,183,0.25)" stroke="#534AB7" stroke-width="1"/>
  <rect x="6" y="29" width="36" height="2" fill="rgba(175,169,236,0.15)" stroke="#7F77DD" stroke-width="0.6"/>
  <rect x="6" y="31" width="36" height="3" rx="0.5" fill="rgba(83,74,183,0.25)" stroke="#534AB7" stroke-width="1"/>
  <rect x="6" y="34" width="36" height="2" fill="rgba(175,169,236,0.15)" stroke="#7F77DD" stroke-width="0.6"/>
  <rect x="6" y="36" width="36" height="3" rx="0.5" fill="rgba(83,74,183,0.25)" stroke="#534AB7" stroke-width="1"/>
  <line x1="4" y1="22" x2="18" y2="30" stroke="#FF6B35" stroke-width="1.6"/>
  <line x1="18" y1="30" x2="32" y2="22" stroke="#4A9EFF" stroke-width="1.6"/>
</g>`,

slits: `<g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
  <rect x="4" y="6" width="16" height="12" rx="1.5" fill="rgba(100,110,130,0.25)" stroke="currentColor" stroke-width="1.4"/>
  <rect x="28" y="6" width="16" height="12" rx="1.5" fill="rgba(100,110,130,0.25)" stroke="currentColor" stroke-width="1.4"/>
  <rect x="4" y="30" width="16" height="12" rx="1.5" fill="rgba(100,110,130,0.25)" stroke="currentColor" stroke-width="1.4"/>
  <rect x="28" y="30" width="16" height="12" rx="1.5" fill="rgba(100,110,130,0.25)" stroke="currentColor" stroke-width="1.4"/>
  <line x1="0" y1="24" x2="48" y2="24" stroke="#4A9EFF" stroke-width="1.2" stroke-dasharray="3 2" opacity="0.6"/>
</g>`,

attenuator: `<g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
  <rect x="18" y="8" width="4" height="32" rx="1" fill="rgba(136,135,128,0.4)" stroke="currentColor"/>
  <rect x="24" y="8" width="4" height="32" rx="1" fill="rgba(136,135,128,0.3)" stroke="currentColor"/>
  <rect x="30" y="8" width="4" height="32" rx="1" fill="rgba(136,135,128,0.2)" stroke="currentColor"/>
  <line x1="4" y1="24" x2="18" y2="24" stroke="#FF6B35" stroke-width="2"/>
  <line x1="34" y1="24" x2="44" y2="24" stroke="#FF6B35" stroke-width="1.2" opacity="0.4"/>
  <text x="17" y="44" font-size="5" stroke="none" fill="currentColor" font-family="monospace" opacity="0.6">Al Cu Mo</text>
</g>`,

'beam-stop': `<g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
  <line x1="4" y1="24" x2="22" y2="24" stroke="#FF6B35" stroke-width="2"/>
  <rect x="22" y="14" width="14" height="20" rx="2" fill="rgba(44,44,42,0.6)" stroke="#2C2C2A" stroke-width="1.8"/>
  <text x="24" y="26.5" font-size="7" stroke="none" fill="#888" font-family="monospace">W</text>
  <line x1="36" y1="14" x2="40" y2="10" stroke="#F5A623" stroke-width="1" opacity="0.5"/>
  <line x1="36" y1="24" x2="44" y2="24" stroke="#F5A623" stroke-width="0.8" opacity="0.3"/>
  <line x1="36" y1="34" x2="40" y2="38" stroke="#F5A623" stroke-width="1" opacity="0.5"/>
</g>`,

shutter: `<g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
  <line x1="4" y1="24" x2="16" y2="24" stroke="#FF6B35" stroke-width="2"/>
  <rect x="16" y="8" width="16" height="32" rx="2" fill="rgba(163,45,45,0.2)" stroke="#A32D2D" stroke-width="1.6"/>
  <line x1="20" y1="14" x2="28" y2="34" stroke="#A32D2D" stroke-width="1.2"/>
  <line x1="28" y1="14" x2="20" y2="34" stroke="#A32D2D" stroke-width="1.2"/>
  <line x1="32" y1="24" x2="44" y2="24" stroke="#FF6B35" stroke-width="2" stroke-dasharray="3 2" opacity="0.3"/>
</g>`,

'zone-plate': `<g fill="none" stroke="currentColor" stroke-linecap="round">
  <circle cx="24" cy="24" r="16" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <circle cx="24" cy="24" r="12" fill="rgba(74,158,255,0.1)" stroke="#4A9EFF" stroke-width="2"/>
  <circle cx="24" cy="24" r="8"  fill="none" stroke="currentColor" stroke-width="1.4"/>
  <circle cx="24" cy="24" r="5"  fill="rgba(74,158,255,0.15)" stroke="#4A9EFF" stroke-width="1.6"/>
  <circle cx="24" cy="24" r="2.5" fill="#4A9EFF" opacity="0.7"/>
  <line x1="4" y1="24" x2="8" y2="24" stroke="#FF6B35" stroke-width="1.6"/>
  <line x1="34" y1="32" x2="40" y2="40" stroke="#4A9EFF" stroke-width="1.2" opacity="0.7"/>
</g>`,

crl: `<g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
  <ellipse cx="16" cy="24" rx="5" ry="12" fill="rgba(74,158,255,0.1)" stroke="#4A9EFF"/>
  <ellipse cx="24" cy="24" rx="5" ry="12" fill="rgba(74,158,255,0.1)" stroke="#4A9EFF"/>
  <ellipse cx="32" cy="24" rx="5" ry="12" fill="rgba(74,158,255,0.1)" stroke="#4A9EFF"/>
  <line x1="4" y1="24" x2="11" y2="24" stroke="#FF6B35" stroke-width="1.6"/>
  <line x1="37" y1="24" x2="44" y2="24" stroke="#4A9EFF" stroke-width="1.6"/>
</g>`,

capillary: `<g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
  <path d="M4 18 Q24 16 44 22" fill="none" stroke="currentColor"/>
  <path d="M4 30 Q24 32 44 26" fill="none" stroke="currentColor"/>
  <path d="M4 21 Q24 20 44 23" fill="rgba(74,158,255,0.1)" stroke="#4A9EFF" stroke-width="0.8"/>
  <path d="M4 27 Q24 28 44 25" fill="rgba(74,158,255,0.1)" stroke="#4A9EFF" stroke-width="0.8"/>
  <line x1="0" y1="22" x2="4" y2="22" stroke="#FF6B35" stroke-width="1.8"/>
  <line x1="0" y1="26" x2="4" y2="26" stroke="#FF6B35" stroke-width="1.8"/>
  <line x1="44" y1="23" x2="48" y2="21" stroke="#4A9EFF" stroke-width="1.4"/>
  <line x1="44" y1="24" x2="48" y2="24" stroke="#4A9EFF" stroke-width="1.4"/>
  <line x1="44" y1="25" x2="48" y2="27" stroke="#4A9EFF" stroke-width="1.4"/>
</g>`,

// ═══════════════ ELECTRON BEAM ELEMENTS ═══════════════

'electron-gun': `<g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
  <polygon points="6,16 22,10 22,38 6,32" fill="rgba(61,214,140,0.12)" stroke="#1D9E75" stroke-width="1.6"/>
  <circle cx="8" cy="24" r="3" fill="#1D9E75" opacity="0.7"/>
  <line x1="22" y1="18" x2="30" y2="14" stroke="currentColor" stroke-width="1"/>
  <line x1="22" y1="24" x2="44" y2="24" stroke="#9B72FF" stroke-width="1.8"/>
  <line x1="22" y1="30" x2="30" y2="34" stroke="currentColor" stroke-width="1"/>
  <line x1="34" y1="24" x2="38" y2="20" stroke="#9B72FF" stroke-width="1" opacity="0.5"/>
  <line x1="34" y1="24" x2="38" y2="28" stroke="#9B72FF" stroke-width="1" opacity="0.5"/>
  <circle cx="40" cy="24" r="1.5" fill="#9B72FF" opacity="0.8"/>
</g>`,

'rf-cavity': `<g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
  <rect x="10" y="12" width="28" height="24" rx="3" fill="rgba(245,166,35,0.1)" stroke="#F5A623" stroke-width="1.6"/>
  <line x1="16" y1="12" x2="16" y2="36" stroke="#F5A623" stroke-width="0.8" opacity="0.5"/>
  <line x1="24" y1="12" x2="24" y2="36" stroke="#F5A623" stroke-width="0.8" opacity="0.5"/>
  <line x1="32" y1="12" x2="32" y2="36" stroke="#F5A623" stroke-width="0.8" opacity="0.5"/>
  <path d="M16 20 Q20 14 24 20 Q28 26 32 20" fill="none" stroke="#F5A623" stroke-width="1.4" opacity="0.8"/>
  <line x1="0" y1="24" x2="10" y2="24" stroke="#9B72FF" stroke-width="1.8"/>
  <line x1="38" y1="24" x2="48" y2="24" stroke="#9B72FF" stroke-width="1.8"/>
  <text x="6" y="44" font-size="6" stroke="none" fill="#F5A623" font-family="monospace" opacity="0.8">RF</text>
</g>`,

quadrupole: `<g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
  <rect x="10" y="10" width="28" height="28" rx="2" fill="rgba(24,95,165,0.1)" stroke="#185FA5" stroke-width="1.5"/>
  <circle cx="24" cy="24" r="5" fill="none" stroke="#185FA5" stroke-width="1.2"/>
  <circle cx="14" cy="14" r="3.5" fill="rgba(24,95,165,0.25)" stroke="#185FA5" stroke-width="1"/>
  <circle cx="34" cy="14" r="3.5" fill="rgba(24,95,165,0.1)" stroke="#185FA5" stroke-width="1"/>
  <circle cx="14" cy="34" r="3.5" fill="rgba(24,95,165,0.1)" stroke="#185FA5" stroke-width="1"/>
  <circle cx="34" cy="34" r="3.5" fill="rgba(24,95,165,0.25)" stroke="#185FA5" stroke-width="1"/>
  <line x1="0" y1="24" x2="10" y2="24" stroke="#9B72FF" stroke-width="1.8"/>
  <line x1="38" y1="24" x2="48" y2="24" stroke="#9B72FF" stroke-width="1.8"/>
</g>`,

dipole: `<g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
  <polygon points="6,12 42,8 42,26 6,30" fill="rgba(83,74,183,0.15)" stroke="#534AB7" stroke-width="1.6"/>
  <line x1="0" y1="19" x2="6" y2="21" stroke="#9B72FF" stroke-width="1.8"/>
  <line x1="42" y1="17" x2="48" y2="15" stroke="#4A9EFF" stroke-width="1.8"/>
  <text x="16" y="22" font-size="7" stroke="none" fill="#534AB7" font-family="monospace">B &#x2297;</text>
</g>`,

solenoid: `<g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
  <rect x="8" y="14" width="32" height="20" rx="10" fill="none" stroke="#9B72FF" stroke-width="1.6"/>
  <line x1="14" y1="14" x2="14" y2="34" stroke="#9B72FF" stroke-width="0.8" opacity="0.5"/>
  <line x1="20" y1="14" x2="20" y2="34" stroke="#9B72FF" stroke-width="0.8" opacity="0.5"/>
  <line x1="26" y1="14" x2="26" y2="34" stroke="#9B72FF" stroke-width="0.8" opacity="0.5"/>
  <line x1="32" y1="14" x2="32" y2="34" stroke="#9B72FF" stroke-width="0.8" opacity="0.5"/>
  <line x1="0" y1="24" x2="8" y2="24" stroke="#9B72FF" stroke-width="1.8"/>
  <line x1="40" y1="24" x2="48" y2="24" stroke="#9B72FF" stroke-width="1.8"/>
</g>`,

'bunch-compressor': `<g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
  <polygon points="4,18 14,14 14,24 4,28"  fill="rgba(83,74,183,0.15)" stroke="#534AB7" stroke-width="1.2"/>
  <polygon points="16,24 24,20 24,28 16,32" fill="rgba(83,74,183,0.15)" stroke="#534AB7" stroke-width="1.2"/>
  <polygon points="26,20 34,16 34,26 26,30" fill="rgba(83,74,183,0.15)" stroke="#534AB7" stroke-width="1.2"/>
  <polygon points="36,26 44,22 44,32 36,36" fill="rgba(83,74,183,0.15)" stroke="#534AB7" stroke-width="1.2"/>
  <path d="M4 22 Q9 32 14 22 Q19 32 24 24 Q29 28 34 20 Q39 28 44 26" fill="none" stroke="#9B72FF" stroke-width="1.5" stroke-dasharray="2 1.5"/>
  <line x1="0" y1="22" x2="4" y2="22" stroke="#9B72FF" stroke-width="1.6"/>
  <line x1="44" y1="26" x2="48" y2="26" stroke="#9B72FF" stroke-width="1.6"/>
</g>`,

sextupole: `<g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
  <circle cx="24" cy="24" r="14" fill="none" stroke="#2DD4BF" stroke-width="1.5"/>
  <circle cx="24" cy="24" r="5" fill="none" stroke="#2DD4BF" stroke-width="1.2"/>
  <polygon points="24,10 27,21 24,24 21,21" fill="rgba(45,212,191,0.2)" stroke="#2DD4BF" stroke-width="0.8"/>
  <polygon points="36,17 27,22 24,24 26,27" fill="rgba(45,212,191,0.15)" stroke="#2DD4BF" stroke-width="0.8"/>
  <polygon points="36,31 25,27 24,24 27,21" fill="rgba(45,212,191,0.2)" stroke="#2DD4BF" stroke-width="0.8"/>
  <polygon points="24,38 21,27 24,24 27,27" fill="rgba(45,212,191,0.15)" stroke="#2DD4BF" stroke-width="0.8"/>
  <polygon points="12,31 23,27 24,24 21,21" fill="rgba(45,212,191,0.2)" stroke="#2DD4BF" stroke-width="0.8"/>
  <polygon points="12,17 25,21 24,24 21,27" fill="rgba(45,212,191,0.15)" stroke="#2DD4BF" stroke-width="0.8"/>
  <line x1="0" y1="24" x2="10" y2="24" stroke="#9B72FF" stroke-width="1.8"/>
  <line x1="38" y1="24" x2="48" y2="24" stroke="#9B72FF" stroke-width="1.8"/>
</g>`,

kicker: `<g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
  <rect x="10" y="14" width="28" height="20" rx="2" fill="rgba(232,91,60,0.12)" stroke="#E24B4A" stroke-width="1.6"/>
  <line x1="0" y1="24" x2="10" y2="24" stroke="#9B72FF" stroke-width="1.8"/>
  <line x1="38" y1="24" x2="44" y2="19" stroke="#9B72FF" stroke-width="1.8"/>
  <line x1="38" y1="24" x2="44" y2="29" stroke="#9B72FF" stroke-width="0.8" stroke-dasharray="2 1.5" opacity="0.5"/>
  <line x1="18" y1="14" x2="18" y2="34" stroke="#E24B4A" stroke-width="0.8" opacity="0.5"/>
  <line x1="26" y1="14" x2="26" y2="34" stroke="#E24B4A" stroke-width="0.8" opacity="0.5"/>
  <text x="11" y="27" font-size="7" stroke="none" fill="#E24B4A" font-family="monospace">pulse</text>
</g>`,

// ═══════════════ DIAGNOSTICS ═══════════════

bpm: `<g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
  <circle cx="24" cy="24" r="14" fill="rgba(61,214,140,0.08)" stroke="#3DD68C" stroke-width="1.5"/>
  <circle cx="24" cy="24" r="4"  fill="rgba(61,214,140,0.2)" stroke="#3DD68C" stroke-width="1.2"/>
  <rect x="21" y="10" width="6" height="4" rx="1" fill="rgba(61,214,140,0.3)" stroke="#3DD68C" stroke-width="1"/>
  <rect x="21" y="34" width="6" height="4" rx="1" fill="rgba(61,214,140,0.3)" stroke="#3DD68C" stroke-width="1"/>
  <rect x="10" y="21" width="4" height="6" rx="1" fill="rgba(61,214,140,0.3)" stroke="#3DD68C" stroke-width="1"/>
  <rect x="34" y="21" width="4" height="6" rx="1" fill="rgba(61,214,140,0.3)" stroke="#3DD68C" stroke-width="1"/>
  <line x1="0" y1="24" x2="10" y2="24" stroke="#9B72FF" stroke-width="1.6"/>
  <line x1="38" y1="24" x2="48" y2="24" stroke="#9B72FF" stroke-width="1.6"/>
</g>`,

screen: `<g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
  <rect x="20" y="8" width="8" height="32" rx="1.5" fill="rgba(245,166,35,0.2)" stroke="#F5A623" stroke-width="1.6"/>
  <line x1="0" y1="24" x2="20" y2="24" stroke="#9B72FF" stroke-width="1.8"/>
  <line x1="28" y1="24" x2="48" y2="24" stroke="#9B72FF" stroke-width="0.8" stroke-dasharray="2 1.5" opacity="0.4"/>
  <ellipse cx="36" cy="16" rx="7" ry="5" fill="rgba(245,166,35,0.15)" stroke="#F5A623" stroke-width="1"/>
  <line x1="28" y1="20" x2="30" y2="17" stroke="#F5A623" stroke-width="0.8"/>
  <text x="33" y="19" font-size="5" stroke="none" fill="#F5A623" font-family="monospace">CCD</text>
</g>`,

ict: `<g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
  <circle cx="24" cy="24" r="12" fill="rgba(245,166,35,0.1)" stroke="#F5A623" stroke-width="2"/>
  <circle cx="24" cy="24" r="6"  fill="none" stroke="#F5A623" stroke-width="1"/>
  <line x1="0" y1="24" x2="12" y2="24" stroke="#9B72FF" stroke-width="1.8"/>
  <line x1="36" y1="24" x2="48" y2="24" stroke="#9B72FF" stroke-width="1.8"/>
  <line x1="24" y1="12" x2="24" y2="6" stroke="#F5A623" stroke-width="1.2"/>
  <rect x="20" y="4" width="8" height="4" rx="1" fill="rgba(245,166,35,0.2)" stroke="#F5A623" stroke-width="1"/>
</g>`,

'faraday-cup': `<g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
  <path d="M20 10 L20 38 Q20 42 24 42 Q28 42 28 38 L28 10" fill="rgba(136,135,128,0.2)" stroke="currentColor" stroke-width="1.6"/>
  <line x1="0" y1="24" x2="20" y2="24" stroke="#9B72FF" stroke-width="1.8"/>
  <line x1="24" y1="10" x2="24" y2="6" stroke="#F5A623" stroke-width="1.2"/>
  <rect x="20" y="3" width="8" height="4" rx="1" fill="rgba(245,166,35,0.2)" stroke="#F5A623" stroke-width="1"/>
  <text x="21" y="6.5" font-size="4.5" stroke="none" fill="#F5A623" font-family="monospace">nA</text>
</g>`,

'wire-scanner': `<g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
  <line x1="0" y1="24" x2="48" y2="24" stroke="#9B72FF" stroke-width="1.6"/>
  <line x1="24" y1="8" x2="24" y2="40" stroke="#F5A623" stroke-width="1.2"/>
  <path d="M18 6 L24 8 L30 6" fill="none" stroke="currentColor" stroke-width="1"/>
  <path d="M18 42 L24 40 L30 42" fill="none" stroke="currentColor" stroke-width="1"/>
  <circle cx="24" cy="24" r="2.5" fill="#F5A623" opacity="0.8"/>
</g>`,

'stripline-bpm': `<g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
  <rect x="8" y="10" width="32" height="28" rx="3" fill="rgba(61,214,140,0.08)" stroke="#3DD68C" stroke-width="1.5"/>
  <rect x="12" y="14" width="24" height="4" rx="1" fill="rgba(61,214,140,0.2)" stroke="#3DD68C" stroke-width="1"/>
  <rect x="12" y="30" width="24" height="4" rx="1" fill="rgba(61,214,140,0.2)" stroke="#3DD68C" stroke-width="1"/>
  <line x1="0" y1="24" x2="8"  y2="24" stroke="#9B72FF" stroke-width="1.8"/>
  <line x1="40" y1="24" x2="48" y2="24" stroke="#9B72FF" stroke-width="1.8"/>
</g>`,

'loss-monitor': `<g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
  <circle cx="24" cy="24" r="13" fill="rgba(224,75,74,0.1)" stroke="#E24B4A" stroke-width="1.5"/>
  <line x1="0"  y1="24" x2="11" y2="24" stroke="#9B72FF" stroke-width="1.6"/>
  <line x1="37" y1="24" x2="48" y2="24" stroke="#9B72FF" stroke-width="1.6"/>
  <path d="M18 18 L24 24 L18 30" stroke="#E24B4A" stroke-width="1.4" fill="none"/>
  <path d="M24 18 L30 24 L24 30" stroke="#E24B4A" stroke-width="1" fill="none" opacity="0.5"/>
  <text x="17" y="28" font-size="9" stroke="none" fill="#E24B4A" font-family="monospace" opacity="0.8">!</text>
</g>`,

'emittance-meter': `<g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
  <rect x="14" y="10" width="6" height="28" rx="1" fill="rgba(155,114,255,0.15)" stroke="#9B72FF" stroke-width="1.4"/>
  <circle cx="17" cy="17" r="1.5" fill="#9B72FF" opacity="0.8"/>
  <circle cx="17" cy="24" r="1.5" fill="#9B72FF" opacity="0.8"/>
  <circle cx="17" cy="31" r="1.5" fill="#9B72FF" opacity="0.8"/>
  <line x1="17" y1="17" x2="32" y2="12" stroke="#F5A623" stroke-width="1" opacity="0.7"/>
  <line x1="17" y1="24" x2="32" y2="24" stroke="#F5A623" stroke-width="1" opacity="0.7"/>
  <line x1="17" y1="31" x2="32" y2="36" stroke="#F5A623" stroke-width="1" opacity="0.7"/>
  <rect x="32" y="10" width="8" height="28" rx="1" fill="rgba(245,166,35,0.15)" stroke="#F5A623" stroke-width="1.4"/>
  <line x1="0"  y1="24" x2="14" y2="24" stroke="#9B72FF" stroke-width="1.8"/>
</g>`,

// ═══════════════ COMMON / BOTH ═══════════════

'vacuum-valve': `<g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
  <circle cx="24" cy="24" r="12" fill="rgba(100,110,130,0.1)" stroke="currentColor" stroke-width="1.5"/>
  <line x1="12" y1="24" x2="36" y2="24" stroke="currentColor" stroke-width="1.8"/>
  <path d="M16 16 L32 32" stroke="currentColor" stroke-width="1.2" opacity="0.4"/>
  <line x1="24" y1="12" x2="24" y2="6"  stroke="currentColor" stroke-width="1.2"/>
  <rect x="20" y="3" width="8" height="4" rx="1" fill="rgba(100,110,130,0.2)" stroke="currentColor" stroke-width="1"/>
  <line x1="0"  y1="24" x2="12" y2="24" stroke="currentColor" stroke-width="1.8"/>
  <line x1="36" y1="24" x2="48" y2="24" stroke="currentColor" stroke-width="1.8"/>
</g>`,

'ion-pump': `<g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
  <rect x="10" y="14" width="28" height="20" rx="3" fill="rgba(100,110,130,0.1)" stroke="currentColor" stroke-width="1.5"/>
  <line x1="24" y1="14" x2="24" y2="4"  stroke="currentColor" stroke-width="1.4"/>
  <circle cx="24" cy="4" r="2.5" fill="rgba(74,158,255,0.3)" stroke="#4A9EFF" stroke-width="1"/>
  <line x1="16" y1="20" x2="16" y2="28" stroke="#4A9EFF" stroke-width="0.8" opacity="0.6"/>
  <line x1="24" y1="18" x2="24" y2="30" stroke="#4A9EFF" stroke-width="0.8" opacity="0.6"/>
  <line x1="32" y1="20" x2="32" y2="28" stroke="#4A9EFF" stroke-width="0.8" opacity="0.6"/>
  <text x="14" y="27.5" font-size="5.5" stroke="none" fill="#4A9EFF" font-family="monospace" opacity="0.8">UHV</text>
</g>`,

cryostat: `<g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
  <rect x="6" y="10" width="36" height="28" rx="4" fill="rgba(74,158,255,0.08)" stroke="#4A9EFF" stroke-width="1.5"/>
  <rect x="12" y="16" width="24" height="16" rx="3" fill="rgba(74,158,255,0.15)" stroke="#4A9EFF" stroke-width="1"/>
  <line x1="0"  y1="24" x2="12" y2="24" stroke="#9B72FF" stroke-width="1.8"/>
  <line x1="36" y1="24" x2="48" y2="24" stroke="#9B72FF" stroke-width="1.8"/>
  <text x="15" y="27" font-size="7" stroke="none" fill="#4A9EFF" font-family="monospace">4 K</text>
  <line x1="6" y1="38" x2="6" y2="44" stroke="#4A9EFF" stroke-width="1"/>
  <line x1="42" y1="38" x2="42" y2="44" stroke="#4A9EFF" stroke-width="1"/>
  <line x1="4" y1="44" x2="44" y2="44" stroke="#4A9EFF" stroke-width="0.8" stroke-dasharray="2 2"/>
</g>`,

'sample-stage': `<g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
  <rect x="14" y="20" width="20" height="14" rx="2" fill="rgba(245,166,35,0.15)" stroke="#F5A623" stroke-width="1.5"/>
  <line x1="24" y1="20" x2="24" y2="12" stroke="currentColor"/>
  <line x1="8"  y1="24" x2="14" y2="24" stroke="#FF6B35" stroke-width="1.6"/>
  <line x1="34" y1="24" x2="40" y2="24" stroke="#4A9EFF" stroke-width="1.6"/>
  <line x1="14" y1="34" x2="10" y2="40" stroke="currentColor" stroke-width="1"/>
  <line x1="34" y1="34" x2="38" y2="40" stroke="currentColor" stroke-width="1"/>
  <line x1="8"  y1="40" x2="40" y2="40" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="24" cy="24" r="2.5" fill="#F5A623" opacity="0.7"/>
</g>`,

'detector-area': `<g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
  <rect x="28" y="8" width="18" height="32" rx="2" fill="rgba(61,214,140,0.12)" stroke="#3DD68C" stroke-width="1.6"/>
  <line x1="33" y1="8"  x2="33" y2="40" stroke="#3DD68C" stroke-width="0.6" opacity="0.5"/>
  <line x1="38" y1="8"  x2="38" y2="40" stroke="#3DD68C" stroke-width="0.6" opacity="0.5"/>
  <line x1="28" y1="14" x2="46" y2="14" stroke="#3DD68C" stroke-width="0.6" opacity="0.5"/>
  <line x1="28" y1="20" x2="46" y2="20" stroke="#3DD68C" stroke-width="0.6" opacity="0.5"/>
  <line x1="28" y1="26" x2="46" y2="26" stroke="#3DD68C" stroke-width="0.6" opacity="0.5"/>
  <line x1="28" y1="32" x2="46" y2="32" stroke="#3DD68C" stroke-width="0.6" opacity="0.5"/>
  <line x1="4"  y1="24" x2="28" y2="24" stroke="#4A9EFF" stroke-width="1.8"/>
  <line x1="4"  y1="22" x2="12" y2="24" stroke="#4A9EFF" stroke-width="0.8" opacity="0.4"/>
  <line x1="4"  y1="26" x2="12" y2="24" stroke="#4A9EFF" stroke-width="0.8" opacity="0.4"/>
</g>`,

'detector-point': `<g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
  <polygon points="30,12 44,24 30,36" fill="rgba(61,214,140,0.15)" stroke="#3DD68C" stroke-width="1.6"/>
  <line x1="4" y1="24" x2="30" y2="24" stroke="#4A9EFF" stroke-width="1.8"/>
  <line x1="44" y1="24" x2="44" y2="16" stroke="#3DD68C" stroke-width="1.2"/>
  <rect x="40" y="12" width="8" height="6" rx="1" fill="rgba(61,214,140,0.2)" stroke="#3DD68C" stroke-width="1"/>
  <text x="41" y="17" font-size="5" stroke="none" fill="#3DD68C" font-family="monospace">APD</text>
</g>`,

'fluorescence-det': `<g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
  <line x1="4"  y1="24" x2="44" y2="24" stroke="#4A9EFF" stroke-width="1.6"/>
  <circle cx="24" cy="24" r="4" fill="rgba(245,166,35,0.3)" stroke="#F5A623" stroke-width="1.2"/>
  <line x1="24" y1="20" x2="24" y2="8" stroke="#F5A623" stroke-width="1.2"/>
  <rect x="18" y="4" width="12" height="6" rx="1.5" fill="rgba(245,166,35,0.2)" stroke="#F5A623" stroke-width="1.2"/>
  <text x="19.5" y="9" font-size="5" stroke="none" fill="#F5A623" font-family="monospace">SDD</text>
  <line x1="24" y1="20" x2="20" y2="12" stroke="#F5A623" stroke-width="0.8" opacity="0.5"/>
  <line x1="24" y1="20" x2="28" y2="12" stroke="#F5A623" stroke-width="0.8" opacity="0.5"/>
</g>`,

'analyzer-crystal': `<g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
  <path d="M8 36 Q24 14 40 28" fill="rgba(175,169,236,0.15)" stroke="#534AB7" stroke-width="1.8"/>
  <line x1="4"  y1="24" x2="16" y2="31" stroke="#4A9EFF" stroke-width="1.6"/>
  <line x1="32" y1="21" x2="42" y2="16" stroke="#4A9EFF" stroke-width="1.4"/>
  <circle cx="42" cy="14" r="3" fill="rgba(61,214,140,0.2)" stroke="#3DD68C" stroke-width="1.2"/>
</g>`,

'ion-chamber': `<g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
  <rect x="10" y="14" width="28" height="20" rx="2" fill="rgba(74,158,255,0.08)" stroke="#4A9EFF" stroke-width="1.5"/>
  <line x1="16" y1="16" x2="16" y2="32" stroke="#4A9EFF" stroke-width="0.8" opacity="0.6"/>
  <line x1="24" y1="16" x2="24" y2="32" stroke="#4A9EFF" stroke-width="0.8" opacity="0.6"/>
  <line x1="32" y1="16" x2="32" y2="32" stroke="#4A9EFF" stroke-width="0.8" opacity="0.6"/>
  <line x1="0"  y1="24" x2="10" y2="24" stroke="#4A9EFF" stroke-width="1.8"/>
  <line x1="38" y1="24" x2="48" y2="24" stroke="#4A9EFF" stroke-width="1.8"/>
</g>`,

'vacuum-gauge': `<g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">
  <circle cx="24" cy="26" r="12" fill="rgba(100,110,130,0.08)" stroke="currentColor" stroke-width="1.5"/>
  <path d="M14 32 Q24 14 34 32" fill="none" stroke="currentColor" stroke-width="1" opacity="0.4"/>
  <line x1="24" y1="26" x2="30" y2="18" stroke="currentColor" stroke-width="1.4"/>
  <circle cx="24" cy="26" r="2" fill="currentColor" opacity="0.5"/>
  <line x1="24" y1="14" x2="24" y2="8" stroke="currentColor" stroke-width="1.2"/>
  <line x1="14" y1="26" x2="0" y2="26" stroke="currentColor" stroke-width="1"/>
</g>`,

// ═══════════════ ADDITIONAL (kept from original) ═══════════════

corrector: `<g fill="none" stroke-width="1.4" stroke-linecap="round">
  <rect x="12" y="12" width="24" height="24" rx="2" fill="rgba(24,95,165,0.1)" stroke="#185FA5" stroke-width="1.5"/>
  <line x1="16" y1="24" x2="32" y2="24" stroke="#185FA5" stroke-width="2"/>
  <polygon points="30,20 36,24 30,28" fill="#185FA5"/>
  <line x1="0" y1="24" x2="12" y2="24" stroke="#9B72FF" stroke-width="1.8"/>
  <line x1="36" y1="24" x2="48" y2="24" stroke="#9B72FF" stroke-width="1.8"/>
</g>`,

motor: `<g fill="none" stroke-width="1.4" stroke-linecap="round">
  <rect x="6" y="10" width="24" height="28" rx="3" fill="rgba(245,166,35,0.12)" stroke="#F5A623" stroke-width="1.6"/>
  <line x1="30" y1="24" x2="42" y2="24" stroke="#F5A623" stroke-width="3"/>
  <circle cx="42" cy="24" r="3" fill="#F5A623" opacity="0.7"/>
  <text x="14" y="27" font-size="8" stroke="none" fill="#F5A623" font-family="monospace" text-anchor="middle">M</text>
</g>`,

camera: `<g fill="none" stroke-width="1.4" stroke-linecap="round">
  <rect x="6" y="12" width="36" height="24" rx="4" fill="rgba(61,214,140,0.1)" stroke="#3DD68C" stroke-width="1.6"/>
  <circle cx="24" cy="24" r="8" fill="none" stroke="#3DD68C" stroke-width="1.5"/>
  <circle cx="24" cy="24" r="3" fill="#3DD68C" opacity="0.7"/>
  <rect x="8" y="14" width="6" height="3" rx="1" fill="rgba(61,214,140,0.3)" stroke="#3DD68C" stroke-width="0.8"/>
</g>`,

ps: `<g fill="none" stroke-width="1.4" stroke-linecap="round">
  <rect x="8" y="8" width="32" height="32" rx="3" fill="rgba(155,114,255,0.1)" stroke="#9B72FF" stroke-width="1.6"/>
  <path d="M21 14 L25 22 L21 22 L27 34" fill="none" stroke="#9B72FF" stroke-width="2" stroke-linejoin="round"/>
  <line x1="8" y1="40" x2="14" y2="40" stroke="#9B72FF" stroke-width="1.2"/>
  <line x1="34" y1="40" x2="40" y2="40" stroke="#9B72FF" stroke-width="1.2"/>
</g>`,

beam: `<g fill="none" stroke-width="1.4" stroke-linecap="round">
  <line x1="4" y1="24" x2="40" y2="24" stroke="#4A9EFF" stroke-width="3"/>
  <polygon points="38,18 48,24 38,30" fill="#4A9EFF" opacity="0.8"/>
</g>`,

modulator: `<g fill="none" stroke-width="1.4" stroke-linecap="round">
  <rect x="6" y="10" width="36" height="28" rx="4" fill="rgba(245,166,35,0.1)" stroke="#F5A623" stroke-width="1.6"/>
  <path d="M12 24 Q16 16 20 24 Q24 32 28 24 Q32 16 36 24" fill="none" stroke="#F5A623" stroke-width="1.8"/>
  <line x1="0" y1="24" x2="6" y2="24" stroke="#9B72FF" stroke-width="1.8"/>
  <line x1="42" y1="24" x2="48" y2="24" stroke="#9B72FF" stroke-width="1.8"/>
</g>`,

cooling: `<g fill="none" stroke-width="1.4" stroke-linecap="round">
  <circle cx="24" cy="24" r="14" fill="rgba(74,158,255,0.08)" stroke="#4A9EFF" stroke-width="1.5"/>
  <line x1="24" y1="12" x2="24" y2="36" stroke="#4A9EFF" stroke-width="1.5"/>
  <line x1="12" y1="24" x2="36" y2="24" stroke="#4A9EFF" stroke-width="1.5"/>
  <line x1="16" y1="16" x2="32" y2="32" stroke="#4A9EFF" stroke-width="1"/>
  <line x1="32" y1="16" x2="16" y2="32" stroke="#4A9EFF" stroke-width="1"/>
  <circle cx="24" cy="24" r="3" fill="#4A9EFF" opacity="0.3"/>
</g>`,

io: `<g fill="none" stroke-width="1.4" stroke-linecap="round">
  <rect x="8" y="8" width="32" height="32" rx="3" fill="rgba(122,144,184,0.1)" stroke="#7A90B8" stroke-width="1.5"/>
  <circle cx="16" cy="36" r="2" fill="#7A90B8"/><circle cx="24" cy="36" r="2" fill="#7A90B8"/><circle cx="32" cy="36" r="2" fill="#7A90B8"/>
  <text x="24" y="25" font-size="9" stroke="none" fill="#7A90B8" font-family="monospace" text-anchor="middle" font-weight="bold">I/O</text>
</g>`,

mps: `<g fill="none" stroke-width="1.4" stroke-linecap="round">
  <polygon points="24,6 44,40 4,40" fill="rgba(224,75,74,0.12)" stroke="#E24B4A" stroke-width="1.8" stroke-linejoin="round"/>
  <text x="24" y="34" font-size="14" stroke="none" fill="#E24B4A" font-family="monospace" text-anchor="middle" font-weight="bold">!</text>
</g>`,

synch: `<g fill="none" stroke-width="1.4" stroke-linecap="round">
  <circle cx="24" cy="24" r="14" fill="rgba(155,114,255,0.08)" stroke="#9B72FF" stroke-width="1.5"/>
  <line x1="24" y1="24" x2="24" y2="13" stroke="#9B72FF" stroke-width="2"/>
  <line x1="24" y1="24" x2="32" y2="28" stroke="#9B72FF" stroke-width="1.5"/>
  <circle cx="24" cy="24" r="2" fill="#9B72FF" opacity="0.7"/>
</g>`,

'turbo-pump': `<g fill="none" stroke-width="1.4" stroke-linecap="round">
  <circle cx="24" cy="24" r="14" fill="rgba(100,110,130,0.08)" stroke="currentColor" stroke-width="1.5"/>
  <line x1="24" y1="24" x2="24" y2="12" stroke="currentColor" stroke-width="2"/>
  <line x1="24" y1="24" x2="36" y2="30" stroke="currentColor" stroke-width="2"/>
  <line x1="24" y1="24" x2="12" y2="30" stroke="currentColor" stroke-width="2"/>
  <circle cx="24" cy="24" r="3" fill="currentColor" opacity="0.3"/>
</g>`,

flag: `<g fill="none" stroke-width="1.4" stroke-linecap="round">
  <line x1="24" y1="6" x2="24" y2="42" stroke="#F5A623" stroke-width="2"/>
  <rect x="24" y="6" width="16" height="14" rx="1" fill="rgba(245,166,35,0.2)" stroke="#F5A623" stroke-width="1.5"/>
  <circle cx="16" cy="24" r="2" fill="#F5A623" opacity="0.5"/>
</g>`,

bcm: `<g fill="none" stroke-width="1.4" stroke-linecap="round">
  <circle cx="24" cy="24" r="14" fill="rgba(61,214,140,0.08)" stroke="#3DD68C" stroke-width="1.5"/>
  <circle cx="24" cy="24" r="7" fill="none" stroke="#3DD68C" stroke-width="1.2"/>
  <line x1="0" y1="24" x2="10" y2="24" stroke="#9B72FF" stroke-width="1.8"/>
  <line x1="38" y1="24" x2="48" y2="24" stroke="#9B72FF" stroke-width="1.8"/>
  <text x="24" y="27" font-size="6" stroke="none" fill="#3DD68C" font-family="monospace" text-anchor="middle">BCM</text>
</g>`,

generic: `<g fill="none" stroke-width="1.4" stroke-linecap="round">
  <rect x="8" y="8" width="32" height="32" rx="4" fill="rgba(122,144,184,0.08)" stroke="#7A90B8" stroke-width="1.5"/>
  <text x="24" y="28" font-size="14" stroke="none" fill="#7A90B8" font-family="monospace" text-anchor="middle">?</text>
</g>`,

};

// ─── Glyph component factory ────────────────────────────────────────────
function createGlyph(id) {
  const Component = ({ status = 'ok', size = 48 }) => (
    <SvgIcon svg={SVG[id]} size={size} status={status} />
  );
  Component.displayName = `${id}Glyph`;
  return Component;
}

// Create all glyph components
const GLYPH_COMPONENTS = {};
for (const id of Object.keys(SVG)) {
  GLYPH_COMPONENTS[id] = createGlyph(id);
}

// ─── Glyph registry (maps string keys → components) ────────────────────
const GLYPH_MAP = {
  // Direct matches
  ...GLYPH_COMPONENTS,
  // Aliases for backward compat & family-based lookup
  'acc-struct':     GLYPH_COMPONENTS['rf-cavity'],
  rf:               GLYPH_COMPONENTS['rf-cavity'],
  cavity:           GLYPH_COMPONENTS['rf-cavity'],
  gun:              GLYPH_COMPONENTS['electron-gun'],
  mot:              GLYPH_COMPONENTS.motor,
  cam:              GLYPH_COMPONENTS.camera,
  adcamera:         GLYPH_COMPONENTS.camera,
  'power-supply':   GLYPH_COMPONENTS.ps,
  mag:              GLYPH_COMPONENTS.quadrupole,
  vac:              GLYPH_COMPONENTS['vacuum-gauge'],
  vacuum:           GLYPH_COMPONENTS['vacuum-gauge'],
  valve:            GLYPH_COMPONENTS['vacuum-valve'],
  cool:             GLYPH_COMPONENTS.cooling,
  tektronix:        GLYPH_COMPONENTS.generic,
};

/** Get glyph component by device family/template/type string */
export function getGlyph(type) {
  return GLYPH_MAP[type] || GLYPH_COMPONENTS.generic;
}

// ─── Palette types (available in the layout editor palette) ─────────────
export const GLYPH_TYPES = [
  // Source
  { type: 'electron-gun',     label: 'Electron Gun',      icon: '🔫', category: 'source' },
  // Accelerator
  { type: 'rf-cavity',        label: 'RF Cavity',          icon: '📡', category: 'accelerator' },
  { type: 'undulator',        label: 'Undulator',          icon: '〰', category: 'accelerator' },
  { type: 'wiggler',          label: 'Wiggler',            icon: '〰', category: 'accelerator' },
  { type: 'bunch-compressor', label: 'Bunch Compressor',   icon: '⇋',  category: 'accelerator' },
  { type: 'modulator',        label: 'Modulator',          icon: '∿',  category: 'accelerator' },
  // Magnets
  { type: 'quadrupole',       label: 'Quadrupole',         icon: '🧲', category: 'magnet' },
  { type: 'dipole',           label: 'Dipole',             icon: '↩',  category: 'magnet' },
  { type: 'solenoid',         label: 'Solenoid',           icon: '⊚',  category: 'magnet' },
  { type: 'sextupole',        label: 'Sextupole',          icon: '✳',  category: 'magnet' },
  { type: 'kicker',           label: 'Kicker',             icon: '⚡', category: 'magnet' },
  { type: 'corrector',        label: 'Corrector',          icon: '→',  category: 'magnet' },
  { type: 'bending-magnet',   label: 'Bending Magnet',     icon: '⤿',  category: 'magnet' },
  { type: 'ps',               label: 'Power Supply',       icon: '⚡', category: 'magnet' },
  // Optics
  { type: 'mirror-flat',      label: 'Mirror (flat)',      icon: '⤨',  category: 'optics' },
  { type: 'mirror-toroid',    label: 'Mirror (toroid)',    icon: '⌒',  category: 'optics' },
  { type: 'kb-mirror',        label: 'KB Mirrors',         icon: '⟋',  category: 'optics' },
  { type: 'dcm',              label: 'DCM',                icon: '⧫',  category: 'optics' },
  { type: 'multilayer-mono',  label: 'ML Mono',            icon: '≡',  category: 'optics' },
  { type: 'zone-plate',       label: 'Zone Plate',         icon: '◎',  category: 'optics' },
  { type: 'crl',              label: 'CRL',                icon: '⊃',  category: 'optics' },
  { type: 'capillary',        label: 'Capillary',          icon: '⊃',  category: 'optics' },
  { type: 'slits',            label: 'Slits',              icon: '⊞',  category: 'optics' },
  { type: 'attenuator',       label: 'Attenuator',         icon: '▮',  category: 'optics' },
  // Diagnostics
  { type: 'bpm',              label: 'BPM',                icon: '◎',  category: 'diagnostic' },
  { type: 'camera',           label: 'Camera',             icon: '📷', category: 'diagnostic' },
  { type: 'screen',           label: 'Screen / OTR',       icon: '🖵',  category: 'diagnostic' },
  { type: 'ict',              label: 'ICT / FCT',          icon: '⊙',  category: 'diagnostic' },
  { type: 'faraday-cup',      label: 'Faraday Cup',        icon: '⊔',  category: 'diagnostic' },
  { type: 'wire-scanner',     label: 'Wire Scanner',       icon: '│',  category: 'diagnostic' },
  { type: 'stripline-bpm',    label: 'Stripline BPM',      icon: '∥',  category: 'diagnostic' },
  { type: 'loss-monitor',     label: 'Loss Monitor',       icon: '⚠',  category: 'diagnostic' },
  { type: 'emittance-meter',  label: 'Emittance Meter',    icon: 'ε',  category: 'diagnostic' },
  { type: 'flag',             label: 'Flag / Profile',     icon: '🏁', category: 'diagnostic' },
  { type: 'bcm',              label: 'BCM',                icon: '⊙',  category: 'diagnostic' },
  { type: 'ion-chamber',      label: 'Ion Chamber',        icon: 'I₀', category: 'diagnostic' },
  // Detectors
  { type: 'detector-area',    label: 'Area Detector',      icon: '⊞',  category: 'detector' },
  { type: 'detector-point',   label: 'Point Detector',     icon: '▷',  category: 'detector' },
  { type: 'fluorescence-det', label: 'Fluorescence Det.',  icon: '⇡',  category: 'detector' },
  { type: 'analyzer-crystal', label: 'Crystal Analyser',   icon: '⌒',  category: 'detector' },
  // Vacuum
  { type: 'vacuum-valve',     label: 'Vacuum Valve',       icon: '⊗',  category: 'vacuum' },
  { type: 'ion-pump',         label: 'Ion Pump',           icon: '⊘',  category: 'vacuum' },
  { type: 'vacuum-gauge',     label: 'Vacuum Gauge',       icon: '☉',  category: 'vacuum' },
  { type: 'turbo-pump',       label: 'Turbo Pump',         icon: '🌀', category: 'vacuum' },
  // Beamline
  { type: 'beam-stop',        label: 'Beam Stop',          icon: '⊠',  category: 'beamline' },
  { type: 'shutter',          label: 'Shutter',            icon: '⊘',  category: 'beamline' },
  { type: 'beam',             label: 'Beam Pipe',          icon: '→',  category: 'beamline' },
  { type: 'sample-stage',     label: 'Sample Stage',       icon: '⊡',  category: 'beamline' },
  { type: 'cryostat',         label: 'Cryostat',           icon: '❄',  category: 'beamline' },
  // Motion
  { type: 'motor',            label: 'Motor',              icon: '⚙',  category: 'motion' },
  // Infrastructure
  { type: 'cooling',          label: 'Cooling',            icon: '❄',  category: 'infra' },
  { type: 'io',               label: 'I/O',                icon: '🔌', category: 'infra' },
  { type: 'mps',              label: 'MPS',                icon: '🛡',  category: 'infra' },
  { type: 'synch',            label: 'Sync / Timing',      icon: '🔄', category: 'infra' },
];
