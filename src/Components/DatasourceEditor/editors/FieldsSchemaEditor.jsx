import React from "react";
import { nanoid } from "nanoid";
import { List, BookOpen, Tag, Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { IconKey, IconTag, IconCategory, IconList, IconCopy } from "@tabler/icons-react";
import { Section, CompactInput } from "../components";
import { Tooltip } from "../../Tooltip/Tooltip";
import { ensureIds } from "./editorUtils";

const FIELD_TYPES = [
  { value: "string", label: "Text" },
  { value: "richtext", label: "Rich Text" },
  { value: "enum", label: "Enum" },
  { value: "boolean", label: "Boolean" },
];

/**
 * Reusable field list renderer with add/remove/reorder and type selection.
 * Used for top-level fields and collection fields.
 */
const FieldList = ({ fields: rawFields, onUpdate, fieldLabel = "field" }) => {
  const fields = ensureIds(rawFields);
  const updateField = (index, key, value) => {
    const updated = fields.map((f, i) => (i === index ? { ...f, [key]: value } : f));
    onUpdate(updated);
  };

  const addField = () => {
    const nextNum = fields.length + 1;
    const newField = {
      _id: nanoid(),
      key: `${fieldLabel}_${nextNum}`,
      label: `${fieldLabel.charAt(0).toUpperCase() + fieldLabel.slice(1)} ${nextNum}`,
      type: "string",
    };
    onUpdate([...fields, newField]);
  };

  const removeField = (index) => {
    onUpdate(fields.filter((_, i) => i !== index));
  };

  const moveField = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= fields.length) return;
    const updated = [...fields];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onUpdate(updated);
  };

  return (
    <>
      <div className="props-field-list">
        {fields.length === 0 && <div className="props-field-list-empty">No fields defined yet</div>}
        {fields.map((field, index) => (
          <div key={field._id} className="props-field-item">
            <div className="props-field-item-inputs">
              <CompactInput
                label={<IconKey size={10} stroke={1.5} />}
                ariaLabel="Key"
                tooltip="Key"
                type="text"
                value={field.key}
                onChange={(val) => updateField(index, "key", val)}
              />
              <CompactInput
                label={<IconTag size={10} stroke={1.5} />}
                ariaLabel="Label"
                tooltip="Label"
                type="text"
                value={field.label}
                onChange={(val) => updateField(index, "label", val)}
              />
              <div className="props-compact-input">
                <Tooltip content="Type" placement="top">
                  <span className="props-compact-label">
                    <IconCategory size={10} stroke={1.5} />
                  </span>
                </Tooltip>
                <select
                  className="props-compact-field"
                  value={field.type}
                  onChange={(e) => updateField(index, "type", e.target.value)}
                  aria-label="Type">
                  {FIELD_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              {field.type === "enum" && (
                <CompactInput
                  label={<IconList size={10} stroke={1.5} />}
                  ariaLabel="Options"
                  tooltip="Options (comma-separated)"
                  type="text"
                  value={(field.options || []).join(", ")}
                  onChange={(val) =>
                    updateField(
                      index,
                      "options",
                      val.split(",").map((s) => s.trim()),
                    )
                  }
                  onBlur={(val) =>
                    updateField(
                      index,
                      "options",
                      val
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    )
                  }
                />
              )}
            </div>
            <div className="props-field-item-actions">
              <button
                className="designer-layer-action-btn"
                onClick={() => moveField(index, -1)}
                disabled={index === 0}
                aria-label={`Move ${field.label} up`}
                title="Move up">
                <ChevronUp size={14} />
              </button>
              <button
                className="designer-layer-action-btn"
                onClick={() => moveField(index, 1)}
                disabled={index === fields.length - 1}
                aria-label={`Move ${field.label} down`}
                title="Move down">
                <ChevronDown size={14} />
              </button>
              <button
                className="designer-layer-action-btn danger"
                onClick={() => removeField(index)}
                aria-label={`Remove ${field.label}`}
                title="Remove field">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className="designer-btn designer-btn-sm" onClick={addField} aria-label={`Add ${fieldLabel}`}>
        <Plus size={14} />
        Add Field
      </button>
    </>
  );
};

/**
 * Generic field list editor for rule/enhancement/stratagem card types.
 * Shows editable top-level fields and type-specific collection sections.
 *
 * - rule: top-level fields + rules collection
 * - enhancement: top-level fields + keywords collection
 * - stratagem: top-level fields only
 */
export const FieldsSchemaEditor = ({ schema, onChange, baseType }) => {
  if (!schema) return null;

  const fields = schema.fields || [];

  const updateFields = (updatedFields) => {
    onChange({ ...schema, fields: updatedFields });
  };

  const updateRulesCollection = (updates) => {
    onChange({ ...schema, rules: { ...schema.rules, ...updates } });
  };

  const updateKeywordsCollection = (updates) => {
    onChange({ ...schema, keywords: { ...schema.keywords, ...updates } });
  };

  return (
    <div>
      <Section title="Fields" icon={List} defaultOpen={true}>
        <FieldList fields={fields} onUpdate={updateFields} fieldLabel="field" />
      </Section>

      {baseType === "rule" && schema.rules && (
        <Section title="Rules Collection" icon={BookOpen} defaultOpen={true}>
          <CompactInput
            label={<IconCopy size={10} stroke={1.5} />}
            ariaLabel="Allow multiple rules"
            tooltip="Allow multiple rules"
            type="toggle"
            value={!!schema.rules.allowMultiple}
            onChange={(val) => updateRulesCollection({ allowMultiple: val })}
          />
          <FieldList
            fields={schema.rules.fields || []}
            onUpdate={(updatedFields) => updateRulesCollection({ fields: updatedFields })}
            fieldLabel="rule field"
          />
        </Section>
      )}

      {baseType === "enhancement" && schema.keywords && (
        <Section title="Keywords Collection" icon={Tag} defaultOpen={true}>
          <CompactInput
            label={<IconCopy size={10} stroke={1.5} />}
            ariaLabel="Allow multiple keywords"
            tooltip="Allow multiple keywords"
            type="toggle"
            value={!!schema.keywords.allowMultiple}
            onChange={(val) => updateKeywordsCollection({ allowMultiple: val })}
          />
          <FieldList
            fields={schema.keywords.fields || []}
            onUpdate={(updatedFields) => updateKeywordsCollection({ fields: updatedFields })}
            fieldLabel="keyword field"
          />
        </Section>
      )}
    </div>
  );
};
