import { PvDisplay } from '../../components/common/PvControls.jsx';

/**
 * BPMWidget — Beam Position Monitor display.
 *
 * Config: { pvPrefix, precision, showCharge, title }
 */
export default function BPMWidget({ config, client }) {
  const pvPrefix = config.pvPrefix;
  const precision = config.precision ?? 3;

  return (
    <div className="bpm-widget-body">
      <PvDisplay client={client} pvName={pvPrefix ? `${pvPrefix}:PosX` : ''} label="X" precision={precision} unit="mm" />
      <PvDisplay client={client} pvName={pvPrefix ? `${pvPrefix}:PosY` : ''} label="Y" precision={precision} unit="mm" />
      {config.showCharge !== false && (
        <PvDisplay client={client} pvName={pvPrefix ? `${pvPrefix}:Charge` : ''} label="Q" precision={precision} unit="pC" />
      )}
    </div>
  );
}
