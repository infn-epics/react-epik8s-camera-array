import { useState, useRef, useEffect } from 'react';
import Widget from '../layout/Widget.jsx';
import { usePv } from '../../hooks/usePv.js';
import { PvSlider, PvDisplay } from '../common/PvControls.jsx';

/**
 * Check if a PVWS update message represents a "truthy" / enabled state.
 * Returns: true (on), false (explicitly off), or null (unknown / no value yet).
 */
function pvState(msg, enableLabel) {
  if (!msg) return null;
  const v = msg.value;
  const t = msg.text;
  // No value received yet (PVWS connected but channel not established)
  if (v === undefined && t === undefined) return null;
  if (v === 1 || v === true) return true;
  if (typeof v === 'string' && (v === '1' || v === enableLabel || v === 'Yes' || v === 'true')) return true;
  if (typeof v === 'number' && v > 0) return true;
  if (typeof t === 'string' && (t === enableLabel || t === '1' || t === 'Yes')) return true;
  return false;
}

/**
 * CameraWidget - MJPEG stream with PV controls for acquire/exposure/gain.
 *
 * Stream rendering logic:
 *  - PV says enabled (value=1) → show stream
 *  - PV says disabled (value=0) → show "Stream off"
 *  - PV state unknown (no value from PVWS, e.g. channel not connected) → try stream anyway
 */
export default function CameraWidget({ device, client, onHide }) {
  const [hasError, setHasError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const imgRef = useRef(null);
  const timerRef = useRef(null);

  const streamEnablePv = usePv(client, `${device.pvPrefix}:Stream1:EnableCallbacks`);
  const acquirePv = usePv(client, `${device.pvPrefix}:Acquire`);

  const streamState = pvState(streamEnablePv, 'Enable');   // true | false | null
  const acquireState = pvState(acquirePv, 'Acquire');

  // Show stream if PV says enabled OR if PV state is unknown (no value yet)
  const showStream = streamState !== false && !!device.streamUrl;
  const streamEnabled = streamState === true;
  const isAcquiring = acquireState === true;

  // Reset error/loaded state on stream toggle or device change
  useEffect(() => {
    setHasError(false);
    setImgLoaded(false);
  }, [streamState, device.pvPrefix]);

  // MJPEG streams are continuous — onLoad may not fire in all browsers.
  // Use a polling check on naturalWidth as fallback.
  useEffect(() => {
    if (!showStream || imgLoaded || hasError) {
      clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      const img = imgRef.current;
      if (img && img.naturalWidth > 0) {
        setImgLoaded(true);
        clearInterval(timerRef.current);
      }
    }, 300);
    return () => clearInterval(timerRef.current);
  }, [showStream, imgLoaded, hasError]);

  const toggleStream = () => {
    if (!client) return;
    client.put(`${device.pvPrefix}:Stream1:EnableCallbacks`, streamEnabled ? 0 : 1);
    setHasError(false);
  };

  const toggleAcquire = () => {
    if (!client) return;
    client.put(`${device.pvPrefix}:Acquire`, isAcquiring ? 0 : 1);
  };

  const status = hasError ? 'error' : streamEnabled ? 'ok' : streamState === null ? 'unknown' : 'warning';

  const detailContent = (
    <div className="camera-detail">
      <div className="camera-detail-stream">
        {showStream ? (
          <img src={device.streamUrl} alt={device.name} className="stream-img" />
        ) : (
          <div className="stream-disabled">Stream disabled</div>
        )}
      </div>
      <div className="camera-detail-controls">
        <PvDisplay client={client} pvName={`${device.pvPrefix}:ArrayRate_RBV`} label="FPS" />
        <PvDisplay client={client} pvName={`${device.pvPrefix}:ArrayCounter_RBV`} label="Frames" precision={0} />
        <PvSlider client={client} pvName={`${device.pvPrefix}:AcquireTime`} label="Exposure" min={0.001} max={10} step={0.001} />
        <PvSlider client={client} pvName={`${device.pvPrefix}:Gain`} label="Gain" min={0} max={500} step={1} />
      </div>
    </div>
  );

  return (
    <Widget
      title={device.name}
      subtitle={device.iocName}
      icon="📷"
      status={status}
      onHide={onHide}
      detailContent={detailContent}
    >
      <div className="camera-widget-body">
        {/* Stream image area */}
        <div className="camera-stream-area">
          {showStream ? (
            hasError ? (
              <div className="stream-error">
                <span>⚠ Unavailable</span>
                <button onClick={() => setHasError(false)}>Retry</button>
              </div>
            ) : (
              <>
                {!imgLoaded && <div className="stream-connecting">{streamState === null ? 'PV unknown — trying stream…' : 'Connecting…'}</div>}
                <img
                  ref={imgRef}
                  className="stream-img"
                  src={device.streamUrl}
                  alt={device.name}
                  style={imgLoaded ? {} : { visibility: 'hidden', position: 'absolute' }}
                  onLoad={() => setImgLoaded(true)}
                  onError={() => setHasError(true)}
                />
              </>
            )
          ) : (
            <div className="stream-disabled">Stream off</div>
          )}
        </div>

        {/* Quick controls */}
        <div className="camera-quick-controls">
          <button className={`widget-action-btn ${streamEnabled ? 'on' : streamState === null ? 'unknown' : 'off'}`} onClick={toggleStream}>
            {streamEnabled ? '🟢 Stream' : streamState === null ? '⚪ Stream' : '🔴 Stream'}
          </button>
          <button className={`widget-action-btn ${isAcquiring ? 'on' : acquireState === null ? 'unknown' : 'off'}`} onClick={toggleAcquire}>
            {isAcquiring ? '⏹ Stop' : '▶ Acquire'}
          </button>
        </div>
      </div>
    </Widget>
  );
}
