import React from "react";
import { BarChart3, Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { Section, CompactInput } from "../components";

const FIELD_TYPES = ["string", "richtext", "enum", "boolean"];

/**
 * Editor for unit stat field definitions.
 * Allows add/remove/reorder stat fields and toggling allowMultipleProfiles.
 */
export const StatsSchemaEditor = ({ schema, onChange }) => {
  const stats = schema?.stats;
  if (!stats) return null;

  const fields = stats.fields || [];

  const updateStats = (updatedStats) => {
    onChange({ ...schema, stats: { ...stats, ...updatedStats } });
  };

  const updateField = (index, key, value) => {
    const updated = fields.map((f, i) => (i === index ? { ...f, [key]: value } : f));
    updateStats({ fields: updated });
  };

  const addField = () => {
    const nextOrder = fields.length > 0 ? Math.max(...fields.map((f) => f.displayOrder || 0)) + 1 : 1;
    const newField = {
      key: `stat_${nextOrder}`,
      label: `Stat ${nextOrder}`,
      type: "string",
      displayOrder: nextOrder,
    };
    updateStats({ fields: [...fields, newField] });
  };

  const removeField = (index) => {
    const updated = fields.filter((_, i) => i !== index);
    updateStats({ fields: updated });
  };

  const moveField = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= fields.length) return;
    const updated = [...fields];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    // Reassign display orders based on new positions
    const reordered = updated.map((f, i) => ({ ...f, displayOrder: i + 1 }));
    updateStats({ fields: reordered });
  };

  const toggleMultipleProfiles = () => {
    updateStats({ allowMultipleProfiles: !stats.allowMultipleProfiles });
  };

  return (
    <Section title="Stats" icon={BarChart3} defaultOpen={true}>
      <label className="props-checkbox">
        <input type="checkbox" checked={!!stats.allowMultipleProfiles} onChange={toggleMultipleProfiles} />
        <span>Allow multiple profiles</span>
      </label>

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

      <button className="designer-btn designer-btn-sm" onClick={addField} aria-label="Add stat field">
        <Plus size={14} />
        Add Field
      </button>
    </Section>
  );
};
