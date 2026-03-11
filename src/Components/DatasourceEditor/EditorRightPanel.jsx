import { Settings, Database, Layers } from "lucide-react";
import { Section } from "./components";

export const EditorRightPanel = ({ selectedItem = null, activeDatasource = null }) => {
  const renderDatasourceMetadata = () => {
    if (!activeDatasource) return null;
    return (
      <div className="props-body">
        <Section title="Datasource Info" icon={Database} defaultOpen={true}>
          <div className="props-metadata-row">
            <span className="props-metadata-label">Name</span>
            <span className="props-metadata-value">{activeDatasource.name}</span>
          </div>
          <div className="props-metadata-row">
            <span className="props-metadata-label">Version</span>
            <span className="props-metadata-value">{activeDatasource.version}</span>
          </div>
          <div className="props-metadata-row">
            <span className="props-metadata-label">Author</span>
            <span className="props-metadata-value">{activeDatasource.author || "—"}</span>
          </div>
          <div className="props-metadata-row">
            <span className="props-metadata-label">Base System</span>
            <span className="props-metadata-value">{activeDatasource.schema?.baseSystem || "custom"}</span>
          </div>
        </Section>
        <Section title="Card Types" icon={Layers} defaultOpen={true}>
          <div className="props-metadata-row">
            <span className="props-metadata-label">Count</span>
            <span className="props-metadata-value">{activeDatasource.schema?.cardTypes?.length || 0}</span>
          </div>
        </Section>
      </div>
    );
  };

  const renderCardTypeInfo = () => {
    if (!selectedItem?.data) return null;
    const cardType = selectedItem.data;
    return (
      <div className="props-body">
        <Section title="Card Type Info" icon={Layers} defaultOpen={true}>
          <div className="props-metadata-row">
            <span className="props-metadata-label">Label</span>
            <span className="props-metadata-value">{cardType.label}</span>
          </div>
          <div className="props-metadata-row">
            <span className="props-metadata-label">Key</span>
            <span className="props-metadata-value">{cardType.key}</span>
          </div>
          <div className="props-metadata-row">
            <span className="props-metadata-label">Base Type</span>
            <span className="props-metadata-value">{cardType.baseType}</span>
          </div>
        </Section>
      </div>
    );
  };

  const headerTitle =
    selectedItem?.type === "datasource" ? "Datasource" : selectedItem?.type === "cardType" ? "Card Type" : "Properties";

  return (
    <div className="designer-properties-panel props-panel">
      {selectedItem && (
        <div className="props-panel-header">
          <h3 className="props-panel-header-title">{headerTitle}</h3>
        </div>
      )}
      {!selectedItem && (
        <div className="props-empty">
          <Settings size={32} />
          <p>Select a datasource or card type</p>
          <p style={{ fontSize: 11, color: "var(--designer-text-muted)" }}>Properties will appear here</p>
        </div>
      )}
      {selectedItem?.type === "datasource" && renderDatasourceMetadata()}
      {selectedItem?.type === "cardType" && renderCardTypeInfo()}
    </div>
  );
};
