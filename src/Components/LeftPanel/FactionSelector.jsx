import React, { useState, useRef, useEffect } from "react";
import { DownOutlined, SearchOutlined } from "@ant-design/icons";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";
import { FactionSettingsModal } from "../FactionSettingsModal";
import "./FactionSelector.css";

export const FactionSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const { dataSource, selectedFaction, updateSelectedFaction } = useDataSourceStorage();

  // Filter factions based on search text
  const filteredFactions = dataSource.data.filter((faction) =>
    faction.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchText("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle escape key to close dropdown
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        setSearchText("");
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setSearchText("");
    }
  };

  const handleSelectFaction = (faction) => {
    updateSelectedFaction(faction);
    setIsOpen(false);
    setSearchText("");
  };

  // Don't render if only one faction
  if (dataSource.data.length <= 1) {
    return null;
  }

  return (
    <>
      <div className="faction-selector" ref={dropdownRef}>
        <button className={`faction-selector-trigger ${isOpen ? "open" : ""}`} onClick={handleToggle}>
          <span
            className={`faction-selector-trigger-text ${
              !selectedFaction ? "faction-selector-trigger-placeholder" : ""
            }`}>
            {selectedFaction?.name || "Select a faction"}
          </span>
          <DownOutlined className="faction-selector-trigger-icon" />
        </button>

        {!dataSource?.noFactionOptions && <FactionSettingsModal />}

        {isOpen && (
          <div className="faction-dropdown">
            <div className="faction-search">
              <SearchOutlined className="faction-search-icon" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search factions..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            <div className="faction-list">
              {filteredFactions.length > 0 ? (
                filteredFactions.map((faction, index) => (
                  <div
                    key={`${faction.id}-${index}`}
                    className={`faction-option ${selectedFaction?.id === faction.id ? "selected" : ""}`}
                    onClick={() => handleSelectFaction(faction)}>
                    {faction.name}
                  </div>
                ))
              ) : (
                <div className="faction-empty">No factions found</div>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="faction-selector-divider" />
    </>
  );
};
