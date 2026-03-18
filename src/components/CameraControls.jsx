import { useCameraPvs } from '../hooks/usePv';

export default function CameraControls({ client, pvPrefix }) {
  const { acquire, acquireTime, gain } = useCameraPvs(client, pvPrefix);

  const isAcquiring = acquire?.value === 1 || acquire?.value === 'Acquire';

  const toggleAcquire = () => {
    if (!pvPrefix || !client) return;
    client.put(`${pvPrefix}:Acquire`, isAcquiring ? 0 : 1);
  };

  const setExposure = (e) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && pvPrefix && client) {
      client.put(`${pvPrefix}:AcquireTime`, val);
    }
  };

  const setGain = (e) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && pvPrefix && client) {
      client.put(`${pvPrefix}:Gain`, val);
    }
  };

  const exposureVal = acquireTime?.value ?? 1;
  const gainVal = gain?.value ?? 0;

  return (
    <div className="camera-controls">
      <button
        className={`acquire-btn ${isAcquiring ? 'active' : ''}`}
        onClick={toggleAcquire}
        title={isAcquiring ? 'Stop acquisition' : 'Start acquisition'}
      >
        {isAcquiring ? '⏹ Stop' : '▶ Start'}
      </button>

      <label className="control-row">
        <span>Exposure</span>
        <input
          type="range"
          min="0.001"
          max="10"
          step="0.001"
          value={exposureVal}
          onChange={setExposure}
        />
        <span className="control-value">{Number(exposureVal).toFixed(3)}s</span>
      </label>

      <label className="control-row">
        <span>Gain</span>
        <input
          type="range"
          min="0"
          max="500"
          step="1"
          value={gainVal}
          onChange={setGain}
        />
        <span className="control-value">{Number(gainVal).toFixed(0)}</span>
      </label>
    </div>
  );
}
