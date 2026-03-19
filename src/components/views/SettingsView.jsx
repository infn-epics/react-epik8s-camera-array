import { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';

/**
 * SettingsView — Application settings page.
 *
 * Sections:
 *  - DataSources: PVWS and Archiver URL management
 *  - (Future) Users / Groups / OAuth2
 */
export default function SettingsView() {
  const { dataSources, updateDataSources, resetDataSources } = useApp();
  const [pvwsUrl, setPvwsUrl] = useState(dataSources.pvwsUrl);
  const [archiverUrl, setArchiverUrl] = useState(dataSources.archiverUrl);
  const [saved, setSaved] = useState(false);

  const isModified =
    pvwsUrl !== dataSources.pvwsUrl || archiverUrl !== dataSources.archiverUrl;
  const isOverridden =
    dataSources.pvwsUrl !== dataSources.pvwsDefault ||
    dataSources.archiverUrl !== dataSources.archiverDefault;

  const handleSave = () => {
    updateDataSources(pvwsUrl, archiverUrl);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    resetDataSources();
    setPvwsUrl(dataSources.pvwsDefault);
    setArchiverUrl(dataSources.archiverDefault);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="settings-view">
      <h2 className="settings-heading">⚙ Settings</h2>

      {/* DataSources Section */}
      <section className="settings-section">
        <h3 className="settings-section-title">Data Sources</h3>
        <p className="settings-section-desc">
          Configure connections to PVWS (Process Variable Web Socket) and the EPICS Archiver Appliance.
          Defaults are loaded from the YAML configuration file.
        </p>

        <div className="settings-field">
          <label className="settings-label" htmlFor="ds-pvws">PVWS URL</label>
          <input
            id="ds-pvws"
            className="settings-input"
            type="text"
            value={pvwsUrl}
            onChange={(e) => setPvwsUrl(e.target.value)}
            placeholder="ws://host/pvws/pv"
          />
          {dataSources.pvwsDefault && (
            <span className="settings-hint">Default: {dataSources.pvwsDefault}</span>
          )}
        </div>

        <div className="settings-field">
          <label className="settings-label" htmlFor="ds-archiver">Archiver URL</label>
          <input
            id="ds-archiver"
            className="settings-input"
            type="text"
            value={archiverUrl}
            onChange={(e) => setArchiverUrl(e.target.value)}
            placeholder="http://host (optional)"
          />
          {dataSources.archiverDefault && (
            <span className="settings-hint">Default: {dataSources.archiverDefault}</span>
          )}
        </div>

        <div className="settings-actions">
          <button
            className="settings-btn settings-btn--primary"
            onClick={handleSave}
            disabled={!isModified}
          >
            Save &amp; Reconnect
          </button>
          <button
            className="settings-btn"
            onClick={handleReset}
            disabled={!isOverridden}
            title="Restore URLs from YAML configuration"
          >
            Reset to Defaults
          </button>
          {saved && <span className="settings-saved">✓ Saved</span>}
        </div>
      </section>

      {/* Future: Users / Groups / OAuth2 */}
      <section className="settings-section settings-section--disabled">
        <h3 className="settings-section-title">Users &amp; Authentication</h3>
        <p className="settings-section-desc">
          User management, group permissions, and OAuth2 authentication will be available in a future release.
        </p>
      </section>
    </div>
  );
}
