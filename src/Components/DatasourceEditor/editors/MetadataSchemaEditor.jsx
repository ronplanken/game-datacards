import React from "react";
import { Tags } from "lucide-react";
import { IconCategory } from "@tabler/icons-react";
import { Section } from "../components";
import { Tooltip } from "../../Tooltip/Tooltip";

const POINTS_FORMAT_OPTIONS = [
  { value: "per-model", label: "Per Model" },
  { value: "per-unit", label: "Per Unit" },
];

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
    <Section title="Card Options" icon={Tags} defaultOpen={true}>
      <label className="props-checkbox">
        <input
          type="checkbox"
          checked={!!metadata.hasKeywords}
          onChange={() => updateMetadata({ hasKeywords: !metadata.hasKeywords })}
        />
        <span>Include keywords</span>
      </label>
      <label className="props-checkbox">
        <input
          type="checkbox"
          checked={!!metadata.hasFactionKeywords}
          onChange={() => updateMetadata({ hasFactionKeywords: !metadata.hasFactionKeywords })}
        />
        <span>Include faction keywords</span>
      </label>
      <label className="props-checkbox">
        <input
          type="checkbox"
          checked={!!metadata.hasPoints}
          onChange={() => updateMetadata({ hasPoints: !metadata.hasPoints })}
        />
        <span>Include points cost</span>
      </label>
      {metadata.hasPoints && (
        <div className="props-compact-input">
          <Tooltip content="Format" placement="top">
            <span className="props-compact-label">
              <IconCategory size={10} stroke={1.5} />
            </span>
          </Tooltip>
          <select
            className="props-compact-field"
            value={metadata.pointsFormat || "per-model"}
            onChange={(e) => updateMetadata({ pointsFormat: e.target.value })}
            aria-label="Points format">
            {POINTS_FORMAT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </Section>
  );
};
