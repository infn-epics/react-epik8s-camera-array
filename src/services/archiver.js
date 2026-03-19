/**
 * EPICS Archiver Appliance REST client.
 *
 * Retrieves historical PV data from an EPICS Archiver Appliance instance.
 * API docs: https://slacmshanern.github.io/epicsarchiverap/userguide.html
 */

const DEFAULT_FETCH_LIMIT = 1000;

export default class ArchiverClient {
  /**
   * @param {string} baseUrl - Archiver base URL, e.g. "https://archiver.example.com"
   */
  constructor(baseUrl) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this._cache = new Map();
  }

  /**
   * Fetch archived data for a PV over a time range.
   * @param {string} pv - PV name
   * @param {Date|string} from - Start time
   * @param {Date|string} to - End time (default: now)
   * @param {number} limit - Max samples (default 1000)
   * @returns {Promise<Array<{timestamp: number, value: number, severity: number}>>}
   */
  async fetchData(pv, from, to = new Date(), limit = DEFAULT_FETCH_LIMIT) {
    const fromISO = from instanceof Date ? from.toISOString() : from;
    const toISO = to instanceof Date ? to.toISOString() : to;

    const cacheKey = `${pv}|${fromISO}|${toISO}|${limit}`;
    if (this._cache.has(cacheKey)) return this._cache.get(cacheKey);

    const url = `${this.baseUrl}/retrieval/data/getData.json?pv=${encodeURIComponent(pv)}&from=${encodeURIComponent(fromISO)}&to=${encodeURIComponent(toISO)}&limit=${limit}`;

    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Archiver fetch failed: ${resp.status} ${resp.statusText}`);

    const json = await resp.json();
    const samples = (json[0]?.data || []).map((d) => ({
      timestamp: d.secs * 1000 + (d.nanos || 0) / 1e6,
      value: d.val,
      severity: d.severity || 0,
      status: d.status || 0,
    }));

    this._cache.set(cacheKey, samples);
    // Evict old cache entries
    if (this._cache.size > 100) {
      const firstKey = this._cache.keys().next().value;
      this._cache.delete(firstKey);
    }

    return samples;
  }

  /**
   * Search for PV names matching a pattern.
   * @param {string} pattern - Glob or regex pattern
   * @returns {Promise<string[]>}
   */
  async searchPVs(pattern) {
    const url = `${this.baseUrl}/mgmt/bpl/getMatchingPVs?pv=${encodeURIComponent(pattern)}&limit=100`;
    const resp = await fetch(url);
    if (!resp.ok) return [];
    return resp.json();
  }

  /**
   * Check if a PV is being archived.
   * @param {string} pv
   * @returns {Promise<boolean>}
   */
  async isPVArchived(pv) {
    const url = `${this.baseUrl}/mgmt/bpl/getPVStatus?pv=${encodeURIComponent(pv)}`;
    const resp = await fetch(url);
    if (!resp.ok) return false;
    const data = await resp.json();
    return data.length > 0 && data[0].status === 'Being archived';
  }

  /** Clear the data cache. */
  clearCache() {
    this._cache.clear();
  }
}
