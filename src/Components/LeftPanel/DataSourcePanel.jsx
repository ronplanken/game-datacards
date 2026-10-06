import React, { useState } from "react";
import { BookOpen } from "lucide-react";
import { Tooltip } from "antd";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";
import { FactionSelector } from "./FactionSelector";
import { SearchInput } from "./SearchInput";
import { ContentTypeSelector } from "./ContentTypeSelector";
import { DataSourceList } from "./DataSourceList";
import { useDataSourceItems } from "./useDataSourceItems";
import "./DataSourcePanel.css";

export const DataSourcePanel = ({ setSelectedTreeIndex, onAddToCategory, onOpenGlossary }) => {
  const [isLoading] = useState(false);
  const [searchText, setSearchText] = useState(undefined);
  const [selectedContentType, setSelectedContentType] = useState("datasheets");

  const { dataSource, selectedFaction } = useDataSourceStorage();
  const dataSourceItems = useDataSourceItems(selectedContentType, searchText);

  const glossaryCount = Array.isArray(dataSource?.schema?.keywordGlossary)
    ? dataSource.schema.keywordGlossary.length
    : 0;

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>
      <div style={{ padding: "8px 8px 0 8px", flexShrink: 0 }}>
        <FactionSelector />
        <SearchInput setSearchText={setSearchText} />
        <div className="datasource-content-type-row">
          <ContentTypeSelector
            isLoading={isLoading}
            selectedContentType={selectedContentType}
            setSelectedContentType={setSelectedContentType}
          />
          {glossaryCount > 0 && (
            <Tooltip title="Browse this datasource's keyword glossary">
              <button className="datasource-glossary-button" onClick={onOpenGlossary} aria-label="Keyword glossary">
                <BookOpen size={14} />
              </button>
            </Tooltip>
          )}
        </div>
      </div>
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
