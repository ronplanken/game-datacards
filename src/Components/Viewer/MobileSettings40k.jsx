import { SUPPORTED_LANGUAGES, LANGUAGE_LABELS } from "../../Helpers/localization.helpers";
import { use11eDataVersions } from "../../Hooks/use11eDataVersions";
import {
  build11eDataVersionOptions,
  get11eDataVersionValue,
  resolve11eDataVersion,
} from "../../Helpers/dataVersion11e.helpers";

const SettingsRow = ({ label, checked, onChange }) => (
  <div className="settings-row">
    <span className="settings-label">{label}</span>
    <button className={`settings-toggle ${checked ? "active" : ""}`} onClick={() => onChange(!checked)}>
      <span className="settings-toggle-thumb" />
    </button>
  </div>
);

const DataVersionRow = ({ settings, updateSettings }) => {
  const { versions } = use11eDataVersions();
  return (
    <div className="settings-row settings-row-select">
      <span className="settings-label">Data version</span>
      <select
        className="settings-select"
        aria-label="Data version"
        value={get11eDataVersionValue(settings.dataVersion11e)}
        onChange={(e) =>
          updateSettings({
            ...settings,
            dataVersion11e: resolve11eDataVersion(e.target.value, versions, settings.dataVersion11e),
          })
        }>
        {build11eDataVersionOptions(versions, settings.dataVersion11e).map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

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
      {settings.selectedDataSource === "40k-11e" && (
        <DataVersionRow settings={settings} updateSettings={updateSettings} />
      )}
    </div>
  </div>
);
