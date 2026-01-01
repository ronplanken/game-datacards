import { Database, ChevronDown, RefreshCw, Plus, Globe, FileText, Check } from "lucide-react";
import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";
import { useSettingsStorage } from "../../Hooks/useSettingsStorage";
import { CustomDatasourceModal } from "../CustomDatasource";
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
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  const { settings, updateSettings } = useSettingsStorage();
  const { checkForUpdate } = useDataSourceStorage();

  // Get display name for current datasource
  const getCurrentDatasourceName = () => {
    const currentId = settings.selectedDataSource;

    // Check built-in datasources
    const builtIn = BUILT_IN_DATASOURCES.find((ds) => ds.id === currentId);
    if (builtIn) return builtIn.title;

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
  const customDatasources = settings.customDatasources || [];
  const position = getDropdownPosition();

  return (
    <>
      <button
        ref={buttonRef}
        className={`ds-selector-btn ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}>
        <Database size={16} />
        <span className="ds-selector-text">{getCurrentDatasourceName()}</span>
        <ChevronDown size={14} className={`ds-selector-chevron ${isOpen ? "rotated" : ""}`} />
      </button>

      {isOpen &&
        ReactDOM.createPortal(
          <div className="ds-dropdown-overlay">
            <div ref={dropdownRef} className="ds-dropdown" style={{ top: position.top, left: position.left }}>
              {/* Check for updates */}
              <button
                className="ds-dropdown-item ds-dropdown-update"
                onClick={handleCheckForUpdates}
                disabled={isUpdating}>
                <RefreshCw size={16} className={isUpdating ? "spinning" : ""} />
                <span>{isUpdating ? "Checking..." : "Check for updates"}</span>
              </button>

              <div className="ds-dropdown-divider" />

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

              {/* Custom datasources */}
              {customDatasources.length > 0 && (
                <>
                  <div className="ds-dropdown-divider" />
                  <div className="ds-dropdown-section">
                    <span className="ds-dropdown-section-title">Custom</span>
                    {customDatasources.map((ds) => (
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
    </>
  );
};
