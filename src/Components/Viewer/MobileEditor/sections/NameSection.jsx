import { EditorTextField } from "../shared/EditorTextField";
import { EditorToggle } from "../shared/EditorToggle";
import { SchemaFieldEditor } from "../shared/SchemaFieldEditor";
import { getUnitCustomFieldDefault } from "../../../../Helpers/customSchema.helpers";

export const NameSection = ({ card, config = {}, updateField, replaceCard }) => {
  const { hasCombatRole, hasArmySlot, hasAutoResize, fields = [] } = config;

  return (
    <div className="mobile-editor-name-section">
      <EditorTextField
        value={card.name}
        onChange={(value) => updateField("name", value)}
        placeholder="Card name"
        className="mobile-editor-name-input"
      />
      {card.subname !== undefined && (
        <EditorTextField
          value={card.subname}
          onChange={(value) => updateField("subname", value)}
          placeholder="Subtitle"
          className="mobile-editor-subname-input"
        />
      )}
      {hasCombatRole && (
        <EditorTextField
          label="Combat Role"
          value={card.combatRole || ""}
          onChange={(value) => updateField("combatRole", value || undefined)}
          placeholder="e.g. Damage Dealer"
        />
      )}
      {hasArmySlot && (
        <EditorTextField
          label="Army Slot"
          value={card.armySlot || ""}
          onChange={(value) => updateField("armySlot", value || undefined)}
          placeholder="e.g. Core"
        />
      )}
      {fields.map((field) => (
        <SchemaFieldEditor
          key={field.key}
          field={field}
          value={card[field.key] === undefined ? getUnitCustomFieldDefault(field) : card[field.key]}
          onChange={(value) => updateField(field.key, value)}
        />
      ))}
      {hasAutoResize && (
        <EditorToggle
          label="Auto-resize card"
          checked={!!card.styling?.autoHeight}
          onChange={(value) =>
            replaceCard({
              ...card,
              styling: { ...(card.styling || {}), autoHeight: value },
            })
          }
        />
      )}
    </div>
  );
};
