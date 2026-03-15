const SettingsRow = ({ label, checked, onChange }) => (
  <div className="settings-row">
    <span className="settings-label">{label}</span>
    <button className={`settings-toggle ${checked ? "active" : ""}`} onClick={() => onChange(!checked)}>
      <span className="settings-toggle-thumb" />
    </button>
  </div>
);

export const MobileSettingsAoS = ({ settings, updateSettings }) => (
  <div className="settings-section">
    <h4 className="settings-section-title">Display</h4>
    <div className="settings-section-content">
      <SettingsRow
        label="Decorative fonts"
        checked={settings.useFancyFonts !== false}
        onChange={(value) => updateSettings({ ...settings, useFancyFonts: value })}
      />
      <SettingsRow
        label="Show generic manifestations"
        checked={settings.showGenericManifestations}
        onChange={(value) => updateSettings({ ...settings, showGenericManifestations: value })}
      />
      <SettingsRow
        label="Show stats as badges"
        checked={settings.aosStatDisplayMode === "badges"}
        onChange={(value) => updateSettings({ ...settings, aosStatDisplayMode: value ? "badges" : "wheel" })}
      />
    </div>
  </div>
);
