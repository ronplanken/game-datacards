import { MinusSquare, PlusSquare, Settings } from "lucide-react";
import React from "react";
import * as ReactDOM from "react-dom";
import { useDataSourceStorage } from "../Hooks/useDataSourceStorage";
import { useSettingsStorage } from "../Hooks/useSettingsStorage";
import { Toggle } from "./SettingsModal/Toggle";
import "./FactionSettingsModal.css";

const modalRoot = document.getElementById("modal-root");

const SettingCard = ({ title, checked, onChange }) => (
  <div className="faction-setting-card clickable" onClick={() => onChange(!checked)}>
    <span className="faction-setting-card-title">{title}</span>
    <Toggle checked={checked} onChange={onChange} />
  </div>
);

export const FactionSettingsModal = () => {
  const [isFactionSettingsVisible, setIsFactionSettingsVisible] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState(null);

  const { dataSource, selectedFaction } = useDataSourceStorage();
  const { settings, updateSettings } = useSettingsStorage();

  // Determine default tab when modal opens
  React.useEffect(() => {
    if (isFactionSettingsVisible && activeTab === null) {
      if (!dataSource.noSubfactionOptions && selectedFaction?.subfactions?.length > 0) {
        setActiveTab("subfactions");
      } else if (!dataSource.noDatasheetOptions) {
        setActiveTab("datasheets");
      } else if (settings.selectedDataSource === "aos") {
        setActiveTab("warscrolls");
      } else if (!dataSource.noStratagemOptions) {
        setActiveTab("stratagems");
      } else if (!dataSource.noSecondaryOptions) {
        setActiveTab("secondaries");
      }
    }
  }, [isFactionSettingsVisible, activeTab, dataSource, selectedFaction, settings.selectedDataSource]);

  const handleClose = () => {
    setIsFactionSettingsVisible(false);
    setActiveTab(null);
  };

  const hasSubfactions = selectedFaction?.subfactions?.length > 0;

  const renderSubfactionsTab = () => (
    <>
      <p className="faction-section-description">
        By default all subfactions are shown. If you want to hide certain subfactions you can toggle them here. This
        will filter stratagems &amp; secondaries. At the moment Datasheets cannot be filtered by subfaction yet because
        of datasource limitations.
      </p>
      <div className="faction-bulk-actions">
        <button
          className="faction-bulk-btn"
          title="De-select all"
          onClick={() => {
            const newSubFactions = settings.ignoredSubFactions ?? [];
            selectedFaction?.subfactions?.forEach((subfaction) => {
              if (!newSubFactions.includes(subfaction.id)) {
                newSubFactions.push(subfaction.id);
              }
            });
            updateSettings({ ...settings, ignoredSubFactions: [...newSubFactions] });
          }}>
          <MinusSquare size={14} />
        </button>
        <button
          className="faction-bulk-btn"
          title="Select all"
          onClick={() => {
            const newSubFactions = settings.ignoredSubFactions ?? [];
            selectedFaction?.subfactions?.forEach((subfaction) => {
              const idx = newSubFactions.findIndex((el) => el === subfaction.id);
              if (idx !== -1) {
                newSubFactions.splice(idx, 1);
              }
            });
            updateSettings({ ...settings, ignoredSubFactions: [...newSubFactions] });
          }}>
          <PlusSquare size={14} />
        </button>
      </div>
      {selectedFaction?.subfactions?.map((subfaction) => (
        <SettingCard
          key={`${selectedFaction.id}-${subfaction.id}`}
          title={subfaction.name}
          checked={!settings.ignoredSubFactions?.includes(subfaction.id)}
          onChange={(value) => {
            const newSubFactions = [...(settings.ignoredSubFactions ?? [])];
            if (value) {
              const idx = newSubFactions.findIndex((el) => el === subfaction.id);
              if (idx !== -1) {
                newSubFactions.splice(idx, 1);
              }
            } else {
              if (!newSubFactions.includes(subfaction.id)) {
                newSubFactions.push(subfaction.id);
              }
            }
            updateSettings({ ...settings, ignoredSubFactions: newSubFactions });
          }}
        />
      ))}
    </>
  );

  const renderDatasheetsTab = () => (
    <>
      {!dataSource.noDatasheetByRole && (
        <>
          <p className="faction-section-title">Generic options</p>
          <SettingCard
            title="Split datasheets by role"
            checked={settings.splitDatasheetsByRole}
            onChange={(value) => updateSettings({ ...settings, splitDatasheetsByRole: value })}
          />
        </>
      )}
      {settings.selectedDataSource === "40k-10e" && (
        <>
          <p className="faction-section-title">Warhammer 10th edition options</p>
          <p className="faction-subsection-title">Datacards</p>
          <SettingCard
            title="Add Legends datacards to factions"
            checked={settings.showLegends}
            onChange={(value) => updateSettings({ ...settings, showLegends: value })}
          />
          <SettingCard
            title="Add Space Marine cards to subchapter factions"
            checked={settings.combineParentFactions}
            onChange={(value) => updateSettings({ ...settings, combineParentFactions: value })}
          />
          <SettingCard
            title="Add allied faction cards to factions"
            checked={settings.combineAlliedFactions}
            onChange={(value) => updateSettings({ ...settings, combineAlliedFactions: value })}
          />
          <p className="faction-subsection-title">Detachments</p>
          <SettingCard
            title="Show non-default factions"
            checked={settings.showNonDefaultFactions}
            onChange={(value) => updateSettings({ ...settings, showNonDefaultFactions: value })}
          />
          <p className="faction-subsection-title">Display</p>
          <SettingCard
            title="Show points in listview"
            checked={settings.showPointsInListview}
            onChange={(value) => updateSettings({ ...settings, showPointsInListview: value })}
          />
          <SettingCard
            title="Always show cards in single-side view"
            checked={settings.showCardsAsDoubleSided || false}
            onChange={(value) => updateSettings({ ...settings, showCardsAsDoubleSided: value })}
          />
          <SettingCard
            title="Group cards by role"
            checked={settings.groupByRole}
            onChange={(value) => updateSettings({ ...settings, groupByRole: value })}
          />
        </>
      )}
      {settings.selectedDataSource === "40k-10e-cp" && (
        <>
          <p className="faction-section-title">Warhammer 10th Combat Patrol options</p>
          <p className="faction-subsection-title">Datacards</p>
          <p className="faction-subsection-title">Display</p>
          <SettingCard
            title="Show points in listview"
            checked={settings.showPointsInListview}
            onChange={(value) => updateSettings({ ...settings, showPointsInListview: value })}
          />
          <SettingCard
            title="Always show cards in single-side view"
            checked={settings.showCardsAsDoubleSided || false}
            onChange={(value) => updateSettings({ ...settings, showCardsAsDoubleSided: value })}
          />
          <SettingCard
            title="Group cards by role"
            checked={settings.groupByRole}
            onChange={(value) => updateSettings({ ...settings, groupByRole: value })}
          />
        </>
      )}
    </>
  );

  const renderWarscrollsTab = () => (
    <>
      <p className="faction-section-title">Warscrolls</p>
      <SettingCard
        title="Show Legends warscrolls"
        checked={settings.showLegends}
        onChange={(value) => updateSettings({ ...settings, showLegends: value })}
      />
      <p className="faction-section-title">Display</p>
      <SettingCard
        title="Use fancy fonts"
        checked={settings.useFancyFonts !== false}
        onChange={(value) => updateSettings({ ...settings, useFancyFonts: value })}
      />
      <SettingCard
        title="Show generic manifestations"
        checked={settings.showGenericManifestations}
        onChange={(value) => updateSettings({ ...settings, showGenericManifestations: value })}
      />
      <SettingCard
        title="Show stats as badges"
        checked={settings.aosStatDisplayMode === "badges"}
        onChange={(value) => updateSettings({ ...settings, aosStatDisplayMode: value ? "badges" : "wheel" })}
      />
    </>
  );

  const renderStratagemsTab = () => (
    <>
      <p className="faction-section-description">Please select your preferred options here.</p>
      <SettingCard
        title="Hide basic stratagems"
        checked={settings.hideBasicStratagems}
        onChange={(value) => updateSettings({ ...settings, hideBasicStratagems: value })}
      />
    </>
  );

  const renderSecondariesTab = () => (
    <>
      <p className="faction-section-description">Please select your preferred options here.</p>
      <SettingCard
        title="Hide basic secondaries"
        checked={settings.hideBasicSecondaries}
        onChange={(value) => updateSettings({ ...settings, hideBasicSecondaries: value })}
      />
    </>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "subfactions":
        return renderSubfactionsTab();
      case "datasheets":
        return renderDatasheetsTab();
      case "warscrolls":
        return renderWarscrollsTab();
      case "stratagems":
        return renderStratagemsTab();
      case "secondaries":
        return renderSecondariesTab();
      default:
        return null;
    }
  };

  return (
    <>
      {isFactionSettingsVisible &&
        ReactDOM.createPortal(
          <div className="faction-modal-overlay" onClick={handleClose}>
            <div className="faction-modal" onClick={(e) => e.stopPropagation()}>
              <div className="faction-modal-header">
                <h2 className="faction-modal-title">{selectedFaction?.name} settings</h2>
              </div>
              <div className="faction-modal-body">
                <nav className="faction-sidebar">
                  {!dataSource.noSubfactionOptions && (
                    <div
                      className={`faction-nav-item ${activeTab === "subfactions" ? "active" : ""} ${
                        !hasSubfactions ? "disabled" : ""
                      }`}
                      onClick={() => hasSubfactions && setActiveTab("subfactions")}>
                      <span>Subfactions</span>
                    </div>
                  )}
                  {!dataSource.noDatasheetOptions && (
                    <div
                      className={`faction-nav-item ${activeTab === "datasheets" ? "active" : ""}`}
                      onClick={() => setActiveTab("datasheets")}>
                      <span>Datasheets</span>
                    </div>
                  )}
                  {settings.selectedDataSource === "aos" && (
                    <div
                      className={`faction-nav-item ${activeTab === "warscrolls" ? "active" : ""}`}
                      onClick={() => setActiveTab("warscrolls")}>
                      <span>Warscrolls</span>
                    </div>
                  )}
                  {!dataSource.noStratagemOptions && (
                    <div
                      className={`faction-nav-item ${activeTab === "stratagems" ? "active" : ""}`}
                      onClick={() => setActiveTab("stratagems")}>
                      <span>Stratagems</span>
                    </div>
                  )}
                  {!dataSource.noSecondaryOptions && (
                    <div
                      className={`faction-nav-item ${activeTab === "secondaries" ? "active" : ""}`}
                      onClick={() => setActiveTab("secondaries")}>
                      <span>Secondaries</span>
                    </div>
                  )}
                </nav>
                <div className="faction-content">{renderContent()}</div>
              </div>
              <div className="faction-modal-footer">
                <button className="faction-close-btn" onClick={handleClose}>
                  Close
                </button>
              </div>
            </div>
          </div>,
          modalRoot,
        )}
      <button
        className="faction-settings-trigger"
        style={{
          width: "32px",
          height: "32px",
          padding: "0px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fff",
          border: "1px solid #d9d9d9",
          borderRadius: "6px",
          cursor: selectedFaction ? "pointer" : "not-allowed",
          opacity: selectedFaction ? 1 : 0.5,
          transition: "all 0.2s ease",
        }}
        disabled={!selectedFaction}
        onClick={() => setIsFactionSettingsVisible(true)}>
        <Settings size={14} />
      </button>
    </>
  );
};
