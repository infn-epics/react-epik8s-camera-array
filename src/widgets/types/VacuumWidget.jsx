import { usePv } from '../../hooks/usePv.js';
import { PvDisplay, StatusIndicator } from '../../components/common/PvControls.jsx';

/**
 * VacuumWidget — pressure display and valve control.
 *
 * Config: { pvPrefix, pressureUnit, hasValve, alarmThreshold, title }
 */
export default function VacuumWidget({ config, client }) {
  const pvPrefix = config.pvPrefix;
  const pressurePv = usePv(client, pvPrefix ? `${pvPrefix}:Pressure` : null);
  const valveStatusPv = usePv(client, pvPrefix ? `${pvPrefix}:Valve:Status` : null);

  const pressure = pressurePv?.value;
  const threshold = config.alarmThreshold ?? 1e-5;
  const isAlarm = typeof pressure === 'number' && pressure > threshold;

  const toggleValve = () => {
    if (!client || !pvPrefix) return;
    const current = valveStatusPv?.value;
    client.put(`${pvPrefix}:Valve:Cmd`, current === 1 ? 0 : 1);
  };

  return (
    <div className="vacuum-widget-body">
      <div className={`vacuum-pressure ${isAlarm ? 'vacuum-alarm' : ''}`}>
        <PvDisplay
          client={client}
          pvName={pvPrefix ? `${pvPrefix}:Pressure` : ''}
          label="Pressure"
          precision={2}
          unit={config.pressureUnit || 'mbar'}
        />
      </div>

      <StatusIndicator
        client={client}
        pvName={pvPrefix ? `${pvPrefix}:Status` : ''}
        label="Status"
      />

      {config.hasValve !== false && (
        <div className="vacuum-valve">
          <span className="pv-label">Valve</span>
          <button
            className={`widget-action-btn ${valveStatusPv?.value === 1 ? 'on' : 'off'}`}
            onClick={toggleValve}
          >
            {valveStatusPv?.value === 1 ? '🟢 Open' : '🔴 Closed'}
          </button>
        </div>
      )}
    </div>
  );
}
