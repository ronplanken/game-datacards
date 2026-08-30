import { EditorAccordion } from "../shared/EditorAccordion";
import { EditorTextField } from "../shared/EditorTextField";
import { EditorToggle } from "../shared/EditorToggle";

export const DamagedSection = ({ card, config = {}, label, icon, updateField }) => {
  const damaged = card.abilities?.damaged;
  if (!damaged) return null;

  // 11e has no per-ability show flag here: the card shows the damaged profile
  // whenever it has content, and the top-level `showDamaged` flag hides it.
  const hasShowToggle = config.hasShowToggle !== false;

  return (
    <EditorAccordion title={label} icon={icon}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {hasShowToggle && (
          <EditorToggle
            label="Show on card"
            checked={damaged.showDamagedAbility !== false}
            onChange={(value) => updateField("abilities.damaged.showDamagedAbility", value)}
          />
        )}
        <EditorTextField
          label="Wounds Remaining"
          value={damaged.range}
          onChange={(value) => updateField("abilities.damaged.range", value)}
          placeholder="e.g. 1-4"
        />
        <EditorTextField
          label="Description"
          value={damaged.description}
          onChange={(value) => updateField("abilities.damaged.description", value)}
          placeholder="Effect while damaged"
          multiline
        />
      </div>
    </EditorAccordion>
  );
};
