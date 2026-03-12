import React, { useState, useRef, useEffect } from "react";
import { Dropdown } from "antd";
import { Plus, ChevronDown } from "lucide-react";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { FactionSelector } from "./FactionSelector";
import { SearchInput } from "./SearchInput";
import { ContentTypeSelector } from "./ContentTypeSelector";
import { DataSourceList } from "./DataSourceList";
import { useDataSourceItems } from "./useDataSourceItems";
import { createBlankCardFromSchema } from "../../Helpers/customDatasource.helpers";

export const DataSourcePanel = ({ setSelectedTreeIndex, onAddToCategory }) => {
  const [isLoading] = useState(false);
  const [searchText, setSearchText] = useState(undefined);
  const [selectedContentType, setSelectedContentType] = useState("datasheets");

  const { selectedFaction, dataSource, isCustomDatasource, addCardToDatasource } = useDataSourceStorage();
  const { setActiveCard } = useCardStorage();
  const dataSourceItems = useDataSourceItems(selectedContentType, searchText);

  const handleCreateCard = (cardTypeDef) => {
    if (!selectedFaction || !dataSource) return;
    const card = createBlankCardFromSchema(cardTypeDef, selectedFaction.id, dataSource.id);
    addCardToDatasource(card);
    setSelectedTreeIndex(null);
    setActiveCard(card);
  };

  const cardTypes = isCustomDatasource ? dataSource?.schema?.cardTypes || [] : [];

  const createCardButton = isCustomDatasource && selectedFaction && cardTypes.length > 0 && (
    <div style={{ padding: "4px 8px 0 8px", flexShrink: 0 }}>
      {cardTypes.length === 1 ? (
        <button
          className="content-type-trigger"
          style={{ width: "100%", justifyContent: "center", gap: "4px" }}
          onClick={() => handleCreateCard(cardTypes[0])}>
          <Plus size={14} />
          <span>Create {cardTypes[0].label}</span>
        </button>
      ) : (
        <CreateCardDropdown cardTypes={cardTypes} onCreateCard={handleCreateCard} />
      )}
    </div>
  );

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>
      <div style={{ padding: "8px 8px 0 8px", flexShrink: 0 }}>
        <FactionSelector isLoading={isLoading} />
        <SearchInput setSearchText={setSearchText} />
        <ContentTypeSelector
          isLoading={isLoading}
          selectedContentType={selectedContentType}
          setSelectedContentType={setSelectedContentType}
        />
      </div>
      {createCardButton}
      <DataSourceList
        isLoading={isLoading}
        dataSource={dataSourceItems}
        selectedFaction={selectedFaction}
        setSelectedTreeIndex={setSelectedTreeIndex}
        onAddToCategory={onAddToCategory}
      />
    </div>
  );
};

const CreateCardDropdown = ({ cardTypes, onCreateCard }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <button
        className="content-type-trigger"
        style={{ width: "100%", justifyContent: "center", gap: "4px" }}
        onClick={() => setIsOpen(!isOpen)}>
        <Plus size={14} />
        <span>Create Card</span>
        <ChevronDown size={14} />
      </button>
      {isOpen && (
        <div className="content-type-dropdown" style={{ top: "100%", marginTop: "2px" }}>
          {cardTypes.map((ct) => (
            <div
              key={ct.key}
              className="content-type-option"
              onClick={() => {
                onCreateCard(ct);
                setIsOpen(false);
              }}>
              {ct.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
