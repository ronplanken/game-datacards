import React, { useCallback, useMemo } from "react";
import { nanoid } from "nanoid";
import { Plus, Trash2, ChevronUp, ChevronDown, ListOrdered, X } from "lucide-react";
import { IconKey, IconTag, IconCategory } from "@tabler/icons-react";
import { Tooltip } from "../../Tooltip/Tooltip";
import { ensureIds } from "../../DatasourceEditor/editors/editorUtils";

/**
 * Valid field type options for the type dropdown.
 */
const FIELD_TYPE_OPTIONS = [
  { value: "string", label: "String" },
  { value: "richtext", label: "Rich Text" },
  { value: "enum", label: "Choice List" },
  { value: "boolean", label: "Yes / No" },
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
 * StepRules - Configure the nested `rules` collection for rule-type card types.
 * Defines label, allowMultiple toggle, and field definitions for the rules collection.
 *
 * @param {Object} props
 * @param {Object} props.wizard - Wizard state from useDatasourceWizard
 */
export const StepRules = ({ wizard }) => {
  const data = wizard.stepData["rules"] || {};
  const rules = data.rules || { label: "Rules", allowMultiple: true, fields: [] };
  const fields = ensureIds(rules.fields);

  const updateRules = useCallback(
    (updater) => {
      wizard.updateStepData("rules", (prev) => {
        const currentRules = prev?.rules || { label: "Rules", allowMultiple: true, fields: [] };
        const newRules = typeof updater === "function" ? updater(currentRules) : updater;
        return { ...prev, rules: newRules };
      });
    },
    [wizard],
  );

  const handleLabelChange = useCallback(
    (value) => {
      updateRules((prev) => ({ ...prev, label: value }));
    },
    [updateRules],
  );

  const handleAllowMultipleToggle = useCallback(() => {
    updateRules((prev) => ({ ...prev, allowMultiple: !prev.allowMultiple }));
  }, [updateRules]);

  const updateFields = useCallback(
    (updater) => {
      updateRules((prev) => {
        const currentFields = prev.fields || [];
        const newFields = typeof updater === "function" ? updater(currentFields) : updater;
        return { ...prev, fields: newFields };
      });
    },
    [updateRules],
  );

  const handleAddField = useCallback(() => {
    updateFields((prev) => {
      const newKey = generateUniqueKey(prev);
      const newField = {
        _id: nanoid(),
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
    <div className="dsw-step-rules" data-testid="dsw-step-rules">
      <h2 className="dsw-step-title">Rules Collection</h2>
      <p className="dsw-step-description">
        Define the fields that each rule on this card type will have. Cards can contain one or more rules, each with
        these fields.
      </p>

      <div className="dsw-rules-config" data-testid="dsw-rules-config">
        <div className="dsw-form-group">
          <label className="dsw-form-label" htmlFor="dsw-rules-label">
            Collection Label
          </label>
          <input
            id="dsw-rules-label"
            className="dsw-form-input"
            type="text"
            value={rules.label}
            onChange={(e) => handleLabelChange(e.target.value)}
            placeholder="Rules"
            data-testid="dsw-rules-label"
          />
        </div>

        <label className="dsw-toggle-row" data-testid="dsw-rules-allow-multiple">
          <input
            type="checkbox"
            className="dsw-toggle-checkbox"
            checked={rules.allowMultiple}
            onChange={handleAllowMultipleToggle}
          />
          <span className="dsw-toggle-label">Allow Multiple Rules</span>
          <span className="dsw-toggle-hint">Cards can contain more than one rule entry.</span>
        </label>
      </div>

      <div className="dsw-stats-fields" data-testid="dsw-rules-fields-list">
        <div className="dsw-stats-fields-header">
          <span className="dsw-stats-fields-title">
            <ListOrdered size={14} />
            Rule Fields ({fields.length})
          </span>
          <button
            type="button"
            className="dsw-btn dsw-btn--secondary dsw-btn--sm"
            onClick={handleAddField}
            data-testid="dsw-rules-fields-add">
            <Plus size={14} />
            Add Field
          </button>
        </div>

        {fields.length === 0 && (
          <div className="dsw-stats-empty" data-testid="dsw-rules-fields-empty">
            <p>No rule fields defined yet. Add fields to define the structure of each rule entry.</p>
          </div>
        )}

        {hasKeyConflict && (
          <div className="dsw-stats-warning" data-testid="dsw-rules-fields-key-conflict">
            Duplicate keys detected. Each field must have a unique key.
          </div>
        )}

        {fields.map((field, index) => (
          <div className="dsw-fields-field-item" key={field._id} data-testid={`dsw-rules-field-${index}`}>
            <div className="dsw-stats-field-row">
              <span className="dsw-stats-field-order">{index + 1}</span>

              <div className="dsw-stats-field-inputs">
                <div className="dsw-icon-input" style={{ flex: 1 }}>
                  <Tooltip content="Key" placement="top">
                    <span className="dsw-icon-input-icon">
                      <IconKey size={12} />
                    </span>
                  </Tooltip>
                  <input
                    className="dsw-form-input dsw-stats-field-key"
                    type="text"
                    value={field.key}
                    onChange={(e) => handleFieldKeyChange(index, e.target.value)}
                    placeholder="key"
                    data-testid={`dsw-rules-field-key-${index}`}
                  />
                </div>
                <div className="dsw-icon-input" style={{ flex: 1 }}>
                  <Tooltip content="Label" placement="top">
                    <span className="dsw-icon-input-icon">
                      <IconTag size={12} />
                    </span>
                  </Tooltip>
                  <input
                    className="dsw-form-input dsw-stats-field-label"
                    type="text"
                    value={field.label}
                    onChange={(e) => handleFieldLabelChange(index, e.target.value)}
                    placeholder="Label"
                    data-testid={`dsw-rules-field-label-${index}`}
                  />
                </div>
                <div className="dsw-icon-input" style={{ width: 120, flex: "0 0 auto" }}>
                  <Tooltip content="Type" placement="top">
                    <span className="dsw-icon-input-icon">
                      <IconCategory size={12} />
                    </span>
                  </Tooltip>
                  <select
                    className="dsw-form-input dsw-fields-type-select"
                    value={field.type}
                    onChange={(e) => handleFieldTypeChange(index, e.target.value)}
                    data-testid={`dsw-rules-field-type-${index}`}>
                    {FIELD_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <label className="dsw-fields-required-toggle" data-testid={`dsw-rules-field-required-${index}`}>
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
                  data-testid={`dsw-rules-field-move-up-${index}`}>
                  <ChevronUp size={14} />
                </button>
                <button
                  type="button"
                  className="dsw-stats-action-btn"
                  onClick={() => handleMoveDown(index)}
                  disabled={index === fields.length - 1}
                  aria-label={`Move ${field.label || field.key} down`}
                  data-testid={`dsw-rules-field-move-down-${index}`}>
                  <ChevronDown size={14} />
                </button>
                <button
                  type="button"
                  className="dsw-stats-action-btn dsw-stats-action-btn--danger"
                  onClick={() => handleRemoveField(index)}
                  aria-label={`Remove ${field.label || field.key}`}
                  data-testid={`dsw-rules-field-remove-${index}`}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {field.type === "enum" && (
              <div className="dsw-fields-enum-options" data-testid={`dsw-rules-field-enum-options-${index}`}>
                <div className="dsw-fields-enum-header">
                  <span className="dsw-fields-enum-title">Choice Options ({(field.options || []).length})</span>
                  <button
                    type="button"
                    className="dsw-btn dsw-btn--secondary dsw-btn--xs"
                    onClick={() => handleAddEnumOption(index)}
                    data-testid={`dsw-rules-field-enum-add-${index}`}>
                    <Plus size={12} />
                    Add Option
                  </button>
                </div>

                {(field.options || []).length === 0 && (
                  <div className="dsw-fields-enum-empty" data-testid={`dsw-rules-field-enum-empty-${index}`}>
                    No options defined yet. Add the allowed values for this field.
                  </div>
                )}

                {(field.options || []).map((option, optIndex) => (
                  <div
                    className="dsw-fields-enum-option-row"
                    key={`enum-${index}-${optIndex}`}
                    data-testid={`dsw-rules-field-enum-option-${index}-${optIndex}`}>
                    <input
                      className="dsw-form-input dsw-fields-enum-input"
                      type="text"
                      value={option}
                      onChange={(e) => handleEnumOptionChange(index, optIndex, e.target.value)}
                      placeholder={`Option ${optIndex + 1}`}
                      data-testid={`dsw-rules-field-enum-value-${index}-${optIndex}`}
                    />
                    <button
                      type="button"
                      className="dsw-stats-action-btn dsw-stats-action-btn--danger"
                      onClick={() => handleRemoveEnumOption(index, optIndex)}
                      aria-label={`Remove option ${option || optIndex + 1}`}
                      data-testid={`dsw-rules-field-enum-remove-${index}-${optIndex}`}>
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
