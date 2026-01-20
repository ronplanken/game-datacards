import { Settings, Type, Sparkles, CircleDot } from "lucide-react";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";

export const StepAoSSettings = () => {
  const { settings, updateSettings } = useSettingsStorage();

  const handleToggleFancyFonts = () => {
    updateSettings({
      ...settings,
      useFancyFonts: !settings.useFancyFonts,
    });
  };

  const handleToggleGenericManifestations = () => {
    updateSettings({
      ...settings,
      showGenericManifestations: !settings.showGenericManifestations,
    });
  };

  const handleToggleStatDisplayMode = () => {
    updateSettings({
      ...settings,
      aosStatDisplayMode: settings.aosStatDisplayMode === "badges" ? "wheel" : "badges",
    });
  };

  return (
    <div className="mww-settings">
      <header className="mww-settings-header">
        <div className="mww-settings-icon mww-settings-icon--aos">
          <Settings />
        </div>
        <h1 className="mww-settings-title">Display Settings</h1>
        <p className="mww-settings-subtitle">Customize how warscrolls and units are displayed in Age of Sigmar.</p>
      </header>

      <div className="mww-settings-options">
        <div className="mww-settings-option">
          <div className="mww-settings-option-icon mww-settings-option-icon--aos">
            <Type />
          </div>
          <div className="mww-settings-option-info">
            <span className="mww-settings-option-label">Use fancy fonts</span>
            <span className="mww-settings-option-desc">Themed serif fonts for an authentic look</span>
          </div>
          <button
            className={`mww-settings-toggle ${settings.useFancyFonts !== false ? "active" : ""}`}
            onClick={handleToggleFancyFonts}
            type="button">
            <span className="mww-settings-toggle-thumb" />
          </button>
        </div>

        {/* Font preview */}
        <div className={`mww-settings-font-preview ${settings.useFancyFonts !== false ? "fancy" : "regular"}`}>
          <span className="mww-settings-font-preview-text">Stormcast Eternals</span>
        </div>

        <div className="mww-settings-option">
          <div className="mww-settings-option-icon mww-settings-option-icon--aos">
            <Sparkles />
          </div>
          <div className="mww-settings-option-info">
            <span className="mww-settings-option-label">Show generic manifestations</span>
            <span className="mww-settings-option-desc">Include universal manifestations for any WIZARD</span>
          </div>
          <button
            className={`mww-settings-toggle ${settings.showGenericManifestations ? "active" : ""}`}
            onClick={handleToggleGenericManifestations}
            type="button">
            <span className="mww-settings-toggle-thumb" />
          </button>
        </div>

        <div className="mww-settings-option">
          <div className="mww-settings-option-icon mww-settings-option-icon--aos">
            <CircleDot />
          </div>
          <div className="mww-settings-option-info">
            <span className="mww-settings-option-label">Show stats as badges</span>
            <span className="mww-settings-option-desc">Compact badges instead of the stat wheel</span>
          </div>
          <button
            className={`mww-settings-toggle ${settings.aosStatDisplayMode === "badges" ? "active" : ""}`}
            onClick={handleToggleStatDisplayMode}
            type="button">
            <span className="mww-settings-toggle-thumb" />
          </button>
        </div>
      </div>

      <p className="mww-settings-note">You can change these settings anytime from the menu.</p>
    </div>
  );
};
