import { usePv } from '../../hooks/usePv.js';
import { PvDisplay, PvInput } from '../../components/common/PvControls.jsx';

/**
 * PowerSupplyWidget — current/voltage set/read, on/off control.
 *
 * Config: { pvPrefix, maxCurrent, maxVoltage, precision, title }
 */
export default function PowerSupplyWidget({ config, client }) {
  const pvPrefix = config.pvPrefix;
  const statusPv = usePv(client, pvPrefix ? `${pvPrefix}:Status` : null);
  const isOn = statusPv?.value === 1 || statusPv?.value === 'ON';

  const toggle = () => {
    if (!client || !pvPrefix) return;
    client.put(`${pvPrefix}:OnOff`, isOn ? 0 : 1);
  };

  const precision = config.precision ?? 3;

  return (
    <div className="ps-widget-body">
      <div className="ps-status">
        <button
          className={`widget-action-btn ${isOn ? 'on' : 'off'}`}
          onClick={toggle}
        >
          {isOn ? '🟢 ON' : '🔴 OFF'}
        </button>
      </div>

      <div className="ps-readings">
        <PvDisplay client={client} pvName={pvPrefix ? `${pvPrefix}:Current:RBV` : ''} label="I read" precision={precision} unit="A" />
        <PvDisplay client={client} pvName={pvPrefix ? `${pvPrefix}:Voltage:RBV` : ''} label="V read" precision={precision} unit="V" />
      </div>

      <div className="ps-setpoints">
        <PvInput
          client={client}
          pvName={pvPrefix ? `${pvPrefix}:Current:Set` : ''}
          label="I set"
          min={0}
          max={config.maxCurrent ?? 100}
          step={0.01}
        />
        <PvInput
          client={client}
          pvName={pvPrefix ? `${pvPrefix}:Voltage:Set` : ''}
          label="V set"
          min={0}
          max={config.maxVoltage ?? 50}
          step={0.01}
        />
      </div>
    </div>
  );
}
