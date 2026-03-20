/**
 * IOC Template Registry — defines form schemas for each IOC template type.
 *
 * Each template describes:
 *  - category / icon / label
 *  - iocFields: fields for the IOC-level config
 *  - devtypes: available device types (enum)
 *  - deviceFields: fields for each device within the IOC
 *
 * Field spec: { key, label, type, default, required, placeholder, options, help }
 *  type: 'text' | 'number' | 'boolean' | 'select' | 'textarea' | 'keyvalue'
 */

// ─── Motor subtypes ────────────────────────────────────────────────
const MOTOR_DEVTYPES = ['pollux', 'newport', 'tml', 'technosoft-asyn', 'thorlabs', 'mercury', 'mercury-on-vt80'];

const MOTOR_DEVICE_FIELDS = [
  { key: 'name', label: 'Name', type: 'text', required: true, placeholder: 'MOT01' },
  { key: 'axid', label: 'Axis ID', type: 'number', required: true, default: 0 },
  { key: 'dllm', label: 'Low Limit (DLLM)', type: 'number', default: 0 },
  { key: 'dhlm', label: 'High Limit (DHLM)', type: 'number', default: 25 },
  { key: 'home', label: 'Home direction', type: 'number', default: 1, help: '1 or -1' },
  { key: 'start', label: 'Start position', type: 'number', default: 10 },
  { key: 'velo', label: 'Velocity', type: 'number', default: 1 },
  { key: 'mres', label: 'Motor Resolution (MRES)', type: 'number', default: 0.0001 },
  { key: 'prec', label: 'Precision (PREC)', type: 'number', default: 4 },
  { key: 'zones', label: 'Zones', type: 'text', placeholder: 'FP1' },
];

// ─── Camera subtypes ───────────────────────────────────────────────
const CAMERA_DEVTYPES = ['camerasim', 'aravisCamera', 'baslerCamera', 'genericCamera'];

const CAMERA_DEVICE_FIELDS = [
  { key: 'name', label: 'Name', type: 'text', required: true, placeholder: 'CAM01' },
  { key: 'id', label: 'Camera ID / IP', type: 'text', placeholder: '192.168.x.x' },
  { key: 'width', label: 'Width', type: 'number', default: 1920 },
  { key: 'height', label: 'Height', type: 'number', default: 1080 },
  { key: 'iocinit', label: 'Init parameters', type: 'keyvalue', default: [] },
];

// ─── Camera IOC extra fields ───────────────────────────────────────
const CAMERA_IOC_EXTRAS = [
  { key: 'stream_enable', label: 'Stream', type: 'boolean', default: true },
  { key: 'iocparam', label: 'IOC Parameters', type: 'keyvalue', group: 'advanced' },
  // Plugin enables
  { key: 'roi_enable', label: 'ROI Plugin', type: 'boolean', default: true, group: 'plugins' },
  { key: 'proc_enable', label: 'Process Plugin', type: 'boolean', default: true, group: 'plugins' },
  { key: 'overlay_enable', label: 'Overlay Plugin', type: 'boolean', default: true, group: 'plugins' },
  { key: 'stats_enable', label: 'Stats Plugin', type: 'boolean', default: true, group: 'plugins' },
  { key: 'tiff_enable', label: 'TIFF Plugin', type: 'boolean', default: true, group: 'plugins' },
  { key: 'stdarray_enable', label: 'StdArray Plugin', type: 'boolean', default: false, group: 'plugins' },
];

// ─── Power Supply subtypes ─────────────────────────────────────────
const PS_DEVTYPES = ['caenels', 'fastps', 'danfysik', 'hazemeyer', 'ocem', 'sigmaphi', 'psEEI', 'kima', 'ibilt', 'maccaferriPS'];

const PS_DEVICE_FIELDS = [
  { key: 'name', label: 'Name', type: 'text', required: true, placeholder: 'PS01' },
  { key: 'ip', label: 'IP Address', type: 'text', placeholder: '192.168.x.x' },
  { key: 'port', label: 'Port', type: 'number', default: 10001 },
  { key: 'channel', label: 'Channel', type: 'number' },
];

// ─── Vacuum subtypes ───────────────────────────────────────────────
const VAC_DEVTYPES = ['pfeiffer-tpg256a', 'pfeiffer-tpg261', 'pfeiffer-tpg362', 'agilent-4uhv', 'agilent-ipcmini', 'agilent-xgs600'];

const VAC_DEVICE_FIELDS = [
  { key: 'name', label: 'Name', type: 'text', required: true, placeholder: 'VAC01' },
  { key: 'channel', label: 'Channel', type: 'number', required: true, default: 1 },
];

// ─── IO subtypes ───────────────────────────────────────────────────
const IO_DEVTYPES = ['icpdas', 'plceli'];

const IO_DEVICE_FIELDS = [
  { key: 'name', label: 'Name', type: 'text', required: true, placeholder: 'IO01' },
  { key: 'channel', label: 'Channel', type: 'number' },
  { key: 'devtype', label: 'IO Type', type: 'select', options: ['rtd', 'di', 'do', 'ai', 'ao', 'rly'] },
];

// ─── Modulator ─────────────────────────────────────────────────────
const MOD_DEVICE_FIELDS = [
  { key: 'name', label: 'Name', type: 'text', required: true, placeholder: 'MOD01' },
  { key: 'server', label: 'Server IP (override)', type: 'text' },
  { key: 'port', label: 'Port (override)', type: 'number' },
  { key: 'hvmax', label: 'HV Max', type: 'number', default: 37 },
];

// ─── Cooling ───────────────────────────────────────────────────────
const COOL_DEVICE_FIELDS = [
  { key: 'name', label: 'Name', type: 'text', required: true, placeholder: 'CHL01' },
  { key: 'server', label: 'Server (override)', type: 'text' },
  { key: 'port', label: 'Port (override)', type: 'number' },
  { key: 'id', label: 'Device ID', type: 'text', default: '01' },
];

// ─── DAQ (tektronix) ──────────────────────────────────────────────
const DAQ_DEVICE_FIELDS = [
  { key: 'name', label: 'Name', type: 'text', required: true, placeholder: 'TEK01' },
  { key: 'channel', label: 'Channel', type: 'number' },
];

// ─── Synch (menlo) ────────────────────────────────────────────────
const SYNCH_DEVICE_FIELDS = [
  { key: 'name', label: 'Name', type: 'text', required: true, placeholder: 'SYNC01' },
  { key: 'channel', label: 'Channel', type: 'number' },
];

// ─── Common IOC fields ─────────────────────────────────────────────
const COMMON_IOC_FIELDS = [
  { key: 'name', label: 'IOC Name', type: 'text', required: true, placeholder: 'my-ioc-01' },
  { key: 'iocprefix', label: 'PV Prefix', type: 'text', required: true, placeholder: 'EUAPS:CTRL' },
  { key: 'zones', label: 'Zones', type: 'text', placeholder: 'FP, FI', help: 'Comma-separated zone names' },
  { key: 'asset', label: 'Asset URL', type: 'text', placeholder: 'https://...' },
];

const CONNECTION_FIELDS = [
  { key: '_server', label: 'Server', type: 'text', placeholder: '192.168.x.x', help: 'Added as iocparam' },
  { key: '_port', label: 'Port', type: 'text', placeholder: '4001', help: 'Added as iocparam' },
];

// ─── Template definitions ──────────────────────────────────────────

export const IOC_TEMPLATES = {
  motor: {
    label: 'Motor',
    icon: '⚙',
    category: 'motion',
    template: 'motor',
    devtypes: MOTOR_DEVTYPES,
    iocFields: [...COMMON_IOC_FIELDS, ...CONNECTION_FIELDS],
    iocExtras: [],
    deviceFields: MOTOR_DEVICE_FIELDS,
    help: 'Motor controller IOC — supports pollux, newport, thorlabs, tml, mercury, technosoft-asyn',
    defaultDevtype: 'pollux',
    scaffold: (name, devtype, prefix) => ({
      name,
      template: 'motor',
      devtype,
      iocprefix: prefix || 'BEAMLINE:CTRL',
      iocparam: [],
      devices: [],
    }),
  },

  adcamera: {
    label: 'Area Detector Camera',
    icon: '📷',
    category: 'daq',
    template: 'adcamera',
    devtypes: CAMERA_DEVTYPES,
    iocFields: [...COMMON_IOC_FIELDS],
    iocExtras: CAMERA_IOC_EXTRAS,
    deviceFields: CAMERA_DEVICE_FIELDS,
    help: 'Area detector camera IOC — camerasim, aravisCamera, baslerCamera',
    defaultDevtype: 'camerasim',
    scaffold: (name, devtype, prefix) => ({
      name,
      template: 'adcamera',
      devtype: devtype || 'camerasim',
      iocprefix: prefix || 'BEAMLINE:CAM',
      stream_enable: true,
      devices: [],
    }),
  },

  ps: {
    label: 'Power Supply',
    icon: '⚡',
    category: 'ps',
    template: 'ps',
    devtypes: PS_DEVTYPES,
    iocFields: [...COMMON_IOC_FIELDS, ...CONNECTION_FIELDS],
    iocExtras: [],
    deviceFields: PS_DEVICE_FIELDS,
    help: 'Power supply IOC — CAEN ELS, Danfysik, Hazemeyer, OCEM, etc.',
    defaultDevtype: 'caenels',
    scaffold: (name, devtype, prefix) => ({
      name,
      template: 'ps',
      devtype,
      iocprefix: prefix || 'BEAMLINE:PS',
      iocparam: [],
      devices: [],
    }),
  },

  vac: {
    label: 'Vacuum',
    icon: '💨',
    category: 'vac',
    template: 'vac',
    devtypes: VAC_DEVTYPES,
    iocFields: [...COMMON_IOC_FIELDS, ...CONNECTION_FIELDS],
    iocExtras: [],
    deviceFields: VAC_DEVICE_FIELDS,
    help: 'Vacuum gauge controller — Pfeiffer TPG, Agilent 4UHV/IPCmini/XGS600',
    defaultDevtype: 'pfeiffer-tpg256a',
    scaffold: (name, devtype, prefix) => ({
      name,
      template: 'vac',
      devtype,
      iocprefix: prefix || 'BEAMLINE:VAC',
      iocparam: [],
      devices: [],
    }),
  },

  cooling: {
    label: 'Cooling / Chiller',
    icon: '❄',
    category: 'cooling',
    template: 'cooling',
    devtypes: ['smc', 'polyscience'],
    iocFields: [...COMMON_IOC_FIELDS, ...CONNECTION_FIELDS],
    iocExtras: [],
    deviceFields: COOL_DEVICE_FIELDS,
    help: 'Chiller / cooling IOC — SMC, PolyScience',
    defaultDevtype: 'smc',
    scaffold: (name, devtype, prefix) => ({
      name,
      template: devtype || 'smc',
      devtype,
      iocprefix: prefix || 'BEAMLINE:CHL',
      iocparam: [],
      devices: [],
    }),
  },

  modulator: {
    label: 'Modulator',
    icon: '📡',
    category: 'modulator',
    template: 'modulator',
    devtypes: ['ppt', 'scandinova-scandicat-mod'],
    iocFields: [...COMMON_IOC_FIELDS, ...CONNECTION_FIELDS],
    iocExtras: [],
    deviceFields: MOD_DEVICE_FIELDS,
    help: 'RF Modulator — PPT, Scandinova',
    defaultDevtype: 'ppt',
    scaffold: (name, devtype, prefix) => ({
      name,
      template: devtype || 'ppt',
      devtype,
      iocprefix: prefix || 'BEAMLINE:MOD',
      iocparam: [],
      devices: [],
    }),
  },

  io: {
    label: 'I/O Controller',
    icon: '🔌',
    category: 'io',
    template: 'io',
    devtypes: IO_DEVTYPES,
    iocFields: [...COMMON_IOC_FIELDS, ...CONNECTION_FIELDS],
    iocExtras: [],
    deviceFields: IO_DEVICE_FIELDS,
    help: 'I/O controller — ICP DAS, PLC ELI',
    defaultDevtype: 'icpdas',
    scaffold: (name, devtype, prefix) => ({
      name,
      template: devtype || 'icpdas',
      devtype,
      iocprefix: prefix || 'BEAMLINE:IO',
      iocparam: [],
      devices: [],
    }),
  },

  tektronix: {
    label: 'Tektronix DAQ',
    icon: '📊',
    category: 'daq',
    template: 'tektronix',
    devtypes: ['tektronix'],
    iocFields: [...COMMON_IOC_FIELDS, ...CONNECTION_FIELDS],
    iocExtras: [],
    deviceFields: DAQ_DEVICE_FIELDS,
    help: 'Tektronix oscilloscope / DAQ',
    defaultDevtype: 'tektronix',
    scaffold: (name, devtype, prefix) => ({
      name,
      template: 'tektronix',
      devtype: 'tektronix',
      iocprefix: prefix || 'BEAMLINE:TEK',
      iocparam: [],
      devices: [],
    }),
  },

  synch: {
    label: 'Synchronization',
    icon: '🔄',
    category: 'synch',
    template: 'synch',
    devtypes: ['menlo'],
    iocFields: [...COMMON_IOC_FIELDS, ...CONNECTION_FIELDS],
    iocExtras: [],
    deviceFields: SYNCH_DEVICE_FIELDS,
    help: 'Synchronization — Menlo laser sync',
    defaultDevtype: 'menlo',
    scaffold: (name, devtype, prefix) => ({
      name,
      template: 'synch',
      devtype: 'menlo',
      iocprefix: prefix || 'BEAMLINE:SYNC',
      iocparam: [],
      devices: [],
    }),
  },

  mps: {
    label: 'Machine Protection',
    icon: '🛡',
    category: 'mps',
    template: 'mps',
    devtypes: ['ssrip-mps'],
    iocFields: [...COMMON_IOC_FIELDS, ...CONNECTION_FIELDS],
    iocExtras: [],
    deviceFields: [
      { key: 'name', label: 'Name', type: 'text', required: true, placeholder: 'MPS01' },
      { key: 'channel', label: 'Channel', type: 'number' },
    ],
    help: 'Machine Protection System — SSRIP MPS',
    defaultDevtype: 'ssrip-mps',
    scaffold: (name, devtype, prefix) => ({
      name,
      template: 'mps',
      devtype: 'ssrip-mps',
      iocprefix: prefix || 'BEAMLINE:MPS',
      iocparam: [],
      devices: [],
    }),
  },
};

/** Get sorted template keys */
export function getTemplateKeys() {
  return Object.keys(IOC_TEMPLATES).sort((a, b) =>
    IOC_TEMPLATES[a].label.localeCompare(IOC_TEMPLATES[b].label),
  );
}

/** Resolve template from IOC data — match by template field or devtype */
export function resolveTemplate(ioc) {
  if (ioc.template && IOC_TEMPLATES[ioc.template]) return IOC_TEMPLATES[ioc.template];
  // Try matching by devtype
  for (const tpl of Object.values(IOC_TEMPLATES)) {
    if (tpl.devtypes.includes(ioc.devtype)) return tpl;
  }
  return null;
}
