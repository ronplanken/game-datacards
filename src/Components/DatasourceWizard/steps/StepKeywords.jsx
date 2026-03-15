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
 * StepKeywords - Configure the `keywords` collection for enhancement-type card types.
 * Defines label, allowMultiple toggle, and field definitions for the keywords collection.
 *
 * @param {Object} props
 * @param {Object} props.wizard - Wizard state from useDatasourceWizard
 */
export const StepKeywords = ({ wizard }) => {
  const data = wizard.stepData["keywords"] || {};
  const keywords = data.keywords || { label: "Keywords", allowMultiple: true, fields: [] };
  const fields = ensureIds(keywords.fields);

  const updateKeywords = useCallback(
    (updater) => {
      wizard.updateStepData("keywords", (prev) => {
        const currentKeywords = prev?.keywords || { label: "Keywords", allowMultiple: true, fields: [] };
        const newKeywords = typeof updater === "function" ? updater(currentKeywords) : updater;
        return { ...prev, keywords: newKeywords };
      });
    },
    [wizard],
  );

  const handleLabelChange = useCallback(
    (value) => {
      updateKeywords((prev) => ({ ...prev, label: value }));
    },
    [updateKeywords],
  );

  const handleAllowMultipleToggle = useCallback(() => {
    updateKeywords((prev) => ({ ...prev, allowMultiple: !prev.allowMultiple }));
  }, [updateKeywords]);

  const updateFields = useCallback(
    (updater) => {
      updateKeywords((prev) => {
        const currentFields = prev.fields || [];
        const newFields = typeof updater === "function" ? updater(currentFields) : updater;
        return { ...prev, fields: newFields };
      });
    },
    [updateKeywords],
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
    <div className="dsw-step-keywords" data-testid="dsw-step-keywords">
      <h2 className="dsw-step-title">Keywords Collection</h2>
      <p className="dsw-step-description">
        Define the fields that each keyword on this card type will have. Cards can contain one or more keywords, each
        with these fields.
      </p>

      <div className="dsw-keywords-config" data-testid="dsw-keywords-config">
        <div className="dsw-form-group">
          <label className="dsw-form-label" htmlFor="dsw-keywords-label">
            Collection Label
          </label>
          <input
            id="dsw-keywords-label"
            className="dsw-form-input"
            type="text"
            value={keywords.label}
            onChange={(e) => handleLabelChange(e.target.value)}
            placeholder="Keywords"
            data-testid="dsw-keywords-label"
          />
        </div>

        <label className="dsw-toggle-row" data-testid="dsw-keywords-allow-multiple">
          <input
            type="checkbox"
            className="dsw-toggle-checkbox"
            checked={keywords.allowMultiple}
            onChange={handleAllowMultipleToggle}
          />
          <span className="dsw-toggle-label">Allow Multiple Keywords</span>
          <span className="dsw-toggle-hint">Cards can contain more than one keyword entry.</span>
        </label>
      </div>

      <div className="dsw-stats-fields" data-testid="dsw-keywords-fields-list">
        <div className="dsw-stats-fields-header">
          <span className="dsw-stats-fields-title">
            <ListOrdered size={14} />
            Keyword Fields ({fields.length})
          </span>
          <button
            type="button"
            className="dsw-btn dsw-btn--secondary dsw-btn--sm"
            onClick={handleAddField}
            data-testid="dsw-keywords-fields-add">
            <Plus size={14} />
            Add Field
          </button>
        </div>

        {fields.length === 0 && (
          <div className="dsw-stats-empty" data-testid="dsw-keywords-fields-empty">
            <p>No keyword fields defined yet. Add fields to define the structure of each keyword entry.</p>
          </div>
        )}

        {hasKeyConflict && (
          <div className="dsw-stats-warning" data-testid="dsw-keywords-fields-key-conflict">
            Duplicate keys detected. Each field must have a unique key.
          </div>
        )}

        {fields.map((field, index) => (
          <div className="dsw-fields-field-item" key={field._id} data-testid={`dsw-keywords-field-${index}`}>
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
                    data-testid={`dsw-keywords-field-key-${index}`}
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
                    data-testid={`dsw-keywords-field-label-${index}`}
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
                    data-testid={`dsw-keywords-field-type-${index}`}>
                    {FIELD_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <label className="dsw-fields-required-toggle" data-testid={`dsw-keywords-field-required-${index}`}>
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
                  data-testid={`dsw-keywords-field-move-up-${index}`}>
                  <ChevronUp size={14} />
                </button>
                <button
                  type="button"
                  className="dsw-stats-action-btn"
                  onClick={() => handleMoveDown(index)}
                  disabled={index === fields.length - 1}
                  aria-label={`Move ${field.label || field.key} down`}
                  data-testid={`dsw-keywords-field-move-down-${index}`}>
                  <ChevronDown size={14} />
                </button>
                <button
                  type="button"
                  className="dsw-stats-action-btn dsw-stats-action-btn--danger"
                  onClick={() => handleRemoveField(index)}
                  aria-label={`Remove ${field.label || field.key}`}
                  data-testid={`dsw-keywords-field-remove-${index}`}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {field.type === "enum" && (
              <div className="dsw-fields-enum-options" data-testid={`dsw-keywords-field-enum-options-${index}`}>
                <div className="dsw-fields-enum-header">
                  <span className="dsw-fields-enum-title">Choice Options ({(field.options || []).length})</span>
                  <button
                    type="button"
                    className="dsw-btn dsw-btn--secondary dsw-btn--xs"
                    onClick={() => handleAddEnumOption(index)}
                    data-testid={`dsw-keywords-field-enum-add-${index}`}>
                    <Plus size={12} />
                    Add Option
                  </button>
                </div>

                {(field.options || []).length === 0 && (
                  <div className="dsw-fields-enum-empty" data-testid={`dsw-keywords-field-enum-empty-${index}`}>
                    No options defined yet. Add the allowed values for this field.
                  </div>
                )}

                {(field.options || []).map((option, optIndex) => (
                  <div
                    className="dsw-fields-enum-option-row"
                    key={`enum-${index}-${optIndex}`}
                    data-testid={`dsw-keywords-field-enum-option-${index}-${optIndex}`}>
                    <input
                      className="dsw-form-input dsw-fields-enum-input"
                      type="text"
                      value={option}
                      onChange={(e) => handleEnumOptionChange(index, optIndex, e.target.value)}
                      placeholder={`Option ${optIndex + 1}`}
                      data-testid={`dsw-keywords-field-enum-value-${index}-${optIndex}`}
                    />
                    <button
                      type="button"
                      className="dsw-stats-action-btn dsw-stats-action-btn--danger"
                      onClick={() => handleRemoveEnumOption(index, optIndex)}
                      aria-label={`Remove option ${option || optIndex + 1}`}
                      data-testid={`dsw-keywords-field-enum-remove-${index}-${optIndex}`}>
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
