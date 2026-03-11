import React, { useCallback, useMemo } from "react";
import { Plus, Trash2, ChevronUp, ChevronDown, ListOrdered, X } from "lucide-react";

/**
 * Valid field type options for the type dropdown.
 */
const FIELD_TYPE_OPTIONS = [
  { value: "string", label: "String" },
  { value: "richtext", label: "Rich Text" },
  { value: "enum", label: "Enum" },
  { value: "boolean", label: "Boolean" },
];

/**
 * Generate a unique key for a new field, avoiding collisions with existing keys.
 *
 * @param {Array} existingFields - Current field definitions
 * @returns {string} A unique key like "field1", "field2", etc.
 */
const generateUniqueKey = (existingFields) => {
  const existingKeys = new Set(existingFields.map((f) => f.key));
  let counter = existingFields.length + 1;
  while (existingKeys.has(`field${counter}`)) {
    counter++;
  }
  return `field${counter}`;
};

/**
 * StepFields - Reusable editable field list for rule, enhancement, and stratagem card types.
 * Defines top-level `fields[]` with key, label, type dropdown, required toggle,
 * and conditional enum options editor.
 *
 * @param {Object} props
 * @param {Object} props.wizard - Wizard state from useDatasourceWizard
 */
export const StepFields = ({ wizard }) => {
  const data = wizard.stepData["fields"] || {};
  const fields = data.fields || [];

  const updateFields = useCallback(
    (updater) => {
      wizard.updateStepData("fields", (prev) => {
        const currentFields = prev?.fields || [];
        const newFields = typeof updater === "function" ? updater(currentFields) : updater;
        return { ...prev, fields: newFields };
      });
    },
    [wizard],
  );

  const handleAddField = useCallback(() => {
    updateFields((prev) => {
      const newKey = generateUniqueKey(prev);
      const newField = {
        key: newKey,
        label: `Field ${prev.length + 1}`,
        type: "string",
        required: false,
      };
      return [...prev, newField];
    });
  }, [updateFields]);

  const handleRemoveField = useCallback(
    (index) => {
      updateFields((prev) => prev.filter((_, i) => i !== index));
    },
    [updateFields],
  );

  const handleFieldKeyChange = useCallback(
    (index, value) => {
      updateFields((prev) => prev.map((f, i) => (i === index ? { ...f, key: value } : f)));
    },
    [updateFields],
  );

  const handleFieldLabelChange = useCallback(
    (index, value) => {
      updateFields((prev) => prev.map((f, i) => (i === index ? { ...f, label: value } : f)));
    },
    [updateFields],
  );

  const handleFieldTypeChange = useCallback(
    (index, value) => {
      updateFields((prev) =>
        prev.map((f, i) => {
          if (i !== index) return f;
          const updated = { ...f, type: value };
          if (value === "enum" && !updated.options) {
            updated.options = [];
          }
          if (value !== "enum") {
            delete updated.options;
          }
          return updated;
        }),
      );
    },
    [updateFields],
  );

  const handleFieldRequiredChange = useCallback(
    (index) => {
      updateFields((prev) => prev.map((f, i) => (i === index ? { ...f, required: !f.required } : f)));
    },
    [updateFields],
  );

  const handleAddEnumOption = useCallback(
    (fieldIndex) => {
      updateFields((prev) =>
        prev.map((f, i) => {
          if (i !== fieldIndex) return f;
          const options = f.options || [];
          return { ...f, options: [...options, ""] };
        }),
      );
    },
    [updateFields],
  );

  const handleEnumOptionChange = useCallback(
    (fieldIndex, optionIndex, value) => {
      updateFields((prev) =>
        prev.map((f, i) => {
          if (i !== fieldIndex) return f;
          const options = [...(f.options || [])];
          options[optionIndex] = value;
          return { ...f, options };
        }),
      );
    },
    [updateFields],
  );

  const handleRemoveEnumOption = useCallback(
    (fieldIndex, optionIndex) => {
      updateFields((prev) =>
        prev.map((f, i) => {
          if (i !== fieldIndex) return f;
          const options = (f.options || []).filter((_, oi) => oi !== optionIndex);
          return { ...f, options };
        }),
      );
    },
    [updateFields],
  );

  const handleMoveUp = useCallback(
    (index) => {
      if (index === 0) return;
      updateFields((prev) => {
        const newFields = [...prev];
        [newFields[index - 1], newFields[index]] = [newFields[index], newFields[index - 1]];
        return newFields;
      });
    },
    [updateFields],
  );

  const handleMoveDown = useCallback(
    (index) => {
      updateFields((prev) => {
        if (index >= prev.length - 1) return prev;
        const newFields = [...prev];
        [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
        return newFields;
      });
    },
    [updateFields],
  );

  const hasKeyConflict = useMemo(() => {
    const keys = fields.map((f) => f.key).filter(Boolean);
    return new Set(keys).size !== keys.length;
  }, [fields]);

  return (
    <div className="dsw-step-fields" data-testid="dsw-step-fields">
      <h2 className="dsw-step-title">Fields</h2>
      <p className="dsw-step-description">
        Define the data fields for this card type. Each field becomes an editable property on cards of this type.
      </p>

      <div className="dsw-stats-fields" data-testid="dsw-fields-list">
        <div className="dsw-stats-fields-header">
          <span className="dsw-stats-fields-title">
            <ListOrdered size={14} />
            Fields ({fields.length})
          </span>
          <button
            type="button"
            className="dsw-btn dsw-btn--secondary dsw-btn--sm"
            onClick={handleAddField}
            data-testid="dsw-fields-add">
            <Plus size={14} />
            Add Field
          </button>
        </div>

        {fields.length === 0 && (
          <div className="dsw-stats-empty" data-testid="dsw-fields-empty">
            <p>No fields defined yet. Add fields to define the data structure for this card type.</p>
          </div>
        )}

        {hasKeyConflict && (
          <div className="dsw-stats-warning" data-testid="dsw-fields-key-conflict">
            Duplicate keys detected. Each field must have a unique key.
          </div>
        )}

        {fields.map((field, index) => (
          <div
            className="dsw-fields-field-item"
            key={`${field.key}-${index}`}
            data-testid={`dsw-fields-field-${index}`}>
            <div className="dsw-stats-field-row">
              <span className="dsw-stats-field-order">{index + 1}</span>

              <div className="dsw-stats-field-inputs">
                <input
                  className="dsw-form-input dsw-stats-field-key"
                  type="text"
                  value={field.key}
                  onChange={(e) => handleFieldKeyChange(index, e.target.value)}
                  placeholder="key"
                  data-testid={`dsw-fields-key-${index}`}
                />
                <input
                  className="dsw-form-input dsw-stats-field-label"
                  type="text"
                  value={field.label}
                  onChange={(e) => handleFieldLabelChange(index, e.target.value)}
                  placeholder="Label"
                  data-testid={`dsw-fields-label-${index}`}
                />
                <select
                  className="dsw-form-input dsw-fields-type-select"
                  value={field.type}
                  onChange={(e) => handleFieldTypeChange(index, e.target.value)}
                  data-testid={`dsw-fields-type-${index}`}>
                  {FIELD_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <label className="dsw-fields-required-toggle" data-testid={`dsw-fields-required-${index}`}>
                  <input
                    type="checkbox"
                    className="dsw-toggle-checkbox"
                    checked={field.required || false}
                    onChange={() => handleFieldRequiredChange(index)}
                  />
                  <span className="dsw-fields-required-label">Required</span>
                </label>
              </div>

              <div className="dsw-stats-field-actions">
                <button
                  type="button"
                  className="dsw-stats-action-btn"
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  aria-label={`Move ${field.label || field.key} up`}
                  data-testid={`dsw-fields-move-up-${index}`}>
                  <ChevronUp size={14} />
                </button>
                <button
                  type="button"
                  className="dsw-stats-action-btn"
                  onClick={() => handleMoveDown(index)}
                  disabled={index === fields.length - 1}
                  aria-label={`Move ${field.label || field.key} down`}
                  data-testid={`dsw-fields-move-down-${index}`}>
                  <ChevronDown size={14} />
                </button>
                <button
                  type="button"
                  className="dsw-stats-action-btn dsw-stats-action-btn--danger"
                  onClick={() => handleRemoveField(index)}
                  aria-label={`Remove ${field.label || field.key}`}
                  data-testid={`dsw-fields-remove-${index}`}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {field.type === "enum" && (
              <div className="dsw-fields-enum-options" data-testid={`dsw-fields-enum-options-${index}`}>
                <div className="dsw-fields-enum-header">
                  <span className="dsw-fields-enum-title">Enum Options ({(field.options || []).length})</span>
                  <button
                    type="button"
                    className="dsw-btn dsw-btn--secondary dsw-btn--xs"
                    onClick={() => handleAddEnumOption(index)}
                    data-testid={`dsw-fields-enum-add-${index}`}>
                    <Plus size={12} />
                    Add Option
                  </button>
                </div>

                {(field.options || []).length === 0 && (
                  <div className="dsw-fields-enum-empty" data-testid={`dsw-fields-enum-empty-${index}`}>
                    No options defined. Add options to constrain this field&apos;s values.
                  </div>
                )}

                {(field.options || []).map((option, optIndex) => (
                  <div
                    className="dsw-fields-enum-option-row"
                    key={`enum-${index}-${optIndex}`}
                    data-testid={`dsw-fields-enum-option-${index}-${optIndex}`}>
                    <input
                      className="dsw-form-input dsw-fields-enum-input"
                      type="text"
                      value={option}
                      onChange={(e) => handleEnumOptionChange(index, optIndex, e.target.value)}
                      placeholder={`Option ${optIndex + 1}`}
                      data-testid={`dsw-fields-enum-value-${index}-${optIndex}`}
                    />
                    <button
                      type="button"
                      className="dsw-stats-action-btn dsw-stats-action-btn--danger"
                      onClick={() => handleRemoveEnumOption(index, optIndex)}
                      aria-label={`Remove option ${option || optIndex + 1}`}
                      data-testid={`dsw-fields-enum-remove-${index}-${optIndex}`}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
