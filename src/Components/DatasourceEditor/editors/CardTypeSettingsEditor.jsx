import React from "react";
import { Tag } from "lucide-react";
import { IconTag } from "@tabler/icons-react";
import { Section, CompactInput } from "../components";
import { TemplateSelector, usePremiumFeatures } from "../../../Premium";

const BASE_TYPE_LABELS = {
  unit: "Unit",
  rule: "Rule",
  enhancement: "Enhancement",
  stratagem: "Stratagem",
};

/**
 * Editor for card type identity: name and template assignment.
 */
export const CardTypeSettingsEditor = ({ cardType, activeDatasource, onUpdateCardType }) => {
  if (!cardType) return null;

  const { hasCardDesigner } = usePremiumFeatures();
  const baseTypeLabel = BASE_TYPE_LABELS[cardType.baseType] || cardType.baseType;

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
      {hasCardDesigner && (
        <div className="props-card-type-template">
          <TemplateSelector
            value={cardType.templateId || null}
            onChange={(id) => onUpdateCardType("templateId", id)}
            targetFormat={activeDatasource?.schema?.baseSystem}
          />
        </div>
      )}
    </Section>
  );
};
