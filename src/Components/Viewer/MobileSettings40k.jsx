const SettingsRow = ({ label, checked, onChange }) => (
  <div className="settings-row">
    <span className="settings-label">{label}</span>
    <button className={`settings-toggle ${checked ? "active" : ""}`} onClick={() => onChange(!checked)}>
      <span className="settings-toggle-thumb" />
    </button>
  </div>
);

export const MobileSettings40k = ({ settings, updateSettings }) => (
  <div className="settings-section">
    <h4 className="settings-section-title">Display</h4>
    <div className="settings-section-content">
      <SettingsRow
        label="Show main faction cards"
        checked={settings.combineParentFactions}
        onChange={(value) => updateSettings({ ...settings, combineParentFactions: value })}
      />
      <SettingsRow
        label="Show allied faction cards"
        checked={settings.combineAlliedFactions}
        onChange={(value) => updateSettings({ ...settings, combineAlliedFactions: value })}
      />
    </div>
  </div>
);
