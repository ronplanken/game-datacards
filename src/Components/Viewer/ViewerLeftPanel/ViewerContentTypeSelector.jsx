import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useDataSourceStorage } from "../../../Hooks/useDataSourceStorage";
import "./ViewerContentTypeSelector.css";

const CONTENT_TYPES_40K = [
  { value: "datasheets", label: "Datasheets", key: "datasheets" },
  { value: "stratagems", label: "Stratagems", key: "stratagems" },
  { value: "rules", label: "Rules", key: "rules" },
];

const CONTENT_TYPES_AOS = [
  { value: "warscrolls", label: "Warscrolls", key: "warscrolls" },
  { value: "manifestationLores", label: "Manifestation Lores", key: "manifestationLores" },
  { value: "spellLores", label: "Spell Lores", key: "lores" },
];

export const ViewerContentTypeSelector = ({ selectedContentType, setSelectedContentType }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { selectedFaction } = useDataSourceStorage();

  // Determine if this is AoS data (has warscrolls property)
  const isAoS = selectedFaction?.warscrolls !== undefined;
  const CONTENT_TYPES = isAoS ? CONTENT_TYPES_AOS : CONTENT_TYPES_40K;

  // Reset content type when data source changes (e.g., 40K to AoS)
  useEffect(() => {
    const defaultType = isAoS ? "warscrolls" : "datasheets";
    if (selectedContentType !== defaultType && !CONTENT_TYPES.some((t) => t.value === selectedContentType)) {
      setSelectedContentType(defaultType);
    }
  }, [isAoS, selectedContentType, setSelectedContentType, CONTENT_TYPES]);

  // Get available content types based on faction data
  const availableTypes = CONTENT_TYPES.filter((type) => {
    if (type.key === "rules") {
      // Rules have a different structure with army and detachment sub-arrays
      const rules = selectedFaction?.rules;
      return rules && (rules.army?.length > 0 || rules.detachment?.length > 0);
    }
    if (type.key === "warscrolls") {
      const warscrolls = selectedFaction?.warscrolls;
      return warscrolls && warscrolls.length > 0;
    }
    if (type.key === "manifestationLores") {
      const manifestationLores = selectedFaction?.manifestationLores;
      return manifestationLores && manifestationLores.length > 0;
    }
    if (type.key === "lores") {
      const lores = selectedFaction?.lores;
      return lores && lores.length > 0;
    }
    const data = selectedFaction?.[type.key];
    return data && data.length > 0;
  });

  // Get the label for the selected content type
  const selectedLabel = CONTENT_TYPES.find((t) => t.value === selectedContentType)?.label || "Select a type";

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
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
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleSelect = (value) => {
    setSelectedContentType(value);
    setIsOpen(false);
  };

  if (!selectedFaction) {
    return null;
  }

  return (
    <div className="viewer-content-type-selector" ref={dropdownRef}>
      <button className={`viewer-content-type-trigger ${isOpen ? "open" : ""}`} onClick={() => setIsOpen(!isOpen)}>
        <span className="viewer-content-type-trigger-text">{selectedLabel}</span>
        <ChevronDown size={14} className="viewer-content-type-trigger-icon" />
      </button>

      {isOpen && (
        <div className="viewer-content-type-dropdown">
          {availableTypes.map((type) => (
            <div
              key={type.value}
              className={`viewer-content-type-option ${selectedContentType === type.value ? "selected" : ""}`}
              onClick={() => handleSelect(type.value)}>
              {type.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
