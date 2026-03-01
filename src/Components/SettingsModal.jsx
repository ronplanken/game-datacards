import { Settings, Database, Trash2, Printer, History, Plus, Package, Cloud, Globe } from "lucide-react";
import { Popconfirm } from "antd";
import { message } from "./Toast/message";
import { Tooltip } from "./Tooltip/Tooltip";
import React, { useEffect, useCallback, useState } from "react";
import { useDataSourceStorage } from "../Hooks/useDataSourceStorage";
import { useSettingsStorage } from "../Hooks/useSettingsStorage";
import { useCardStorage } from "../Hooks/useCardStorage";
import { useAuth, useSubscription, useSync } from "../Premium";
import { useUmami } from "../Hooks/useUmami";
import { useDatasourceSharing } from "../Hooks/useDatasourceSharing";
import { Toggle, DatasourceCard, CustomDatasourceCard, ChangelogEntry } from "./SettingsModal/index";
import { CustomDatasourceModal, EditDatasourceMetadataModal } from "../Premium";
import { PublishDatasourceModal } from "./DatasourcePublish";
import { confirmDialog } from "./ConfirmChangesModal";
import "./SettingsModal.css";

// Format ISO date string to localized date/time
const formatDate = (isoString) => {
  if (!isoString) return "Never";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
};

export const SettingsModal = () => {
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("datasources");
  const [showOlderVersions, setShowOlderVersions] = React.useState(false);
  const [isCustomDatasourceModalOpen, setIsCustomDatasourceModalOpen] = useState(false);
  const [checkingCustomUpdateId, setCheckingCustomUpdateId] = useState(null);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishingDatasourceId, setPublishingDatasourceId] = useState(null);
  const [uploadingDatasourceId, setUploadingDatasourceId] = useState(null);
  const [isEditMetadataModalOpen, setIsEditMetadataModalOpen] = useState(false);
  const [editingDatasource, setEditingDatasource] = useState(null);

  const { settings, updateSettings } = useSettingsStorage();
  const { trackEvent } = useUmami();
  const { getLocalDatasources, updateDatasourceCloudState } = useCardStorage();
  const {
    dataSource,
    checkForUpdate,
    clearData,
    removeCustomDatasource,
    checkCustomDatasourceUpdate,
    applyCustomDatasourceUpdate,
    getCustomDatasourceData,
  } = useDataSourceStorage();
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const { uploadDatasource, publishLocalDatasource, pushDatasourceUpdate } = useDatasourceSharing();
  const { uploadLocalDatasource } = useSync();

  // Get tier from subscription object
  const tier = subscription?.tier || "free";

  const [checkingForUpdate, setCheckingForUpdate] = React.useState(false);

  // Check if user can upload (Premium or Creator tier)
  const canUpload = user && (tier === "premium" || tier === "creator");

  const refreshData = () => {
    setCheckingForUpdate(true);
    checkForUpdate().then(() => setCheckingForUpdate(false));
  };

  const handleCheckCustomUpdate = async (datasourceId) => {
    setCheckingCustomUpdateId(datasourceId);
    const result = await checkCustomDatasourceUpdate(datasourceId);
    setCheckingCustomUpdateId(null);

    if (result.hasUpdate) {
      // Show confirmation dialog before applying update
      const datasource = settings.customDatasources?.find((ds) => ds.id === datasourceId);
      const currentVersion = datasource?.version || "unknown";
      const newVersion = result.newData?.version || "unknown";
      const datasourceName = datasource?.name || "datasource";
      const updateMessage =
        'A new version of "' +
        datasourceName +
        '" is available.\n\nCurrent version: ' +
        currentVersion +
        "\nNew version: " +
        newVersion +
        "\n\nDo you want to apply this update?";

      confirmDialog({
        title: "Update Available",
        content: updateMessage,
        handleSave: async () => {
          await applyCustomDatasourceUpdate(datasourceId, result.newData);
          message.success("Datasource updated successfully");
        },
        handleDiscard: () => {},
        handleCancel: () => {},
        saveText: "Apply Update",
        discardText: "Skip",
        hideDiscard: true,
      });
    } else {
      message.info("No updates available");
    }
  };

  const handleUploadDatasource = async (datasourceId) => {
    const registryEntry = settings.customDatasources?.find((ds) => ds.id === datasourceId);
    if (!registryEntry) return;

    // Get the full datasource data from storage (includes the 'data' array)
    const fullDatasourceData = await getCustomDatasourceData(datasourceId);
    if (!fullDatasourceData) {
      message.error("Could not load datasource data");
      return;
    }

    setUploadingDatasourceId(datasourceId);
    try {
      const metadata = {
        name: registryEntry.name,
        version: registryEntry.version,
        authorName: registryEntry.author,
        displayFormat: fullDatasourceData.displayFormat,
      };
      const result = await uploadDatasource(fullDatasourceData, metadata);
      if (result.success) {
        // Update the local datasource with cloudId
        const updatedDatasources = settings.customDatasources.map((ds) =>
          ds.id === datasourceId ? { ...ds, cloudId: result.cloudId } : ds,
        );
        updateSettings({ ...settings, customDatasources: updatedDatasources });
        message.success("Datasource uploaded to cloud successfully");
      } else {
        message.error(result.error || "Failed to upload datasource");
      }
    } catch (error) {
      message.error("Failed to upload datasource");
    } finally {
      setUploadingDatasourceId(null);
    }
  };

  const handlePublishDatasource = (datasourceId) => {
    setPublishingDatasourceId(datasourceId);
    setIsPublishModalOpen(true);
  };

  const handlePublishComplete = (shareCode) => {
    if (publishingDatasourceId && shareCode) {
      // Update the local datasource with published state
      const updatedDatasources = settings.customDatasources.map((ds) =>
        ds.id === publishingDatasourceId ? { ...ds, isPublished: true, shareCode } : ds,
      );
      updateSettings({ ...settings, customDatasources: updatedDatasources });
    }
    setIsPublishModalOpen(false);
    setPublishingDatasourceId(null);
  };

  // Handle escape key
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape" && isModalVisible) {
        setIsModalVisible(false);
      }
    },
    [isModalVisible],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsModalVisible(false);
    }
  };

  const navItems = [
    { key: "datasources", label: "Datasources", icon: <Database size={16} className="settings-nav-icon" /> },
    { key: "storage", label: "Storage", icon: <Trash2 size={16} className="settings-nav-icon" /> },
    { key: "printing", label: "Printing", icon: <Printer size={16} className="settings-nav-icon" /> },
    { key: "changelog", label: "Changelog", icon: <History size={16} className="settings-nav-icon" /> },
  ];

  // Datasource details component
  const DatasourceDetails = () => (
    <div className="datasource-details">
      <div className="datasource-detail-item">
        <span className="datasource-detail-label">Last update check</span>
        <span className="datasource-detail-value">{formatDate(dataSource.lastCheckedForUpdate)}</span>
      </div>
      <div className="datasource-detail-item">
        <span className="datasource-detail-label">Data version date</span>
        <span className="datasource-detail-value">{formatDate(dataSource.lastUpdated)}</span>
      </div>
      <div className="datasource-detail-item">
        <span className="datasource-detail-label">Version</span>
        <span className="datasource-detail-value">{dataSource.version}</span>
      </div>
      <div className="datasource-detail-item">
        <span className="datasource-detail-label">Factions</span>
        <span className="datasource-detail-value">{dataSource.data.length || 0}</span>
      </div>
      <div className="datasource-detail-item">
        <span className="datasource-detail-label">Stored</span>
        <span className="datasource-detail-value">Locally in browser</span>
      </div>
    </div>
  );

  return (
    <>
      {isModalVisible && (
        <div className="settings-modal-overlay" onClick={handleOverlayClick}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="settings-modal-header">
              <span className="settings-modal-title">Settings</span>
              <span className="settings-version-badge">Version {import.meta.env.VITE_VERSION}</span>
            </div>

            {/* Body */}
            <div className="settings-modal-body">
              {/* Sidebar */}
              <nav className="settings-sidebar">
                {navItems.map((item) => (
                  <div
                    key={item.key}
                    className={`settings-nav-item ${activeTab === item.key ? "active" : ""}`}
                    onClick={() => setActiveTab(item.key)}>
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                ))}
              </nav>

              {/* Content */}
              <div className="settings-content">
                {/* Datasources Tab */}
                {activeTab === "datasources" && (
                  <>
                    <p className="settings-section-description">
                      Choose a game system to load its unit data. If none is selected, the Basic Card system is used.
                    </p>

                    {/* Active Datasource Section */}
                    <div className="datasource-section">
                      <h3 className="datasource-section-title">Active Datasource</h3>
                      {(() => {
                        // Check if a custom datasource is active
                        const activeCustomDs = settings.customDatasources?.find(
                          (ds) => ds.id === settings.selectedDataSource,
                        );

                        if (activeCustomDs) {
                          return (
                            <CustomDatasourceCard
                              key={activeCustomDs.id}
                              datasource={activeCustomDs}
                              isActive={true}
                              onToggle={() => {}}
                              onCheckUpdate={
                                activeCustomDs.sourceType === "url" && !activeCustomDs.isSubscribed
                                  ? () => handleCheckCustomUpdate(activeCustomDs.id)
                                  : undefined
                              }
                              isCheckingUpdate={checkingCustomUpdateId === activeCustomDs.id}
                              onUpload={() => handleUploadDatasource(activeCustomDs.id)}
                              onPublish={() => handlePublishDatasource(activeCustomDs.id)}
                              isUploading={uploadingDatasourceId === activeCustomDs.id}
                              canUpload={canUpload}
                            />
                          );
                        }

                        // Otherwise show built-in datasource
                        const datasources = [
                          { id: "basic", title: "Basic Cards", hasUpdate: false },
                          { id: "40k-10e", title: "40k 10th Edition import", hasUpdate: true },
                          { id: "40k-10e-cp", title: "40k 10th Combat Patrol import", hasUpdate: true },
                          { id: "40k", title: "Wahapedia data import 9th edition", hasUpdate: true },
                          { id: "necromunda", title: "Necromunda", hasUpdate: false },
                          { id: "aos", title: "Age of Sigmar", hasUpdate: true },
                        ];
                        const activeDs =
                          datasources.find((ds) => ds.id === settings.selectedDataSource) || datasources[0];
                        return (
                          <DatasourceCard
                            key={activeDs.id}
                            title={activeDs.title}
                            isActive={true}
                            onToggle={() => {}}
                            disabled={true}
                            onCheckUpdate={activeDs.hasUpdate ? refreshData : undefined}
                            isCheckingUpdate={checkingForUpdate}>
                            {activeDs.hasUpdate && <DatasourceDetails />}
                          </DatasourceCard>
                        );
                      })()}
                    </div>

                    {/* Local Datasources Section */}
                    {getLocalDatasources().length > 0 && (
                      <div className="datasource-section">
                        <h3 className="datasource-section-title">Local Datasources</h3>
                        <p className="datasource-section-description">
                          Datasources you created from your card categories. Upload to cloud to share with others.
                        </p>
                        {getLocalDatasources().map((ds) => {
                          const isActive = settings.selectedDataSource === `local-ds-${ds.uuid}`;
                          return (
                            <div key={ds.uuid} className={`local-datasource-card ${isActive ? "active" : ""}`}>
                              <div className="local-datasource-header">
                                <Package size={16} className="local-datasource-icon" />
                                <span className="local-datasource-name">{ds.name}</span>
                                {ds.isPublished && (
                                  <span className="local-datasource-badge published">
                                    <Globe size={10} /> Published
                                  </span>
                                )}
                                {ds.isUploaded && !ds.isPublished && (
                                  <span className="local-datasource-badge uploaded">
                                    <Cloud size={10} /> Uploaded
                                  </span>
                                )}
                              </div>
                              <div className="local-datasource-meta">
                                <span>v{ds.version || "1.0.0"}</span>
                                {ds.author && <span>by {ds.author}</span>}
                                <span>{ds.cards?.length || 0} cards</span>
                              </div>
                              <div className="local-datasource-actions">
                                {!isActive && (
                                  <button
                                    className="local-datasource-btn"
                                    onClick={() =>
                                      updateSettings({
                                        ...settings,
                                        selectedDataSource: `local-ds-${ds.uuid}`,
                                      })
                                    }>
                                    Select
                                  </button>
                                )}
                                <button
                                  className="local-datasource-btn"
                                  onClick={() => {
                                    setEditingDatasource(ds);
                                    setIsEditMetadataModalOpen(true);
                                  }}>
                                  Edit
                                </button>
                                {user && canUpload && !ds.isUploaded && (
                                  <button
                                    className="local-datasource-btn primary"
                                    onClick={() => {
                                      updateDatasourceCloudState(ds.uuid, {
                                        syncEnabled: true,
                                        syncStatus: "pending",
                                      });
                                      message.info("Uploading datasource...");
                                    }}>
                                    Upload
                                  </button>
                                )}
                                {user && ds.isUploaded && !ds.isPublished && (
                                  <button
                                    className="local-datasource-btn primary"
                                    onClick={async () => {
                                      const result = await publishLocalDatasource(ds.cloudId, {});
                                      if (result.success) {
                                        updateDatasourceCloudState(ds.uuid, {
                                          isPublished: true,
                                          shareCode: result.shareCode,
                                          publishedVersion: result.versionNumber,
                                        });
                                      }
                                    }}>
                                    Publish
                                  </button>
                                )}
                                {user && ds.isPublished && (
                                  <button
                                    className="local-datasource-btn"
                                    onClick={async () => {
                                      const result = await pushDatasourceUpdate(ds.cloudId);
                                      if (result.success) {
                                        updateDatasourceCloudState(ds.uuid, {
                                          publishedVersion: result.newVersionNumber,
                                        });
                                      }
                                    }}>
                                    Push Update
                                  </button>
                                )}
                              </div>
                              {ds.shareCode && (
                                <div className="local-datasource-share">
                                  Share code: <code>{ds.shareCode}</code>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Custom Datasources Section */}
                    <div className="datasource-section">
                      <div className="datasource-section-header">
                        <h3 className="datasource-section-title">Custom Datasources</h3>
                        <button className="datasource-add-btn" onClick={() => setIsCustomDatasourceModalOpen(true)}>
                          <Plus size={12} />
                          Add
                        </button>
                      </div>
                      {(!settings.customDatasources || settings.customDatasources.length === 0) && (
                        <p className="datasource-empty-text">
                          No custom datasources imported yet. Click &quot;Add&quot; to import from URL or file.
                        </p>
                      )}
                      {settings.customDatasources?.map((ds) => {
                        const isActive = ds.id === settings.selectedDataSource;
                        return (
                          <CustomDatasourceCard
                            key={ds.id}
                            datasource={ds}
                            isActive={false}
                            isGhost={isActive}
                            onToggle={() =>
                              updateSettings({
                                ...settings,
                                selectedDataSource: ds.id,
                              })
                            }
                            onDelete={!isActive && !ds.isSubscribed ? () => removeCustomDatasource(ds.id) : undefined}
                            onUpload={() => handleUploadDatasource(ds.id)}
                            onPublish={() => handlePublishDatasource(ds.id)}
                            isUploading={uploadingDatasourceId === ds.id}
                            canUpload={canUpload}
                          />
                        );
                      })}
                    </div>

                    {/* Other Datasources Section */}
                    <div className="datasource-section">
                      <h3 className="datasource-section-title">Other Datasources</h3>
                      {(() => {
                        const datasources = [
                          { id: "basic", title: "Basic Cards", hasUpdate: false },
                          { id: "40k-10e", title: "40k 10th Edition import", hasUpdate: true },
                          { id: "40k-10e-cp", title: "40k 10th Combat Patrol import", hasUpdate: true },
                          { id: "40k", title: "Wahapedia data import 9th edition", hasUpdate: true },
                          { id: "necromunda", title: "Necromunda", hasUpdate: false },
                          { id: "aos", title: "Age of Sigmar", hasUpdate: true },
                        ];
                        const isCustomDatasourceActive = settings.customDatasources?.some(
                          (ds) => ds.id === settings.selectedDataSource,
                        );
                        return datasources.map((ds) => {
                          const isActive = !isCustomDatasourceActive && ds.id === settings.selectedDataSource;
                          return (
                            <DatasourceCard
                              key={ds.id}
                              title={ds.title}
                              isActive={isActive}
                              onToggle={() =>
                                updateSettings({
                                  ...settings,
                                  selectedDataSource: ds.id,
                                })
                              }
                              disabled={isActive}
                            />
                          );
                        });
                      })()}
                    </div>
                  </>
                )}

                {/* Storage Tab */}
                {activeTab === "storage" && (
                  <>
                    <div className="warning-box">
                      <p className="warning-box-text">
                        This permanently deletes all locally stored data, including your saved cards and categories.
                        This action cannot be undone.
                      </p>
                    </div>
                    <Popconfirm
                      title={"Delete all saved cards, categories, and settings? This cannot be undone."}
                      onConfirm={clearData}>
                      <button className="danger-btn">Clear all data</button>
                    </Popconfirm>
                  </>
                )}

                {/* Printing Tab */}
                {activeTab === "printing" && (
                  <>
                    <p className="settings-section-description">Adjust how your cards are printed.</p>
                    <div className="setting-row">
                      <div className="setting-info">
                        <div className="setting-label">Legacy Printing</div>
                        <div className="setting-description">
                          Use the original print layout from earlier versions. Try this if the default layout has issues
                          with your printer.
                        </div>
                      </div>
                      <Toggle
                        checked={settings.legacyPrinting}
                        onChange={() =>
                          updateSettings({
                            ...settings,
                            legacyPrinting: !settings.legacyPrinting,
                          })
                        }
                      />
                    </div>
                  </>
                )}

                {/* Changelog Tab */}
                {activeTab === "changelog" && (
                  <div className="changelog-container">
                    <div className="changelog-timeline">
                      <ChangelogEntry version="Version 3.3.0" date="01-03-2026" defaultExpanded={true}>
                        <h4 className="changelog-section-title">Added</h4>
                        <ul className="changelog-list">
                          <li className="changelog-list-item">
                            <strong>List Forge Import</strong>
                            Import army lists from{" "}
                            <a href="https://listforge.club/" target="_blank" rel="noreferrer">
                              List Forge
                            </a>{" "}
                            by uploading an exported file or pasting its contents. Match units to your datasource for full
                            datasheet cards, or import the exported data directly.
                          </li>
                          <li className="changelog-list-item">
                            <strong>Automatic Unit Matching</strong>
                            Factions, detachments, units, and enhancements are detected and matched automatically with the
                            option to review and adjust before importing.
                          </li>
                        </ul>
                      </ChangelogEntry>

                      <ChangelogEntry version="Version 3.1.3" date="13-02-2026">
                        <h4 className="changelog-section-title">Fixes</h4>
                        <ul className="changelog-list">
                          <li className="changelog-list-item">
                            <strong>Ability Keyword Styling</strong>
                            Weapon keywords (e.g. Sustained Hits, Hazardous, Assault) in ability descriptions now render
                            with the correct green weapon style and tooltip. Rule keywords (e.g. Feel No Pain, Lone
                            Operative) use the black rule style.
                          </li>
                        </ul>
                      </ChangelogEntry>

                      <ChangelogEntry version="Version 3.0.0" date="01-12-2025">
                        <h4 className="changelog-section-title">Added</h4>
                        <ul className="changelog-list">
                          <li className="changelog-list-item">
                            <strong>Age of Sigmar Support</strong>
                            Full support for Age of Sigmar warscrolls with spell lores, manifestations, and
                            faction-specific styling.
                          </li>
                          <li className="changelog-list-item">
                            <strong>Updated Styling</strong>
                            Refreshed modal designs and UI components for a more modern look and feel.
                          </li>
                          <li className="changelog-list-item">
                            <strong>Custom Faction Icons</strong>
                            Upload your own faction symbol with positioning and scaling controls.
                          </li>
                          <li className="changelog-list-item">
                            <strong>Custom Colours</strong>
                            Override faction colours with custom banner and header colours per card.
                          </li>
                          <li className="changelog-list-item">
                            <strong>Linkable Leaders</strong>
                            Link Leader and Led By entries to your own custom cards.
                          </li>
                          <li className="changelog-list-item">
                            <strong>Updated Controls</strong>
                            Auto-fit card scaling and improved zoom controls in the editor.
                          </li>
                          <li className="changelog-list-item">
                            <strong>Sub-categories</strong>
                            Organise your cards with nested sub-categories in the tree view.
                          </li>
                        </ul>
                      </ChangelogEntry>

                      <ChangelogEntry version="Version 2.14.0" date="26-11-2025">
                        <h4 className="changelog-section-title">Added</h4>
                        <ul className="changelog-list">
                          <li className="changelog-list-item">
                            <strong>Custom Faction Symbol</strong>
                            Upload a custom faction symbol image with positioning and scaling options.
                          </li>
                          <li className="changelog-list-item">
                            <strong>Points Display Options</strong>
                            Configure how points are displayed with options to show all points, designate a primary
                            point, and display model counts.
                          </li>
                          <li className="changelog-list-item">
                            <strong>Auto-fit Card Scaling</strong>
                            Cards now automatically scale to fit the available space. Toggle between Auto and Manual
                            zoom modes using the new button next to the zoom controls.
                          </li>
                        </ul>
                        <h4 className="changelog-section-title">Fixed</h4>
                        <ul className="changelog-list">
                          <li className="changelog-list-item">
                            <strong>Points Not Showing in Image Export</strong>
                            Fixed an issue where points were not visible when exporting Warhammer 10th edition cards as
                            images.
                          </li>
                        </ul>
                      </ChangelogEntry>

                      <ChangelogEntry version="Version 2.13.0" date="25-09-2025">
                        <h4 className="changelog-section-title">Added</h4>
                        <ul className="changelog-list">
                          <li className="changelog-list-item">
                            <strong>Local Image Upload</strong>
                            Upload custom images that save to your browser (not shared with others).
                          </li>
                          <li className="changelog-list-item">
                            <strong>Image Positioning</strong>
                            Move images left/right and up/down with slider controls.
                          </li>
                          <li className="changelog-list-item">
                            <strong>Image Layer Control</strong>
                            Choose if images appear above or below other card elements.
                          </li>
                          <li className="changelog-list-item">
                            <strong>Styling Panel Everywhere</strong>
                            Image controls now work in both single and double-sided views.
                          </li>
                          <li className="changelog-list-item">
                            <strong>Enhanced Text Editor</strong>
                            All text editors now support text coloring and proper line breaks.
                          </li>
                          <li className="changelog-list-item">
                            <strong>Unified Editor Experience</strong>
                            Consistent editing features across 10th Edition and Necromunda cards.
                          </li>
                        </ul>
                      </ChangelogEntry>

                      <ChangelogEntry version="Version 2.12.1" date="12-06-2025">
                        <h4 className="changelog-section-title">Added</h4>
                        <ul className="changelog-list">
                          <li className="changelog-list-item">
                            <strong>Added Deathwatch to 10e cards</strong>
                            Deathwatch faction is now available for Warhammer 40k 10th edition cards.
                          </li>
                        </ul>
                        <h4 className="changelog-section-title">Fixes</h4>
                        <ul className="changelog-list">
                          <li className="changelog-list-item">
                            <strong>Fixed the delete modal not showing up</strong>
                            Resolved issues with delete confirmation modal visibility and improved line height
                            formatting for Stratagem cards.
                          </li>
                          <li className="changelog-list-item">
                            <strong>Fixed multi-line not working properly</strong>
                            Improved text formatting to properly handle multi-line content in Stratagem and Enhancement
                            cards.
                          </li>
                        </ul>
                      </ChangelogEntry>

                      <ChangelogEntry version="Version 2.12.0" date="04-06-2025">
                        <h4 className="changelog-section-title">Features</h4>
                        <ul className="changelog-list">
                          <li className="changelog-list-item">
                            <strong>Panel visibility toggles for 10e cards</strong>
                            Added toggle switches to show/hide Wargear, Loadout, and Abilities sections in the card
                            editor.
                          </li>
                        </ul>
                      </ChangelogEntry>

                      <ChangelogEntry version="Version 2.11.0" date="13-05-2025">
                        <h4 className="changelog-section-title">Added</h4>
                        <ul className="changelog-list">
                          <li className="changelog-list-item">
                            <strong>Enhancement Cards</strong>A new option for the desktop editor has been added. You
                            can now add Enhancement Cards to your collections.
                          </li>
                          <li className="changelog-list-item">
                            <strong>Resizeable 10e stratagems & enhancement cards</strong>
                            We have added the first kind of resizeable cards to the desktop editor. You can now resize
                            them using a slider, and change the font-size of the content.
                          </li>
                        </ul>
                        <h4 className="changelog-section-title">Fixes</h4>
                        <ul className="changelog-list">
                          <li className="changelog-list-item">
                            <strong>Unsaved changes popup</strong>
                            After our previous change to the unsaved changes popup, you could get in a loop where you
                            did not want to save changes but couldn&apos;t swap cards. You now have the extra option to
                            discard your changes.
                          </li>
                        </ul>
                      </ChangelogEntry>

                      <button
                        className="changelog-older-toggle"
                        onClick={() => setShowOlderVersions(!showOlderVersions)}>
                        {showOlderVersions ? "Hide older versions" : "Show older versions"}
                      </button>

                      {showOlderVersions && (
                        <>
                          <ChangelogEntry version="Version 2.10.0" date="13-05-2025">
                            <h4 className="changelog-section-title">Added</h4>
                            <ul className="changelog-list">
                              <li className="changelog-list-item">
                                <strong>Added external image option for 10e Unit Cards</strong>
                                Based on our previous update, we added the option to add an external image to your 10e
                                cards.
                              </li>
                              <li className="changelog-list-item">
                                <strong>Text Size option for 10e Stratagem Cards</strong>
                                You can now manually set the text size for your stratagem cards.
                              </li>
                            </ul>
                          </ChangelogEntry>

                          <ChangelogEntry version="Version 2.9.3" date="09-05-2025">
                            <h4 className="changelog-section-title">Added</h4>
                            <ul className="changelog-list">
                              <li className="changelog-list-item">
                                <strong>html-data tags for external CSS</strong>
                                Added html-data tags to the Datacards that allow you to use custom CSS.
                              </li>
                            </ul>
                          </ChangelogEntry>

                          <ChangelogEntry version="Version 2.9.1" date="18-10-2024">
                            <h4 className="changelog-section-title">Features</h4>
                            <ul className="changelog-list">
                              <li className="changelog-list-item">
                                <strong>Updated to latest datasources</strong>
                                All the latest changes are now available!
                              </li>
                              <li className="changelog-list-item">
                                <strong>Points values with multiple keywords</strong>
                                Points values with specific keywords are now displayed properly.
                              </li>
                            </ul>
                          </ChangelogEntry>

                          <ChangelogEntry version="Version 2.9.0" date="16-10-2024">
                            <h4 className="changelog-section-title">Features</h4>
                            <ul className="changelog-list">
                              <li className="changelog-list-item">
                                <strong>Agents of the Imperium</strong>
                                The new Agents of the Imperium faction is now available for 10th edition.
                              </li>
                              <li className="changelog-list-item">
                                <strong>New Combat Patrols</strong>
                                New Combat patrols have been added.
                              </li>
                            </ul>
                          </ChangelogEntry>

                          <ChangelogEntry version="Version 2.8.0" date="26-08-2024">
                            <h4 className="changelog-section-title">Features</h4>
                            <ul className="changelog-list">
                              <li className="changelog-list-item">
                                <strong>Genestealer Cults & Sisters of Battle</strong>
                                Two new codexes have been added.
                              </li>
                            </ul>
                          </ChangelogEntry>

                          <ChangelogEntry version="Version 2.7.0" date="20-06-2024">
                            <h4 className="changelog-section-title">Features</h4>
                            <ul className="changelog-list">
                              <li className="changelog-list-item">
                                <strong>Chaos Space Marines</strong>
                                The new Chaos Space Marines have popped up in the 10th edition.
                              </li>
                              <li className="changelog-list-item">
                                <strong>Emperor&apos;s Children</strong>
                                The Emperor&apos;s Children faction is now available for 10th edition.
                              </li>
                            </ul>
                          </ChangelogEntry>

                          <ChangelogEntry version="Version 2.6.0" date="29-04-2024">
                            <h4 className="changelog-section-title">Features</h4>
                            <ul className="changelog-list">
                              <li className="changelog-list-item">
                                <strong>Full sized cards display</strong>
                                The technology has arrived to display Warhammer 10e cards in a single full sized card
                                side.
                              </li>
                              <li className="changelog-list-item">
                                <strong>Complete and thorough cleanup of datasources</strong>
                                We have set all our servitors to work and managed to automate the error checking and
                                cleanup of our datasources.
                              </li>
                            </ul>
                            <div className="changelog-discord">
                              <a href="https://discord.gg/anfn4qTYC4" target="_blank" rel="noreferrer">
                                <img
                                  src="https://discordapp.com/api/guilds/997166169540788244/widget.png?style=banner2"
                                  alt="Discord"
                                />
                              </a>
                            </div>
                          </ChangelogEntry>

                          <ChangelogEntry version="Version 2.5.0" date="19-03-2024">
                            <h4 className="changelog-section-title">Updates</h4>
                            <ul className="changelog-list">
                              <li className="changelog-list-item">
                                <strong>Dark Angels update</strong>
                                The new Dark Angels 10e codex has been added to the website.
                              </li>
                            </ul>
                          </ChangelogEntry>

                          <ChangelogEntry version="Version 2.4.0" date="16-03-2024">
                            <h4 className="changelog-section-title">Updates</h4>
                            <ul className="changelog-list">
                              <li className="changelog-list-item">
                                <strong>Space Marines update</strong>
                                The 10e Space Marines have been updated to their latest source.
                              </li>
                            </ul>
                          </ChangelogEntry>

                          <ChangelogEntry version="Version 2.3.0 - 2.0.0" date="2023">
                            <p className="changelog-list-item">
                              Earlier versions included features like mobile list creation, stratagem editor, backcard
                              editing, 10th edition support, and various improvements. See the Discord for full
                              historical changelogs.
                            </p>
                            <div className="changelog-discord">
                              <a href="https://discord.gg/anfn4qTYC4" target="_blank" rel="noreferrer">
                                <img
                                  src="https://discordapp.com/api/guilds/997166169540788244/widget.png?style=banner2"
                                  alt="Discord"
                                />
                              </a>
                            </div>
                          </ChangelogEntry>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="settings-modal-footer">
              <button className="close-btn" onClick={() => setIsModalVisible(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Tooltip content="Configuration" placement="bottom-start">
        <button
          className="app-header-icon-btn"
          onClick={() => {
            setIsModalVisible(true);
            trackEvent("settings-open");
          }}>
          <Settings size={20} />
        </button>
      </Tooltip>

      <CustomDatasourceModal
        isOpen={isCustomDatasourceModalOpen}
        onClose={() => setIsCustomDatasourceModalOpen(false)}
      />

      <EditDatasourceMetadataModal
        isOpen={isEditMetadataModalOpen}
        onClose={() => {
          setIsEditMetadataModalOpen(false);
          setEditingDatasource(null);
        }}
        datasource={editingDatasource}
      />

      <PublishDatasourceModal
        isOpen={isPublishModalOpen}
        onClose={() => {
          setIsPublishModalOpen(false);
          setPublishingDatasourceId(null);
        }}
        datasource={settings.customDatasources?.find((ds) => ds.id === publishingDatasourceId)}
        onPublishComplete={handlePublishComplete}
      />
    </>
  );
};
