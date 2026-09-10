import { EditorAccordion } from "../shared/EditorAccordion";
import { EditorNumberField } from "../shared/EditorNumberField";
import { EditorTextField } from "../shared/EditorTextField";
import { EditorToggle } from "../shared/EditorToggle";

export const InvulSection = ({ card, config = {}, label, icon, updateField }) => {
  const invul = card.abilities?.invul;
  if (!invul) return null;

  // 11e invulnerable saves are a single value rendered in the card header:
  // there is no info line and no per-field show flag (the panel switch owns
  // visibility), so the extra controls would write keys the renderer ignores.
  const valueOnly = config.valueOnly === true;

  return (
    <EditorAccordion title={label} icon={icon}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <EditorNumberField
          label="Value"
          value={invul.value}
          onChange={(value) => updateField("abilities.invul.value", value)}
        />
        {!valueOnly && (
          <>
            <EditorTextField
              label="Info"
              value={invul.info}
              onChange={(value) => updateField("abilities.invul.info", value)}
              placeholder="e.g. Ranged attacks only"
            />
            <EditorToggle
              label="Show on card"
              checked={invul.showInvulnerableSave !== false}
              onChange={(value) => updateField("abilities.invul.showInvulnerableSave", value)}
            />
            <EditorToggle
              label="Show Info"
              checked={!!invul.showInfo}
              onChange={(value) => updateField("abilities.invul.showInfo", value)}
            />
          </>
        )}
      </div>
    </EditorAccordion>
  );
};
