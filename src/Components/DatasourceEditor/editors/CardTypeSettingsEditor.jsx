import React from "react";
import { Tag } from "lucide-react";
import { IconTag, IconResize, IconCategory } from "@tabler/icons-react";
import { Section, CompactInput } from "../components";
import { TemplateSelector, usePremiumFeatures } from "../../../Premium";

const BASE_TYPE_LABELS = {
  unit: "Unit",
  rule: "Rule",
  enhancement: "Enhancement",
  stratagem: "Stratagem",
};

const AUTO_RESIZE_SYSTEMS = ["starcraft-tmg", "40k-10e", "40k-11e"];

/**
 * Editor for card type identity: name, template assignment, and the
 * auto-resize card option (for base systems that support it).
 */
export const CardTypeSettingsEditor = ({
  cardType,
  activeDatasource,
  onUpdateCardType,
  onUpdateSchema,
  baseSystem,
}) => {
  if (!cardType) return null;

  const { hasCardDesigner } = usePremiumFeatures();
  const baseTypeLabel = BASE_TYPE_LABELS[cardType.baseType] || cardType.baseType;

  const metadata = cardType.schema?.metadata;
  const showAutoResize = !!metadata && AUTO_RESIZE_SYSTEMS.includes(baseSystem) && typeof onUpdateSchema === "function";
  const showSubcategory = !!metadata && typeof onUpdateSchema === "function";

  return (
    <Section title="Card Type" icon={Tag} defaultOpen={true}>
      <CompactInput
        label={<IconTag size={10} stroke={1.5} />}
        ariaLabel="Card type name"
        tooltip="Name"
        type="text"
        value={cardType.label || ""}
        onChange={(val) => onUpdateCardType("label", val)}
      />
      <div className="props-metadata-row">
        <span className="props-metadata-label">Base Type</span>
        <span className="props-metadata-value">{baseTypeLabel}</span>
      </div>
      {showAutoResize && (
        <CompactInput
          label={<IconResize size={10} stroke={1.5} />}
          ariaLabel="Auto-resize"
          tooltip="Allow per-card toggle to auto-resize the card height to fit its content"
          type="toggle"
          value={!!metadata.hasAutoResize}
          onChange={(val) => onUpdateSchema({ ...cardType.schema, metadata: { ...metadata, hasAutoResize: val } })}
        />
      )}
      {showSubcategory && (
        <CompactInput
          label={<IconCategory size={10} stroke={1.5} />}
          ariaLabel="Subcategory"
          tooltip="Add a per-card Subcategory field (shown in Basic Information) and group cards by it in the card list"
          type="toggle"
          value={!!metadata.hasSubcategory}
          onChange={(val) => onUpdateSchema({ ...cardType.schema, metadata: { ...metadata, hasSubcategory: val } })}
        />
      )}
      {hasCardDesigner && (
        <div className="props-card-type-template">
          <TemplateSelector value={cardType.templateId || null} onChange={(id) => onUpdateCardType("templateId", id)} />
        </div>
      )}
    </Section>
  );
};
