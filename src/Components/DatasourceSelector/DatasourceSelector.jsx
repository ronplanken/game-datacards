import { Database, ChevronDown, RefreshCw, Plus, Globe, FileText, Check, Link, Users, Package } from "lucide-react";
import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { compare } from "compare-versions";
import moment from "moment";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";
import { useSettingsStorage } from "../../Hooks/useSettingsStorage";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { CustomDatasourceModal } from "../../Premium";
import { DatasourceBrowserModal } from "../DatasourceBrowser";
import "./DatasourceSelector.css";

const BUILT_IN_DATASOURCES = [
  { id: "basic", title: "Basic Cards" },
  { id: "40k-10e", title: "40k 10th Edition" },
  { id: "40k-10e-cp", title: "40k Combat Patrol" },
  { id: "40k", title: "Wahapedia 9th Edition" },
  { id: "necromunda", title: "Necromunda" },
  { id: "aos", title: "Age of Sigmar" },
];

export const DatasourceSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isBrowseModalOpen, setIsBrowseModalOpen] = useState(false);
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  const { settings, updateSettings } = useSettingsStorage();
  const { dataSource, checkForUpdate } = useDataSourceStorage();
  const { getLocalDatasources } = useCardStorage();

  // Get local datasources from card storage
  const localDatasources = getLocalDatasources();

  // Separate custom datasources into subscribed and non-subscribed
  const customDatasources = settings.customDatasources || [];
  const subscribedDatasources = customDatasources.filter((ds) => ds.isSubscribed);
  const ownedDatasources = customDatasources.filter((ds) => !ds.isSubscribed);

  // Check if datasource needs update (same logic as UpdateReminder)
  useEffect(() => {
    // Don't show update indicator for local custom datasources (they can't be auto-updated)
    const isCustomDatasource = settings.selectedDataSource?.startsWith("custom-");
    if (isCustomDatasource) {
      const customDs = settings.customDatasources?.find((ds) => ds.id === settings.selectedDataSource);
      if (customDs?.sourceType === "local") {
        setNeedsUpdate(false);
        return;
      }
    }

    // Check if we have valid versions to compare
    const appVersion = process.env.REACT_APP_VERSION;
    const hasVersionInfo = dataSource.version && appVersion;

    if (
      (dataSource.lastCheckedForUpdate && moment().diff(moment(dataSource.lastCheckedForUpdate), "days") > 2) ||
      (hasVersionInfo && compare(dataSource.version, appVersion, "<"))
    ) {
      setNeedsUpdate(true);
    } else {
      setNeedsUpdate(false);
    }
  }, [dataSource, settings.selectedDataSource, settings.customDatasources]);

  // Get display name for current datasource
  const getCurrentDatasourceName = () => {
    const currentId = settings.selectedDataSource;

    // Check built-in datasources
    const builtIn = BUILT_IN_DATASOURCES.find((ds) => ds.id === currentId);
    if (builtIn) return builtIn.title;

    // Check local datasources (from card storage)
    const localDs = localDatasources.find((ds) => `local-ds-${ds.uuid}` === currentId);
    if (localDs) return localDs.name;

    // Check custom datasources
    const customDs = settings.customDatasources?.find((ds) => ds.id === currentId);
    if (customDs) return customDs.name;

    // Default
    return "Basic Cards";
  };

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const handleCheckForUpdates = useCallback(async () => {
    setIsUpdating(true);
    try {
      await checkForUpdate();
    } finally {
      setIsUpdating(false);
      setIsOpen(false);
    }
  }, [checkForUpdate]);

  const handleSelectDatasource = (datasourceId) => {
    updateSettings({
      ...settings,
      selectedDataSource: datasourceId,
    });
    setIsOpen(false);
  };

  const handleAddExternal = () => {
    setIsOpen(false);
    setIsCustomModalOpen(true);
  };

  // Calculate dropdown position
  const getDropdownPosition = () => {
    if (!buttonRef.current) return { top: 0, left: 0 };
    const rect = buttonRef.current.getBoundingClientRect();
    return {
      top: rect.bottom + 8,
      left: rect.left,
    };
  };

  const currentId = settings.selectedDataSource || "basic";
  const position = getDropdownPosition();

  // Check if current datasource is a local, custom, or subscribed datasource (they have their own sync)
  const isCustomOrLocalDatasource =
    currentId.startsWith("local-ds-") || currentId.startsWith("custom-") || currentId.startsWith("subscribed-");

  return (
    <>
      <button
        ref={buttonRef}
        className={`ds-selector-btn ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}>
        <Database size={16} />
        <span className="ds-selector-text">{getCurrentDatasourceName()}</span>
        <ChevronDown size={14} className={`ds-selector-chevron ${isOpen ? "rotated" : ""}`} />
        {needsUpdate && !isCustomOrLocalDatasource && <span className="ds-update-dot" />}
      </button>

      {isOpen &&
        ReactDOM.createPortal(
          <div className="ds-dropdown-overlay">
            <div ref={dropdownRef} className="ds-dropdown" style={{ top: position.top, left: position.left }}>
              {/* Check for updates - only show for built-in datasources */}
              {!isCustomOrLocalDatasource && (
                <>
                  <button
                    className={`ds-dropdown-item ds-dropdown-update ${needsUpdate ? "needs-update" : ""}`}
                    onClick={handleCheckForUpdates}
                    disabled={isUpdating}>
                    <RefreshCw size={16} className={isUpdating ? "spinning" : ""} />
                    <span>{isUpdating ? "Checking..." : "Check for updates"}</span>
                  </button>

                  <div className="ds-dropdown-divider" />
                </>
              )}

              {/* Built-in datasources */}
              <div className="ds-dropdown-section">
                <span className="ds-dropdown-section-title">Datasources</span>
                {BUILT_IN_DATASOURCES.map((ds) => (
                  <button
                    key={ds.id}
                    className={`ds-dropdown-item ${currentId === ds.id ? "selected" : ""}`}
                    onClick={() => handleSelectDatasource(ds.id)}>
                    <span className="ds-dropdown-item-text">{ds.title}</span>
                    {currentId === ds.id && <Check size={16} className="ds-dropdown-check" />}
                  </button>
                ))}
              </div>

              {/* Local datasources (editable in treeview) */}
              {localDatasources.length > 0 && (
                <>
                  <div className="ds-dropdown-divider" />
                  <div className="ds-dropdown-section">
                    <span className="ds-dropdown-section-title">Local Datasources</span>
                    {localDatasources.map((ds) => (
                      <button
                        key={ds.uuid}
                        className={`ds-dropdown-item ${currentId === `local-ds-${ds.uuid}` ? "selected" : ""}`}
                        onClick={() => handleSelectDatasource(`local-ds-${ds.uuid}`)}>
                        <Package size={14} className="ds-dropdown-item-icon ds-local-ds-icon" />
                        <span className="ds-dropdown-item-text">{ds.name}</span>
                        {ds.isPublished && <span className="ds-published-badge">Published</span>}
                        {currentId === `local-ds-${ds.uuid}` && <Check size={16} className="ds-dropdown-check" />}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Subscribed datasources */}
              {subscribedDatasources.length > 0 && (
                <>
                  <div className="ds-dropdown-divider" />
                  <div className="ds-dropdown-section">
                    <span className="ds-dropdown-section-title">Subscribed</span>
                    {subscribedDatasources.map((ds) => (
                      <button
                        key={ds.id}
                        className={`ds-dropdown-item ${currentId === ds.id ? "selected" : ""}`}
                        onClick={() => handleSelectDatasource(ds.id)}>
                        <Link size={14} className="ds-dropdown-item-icon ds-subscribed-icon" />
                        <span className="ds-dropdown-item-text">{ds.name}</span>
                        {currentId === ds.id && <Check size={16} className="ds-dropdown-check" />}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {/* Custom datasources (owned) */}
              {ownedDatasources.length > 0 && (
                <>
                  <div className="ds-dropdown-divider" />
                  <div className="ds-dropdown-section">
                    <span className="ds-dropdown-section-title">Custom</span>
                    {ownedDatasources.map((ds) => (
                      <button
                        key={ds.id}
                        className={`ds-dropdown-item ${currentId === ds.id ? "selected" : ""}`}
                        onClick={() => handleSelectDatasource(ds.id)}>
                        {ds.sourceType === "url" ? (
                          <Globe size={14} className="ds-dropdown-item-icon" />
                        ) : (
                          <FileText size={14} className="ds-dropdown-item-icon" />
                        )}
                        <span className="ds-dropdown-item-text">{ds.name}</span>
                        {currentId === ds.id && <Check size={16} className="ds-dropdown-check" />}
                      </button>
                    ))}
                  </div>
                </>
              )}

              <div className="ds-dropdown-divider" />

              {/* Browse community */}
              <button
                className="ds-dropdown-item ds-dropdown-browse"
                onClick={() => {
                  setIsOpen(false);
                  setIsBrowseModalOpen(true);
                }}>
                <Users size={16} />
                <span>Browse Community</span>
              </button>

              {/* Add external datasource */}
              <button className="ds-dropdown-item ds-dropdown-add" onClick={handleAddExternal}>
                <Plus size={16} />
                <span>Add external datasource</span>
              </button>
            </div>
          </div>,
          document.body
        )}

      <CustomDatasourceModal isOpen={isCustomModalOpen} onClose={() => setIsCustomModalOpen(false)} />
      <DatasourceBrowserModal isOpen={isBrowseModalOpen} onClose={() => setIsBrowseModalOpen(false)} />
    </>
  );
};
