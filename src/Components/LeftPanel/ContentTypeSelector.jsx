import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";
import { getTargetArray } from "../../Helpers/customDatasource.helpers";
import "./ContentTypeSelector.css";

const CONTENT_TYPES_40K = [
  { value: "datasheets", label: "Datasheets", key: "datasheets" },
  { value: "stratagems", label: "Stratagems", key: "stratagems" },
  { value: "secondaries", label: "Secondaries", key: "secondaries" },
  { value: "enhancements", label: "Enhancements", key: "enhancements" },
  { value: "psychicpowers", label: "Psychic powers", key: "psychicpowers" },
  { value: "rules", label: "Rules", key: "rules" },
];

const CONTENT_TYPES_AOS = [
  { value: "warscrolls", label: "Warscrolls", key: "warscrolls" },
  { value: "manifestationLores", label: "Manifestation Lores", key: "manifestationLores" },
  { value: "spellLores", label: "Spell Lores", key: "lores" },
];

export const ContentTypeSelector = ({ selectedContentType, setSelectedContentType }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { selectedFaction, dataSource, isCustomDatasource } = useDataSourceStorage();

  // Build content types from schema for custom datasources
  const customContentTypes = isCustomDatasource
    ? (dataSource?.schema?.cardTypes || []).map((ct) => ({
        value: getTargetArray(ct.key),
        label: ct.label + "s",
        key: getTargetArray(ct.key),
        cardTypeKey: ct.key,
      }))
    : [];

  // Deduplicate custom content types (multiple card types may map to same array)
  const uniqueCustomTypes = isCustomDatasource
    ? customContentTypes.filter((ct, i, arr) => arr.findIndex((t) => t.value === ct.value) === i)
    : [];

  // Determine which content types to use based on the first item's source
  const isAoS = !isCustomDatasource && dataSource?.data?.[0]?.warscrolls !== undefined;
  const CONTENT_TYPES = isCustomDatasource ? uniqueCustomTypes : isAoS ? CONTENT_TYPES_AOS : CONTENT_TYPES_40K;

  // Reset content type when data source changes (e.g., 40K to AoS, or to custom)
  useEffect(() => {
    const defaultType = isCustomDatasource ? uniqueCustomTypes[0]?.value : isAoS ? "warscrolls" : "datasheets";
    if (
      defaultType &&
      selectedContentType !== defaultType &&
      !CONTENT_TYPES.some((t) => t.value === selectedContentType)
    ) {
      setSelectedContentType(defaultType);
    }
  }, [isAoS, isCustomDatasource, selectedContentType, setSelectedContentType, CONTENT_TYPES]);

  // For custom datasources, show all types regardless of whether cards exist
  const availableTypes = isCustomDatasource
    ? CONTENT_TYPES
    : CONTENT_TYPES.filter((type) => {
        if (type.key === "rules") {
          // Rules have a different structure with army and detachment sub-arrays
          const rules = selectedFaction?.rules;
          return rules && (rules.army?.length > 0 || rules.detachment?.length > 0);
        }
        const data = selectedFaction?.[type.key];
        return data && data.length > 0;
      });

  // Get the label for the selected content type
  const allContentTypes = [...CONTENT_TYPES_40K, ...CONTENT_TYPES_AOS, ...uniqueCustomTypes];
  const selectedLabel = allContentTypes.find((t) => t.value === selectedContentType)?.label || "Select a type";

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
