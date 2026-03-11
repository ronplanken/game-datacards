import React from "react";
import { Settings } from "lucide-react";
import { DatasourceMetadataEditor } from "./editors/DatasourceMetadataEditor";
import { StatsSchemaEditor } from "./editors/StatsSchemaEditor";
import { WeaponsSchemaEditor } from "./editors/WeaponsSchemaEditor";
import { AbilitiesSchemaEditor } from "./editors/AbilitiesSchemaEditor";
import { MetadataSchemaEditor } from "./editors/MetadataSchemaEditor";
import { FieldsSchemaEditor } from "./editors/FieldsSchemaEditor";

/**
 * Router component that renders the correct schema editor based on the selected item.
 *
 * - Datasource parent selected -> DatasourceMetadataEditor
 * - Card type selected -> sub-editor based on baseType:
 *   - "unit" -> Stats, Weapons, Abilities, Metadata sections
 *   - "rule" -> FieldsSchemaEditor with rules collection
 *   - "enhancement" -> FieldsSchemaEditor with keywords collection
 *   - "stratagem" -> FieldsSchemaEditor (fields only)
 */
export const SchemaDefinitionEditor = ({ selectedItem = null, activeDatasource = null, onUpdateDatasource }) => {
  if (!selectedItem) {
    return (
      <div className="props-empty">
        <Settings size={32} />
        <p>Select a datasource or card type</p>
        <p className="props-empty-subtitle">Details and settings will appear here</p>
      </div>
    );
  }

  if (selectedItem.type === "datasource") {
    return <DatasourceMetadataEditor datasource={activeDatasource} onUpdateDatasource={onUpdateDatasource} />;
  }

  if (selectedItem.type === "cardType") {
    const cardType = selectedItem.data;
    if (!cardType) return null;

    return renderCardTypeEditor(cardType, activeDatasource, onUpdateDatasource);
  }

  return null;
};

function renderCardTypeEditor(cardType, activeDatasource, onUpdateDatasource) {
  const { baseType } = cardType;

  const handleCardTypeSchemaChange = (updatedSchema) => {
    if (!activeDatasource || !onUpdateDatasource) return;
    const updatedCardTypes = activeDatasource.schema.cardTypes.map((ct) =>
      ct.key === cardType.key ? { ...ct, schema: updatedSchema } : ct,
    );
    onUpdateDatasource({
      ...activeDatasource,
      schema: { ...activeDatasource.schema, cardTypes: updatedCardTypes },
    });
  };

  switch (baseType) {
    case "unit":
      return (
        <div className="props-body">
          <StatsSchemaEditor schema={cardType.schema} onChange={handleCardTypeSchemaChange} />
          <WeaponsSchemaEditor schema={cardType.schema} onChange={handleCardTypeSchemaChange} />
          <AbilitiesSchemaEditor schema={cardType.schema} onChange={handleCardTypeSchemaChange} />
          <MetadataSchemaEditor schema={cardType.schema} onChange={handleCardTypeSchemaChange} />
        </div>
      );

    case "rule":
      return (
        <div className="props-body">
          <FieldsSchemaEditor schema={cardType.schema} onChange={handleCardTypeSchemaChange} baseType="rule" />
        </div>
      );

    case "enhancement":
      return (
        <div className="props-body">
          <FieldsSchemaEditor schema={cardType.schema} onChange={handleCardTypeSchemaChange} baseType="enhancement" />
        </div>
      );

    case "stratagem":
      return (
        <div className="props-body">
          <FieldsSchemaEditor schema={cardType.schema} onChange={handleCardTypeSchemaChange} baseType="stratagem" />
        </div>
      );

    default:
      return null;
  }
}
