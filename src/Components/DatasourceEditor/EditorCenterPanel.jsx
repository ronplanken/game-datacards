import { FileText } from "lucide-react";
import { SchemaTreeView } from "./SchemaTreeView";

export const EditorCenterPanel = ({ selectedItem, activeDatasource }) => {
  const hasSelection = selectedItem && activeDatasource;

  return (
    <div className="designer-center-panel">
      {hasSelection ? (
        <SchemaTreeView selectedItem={selectedItem} activeDatasource={activeDatasource} />
      ) : (
        <div className="designer-empty-state" style={{ flex: 1 }}>
          <FileText />
          <p>Select a card type to view its structure</p>
          <p style={{ fontSize: 11, marginTop: 2 }}>The field structure will appear here</p>
        </div>
      )}
    </div>
  );
};
