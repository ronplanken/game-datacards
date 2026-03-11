import { SchemaDefinitionEditor } from "./SchemaDefinitionEditor";

export const EditorRightPanel = ({ selectedItem = null, activeDatasource = null, onUpdateDatasource }) => {
  const headerTitle =
    selectedItem?.type === "datasource" ? "Datasource" : selectedItem?.type === "cardType" ? "Card Type" : "Properties";

  return (
    <div className="designer-properties-panel props-panel">
      {selectedItem && (
        <div className="props-panel-header">
          <h3 className="props-panel-header-title">{headerTitle}</h3>
        </div>
      )}
      <SchemaDefinitionEditor
        selectedItem={selectedItem}
        activeDatasource={activeDatasource}
        onUpdateDatasource={onUpdateDatasource}
      />
    </div>
  );
};
