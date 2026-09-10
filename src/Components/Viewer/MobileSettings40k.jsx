import { SUPPORTED_LANGUAGES, LANGUAGE_LABELS } from "../../Helpers/localization.helpers";

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
      {/* Card language (multi-language datasources; mirrors the desktop Settings picker) */}
      {settings.selectedDataSource === "40k-11e" && (
        <div className="settings-row settings-row-select">
          <span className="settings-label">Card language</span>
          <select
            className="settings-select"
            aria-label="Card language"
            value={settings.language || "en"}
            onChange={(e) => updateSettings({ ...settings, language: e.target.value })}>
            {SUPPORTED_LANGUAGES.map((code) => (
              <option key={code} value={code}>
                {LANGUAGE_LABELS[code] || code}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  </div>
);
