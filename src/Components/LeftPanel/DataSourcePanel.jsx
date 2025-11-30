import React, { useState } from "react";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";
import { FactionSelector } from "./FactionSelector";
import { SearchInput } from "./SearchInput";
import { ContentTypeSelector } from "./ContentTypeSelector";
import { DataSourceList } from "./DataSourceList";
import { useDataSourceItems } from "./useDataSourceItems";

export const DataSourcePanel = ({ setSelectedTreeIndex }) => {
  const [isLoading] = useState(false);
  const [searchText, setSearchText] = useState(undefined);
  const [selectedContentType, setSelectedContentType] = useState("datasheets");

  const { selectedFaction } = useDataSourceStorage();
  const dataSourceItems = useDataSourceItems(selectedContentType, searchText);

  return (
    <div
      style={{
        height: "100%",
        overflow: "auto",
      }}>
      <div style={{ padding: "8px 8px 0 8px" }}>
        <FactionSelector isLoading={isLoading} />
        <SearchInput setSearchText={setSearchText} />
        <ContentTypeSelector
          isLoading={isLoading}
          selectedContentType={selectedContentType}
          setSelectedContentType={setSelectedContentType}
        />
      </div>
      <DataSourceList
        isLoading={isLoading}
        dataSource={dataSourceItems}
        selectedFaction={selectedFaction}
        setSelectedTreeIndex={setSelectedTreeIndex}
      />
    </div>
  );
};
