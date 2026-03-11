import React from "react";
import { Sparkles } from "lucide-react";
import { Section } from "../components";

/**
 * Editor for ability category definitions.
 * Editable category list with format selection, invuln/damaged toggles.
 */
export const AbilitiesSchemaEditor = ({ schema, onChange }) => {
  const abilities = schema?.abilities;
  if (!abilities) return null;

  return (
    <Section title="Abilities" icon={Sparkles} defaultOpen={true}>
      <div className="props-metadata-row">
        <span className="props-metadata-label">Categories</span>
        <span className="props-metadata-value">{abilities.categories?.length || 0}</span>
      </div>
      <div className="props-metadata-row">
        <span className="props-metadata-label">Invulnerable Save</span>
        <span className="props-metadata-value">{abilities.hasInvulnerableSave ? "Yes" : "No"}</span>
      </div>
      <div className="props-metadata-row">
        <span className="props-metadata-label">Damaged Ability</span>
        <span className="props-metadata-value">{abilities.hasDamagedAbility ? "Yes" : "No"}</span>
      </div>
    </Section>
  );
};
