import React from "react";
import { Tags } from "lucide-react";
import { Section } from "../components";

const POINTS_FORMAT_OPTIONS = ["per-model", "per-unit"];

/**
 * Editor for unit metadata flags.
 * Toggles for hasKeywords, hasFactionKeywords, hasPoints, pointsFormat dropdown.
 */
export const MetadataSchemaEditor = ({ schema, onChange }) => {
  const metadata = schema?.metadata;
  if (!metadata) return null;

  const updateMetadata = (updates) => {
    onChange({ ...schema, metadata: { ...metadata, ...updates } });
  };

  return (
    <Section title="Metadata" icon={Tags} defaultOpen={true}>
      <label className="props-checkbox">
        <input
          type="checkbox"
          checked={!!metadata.hasKeywords}
          onChange={() => updateMetadata({ hasKeywords: !metadata.hasKeywords })}
        />
        <span>Keywords</span>
      </label>
      <label className="props-checkbox">
        <input
          type="checkbox"
          checked={!!metadata.hasFactionKeywords}
          onChange={() => updateMetadata({ hasFactionKeywords: !metadata.hasFactionKeywords })}
        />
        <span>Faction keywords</span>
      </label>
      <label className="props-checkbox">
        <input
          type="checkbox"
          checked={!!metadata.hasPoints}
          onChange={() => updateMetadata({ hasPoints: !metadata.hasPoints })}
        />
        <span>Points</span>
      </label>
      {metadata.hasPoints && (
        <div className="props-compact-input">
          <span className="props-compact-label">Format</span>
          <select
            className="props-compact-field"
            value={metadata.pointsFormat || "per-model"}
            onChange={(e) => updateMetadata({ pointsFormat: e.target.value })}
            aria-label="Points format">
            {POINTS_FORMAT_OPTIONS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
      )}
    </Section>
  );
};
