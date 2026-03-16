import React from "react";
import { Tags } from "lucide-react";
import { IconCategory, IconHash, IconUsers, IconCoin, IconBadge, IconTypography } from "@tabler/icons-react";
import { Section, CompactInput } from "../components";
import { Tooltip } from "../../Tooltip/Tooltip";

const POINTS_FORMAT_OPTIONS = [
  { value: "per-model", label: "Per Model" },
  { value: "per-unit", label: "Per Unit" },
];

const BANNER_TYPE_OPTIONS = [
  { value: "faction", label: "Faction Name" },
  { value: "custom", label: "Custom Text" },
  { value: "hidden", label: "Hidden" },
];

/**
 * Editor for unit metadata flags.
 * Toggles for hasKeywords, hasFactionKeywords, hasPoints, pointsFormat dropdown.
 */
export const MetadataSchemaEditor = ({ schema, onChange, baseSystem }) => {
  const metadata = schema?.metadata;
  if (!metadata) return null;

  const updateMetadata = (updates) => {
    onChange({ ...schema, metadata: { ...metadata, ...updates } });
  };

  return (
    <Section title="Card Options" icon={Tags} defaultOpen={true}>
      <CompactInput
        label={<IconHash size={10} stroke={1.5} />}
        ariaLabel="Keywords"
        tooltip="Include keywords"
        type="toggle"
        value={!!metadata.hasKeywords}
        onChange={(val) => updateMetadata({ hasKeywords: val })}
      />
      <CompactInput
        label={<IconUsers size={10} stroke={1.5} />}
        ariaLabel="Faction keywords"
        tooltip="Include faction keywords"
        type="toggle"
        value={!!metadata.hasFactionKeywords}
        onChange={(val) => updateMetadata({ hasFactionKeywords: val })}
      />
      <CompactInput
        label={<IconCoin size={10} stroke={1.5} />}
        ariaLabel="Points cost"
        tooltip="Include points cost"
        type="toggle"
        value={!!metadata.hasPoints}
        onChange={(val) => updateMetadata({ hasPoints: val })}
      />
      {metadata.hasPoints && (
        <div className="props-tree-children">
          <div className="props-tree-child">
            <div className="props-compact-input">
              <Tooltip content="Points format" placement="top">
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
          </div>
        </div>
      )}
      {baseSystem !== "40k-10e" && (
        <>
          <div className="props-compact-input">
            <Tooltip content="Banner type" placement="top">
              <span className="props-compact-label">
                <IconBadge size={10} stroke={1.5} />
              </span>
            </Tooltip>
            <select
              className="props-compact-field"
              value={metadata.bannerType || "faction"}
              onChange={(e) =>
                updateMetadata({
                  bannerType: e.target.value,
                  ...(e.target.value !== "custom" ? { bannerCustomText: undefined } : {}),
                })
              }
              aria-label="Banner type">
              {BANNER_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          {metadata.bannerType === "custom" && (
            <div className="props-tree-children">
              <div className="props-tree-child">
                <CompactInput
                  label={<IconTypography size={10} stroke={1.5} />}
                  ariaLabel="Banner text"
                  tooltip="Custom banner text"
                  type="text"
                  value={metadata.bannerCustomText || ""}
                  onChange={(val) => updateMetadata({ bannerCustomText: val })}
                />
              </div>
            </div>
          )}
        </>
      )}
    </Section>
  );
};
