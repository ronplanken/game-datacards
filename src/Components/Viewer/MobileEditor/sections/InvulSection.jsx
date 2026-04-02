import { EditorAccordion } from "../shared/EditorAccordion";
import { EditorNumberField } from "../shared/EditorNumberField";
import { EditorTextField } from "../shared/EditorTextField";
import { EditorToggle } from "../shared/EditorToggle";

export const InvulSection = ({ card, label, icon, updateField }) => {
  const invul = card.abilities?.invul;
  if (!invul) return null;

  return (
    <EditorAccordion title={label} icon={icon}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <EditorNumberField
          label="Value"
          value={invul.value}
          onChange={(value) => updateField("abilities.invul.value", value)}
        />
        <EditorTextField
          label="Info"
          value={invul.info}
          onChange={(value) => updateField("abilities.invul.info", value)}
          placeholder="Additional info"
        />
        <EditorToggle
          label="Show Invulnerable Save"
          checked={invul.showInvulnerableSave !== false}
          onChange={(value) => updateField("abilities.invul.showInvulnerableSave", value)}
        />
        <EditorToggle
          label="Show Info"
          checked={!!invul.showInfo}
          onChange={(value) => updateField("abilities.invul.showInfo", value)}
        />
      </div>
    </EditorAccordion>
  );
};
