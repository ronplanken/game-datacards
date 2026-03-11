import React from "react";
import { List, BookOpen, Tag } from "lucide-react";
import { Section } from "../components";

/**
 * Generic field list editor for rule/enhancement/stratagem card types.
 * Shows top-level fields and type-specific collections (rules, keywords).
 */
export const FieldsSchemaEditor = ({ schema, onChange, baseType }) => {
  if (!schema) return null;

  const fields = schema.fields || [];

  return (
    <div>
      <Section title="Fields" icon={List} defaultOpen={true}>
        <div className="props-metadata-row">
          <span className="props-metadata-label">Count</span>
          <span className="props-metadata-value">{fields.length}</span>
        </div>
      </Section>

      {baseType === "rule" && schema.rules && (
        <Section title="Rules Collection" icon={BookOpen} defaultOpen={true}>
          <div className="props-metadata-row">
            <span className="props-metadata-label">Fields</span>
            <span className="props-metadata-value">{schema.rules.fields?.length || 0}</span>
          </div>
          <div className="props-metadata-row">
            <span className="props-metadata-label">Allow Multiple</span>
            <span className="props-metadata-value">{schema.rules.allowMultiple ? "Yes" : "No"}</span>
          </div>
        </Section>
      )}

      {baseType === "enhancement" && schema.keywords && (
        <Section title="Keywords Collection" icon={Tag} defaultOpen={true}>
          <div className="props-metadata-row">
            <span className="props-metadata-label">Fields</span>
            <span className="props-metadata-value">{schema.keywords.fields?.length || 0}</span>
          </div>
          <div className="props-metadata-row">
            <span className="props-metadata-label">Allow Multiple</span>
            <span className="props-metadata-value">{schema.keywords.allowMultiple ? "Yes" : "No"}</span>
          </div>
        </Section>
      )}
    </div>
  );
};
