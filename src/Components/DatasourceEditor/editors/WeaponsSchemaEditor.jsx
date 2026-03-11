import React from "react";
import { Swords } from "lucide-react";
import { Section } from "../components";

/**
 * Editor for weapon type definitions.
 * Tabbed interface per weapon type with editable column list.
 */
export const WeaponsSchemaEditor = ({ schema, onChange }) => {
  const weaponTypes = schema?.weaponTypes;
  if (!weaponTypes) return null;

  return (
    <Section title="Weapon Types" icon={Swords} defaultOpen={true}>
      <div className="props-metadata-row">
        <span className="props-metadata-label">Types</span>
        <span className="props-metadata-value">{weaponTypes.types?.length || 0}</span>
      </div>
    </Section>
  );
};
