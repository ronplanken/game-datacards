import { useState } from "react";
import { Database, Loader2, Repeat } from "lucide-react";
import { message } from "antd";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";
import { useSettingsStorage } from "../../Hooks/useSettingsStorage";
import { BottomSheet } from "./Mobile/BottomSheet";
import "./MobileMenu.css";

// Custom toggle component
const Toggle = ({ checked, onChange }) => (
  <button className={`settings-toggle ${checked ? "active" : ""}`} onClick={() => onChange(!checked)}>
    <span className="settings-toggle-thumb" />
  </button>
);

// Settings row component
const SettingsRow = ({ label, checked, onChange }) => (
  <div className="settings-row">
    <span className="settings-label">{label}</span>
    <Toggle checked={checked} onChange={onChange} />
  </div>
);

export const MobileMenu = ({ isVisible, setIsVisible }) => {
  const [checkingForUpdate, setCheckingForUpdate] = useState(false);
  const { checkForUpdate } = useDataSourceStorage();
  const { settings, updateSettings } = useSettingsStorage();

  const handleClose = () => setIsVisible(false);

  const handleUpdateDatasources = () => {
    setCheckingForUpdate(true);
    checkForUpdate().then(() => {
      setCheckingForUpdate(false);
      handleClose();
      message.success({
        content: "The datasource has been successfully updated.",
        style: { marginTop: "10vh" },
      });
    });
  };

  const handleChangeGameSystem = () => {
    updateSettings({
      ...settings,
      mobile: {
        ...settings.mobile,
        gameSystemSelected: false,
      },
    });
    handleClose();
  };

  // Get current game system name
  const getGameSystemName = () => {
    switch (settings.selectedDataSource) {
      case "40k-10e":
        return "Warhammer 40K 10th Edition";
      case "aos":
        return "Age of Sigmar";
      default:
        return settings.selectedDataSource || "None";
    }
  };

  return (
    <BottomSheet isOpen={isVisible} onClose={handleClose} title="Settings">
      <div className="settings-content">
        {/* Game System Section */}
        <div className="settings-section">
          <h4 className="settings-section-title">Game System</h4>
          <div className="settings-game-system">
            <span className="settings-game-system-current">{getGameSystemName()}</span>
            <button className="settings-action-button secondary" onClick={handleChangeGameSystem}>
              <Repeat size={18} />
              <span>Change</span>
            </button>
          </div>
        </div>

        {/* Display Section - only for AoS */}
        {settings.selectedDataSource === "aos" && (
          <div className="settings-section">
            <h4 className="settings-section-title">Display</h4>
            <div className="settings-section-content">
              <SettingsRow
                label="Use fancy fonts"
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
        )}

        {/* Card Types Section */}
        <div className="settings-section">
          <h4 className="settings-section-title">Card Types</h4>
          <div className="settings-section-content">
            <SettingsRow
              label="Show Legend cards"
              checked={settings.showLegends}
              onChange={(value) => updateSettings({ ...settings, showLegends: value })}
            />
            {settings.selectedDataSource === "40k-10e" && (
              <>
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
              </>
            )}
          </div>
        </div>

        {/* Actions Section */}
        <div className="settings-section">
          <h4 className="settings-section-title">Data</h4>
          <button
            className={`settings-action-button ${checkingForUpdate ? "loading" : ""}`}
            onClick={handleUpdateDatasources}
            disabled={checkingForUpdate}>
            {checkingForUpdate ? <Loader2 size={18} className="animate-spin" /> : <Database size={18} />}
            <span>{checkingForUpdate ? "Updating..." : "Update datasources"}</span>
          </button>
        </div>
      </div>
    </BottomSheet>
  );
};
