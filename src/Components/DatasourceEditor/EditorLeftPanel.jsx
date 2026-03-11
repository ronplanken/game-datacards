import { useState } from "react";
import { Database, Plus, Swords, BookOpen, Sparkles, Zap, Trash2, ChevronDown, ChevronRight } from "lucide-react";

const BASETYPE_ICONS = {
  unit: Swords,
  rule: BookOpen,
  enhancement: Sparkles,
  stratagem: Zap,
};

const BASETYPE_LABELS = {
  unit: "Unit",
  rule: "Rule",
  enhancement: "Enhancement",
  stratagem: "Stratagem",
};

export const EditorLeftPanel = ({
  datasources = [],
  activeDatasource = null,
  selectedItem = null,
  onSelectDatasource,
  onSelectCardType,
  onNewDatasource,
  onAddCardType,
  onDeleteCardType,
  onOpenDatasource,
}) => {
  const [datasourceListOpen, setDatasourceListOpen] = useState(false);

  if (!activeDatasource && datasources.length === 0) {
    return (
      <div className="designer-layer-panel">
        <div className="designer-empty-state" style={{ flex: 1 }}>
          <Database />
          <p>No custom datasources yet</p>
          <p>Create one to define your own card formats</p>
          <button className="designer-template-btn" onClick={onNewDatasource} aria-label="Create new datasource">
            <Plus size={14} />
            New Datasource
          </button>
        </div>
      </div>
    );
  }

  const cardTypes = activeDatasource?.schema?.cardTypes || [];

  return (
    <div className="designer-layer-panel">
      {/* Datasource selector */}
      <div className="designer-template-selector">
        <button className="designer-template-btn" onClick={onNewDatasource}>
          <Plus size={14} />
          New Datasource
        </button>
      </div>

      {/* Open datasource list */}
      {datasources.length > 0 && (
        <div className="designer-datasource-toggle">
          <button className="designer-datasource-toggle-btn" onClick={() => setDatasourceListOpen(!datasourceListOpen)}>
            {datasourceListOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            Open Datasource
          </button>
          {datasourceListOpen && (
            <div className="designer-layer-list designer-datasource-toggle-list">
              {datasources.map((ds) => (
                <button
                  key={ds.id}
                  className={`designer-layer-item ${activeDatasource?.id === ds.id ? "selected" : ""}`}
                  onClick={() => onOpenDatasource?.(ds)}>
                  <Database className="designer-layer-icon" />
                  <span className="designer-layer-name">{ds.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Active datasource info */}
      {activeDatasource && (
        <div className="designer-template-info">
          <p className="designer-template-name">
            <Database size={14} />
            {activeDatasource.name}
          </p>
          <p className="designer-template-meta">
            v{activeDatasource.version} &middot; {activeDatasource.schema?.baseSystem || "custom"} &middot;{" "}
            {cardTypes.length} card type{cardTypes.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* Card types header */}
      <div className="designer-panel-header">
        <h3 className="designer-panel-title">Card Types</h3>
      </div>

      {/* Card type tree */}
      <div className="designer-panel-content">
        {activeDatasource && (
          <div className="designer-layer-tree">
            {/* Datasource parent item */}
            <button
              className={`designer-layer-item ${selectedItem?.type === "datasource" ? "selected" : ""}`}
              onClick={() => onSelectDatasource?.(activeDatasource)}>
              <Database className="designer-layer-icon" />
              <span className="designer-layer-name">{activeDatasource.name}</span>
              <span className="designer-layer-count">{cardTypes.length}</span>
            </button>

            {/* Card type children */}
            <div className="designer-layer-nested">
              {cardTypes.map((cardType) => {
                const Icon = BASETYPE_ICONS[cardType.baseType] || BookOpen;
                return (
                  <button
                    key={cardType.key}
                    className={`designer-layer-item ${
                      selectedItem?.type === "cardType" && selectedItem?.key === cardType.key ? "selected" : ""
                    }`}
                    onClick={() => onSelectCardType?.(cardType)}>
                    <Icon className="designer-layer-icon" />
                    <span className="designer-layer-name">{cardType.label}</span>
                    <span className="designer-layer-actions">
                      <button
                        className="designer-layer-action-btn danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCardType?.(cardType);
                        }}
                        title={`Delete ${cardType.label}`}>
                        <Trash2 size={14} />
                      </button>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Add card type button */}
            <div className="designer-add-card-type">
              <button className="designer-btn designer-btn-sm" onClick={onAddCardType}>
                <Plus size={12} />
                Add Card Type
              </button>
            </div>
          </div>
        )}

        {!activeDatasource && (
          <div className="designer-empty-state">
            <Database />
            <p>Select a datasource to view its card types</p>
          </div>
        )}
      </div>
    </div>
  );
};

export { BASETYPE_ICONS, BASETYPE_LABELS };
