import logo from "../../Images/logo.png";
import { useSettingsStorage } from "../../Hooks/useSettingsStorage";
import "./MobileGameSystemSettings.css";

export const MobileGameSystemSettings = ({ gameSystem, onContinue }) => {
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

  const getGameSystemName = () => {
    switch (gameSystem) {
      case "aos":
        return "Age of Sigmar";
      case "40k-10e":
        return "Warhammer 40,000";
      default:
        return gameSystem;
    }
  };

  return (
    <div className="gss-settings">
      <div className="gss-settings-content">
        <header className="gss-settings-header">
          <img src={logo} alt="Game Datacards" className="gss-settings-logo" />
          <h1 className="gss-settings-title">{getGameSystemName()}</h1>
          <p className="gss-settings-subtitle">Display Settings</p>
        </header>

        <div className="gss-settings-options">
          <div className="gss-settings-option">
            <div className="gss-settings-option-info">
              <span className="gss-settings-option-label">Decorative fonts</span>
              <span className="gss-settings-option-description">
                Themed serif fonts for an authentic look. Disable for better readability.
              </span>
            </div>
            <button
              className={`gss-settings-toggle ${settings.useFancyFonts !== false ? "active" : ""}`}
              onClick={handleToggleFancyFonts}
              type="button">
              <span className="gss-settings-toggle-thumb" />
            </button>
          </div>
          <div className={`gss-settings-font-preview ${settings.useFancyFonts !== false ? "fancy" : "regular"}`}>
            <span className="preview-text">Stormcast Eternals</span>
          </div>

          <div className="gss-settings-option">
            <div className="gss-settings-option-info">
              <span className="gss-settings-option-label">Show generic manifestations</span>
              <span className="gss-settings-option-description">
                Include universal manifestations available to any WIZARD.
              </span>
            </div>
            <button
              className={`gss-settings-toggle ${settings.showGenericManifestations ? "active" : ""}`}
              onClick={handleToggleGenericManifestations}
              type="button">
              <span className="gss-settings-toggle-thumb" />
            </button>
          </div>

          <div className="gss-settings-option">
            <div className="gss-settings-option-info">
              <span className="gss-settings-option-label">Show stats as badges</span>
              <span className="gss-settings-option-description">
                Display Move, Save, Control, and Health as compact badges instead of the stat wheel.
              </span>
            </div>
            <button
              className={`gss-settings-toggle ${settings.aosStatDisplayMode === "badges" ? "active" : ""}`}
              onClick={handleToggleStatDisplayMode}
              type="button">
              <span className="gss-settings-toggle-thumb" />
            </button>
          </div>
        </div>

        <button className="gss-settings-continue" onClick={onContinue} type="button">
          Continue
        </button>

        <footer className="gss-settings-footer">
          <p>You can change these settings anytime via the menu.</p>
        </footer>
      </div>
    </div>
  );
};
