import { EditorAccordion } from "../shared/EditorAccordion";
import { EditorTextField } from "../shared/EditorTextField";
import { EditorToggle } from "../shared/EditorToggle";

export const DamagedSection = ({ card, label, icon, updateField }) => {
  const damaged = card.abilities?.damaged;
  if (!damaged) return null;

  return (
    <EditorAccordion title={label} icon={icon}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <EditorToggle
          label="Show Damaged Profile"
          checked={damaged.showDamagedAbility !== false}
          onChange={(value) => updateField("abilities.damaged.showDamagedAbility", value)}
        />
        <EditorTextField
          label="Wound Range"
          value={damaged.range}
          onChange={(value) => updateField("abilities.damaged.range", value)}
          placeholder="e.g. 1-4 Wounds Remaining"
        />
        <EditorTextField
          label="Description"
          value={damaged.description}
          onChange={(value) => updateField("abilities.damaged.description", value)}
          placeholder="Damaged effect"
          multiline
        />
      </div>
    </EditorAccordion>
  );
};
