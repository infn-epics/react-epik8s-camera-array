import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook to fetch historical PV data from the Archiver.
 *
 * @param {ArchiverClient} client - Archiver client instance
 * @param {string} pvName - PV to query
 * @param {Date|string} from - Start time
 * @param {Date|string} to - End time
 * @param {number} refreshInterval - Auto-refresh in ms (0 = disabled)
 * @returns {{ data, loading, error, refresh }}
 */
export function useArchiver(client, pvName, from, to, refreshInterval = 0) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  const fetch_ = useCallback(async () => {
    if (!client || !pvName || !from) return;
    setLoading(true);
    setError(null);
    try {
      const result = await client.fetchData(pvName, from, to || new Date());
      setData(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [client, pvName, from, to]);

  useEffect(() => {
    fetch_();
  }, [fetch_]);

  useEffect(() => {
    if (!refreshInterval || refreshInterval <= 0) return;
    timerRef.current = setInterval(fetch_, refreshInterval);
    return () => clearInterval(timerRef.current);
  }, [fetch_, refreshInterval]);

  return { data, loading, error, refresh: fetch_ };
}
