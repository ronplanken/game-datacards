import React, { useCallback, useMemo, useState } from "react";
import { Plus, Trash2, ChevronUp, ChevronDown, Crosshair } from "lucide-react";
import { IconKey, IconTag } from "@tabler/icons-react";
import { Tooltip } from "../../Tooltip/Tooltip";

/**
 * Default weapon types structure for new wizard sessions.
 */
const DEFAULT_WEAPON_TYPES = {
  label: "Weapon Types",
  allowMultiple: true,
  types: [],
};

/**
 * Generate a unique key for a new weapon type, avoiding collisions with existing keys.
 *
 * @param {Array} existingTypes - Current weapon type definitions
 * @returns {string} A unique key like "weapon1", "weapon2", etc.
 */
const generateUniqueTypeKey = (existingTypes) => {
  const existingKeys = new Set(existingTypes.map((t) => t.key));
  let counter = existingTypes.length + 1;
  while (existingKeys.has(`weapon${counter}`)) {
    counter++;
  }
  return `weapon${counter}`;
};

/**
 * Generate a unique key for a new column, avoiding collisions with existing keys.
 *
 * @param {Array} existingColumns - Current column definitions
 * @returns {string} A unique key like "col1", "col2", etc.
 */
const generateUniqueColumnKey = (existingColumns) => {
  const existingKeys = new Set(existingColumns.map((c) => c.key));
  let counter = existingColumns.length + 1;
  while (existingKeys.has(`col${counter}`)) {
    counter++;
  }
  return `col${counter}`;
};

/**
 * StepWeapons - Configure weapon types and their columns for a unit card type.
 * Provides a tabbed interface per weapon type, with editable column lists per tab,
 * add/remove weapon types, and hasKeywords/hasProfiles toggles per type.
 *
 * @param {Object} props
 * @param {Object} props.wizard - Wizard state from useDatasourceWizard
 */
export const StepWeapons = ({ wizard }) => {
  const data = wizard.stepData["weapons"] || {};
  const weaponTypes = data.weaponTypes || DEFAULT_WEAPON_TYPES;
  const types = weaponTypes.types || [];

  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const updateWeaponTypes = useCallback(
    (updater) => {
      wizard.updateStepData("weapons", (prev) => {
        const current = prev?.weaponTypes || DEFAULT_WEAPON_TYPES;
        const newVal = typeof updater === "function" ? updater(current) : updater;
        return { ...prev, weaponTypes: newVal };
      });
    },
    [wizard],
  );

  const handleAddType = useCallback(() => {
    updateWeaponTypes((prev) => {
      const currentTypes = prev.types || [];
      const newKey = generateUniqueTypeKey(currentTypes);
      const newType = {
        key: newKey,
        label: `Weapon Type ${currentTypes.length + 1}`,
        hasKeywords: false,
        hasProfiles: false,
        columns: [],
      };
      return { ...prev, types: [...currentTypes, newType] };
    });
    setActiveTabIndex(types.length);
  }, [updateWeaponTypes, types.length]);

  const handleRemoveType = useCallback(
    (index) => {
      updateWeaponTypes((prev) => {
        const newTypes = prev.types.filter((_, i) => i !== index);
        return { ...prev, types: newTypes };
      });
      setActiveTabIndex((prev) => {
        if (prev >= types.length - 1) return Math.max(0, types.length - 2);
        if (prev > index) return prev - 1;
        return prev;
      });
    },
    [updateWeaponTypes, types.length],
  );

  const handleTypeKeyChange = useCallback(
    (index, value) => {
      updateWeaponTypes((prev) => {
        const newTypes = prev.types.map((t, i) => (i === index ? { ...t, key: value } : t));
        return { ...prev, types: newTypes };
      });
    },
    [updateWeaponTypes],
  );

  const handleTypeLabelChange = useCallback(
    (index, value) => {
      updateWeaponTypes((prev) => {
        const newTypes = prev.types.map((t, i) => (i === index ? { ...t, label: value } : t));
        return { ...prev, types: newTypes };
      });
    },
    [updateWeaponTypes],
  );

  const handleToggleKeywords = useCallback(
    (index) => {
      updateWeaponTypes((prev) => {
        const newTypes = prev.types.map((t, i) => (i === index ? { ...t, hasKeywords: !t.hasKeywords } : t));
        return { ...prev, types: newTypes };
      });
    },
    [updateWeaponTypes],
  );

  const handleToggleProfiles = useCallback(
    (index) => {
      updateWeaponTypes((prev) => {
        const newTypes = prev.types.map((t, i) => (i === index ? { ...t, hasProfiles: !t.hasProfiles } : t));
        return { ...prev, types: newTypes };
      });
    },
    [updateWeaponTypes],
  );

  const handleAddColumn = useCallback(
    (typeIndex) => {
      updateWeaponTypes((prev) => {
        const newTypes = prev.types.map((t, i) => {
          if (i !== typeIndex) return t;
          const currentColumns = t.columns || [];
          const newKey = generateUniqueColumnKey(currentColumns);
          const newColumn = {
            key: newKey,
            label: newKey.toUpperCase(),
            type: "string",
            required: true,
          };
          return { ...t, columns: [...currentColumns, newColumn] };
        });
        return { ...prev, types: newTypes };
      });
    },
    [updateWeaponTypes],
  );

  const handleRemoveColumn = useCallback(
    (typeIndex, colIndex) => {
      updateWeaponTypes((prev) => {
        const newTypes = prev.types.map((t, i) => {
          if (i !== typeIndex) return t;
          return { ...t, columns: t.columns.filter((_, ci) => ci !== colIndex) };
        });
        return { ...prev, types: newTypes };
      });
    },
    [updateWeaponTypes],
  );

  const handleColumnKeyChange = useCallback(
    (typeIndex, colIndex, value) => {
      updateWeaponTypes((prev) => {
        const newTypes = prev.types.map((t, i) => {
          if (i !== typeIndex) return t;
          const newColumns = t.columns.map((c, ci) => (ci === colIndex ? { ...c, key: value } : c));
          return { ...t, columns: newColumns };
        });
        return { ...prev, types: newTypes };
      });
    },
    [updateWeaponTypes],
  );

  const handleColumnLabelChange = useCallback(
    (typeIndex, colIndex, value) => {
      updateWeaponTypes((prev) => {
        const newTypes = prev.types.map((t, i) => {
          if (i !== typeIndex) return t;
          const newColumns = t.columns.map((c, ci) => (ci === colIndex ? { ...c, label: value } : c));
          return { ...t, columns: newColumns };
        });
        return { ...prev, types: newTypes };
      });
    },
    [updateWeaponTypes],
  );

  const handleMoveColumnUp = useCallback(
    (typeIndex, colIndex) => {
      if (colIndex === 0) return;
      updateWeaponTypes((prev) => {
        const newTypes = prev.types.map((t, i) => {
          if (i !== typeIndex) return t;
          const newColumns = [...t.columns];
          [newColumns[colIndex - 1], newColumns[colIndex]] = [newColumns[colIndex], newColumns[colIndex - 1]];
          return { ...t, columns: newColumns };
        });
        return { ...prev, types: newTypes };
      });
    },
    [updateWeaponTypes],
  );

  const handleMoveColumnDown = useCallback(
    (typeIndex, colIndex) => {
      updateWeaponTypes((prev) => {
        const newTypes = prev.types.map((t, i) => {
          if (i !== typeIndex) return t;
          if (colIndex >= t.columns.length - 1) return t;
          const newColumns = [...t.columns];
          [newColumns[colIndex], newColumns[colIndex + 1]] = [newColumns[colIndex + 1], newColumns[colIndex]];
          return { ...t, columns: newColumns };
        });
        return { ...prev, types: newTypes };
      });
    },
    [updateWeaponTypes],
  );

  const activeType = types[activeTabIndex] || null;

  const hasTypeKeyConflict = useMemo(() => {
    const keys = types.map((t) => t.key).filter(Boolean);
    return new Set(keys).size !== keys.length;
  }, [types]);

  const hasColumnKeyConflict = useMemo(() => {
    if (!activeType) return false;
    const keys = (activeType.columns || []).map((c) => c.key).filter(Boolean);
    return new Set(keys).size !== keys.length;
  }, [activeType]);

  return (
    <div className="dsw-step-weapons" data-testid="dsw-step-weapons">
      <h2 className="dsw-step-title">Weapon Types</h2>
      <p className="dsw-step-description">
        Define weapon categories and their column definitions. Each weapon type has its own table layout on the card.
      </p>

      <div className="dsw-weapons-tabs" data-testid="dsw-weapons-tabs">
        <div className="dsw-weapons-tab-bar">
          {types.map((type, index) => (
            <button
              key={`${type.key}-${index}`}
              type="button"
              className={`dsw-weapons-tab ${index === activeTabIndex ? "dsw-weapons-tab--active" : ""}`}
              onClick={() => setActiveTabIndex(index)}
              data-testid={`dsw-weapons-tab-${index}`}>
              <span className="dsw-weapons-tab-label">{type.label || type.key}</span>
              <span
                className="dsw-weapons-tab-remove"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveType(index);
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemoveType(index);
                  }
                }}
                aria-label={`Remove ${type.label || type.key}`}
                data-testid={`dsw-weapons-tab-remove-${index}`}>
                <Trash2 size={12} />
              </span>
            </button>
          ))}
          <button
            type="button"
            className="dsw-btn dsw-btn--secondary dsw-btn--sm"
            onClick={handleAddType}
            data-testid="dsw-weapons-add-type">
            <Plus size={14} />
            Add Type
          </button>
        </div>

        {hasTypeKeyConflict && (
          <div className="dsw-stats-warning" data-testid="dsw-weapons-type-key-conflict">
            Duplicate weapon type keys detected. Each weapon type must have a unique key.
          </div>
        )}

        {types.length === 0 && (
          <div className="dsw-stats-empty" data-testid="dsw-weapons-empty">
            <p>No weapon types defined yet. Add a weapon type to configure its columns.</p>
          </div>
        )}

        {activeType && (
          <div className="dsw-weapons-type-panel" data-testid="dsw-weapons-type-panel">
            <div className="dsw-form-fields">
              <div className="dsw-form-field">
                <label className="dsw-form-label">Key</label>
                <input
                  className="dsw-form-input"
                  type="text"
                  value={activeType.key}
                  onChange={(e) => handleTypeKeyChange(activeTabIndex, e.target.value)}
                  placeholder="e.g. ranged, melee"
                  data-testid="dsw-weapons-type-key"
                />
              </div>
              <div className="dsw-form-field">
                <label className="dsw-form-label">Label</label>
                <input
                  className="dsw-form-input"
                  type="text"
                  value={activeType.label}
                  onChange={(e) => handleTypeLabelChange(activeTabIndex, e.target.value)}
                  placeholder="e.g. Ranged Weapons"
                  data-testid="dsw-weapons-type-label"
                />
              </div>
            </div>

            <div className="dsw-weapons-toggles">
              <label className="dsw-toggle-row">
                <input
                  type="checkbox"
                  className="dsw-toggle-checkbox"
                  checked={activeType.hasKeywords}
                  onChange={() => handleToggleKeywords(activeTabIndex)}
                  data-testid="dsw-weapons-has-keywords"
                />
                <span className="dsw-toggle-label">Has Keywords</span>
                <span className="dsw-toggle-hint">Weapons can have keyword tags (e.g. Rapid Fire, Assault).</span>
              </label>
              <label className="dsw-toggle-row">
                <input
                  type="checkbox"
                  className="dsw-toggle-checkbox"
                  checked={activeType.hasProfiles}
                  onChange={() => handleToggleProfiles(activeTabIndex)}
                  data-testid="dsw-weapons-has-profiles"
                />
                <span className="dsw-toggle-label">Has Profiles</span>
                <span className="dsw-toggle-hint">
                  Weapons can have multiple profiles (e.g. standard and overcharge).
                </span>
              </label>
            </div>

            <div className="dsw-stats-fields" data-testid="dsw-weapons-column-list">
              <div className="dsw-stats-fields-header">
                <span className="dsw-stats-fields-title">
                  <Crosshair size={14} />
                  Columns ({(activeType.columns || []).length})
                </span>
                <button
                  type="button"
                  className="dsw-btn dsw-btn--secondary dsw-btn--sm"
                  onClick={() => handleAddColumn(activeTabIndex)}
                  data-testid="dsw-weapons-add-column">
                  <Plus size={14} />
                  Add Column
                </button>
              </div>

              {hasColumnKeyConflict && (
                <div className="dsw-stats-warning" data-testid="dsw-weapons-col-key-conflict">
                  Duplicate column keys detected. Each column must have a unique key.
                </div>
              )}

              {(activeType.columns || []).length === 0 && (
                <div className="dsw-stats-empty" data-testid="dsw-weapons-columns-empty">
                  <p>No columns defined yet. Add columns to define the weapon table layout.</p>
                </div>
              )}

              {(activeType.columns || []).map((col, colIndex) => (
                <div
                  className="dsw-stats-field-row"
                  key={`${col.key}-${colIndex}`}
                  data-testid={`dsw-weapons-col-${colIndex}`}>
                  <span className="dsw-stats-field-order">{colIndex + 1}</span>

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
                        value={col.key}
                        onChange={(e) => handleColumnKeyChange(activeTabIndex, colIndex, e.target.value)}
                        placeholder="key"
                        data-testid={`dsw-weapons-col-key-${colIndex}`}
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
                        value={col.label}
                        onChange={(e) => handleColumnLabelChange(activeTabIndex, colIndex, e.target.value)}
                        placeholder="Label"
                        data-testid={`dsw-weapons-col-label-${colIndex}`}
                      />
                    </div>
                  </div>

                  <div className="dsw-stats-field-actions">
                    <button
                      type="button"
                      className="dsw-stats-action-btn"
                      onClick={() => handleMoveColumnUp(activeTabIndex, colIndex)}
                      disabled={colIndex === 0}
                      aria-label={`Move ${col.label || col.key} up`}
                      data-testid={`dsw-weapons-col-move-up-${colIndex}`}>
                      <ChevronUp size={14} />
                    </button>
                    <button
                      type="button"
                      className="dsw-stats-action-btn"
                      onClick={() => handleMoveColumnDown(activeTabIndex, colIndex)}
                      disabled={colIndex === (activeType.columns || []).length - 1}
                      aria-label={`Move ${col.label || col.key} down`}
                      data-testid={`dsw-weapons-col-move-down-${colIndex}`}>
                      <ChevronDown size={14} />
                    </button>
                    <button
                      type="button"
                      className="dsw-stats-action-btn dsw-stats-action-btn--danger"
                      onClick={() => handleRemoveColumn(activeTabIndex, colIndex)}
                      aria-label={`Remove ${col.label || col.key}`}
                      data-testid={`dsw-weapons-col-remove-${colIndex}`}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
