import React from "react";
import { Tag } from "lucide-react";
import { Section } from "../components";

/**
 * Editor for unit metadata flags.
 * Toggles for hasKeywords, hasFactionKeywords, hasPoints, pointsFormat.
 */
export const MetadataSchemaEditor = ({ schema, onChange }) => {
  const metadata = schema?.metadata;
  if (!metadata) return null;

  return (
    <Section title="Metadata" icon={Tag} defaultOpen={true}>
      <div className="props-metadata-row">
        <span className="props-metadata-label">Keywords</span>
        <span className="props-metadata-value">{metadata.hasKeywords ? "Yes" : "No"}</span>
      </div>
      <div className="props-metadata-row">
        <span className="props-metadata-label">Faction Keywords</span>
        <span className="props-metadata-value">{metadata.hasFactionKeywords ? "Yes" : "No"}</span>
      </div>
      <div className="props-metadata-row">
        <span className="props-metadata-label">Points</span>
        <span className="props-metadata-value">{metadata.hasPoints ? metadata.pointsFormat || "per-unit" : "No"}</span>
      </div>
    </Section>
  );
};
