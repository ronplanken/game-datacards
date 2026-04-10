import { useState } from "react";
import {
  Database,
  Plus,
  Swords,
  BookOpen,
  Sparkles,
  Zap,
  Trash2,
  ChevronDown,
  FolderOpen,
  ChevronUp,
  Download,
  Upload,
} from "lucide-react";
import { DatasourceSyncIcon } from "../../Premium";
import { ActiveItemToolbar } from "../Shared/ActiveItemToolbar";
import { getTargetArray } from "../../Helpers/customDatasource.helpers";
import { OnboardingLeftPanel } from "./components/OnboardingLeftPanel";

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
  onSelectCard,
  onAddCard,
  onDeleteCard,
  onNewDatasource,
  onAddCardType,
  onDeleteCardType,
  onReorderCardTypes,
  onExportDatasource,
  onImportSchema,
  onDeleteDatasource,
  onOpenDatasource,
}) => {
  const [datasourceListOpen, setDatasourceListOpen] = useState(false);
  const [activeCardTypeTab, setActiveCardTypeTab] = useState(null);

  if (!activeDatasource && datasources.length === 0) {
    return (
      <div className="designer-layer-panel">
        <OnboardingLeftPanel />
      </div>
    );
  }

  const cardTypes = activeDatasource?.schema?.cardTypes || [];

  return (
    <div className="designer-layer-panel">
      {/* Datasource selector */}
      <div className="designer-template-selector">
        <button
          className="designer-template-btn"
          onClick={onNewDatasource}
          aria-label="Create new datasource"
          style={{ marginBottom: datasources.length > 0 ? 8 : 0 }}>
          <Plus size={14} />
          New Datasource
        </button>

        {datasources.length > 0 && (
          <>
            <button
              className="designer-btn"
              style={{ width: "100%", justifyContent: "space-between" }}
              onClick={() => setDatasourceListOpen(!datasourceListOpen)}>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <FolderOpen size={14} />
                Open Datasource
              </span>
              <ChevronDown
                size={14}
                style={{
                  transition: "transform 0.2s ease",
                  transform: datasourceListOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>
            {datasourceListOpen && (
              <div
                className="designer-layer-list"
                style={{
                  marginTop: 8,
                  maxHeight: 200,
                  overflowY: "auto",
                  background: "var(--designer-bg-secondary)",
                  borderRadius: "var(--designer-radius-md)",
                  padding: 4,
                }}>
                {datasources.map((ds) => (
                  <button
                    key={ds.id}
                    className={`designer-layer-item ${activeDatasource?.id === ds.id ? "selected" : ""}`}
                    onClick={() => {
                      onOpenDatasource?.(ds);
                      setDatasourceListOpen(false);
                    }}>
                    <Database className="designer-layer-icon" />
                    <span className="designer-layer-name">{ds.name}</span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

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
          <ActiveItemToolbar
            groups={[
              [
                {
                  icon: Download,
                  onClick: () => onExportDatasource?.(activeDatasource),
                  title: "Export schema (coming soon)",
                  disabled: true,
                },
                {
                  icon: Upload,
                  onClick: () => onImportSchema?.(),
                  title: "Import schema (coming soon)",
                  disabled: true,
                },
              ],
              [
                {
                  icon: Trash2,
                  onClick: () => onDeleteDatasource?.(activeDatasource),
                  title: "Delete datasource",
                  danger: true,
                },
              ],
            ]}>
            <DatasourceSyncIcon datasource={activeDatasource} />
          </ActiveItemToolbar>
        </div>
      )}

      {/* Card types header */}
      <div className="designer-panel-header">
        <h3 className="designer-panel-title">
          Card Types
          {activeDatasource && <span className="designer-panel-title-count">{cardTypes.length}</span>}
        </h3>
        {activeDatasource && (
          <button className="designer-panel-header-action" onClick={onAddCardType} title="Add card type">
            <Plus size={14} />
          </button>
        )}
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
              {cardTypes.map((cardType, index) => {
                const Icon = BASETYPE_ICONS[cardType.baseType] || BookOpen;
                return (
                  <div
                    key={cardType.key}
                    className={`designer-layer-item ${
                      selectedItem?.type === "cardType" && selectedItem?.key === cardType.key ? "selected" : ""
                    }`}
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelectCardType?.(cardType)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelectCardType?.(cardType);
                      }
                    }}>
                    <Icon className="designer-layer-icon" />
                    <span className="designer-layer-name">{cardType.label}</span>
                    <span className="designer-layer-actions">
                      <button
                        className="designer-layer-action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (index > 0) {
                            const reordered = [...cardTypes];
                            const temp = reordered[index];
                            reordered[index] = reordered[index - 1];
                            reordered[index - 1] = temp;
                            onReorderCardTypes?.(reordered);
                          }
                        }}
                        disabled={index === 0}
                        title="Move up"
                        aria-label={`Move ${cardType.label} up`}>
                        <ChevronUp size={14} />
                      </button>
                      <button
                        className="designer-layer-action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (index < cardTypes.length - 1) {
                            const reordered = [...cardTypes];
                            const temp = reordered[index];
                            reordered[index] = reordered[index + 1];
                            reordered[index + 1] = temp;
                            onReorderCardTypes?.(reordered);
                          }
                        }}
                        disabled={index === cardTypes.length - 1}
                        title="Move down"
                        aria-label={`Move ${cardType.label} down`}>
                        <ChevronDown size={14} />
                      </button>
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
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!activeDatasource && (
          <div className="designer-empty-state">
            <Database />
            <p>Open a datasource from the list above</p>
          </div>
        )}
      </div>

      {/* Cards section */}
      {activeDatasource && cardTypes.length > 0 && (
        <>
          <div className="designer-panel-header">
            <h3 className="designer-panel-title">
              Cards
              <CardCountBadge
                activeDatasource={activeDatasource}
                cardTypeKey={activeCardTypeTab || cardTypes[0]?.key}
              />
            </h3>
            <button
              className="designer-panel-header-action"
              onClick={() => {
                const ct = cardTypes.find((c) => c.key === (activeCardTypeTab || cardTypes[0]?.key));
                if (ct) onAddCard?.(ct);
              }}
              title={`Add ${cardTypes.find((c) => c.key === (activeCardTypeTab || cardTypes[0]?.key))?.label || "card"}`}>
              <Plus size={14} />
            </button>
          </div>
          <div className="designer-panel-content">
            <CardTypeTabBar
              cardTypes={cardTypes}
              activeTab={activeCardTypeTab || cardTypes[0]?.key}
              onTabChange={setActiveCardTypeTab}
            />
            <CardList
              activeDatasource={activeDatasource}
              cardTypeKey={activeCardTypeTab || cardTypes[0]?.key}
              cardTypes={cardTypes}
              selectedItem={selectedItem}
              onSelectCard={onSelectCard}
              onDeleteCard={onDeleteCard}
              onAddCard={onAddCard}
            />
          </div>
        </>
      )}
    </div>
  );
};

const CardCountBadge = ({ activeDatasource, cardTypeKey }) => {
  const faction = activeDatasource?.data?.[0];
  if (!faction || !cardTypeKey) return null;
  const targetArray = getTargetArray(cardTypeKey);
  const count = (faction[targetArray] || []).filter((c) => c.cardType === cardTypeKey).length;
  return <span className="designer-panel-title-count">{count}</span>;
};

const CardTypeTabBar = ({ cardTypes, activeTab, onTabChange }) => (
  <div className="designer-card-type-tabs">
    {cardTypes.map((ct) => {
      const Icon = BASETYPE_ICONS[ct.baseType] || BookOpen;
      return (
        <button
          key={ct.key}
          className={`designer-card-type-tab ${activeTab === ct.key ? "active" : ""}`}
          onClick={() => onTabChange(ct.key)}
          title={ct.label}>
          <Icon size={12} />
          <span>{ct.label}</span>
        </button>
      );
    })}
  </div>
);

const CardList = ({
  activeDatasource,
  cardTypeKey,
  cardTypes,
  selectedItem,
  onSelectCard,
  onDeleteCard,
  onAddCard,
}) => {
  const cardTypeDef = cardTypes.find((ct) => ct.key === cardTypeKey);
  if (!cardTypeDef) return null;

  const faction = activeDatasource.data?.[0];
  if (!faction) return null;

  const targetArray = getTargetArray(cardTypeKey);
  const cards = (faction[targetArray] || []).filter((c) => c.cardType === cardTypeKey);

  return (
    <div className="designer-card-list">
      {cards.map((card) => (
        <div
          key={card.id}
          className={`designer-layer-item ${selectedItem?.type === "card" && selectedItem?.data?.id === card.id ? "selected" : ""}`}
          role="button"
          tabIndex={0}
          onClick={() => onSelectCard?.(card)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelectCard?.(card);
            }
          }}>
          <span className="designer-layer-name">{card.name || "Unnamed"}</span>
          <span className="designer-layer-actions">
            <button
              className="designer-layer-action-btn danger"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteCard?.(card.id, card.cardType);
              }}
              title="Delete card">
              <Trash2 size={14} />
            </button>
          </span>
        </div>
      ))}
      {cards.length === 0 && (
        <div className="designer-empty-state" style={{ padding: "12px 0" }}>
          <p style={{ fontSize: 12, opacity: 0.6 }}>No {cardTypeDef.label.toLowerCase()} cards yet</p>
        </div>
      )}
    </div>
  );
};

export { BASETYPE_ICONS, BASETYPE_LABELS };
