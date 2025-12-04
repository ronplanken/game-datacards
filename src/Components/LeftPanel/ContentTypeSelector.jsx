import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";
import "./ContentTypeSelector.css";

const CONTENT_TYPES = [
  { value: "datasheets", label: "Datasheets", key: "datasheets" },
  { value: "stratagems", label: "Stratagems", key: "stratagems" },
  { value: "secondaries", label: "Secondaries", key: "secondaries" },
  { value: "enhancements", label: "Enhancements", key: "enhancements" },
  { value: "psychicpowers", label: "Psychic powers", key: "psychicpowers" },
  { value: "rules", label: "Rules", key: "rules" },
];

export const ContentTypeSelector = ({ selectedContentType, setSelectedContentType }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { selectedFaction } = useDataSourceStorage();

  // Get available content types based on faction data
  const availableTypes = CONTENT_TYPES.filter((type) => {
    if (type.key === "rules") {
      // Rules have a different structure with army and detachment sub-arrays
      const rules = selectedFaction?.rules;
      return rules && (rules.army?.length > 0 || rules.detachment?.length > 0);
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
    <div className="content-type-selector" ref={dropdownRef}>
      <button className={`content-type-trigger ${isOpen ? "open" : ""}`} onClick={() => setIsOpen(!isOpen)}>
        <span className="content-type-trigger-text">{selectedLabel}</span>
        <ChevronDown size={14} className="content-type-trigger-icon" />
      </button>

      {isOpen && (
        <div className="content-type-dropdown">
          {availableTypes.map((type) => (
            <div
              key={type.value}
              className={`content-type-option ${selectedContentType === type.value ? "selected" : ""}`}
              onClick={() => handleSelect(type.value)}>
              {type.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
