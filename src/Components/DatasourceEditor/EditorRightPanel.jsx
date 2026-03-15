import { SchemaDefinitionEditor } from "./SchemaDefinitionEditor";
import { DatasourceCardEditor } from "./DatasourceCardEditor";

export const EditorRightPanel = ({
  selectedItem = null,
  activeDatasource = null,
  onUpdateDatasource,
  onUpdateCard,
}) => {
  const headerTitle =
    selectedItem?.type === "datasource"
      ? "Datasource"
      : selectedItem?.type === "cardType"
        ? "Card Type"
        : selectedItem?.type === "card"
          ? "Card Editor"
          : "Properties";

  return (
    <div className="designer-properties-panel props-panel">
      {selectedItem && (
        <div className="props-panel-header">
          <h3 className="props-panel-header-title">{headerTitle}</h3>
        </div>
      )}
      {selectedItem?.type === "card" ? (
        <DatasourceCardEditor
          card={selectedItem.data}
          activeDatasource={activeDatasource}
          onUpdateCard={onUpdateCard}
        />
      ) : (
        <SchemaDefinitionEditor
          selectedItem={selectedItem}
          activeDatasource={activeDatasource}
          onUpdateDatasource={onUpdateDatasource}
        />
      )}
    </div>
  );
};
