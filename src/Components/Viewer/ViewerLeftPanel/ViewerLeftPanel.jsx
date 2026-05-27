import { useState } from "react";
import { useParams } from "react-router-dom";
import { ViewerFactionSelector } from "./ViewerFactionSelector";
import { ViewerContentTypeSelector } from "./ViewerContentTypeSelector";
import { ViewerSearchInput } from "./ViewerSearchInput";
import { ViewerUnitList } from "./ViewerUnitList";
import { useDataSourceStorage } from "../../../Hooks/useDataSourceStorage";
import "./ViewerLeftPanel.css";

export const ViewerLeftPanel = () => {
  const { stratagem } = useParams();
  const { dataSource, isCustomDatasource } = useDataSourceStorage();

  const getDefaultContentType = () => {
    if (stratagem) return "stratagems";
    if (isCustomDatasource && dataSource?.schema?.cardTypes?.length) {
      return dataSource.schema.cardTypes[0].key;
    }
    return "datasheets";
  };

  const [searchText, setSearchText] = useState(undefined);
  const [selectedContentType, setSelectedContentType] = useState(getDefaultContentType());

  return (
    <div className="viewer-left-panel">
      <div className="viewer-left-panel-header">
        <ViewerFactionSelector />
        <ViewerSearchInput setSearchText={setSearchText} />
        <ViewerContentTypeSelector
          selectedContentType={selectedContentType}
          setSelectedContentType={setSelectedContentType}
        />
      </div>
      <ViewerUnitList searchText={searchText} selectedContentType={selectedContentType} />
    </div>
  );
};
