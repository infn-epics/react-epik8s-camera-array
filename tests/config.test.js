/**
 * Validates every YAML config file in the tests/ directory by:
 * - Checking YAML syntax is valid
 * - Checking required top-level fields
 * - Running parseDevices and asserting structural correctness
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import { parseDevices, groupDevicesBy } from '../src/models/device.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Discover all YAML files in this directory (excluding test code itself)
const yamlFiles = readdirSync(__dirname)
  .filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'))
  .sort();

function load(file) {
  const text = readFileSync(join(__dirname, file), 'utf8');
  return yaml.load(text);
}

describe('YAML config files', () => {
  it('found at least one YAML file', () => {
    expect(yamlFiles.length).toBeGreaterThan(0);
  });
});

describe.each(yamlFiles.map((f) => [f]))('%s', (file) => {
  it('parses as valid YAML', () => {
    const config = load(file);
    expect(config).toBeTruthy();
    expect(typeof config).toBe('object');
  });

  it('has a beamline or namespace identifier', () => {
    const config = load(file);
    const id = config.beamline || config.namespace;
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('parseDevices returns an array', () => {
    const config = load(file);
    const devices = parseDevices(config);
    expect(Array.isArray(devices)).toBe(true);
  });

  it('all devices have required fields', () => {
    const config = load(file);
    const devices = parseDevices(config);
    for (const dev of devices) {
      expect(dev.id, `device.id missing in ${file}`).toBeTruthy();
      expect(dev.name, `device.name missing in ${file}`).toBeTruthy();
      expect(dev.iocName, `device.iocName missing in ${file}`).toBeTruthy();
      expect(dev.pvPrefix, `device.pvPrefix in ${file}`).toBeDefined();
      expect(dev.family, `device.family missing in ${file}`).toBeTruthy();
      expect(dev.beamline, `device.beamline missing in ${file}`).toBeTruthy();
    }
  });

  it('camera devices have stream state fields', () => {
    const config = load(file);
    const devices = parseDevices(config);
    const cameras = devices.filter((d) => d.streamEnabled);
    for (const cam of cameras) {
      expect(cam.streamUrl, `camera streamUrl missing in ${file}`).toBeTruthy();
    }
  });

  it('groupDevicesBy zone produces valid groups', () => {
    const config = load(file);
    const devices = parseDevices(config);
    const byZone = groupDevicesBy(devices, 'zone');
    expect(typeof byZone).toBe('object');
    for (const [zone, group] of Object.entries(byZone)) {
      expect(typeof zone).toBe('string');
      expect(Array.isArray(group)).toBe(true);
      expect(group.length).toBeGreaterThan(0);
    }
  });

  it('groupDevicesBy family produces valid groups', () => {
    const config = load(file);
    const devices = parseDevices(config);
    const byFamily = groupDevicesBy(devices, 'family');
    for (const [, group] of Object.entries(byFamily)) {
      for (const dev of group) {
        expect(dev.family).toBeTruthy();
      }
    }
  });
});
