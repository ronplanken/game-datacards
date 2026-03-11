import React from "react";
import { List, BookOpen, Tag, Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { Section, CompactInput } from "../components";

const FIELD_TYPES = ["string", "richtext", "enum", "boolean"];

/**
 * Reusable field list renderer with add/remove/reorder and type selection.
 * Used for top-level fields and collection fields.
 */
const FieldList = ({ fields, onUpdate, fieldLabel = "field" }) => {
  const updateField = (index, key, value) => {
    const updated = fields.map((f, i) => (i === index ? { ...f, [key]: value } : f));
    onUpdate(updated);
  };

  const addField = () => {
    const nextNum = fields.length + 1;
    const newField = {
      key: `${fieldLabel}_${nextNum}`,
      label: `${fieldLabel.charAt(0).toUpperCase() + fieldLabel.slice(1)} ${nextNum}`,
      type: "string",
      required: false,
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
        {fields.map((field, index) => (
          <div key={field.key + "-" + index} className="props-field-item">
            <div className="props-field-item-inputs">
              <CompactInput
                label="Key"
                type="text"
                value={field.key}
                onChange={(val) => updateField(index, "key", val)}
              />
              <CompactInput
                label="Label"
                type="text"
                value={field.label}
                onChange={(val) => updateField(index, "label", val)}
              />
              <div className="props-compact-input">
                <span className="props-compact-label">Type</span>
                <select
                  className="props-compact-field"
                  value={field.type}
                  onChange={(e) => updateField(index, "type", e.target.value)}
                  aria-label="Type">
                  {FIELD_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <label className="props-checkbox">
                <input
                  type="checkbox"
                  checked={!!field.required}
                  onChange={() => updateField(index, "required", !field.required)}
                />
                <span>Required</span>
              </label>
              {field.type === "enum" && (
                <CompactInput
                  label="Options"
                  type="text"
                  value={(field.options || []).join(", ")}
                  onChange={(val) =>
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
          <label className="props-checkbox">
            <input
              type="checkbox"
              checked={!!schema.rules.allowMultiple}
              onChange={() => updateRulesCollection({ allowMultiple: !schema.rules.allowMultiple })}
            />
            <span>Allow multiple rules</span>
          </label>
          <FieldList
            fields={schema.rules.fields || []}
            onUpdate={(updatedFields) => updateRulesCollection({ fields: updatedFields })}
            fieldLabel="rule field"
          />
        </Section>
      )}

      {baseType === "enhancement" && schema.keywords && (
        <Section title="Keywords Collection" icon={Tag} defaultOpen={true}>
          <label className="props-checkbox">
            <input
              type="checkbox"
              checked={!!schema.keywords.allowMultiple}
              onChange={() => updateKeywordsCollection({ allowMultiple: !schema.keywords.allowMultiple })}
            />
            <span>Allow multiple keywords</span>
          </label>
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
