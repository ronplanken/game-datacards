import React, { useCallback, useMemo } from "react";
import { Plus, Trash2, ChevronUp, ChevronDown, BarChart3 } from "lucide-react";

/**
 * Default stats structure for new wizard sessions.
 */
const DEFAULT_STATS = {
  label: "Stat Profiles",
  allowMultipleProfiles: false,
  fields: [],
};

/**
 * Generate a unique key for a new stat field, avoiding collisions with existing keys.
 *
 * @param {Array} existingFields - Current field definitions
 * @returns {string} A unique key like "stat1", "stat2", etc.
 */
const generateUniqueKey = (existingFields) => {
  const existingKeys = new Set(existingFields.map((f) => f.key));
  let counter = existingFields.length + 1;
  while (existingKeys.has(`stat${counter}`)) {
    counter++;
  }
  return `stat${counter}`;
};

/**
 * Re-assign displayOrder to all fields based on their array position.
 *
 * @param {Array} fields - Field definitions
 * @returns {Array} Fields with updated displayOrder values (1-based)
 */
const reindexDisplayOrder = (fields) => fields.map((f, i) => ({ ...f, displayOrder: i + 1 }));

/**
 * StepStats - Configure stat profile fields for a unit card type.
 * Provides an editable field list with add/remove/rename, reorder via up/down buttons,
 * automatic displayOrder assignment, and an allowMultipleProfiles toggle.
 *
 * @param {Object} props
 * @param {Object} props.wizard - Wizard state from useDatasourceWizard
 */
export const StepStats = ({ wizard }) => {
  const data = wizard.stepData["stats"] || {};
  const stats = data.stats || DEFAULT_STATS;
  const fields = stats.fields || [];

  const updateStats = useCallback(
    (updater) => {
      wizard.updateStepData("stats", (prev) => {
        const currentStats = prev?.stats || DEFAULT_STATS;
        const newStats = typeof updater === "function" ? updater(currentStats) : updater;
        return { ...prev, stats: newStats };
      });
    },
    [wizard],
  );

  const handleToggleMultipleProfiles = useCallback(() => {
    updateStats((prev) => ({
      ...prev,
      allowMultipleProfiles: !prev.allowMultipleProfiles,
    }));
  }, [updateStats]);

  const handleAddField = useCallback(() => {
    updateStats((prev) => {
      const currentFields = prev.fields || [];
      const newKey = generateUniqueKey(currentFields);
      const newField = {
        key: newKey,
        label: newKey.toUpperCase(),
        type: "string",
        displayOrder: currentFields.length + 1,
      };
      return { ...prev, fields: [...currentFields, newField] };
    });
  }, [updateStats]);

  const handleRemoveField = useCallback(
    (index) => {
      updateStats((prev) => {
        const newFields = prev.fields.filter((_, i) => i !== index);
        return { ...prev, fields: reindexDisplayOrder(newFields) };
      });
    },
    [updateStats],
  );

  const handleFieldKeyChange = useCallback(
    (index, value) => {
      updateStats((prev) => {
        const newFields = prev.fields.map((f, i) => (i === index ? { ...f, key: value } : f));
        return { ...prev, fields: newFields };
      });
    },
    [updateStats],
  );

  const handleFieldLabelChange = useCallback(
    (index, value) => {
      updateStats((prev) => {
        const newFields = prev.fields.map((f, i) => (i === index ? { ...f, label: value } : f));
        return { ...prev, fields: newFields };
      });
    },
    [updateStats],
  );

  const handleMoveUp = useCallback(
    (index) => {
      if (index === 0) return;
      updateStats((prev) => {
        const newFields = [...prev.fields];
        [newFields[index - 1], newFields[index]] = [newFields[index], newFields[index - 1]];
        return { ...prev, fields: reindexDisplayOrder(newFields) };
      });
    },
    [updateStats],
  );

  const handleMoveDown = useCallback(
    (index) => {
      updateStats((prev) => {
        if (index >= prev.fields.length - 1) return prev;
        const newFields = [...prev.fields];
        [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
        return { ...prev, fields: reindexDisplayOrder(newFields) };
      });
    },
    [updateStats],
  );

  const hasKeyConflict = useMemo(() => {
    const keys = fields.map((f) => f.key).filter(Boolean);
    return new Set(keys).size !== keys.length;
  }, [fields]);

  return (
    <div className="dsw-step-stats" data-testid="dsw-step-stats">
      <h2 className="dsw-step-title">Stat Profile Fields</h2>
      <p className="dsw-step-description">
        Define the stat columns that appear on the unit card. Each stat becomes a column header in the stat line.
      </p>

      <div className="dsw-stats-toggle" data-testid="dsw-stats-multi-toggle">
        <label className="dsw-toggle-row">
          <input
            type="checkbox"
            className="dsw-toggle-checkbox"
            checked={stats.allowMultipleProfiles}
            onChange={handleToggleMultipleProfiles}
            data-testid="dsw-stats-allow-multiple"
          />
          <span className="dsw-toggle-label">Allow multiple stat profiles</span>
          <span className="dsw-toggle-hint">
            Enable this if units can have more than one stat line (e.g. different models).
          </span>
        </label>
      </div>

      <div className="dsw-stats-fields" data-testid="dsw-stats-field-list">
        <div className="dsw-stats-fields-header">
          <span className="dsw-stats-fields-title">
            <BarChart3 size={14} />
            Stat Fields ({fields.length})
          </span>
          <button
            type="button"
            className="dsw-btn dsw-btn--secondary dsw-btn--sm"
            onClick={handleAddField}
            data-testid="dsw-stats-add-field">
            <Plus size={14} />
            Add Field
          </button>
        </div>

        {fields.length === 0 && (
          <div className="dsw-stats-empty" data-testid="dsw-stats-empty">
            <p>No stat fields defined yet. Add fields to define the stat line columns.</p>
          </div>
        )}

        {hasKeyConflict && (
          <div className="dsw-stats-warning" data-testid="dsw-stats-key-conflict">
            Duplicate keys detected. Each stat field must have a unique key.
          </div>
        )}

        {fields.map((field, index) => (
          <div className="dsw-stats-field-row" key={`${field.key}-${index}`} data-testid={`dsw-stats-field-${index}`}>
            <span className="dsw-stats-field-order">{field.displayOrder}</span>

            <div className="dsw-stats-field-inputs">
              <input
                className="dsw-form-input dsw-stats-field-key"
                type="text"
                value={field.key}
                onChange={(e) => handleFieldKeyChange(index, e.target.value)}
                placeholder="key"
                data-testid={`dsw-stats-field-key-${index}`}
              />
              <input
                className="dsw-form-input dsw-stats-field-label"
                type="text"
                value={field.label}
                onChange={(e) => handleFieldLabelChange(index, e.target.value)}
                placeholder="Label"
                data-testid={`dsw-stats-field-label-${index}`}
              />
            </div>

            <div className="dsw-stats-field-actions">
              <button
                type="button"
                className="dsw-stats-action-btn"
                onClick={() => handleMoveUp(index)}
                disabled={index === 0}
                aria-label={`Move ${field.label || field.key} up`}
                data-testid={`dsw-stats-move-up-${index}`}>
                <ChevronUp size={14} />
              </button>
              <button
                type="button"
                className="dsw-stats-action-btn"
                onClick={() => handleMoveDown(index)}
                disabled={index === fields.length - 1}
                aria-label={`Move ${field.label || field.key} down`}
                data-testid={`dsw-stats-move-down-${index}`}>
                <ChevronDown size={14} />
              </button>
              <button
                type="button"
                className="dsw-stats-action-btn dsw-stats-action-btn--danger"
                onClick={() => handleRemoveField(index)}
                aria-label={`Remove ${field.label || field.key}`}
                data-testid={`dsw-stats-remove-${index}`}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
