import { useState } from "react";
import { Wrench, X, RotateCcw, ChevronDown } from "lucide-react";
import { useSettingsStorage } from "../../Hooks/useSettingsStorage";
import { getLatestWizardVersion } from "../WhatsNewWizard/versions";
import "./DevFab.css";

const WIZARD_VERSIONS = ["0.0.0", "3.0.0", "3.1.0", "3.2.0", "3.3.0", "3.4.0", "3.5.0", "3.6.0", "3.7.0"];

export const DevFab = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, updateSettings } = useSettingsStorage();

  const currentVersion = import.meta.env.VITE_VERSION;
  const latestWizard = getLatestWizardVersion();

  const setLastWizardVersion = (version) => {
    updateSettings({ ...settings, lastMajorWizardVersion: version });
  };

  const setWizardCompleted = (version) => {
    updateSettings({ ...settings, wizardCompleted: version });
  };

  const resetBothToVersion = (version) => {
    updateSettings({ ...settings, lastMajorWizardVersion: version, wizardCompleted: version });
  };

  const resetWizardState = () => {
    updateSettings({
      ...settings,
      lastMajorWizardVersion: "0.0.0",
      wizardCompleted: currentVersion,
    });
  };

  return (
    <>
      {/* FAB button */}
      <button className="dev-fab" onClick={() => setIsOpen(!isOpen)} type="button">
        {isOpen ? <X size={20} /> : <Wrench size={20} />}
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="dev-fab-panel">
          <div className="dev-fab-panel-header">
            <span>Dev Tools</span>
            <span className="dev-fab-version">v{currentVersion}</span>
          </div>

          <div className="dev-fab-section">
            <label className="dev-fab-label">Last Wizard Version</label>
            <span className="dev-fab-value">{settings.lastMajorWizardVersion || "not set"}</span>
            <div className="dev-fab-select-wrap">
              <select
                className="dev-fab-select"
                value={settings.lastMajorWizardVersion || "0.0.0"}
                onChange={(e) => setLastWizardVersion(e.target.value)}>
                {WIZARD_VERSIONS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="dev-fab-select-icon" />
            </div>
          </div>

          <div className="dev-fab-section">
            <label className="dev-fab-label">Wizard Completed</label>
            <span className="dev-fab-value">{settings.wizardCompleted || "not set"}</span>
            <div className="dev-fab-select-wrap">
              <select
                className="dev-fab-select"
                value={settings.wizardCompleted || "0.0.0"}
                onChange={(e) => setWizardCompleted(e.target.value)}>
                {WIZARD_VERSIONS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="dev-fab-select-icon" />
            </div>
          </div>

          <div className="dev-fab-divider" />

          <div className="dev-fab-section">
            <label className="dev-fab-label">Quick Actions</label>
            <button className="dev-fab-action" onClick={resetWizardState} type="button">
              <RotateCcw size={14} />
              <span>Show all wizards from start</span>
            </button>
            <button className="dev-fab-action" onClick={() => resetBothToVersion("3.6.0")} type="button">
              <RotateCcw size={14} />
              <span>Show only v3.7.0 wizard</span>
            </button>
            <button
              className="dev-fab-action"
              onClick={() => resetBothToVersion(latestWizard || currentVersion)}
              type="button">
              <RotateCcw size={14} />
              <span>Mark all wizards seen</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
