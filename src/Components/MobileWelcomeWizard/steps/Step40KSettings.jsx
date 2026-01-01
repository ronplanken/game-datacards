import { Settings, Skull, Users, Shield } from "lucide-react";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";

export const Step40KSettings = () => {
  const { settings, updateSettings } = useSettingsStorage();

  const handleToggleLegends = () => {
    updateSettings({
      ...settings,
      showLegends: !settings.showLegends,
    });
  };

  const handleToggleParentFactions = () => {
    updateSettings({
      ...settings,
      combineParentFactions: !settings.combineParentFactions,
    });
  };

  const handleToggleAlliedFactions = () => {
    updateSettings({
      ...settings,
      combineAlliedFactions: !settings.combineAlliedFactions,
    });
  };

  return (
    <div className="mww-settings">
      <header className="mww-settings-header">
        <div className="mww-settings-icon mww-settings-icon--40k">
          <Settings />
        </div>
        <h1 className="mww-settings-title">Display Settings</h1>
        <p className="mww-settings-subtitle">Customize how units and factions are displayed in Warhammer 40,000.</p>
      </header>

      <div className="mww-settings-options">
        <div className="mww-settings-option">
          <div className="mww-settings-option-icon">
            <Skull />
          </div>
          <div className="mww-settings-option-info">
            <span className="mww-settings-option-label">Show Legend cards</span>
            <span className="mww-settings-option-desc">Display Legend units in faction lists</span>
          </div>
          <button
            className={`mww-settings-toggle ${settings.showLegends ? "active" : ""}`}
            onClick={handleToggleLegends}
            type="button">
            <span className="mww-settings-toggle-thumb" />
          </button>
        </div>

        <div className="mww-settings-option">
          <div className="mww-settings-option-icon">
            <Shield />
          </div>
          <div className="mww-settings-option-info">
            <span className="mww-settings-option-label">Show main faction cards</span>
            <span className="mww-settings-option-desc">Include parent faction units in sub-faction lists</span>
          </div>
          <button
            className={`mww-settings-toggle ${settings.combineParentFactions ? "active" : ""}`}
            onClick={handleToggleParentFactions}
            type="button">
            <span className="mww-settings-toggle-thumb" />
          </button>
        </div>

        <div className="mww-settings-option">
          <div className="mww-settings-option-icon">
            <Users />
          </div>
          <div className="mww-settings-option-info">
            <span className="mww-settings-option-label">Show allied faction cards</span>
            <span className="mww-settings-option-desc">Include Imperial Agents, dungeons, and other allies</span>
          </div>
          <button
            className={`mww-settings-toggle ${settings.combineAlliedFactions ? "active" : ""}`}
            onClick={handleToggleAlliedFactions}
            type="button">
            <span className="mww-settings-toggle-thumb" />
          </button>
        </div>
      </div>

      <p className="mww-settings-note">You can change these settings anytime from the menu.</p>
    </div>
  );
};
