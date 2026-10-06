import React, { useCallback, useMemo } from "react";
import { nanoid } from "nanoid";
import { Plus, Trash2, ChevronUp, ChevronDown, Layers } from "lucide-react";
import { IconKey, IconTag, IconTemplate, IconHeading } from "@tabler/icons-react";
import { Tooltip } from "../../Tooltip/Tooltip";
import { ensureIds } from "../../DatasourceEditor/editors/editorUtils";

/**
 * Default abilities structure for new wizard sessions.
 */
const DEFAULT_ABILITIES = {
  label: "Abilities",
  categories: [],
};

/**
 * Available format options for ability categories.
 */
const FORMAT_OPTIONS = [
  { value: "name-only", label: "Name only" },
  { value: "name-description", label: "Name + Description" },
];

/**
 * Generate a unique key for a new ability category, avoiding collisions with existing keys.
 *
 * @param {Array} existingCategories - Current category definitions
 * @returns {string} A unique key like "category1", "category2", etc.
 */
const generateUniqueKey = (existingCategories) => {
  const existingKeys = new Set(existingCategories.map((c) => c.key));
  let counter = existingCategories.length + 1;
  while (existingKeys.has(`category${counter}`)) {
    counter++;
  }
  return `category${counter}`;
};

/**
 * StepAbilities - Configure ability categories for a unit card type.
 * Provides an editable category list with format selection (name-only / name-description),
 * and toggles for invulnerable save and damaged ability features.
 *
 * @param {Object} props
 * @param {Object} props.wizard - Wizard state from useDatasourceWizard
 */
export const StepAbilities = ({ wizard }) => {
  const data = wizard.stepData["abilities"] || {};
  const abilities = data.abilities || DEFAULT_ABILITIES;
  const categories = ensureIds(abilities.categories);

  const updateAbilities = useCallback(
    (updater) => {
      wizard.updateStepData("abilities", (prev) => {
        const currentAbilities = prev?.abilities || DEFAULT_ABILITIES;
        const newAbilities = typeof updater === "function" ? updater(currentAbilities) : updater;
        return { ...prev, abilities: newAbilities };
      });
    },
    [wizard],
  );

  const handleAddCategory = useCallback(() => {
    updateAbilities((prev) => {
      const currentCategories = prev.categories || [];
      const newKey = generateUniqueKey(currentCategories);
      const newCategory = {
        _id: nanoid(),
        key: newKey,
        label: `Category ${currentCategories.length + 1}`,
        format: "name-description",
      };
      return { ...prev, categories: [...currentCategories, newCategory] };
    });
  }, [updateAbilities]);

  const handleRemoveCategory = useCallback(
    (index) => {
      updateAbilities((prev) => {
        const newCategories = prev.categories.filter((_, i) => i !== index);
        return { ...prev, categories: newCategories };
      });
    },
    [updateAbilities],
  );

  const handleCategoryKeyChange = useCallback(
    (index, value) => {
      updateAbilities((prev) => {
        const newCategories = prev.categories.map((c, i) => (i === index ? { ...c, key: value } : c));
        return { ...prev, categories: newCategories };
      });
    },
    [updateAbilities],
  );

  const handleCategoryLabelChange = useCallback(
    (index, value) => {
      updateAbilities((prev) => {
        const newCategories = prev.categories.map((c, i) => (i === index ? { ...c, label: value } : c));
        return { ...prev, categories: newCategories };
      });
    },
    [updateAbilities],
  );

  const handleCategoryFormatChange = useCallback(
    (index, value) => {
      updateAbilities((prev) => {
        const newCategories = prev.categories.map((c, i) => (i === index ? { ...c, format: value } : c));
        return { ...prev, categories: newCategories };
      });
    },
    [updateAbilities],
  );

  const handleCategoryHeaderChange = useCallback(
    (index, value) => {
      updateAbilities((prev) => {
        const newCategories = prev.categories.map((c, i) => (i === index ? { ...c, header: value || undefined } : c));
        return { ...prev, categories: newCategories };
      });
    },
    [updateAbilities],
  );

  const handleMoveUp = useCallback(
    (index) => {
      if (index === 0) return;
      updateAbilities((prev) => {
        const newCategories = [...prev.categories];
        [newCategories[index - 1], newCategories[index]] = [newCategories[index], newCategories[index - 1]];
        return { ...prev, categories: newCategories };
      });
    },
    [updateAbilities],
  );

  const handleMoveDown = useCallback(
    (index) => {
      updateAbilities((prev) => {
        if (index >= prev.categories.length - 1) return prev;
        const newCategories = [...prev.categories];
        [newCategories[index], newCategories[index + 1]] = [newCategories[index + 1], newCategories[index]];
        return { ...prev, categories: newCategories };
      });
    },
    [updateAbilities],
  );

  const hasKeyConflict = useMemo(() => {
    const keys = categories.map((c) => c.key).filter(Boolean);
    return new Set(keys).size !== keys.length;
  }, [categories]);

  return (
    <div className="dsw-step-abilities" data-testid="dsw-step-abilities">
      <h2 className="dsw-step-title">Abilities</h2>
      <p className="dsw-step-description">
        Define ability categories and their display format. Each category groups related abilities on the card.
      </p>

      <div className="dsw-stats-fields" data-testid="dsw-abilities-category-list">
        <div className="dsw-stats-fields-header">
          <span className="dsw-stats-fields-title">
            <Layers size={14} />
            Categories ({categories.length})
          </span>
          <button
            type="button"
            className="dsw-btn dsw-btn--secondary dsw-btn--sm"
            onClick={handleAddCategory}
            data-testid="dsw-abilities-add-category">
            <Plus size={14} />
            Add Category
          </button>
        </div>

        {categories.length === 0 && (
          <div className="dsw-stats-empty" data-testid="dsw-abilities-empty">
            <p>No ability categories defined yet. Add categories to group abilities on the card.</p>
          </div>
        )}

        {hasKeyConflict && (
          <div className="dsw-stats-warning" data-testid="dsw-abilities-key-conflict">
            Duplicate keys detected. Each ability category must have a unique key.
          </div>
        )}

        {categories.map((category, index) => (
          <div className="dsw-stats-field-row" key={category._id} data-testid={`dsw-abilities-category-${index}`}>
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
                  value={category.key}
                  onChange={(e) => handleCategoryKeyChange(index, e.target.value)}
                  placeholder="key"
                  data-testid={`dsw-abilities-category-key-${index}`}
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
                  value={category.label}
                  onChange={(e) => handleCategoryLabelChange(index, e.target.value)}
                  placeholder="Label"
                  data-testid={`dsw-abilities-category-label-${index}`}
                />
              </div>
              <div className="dsw-icon-input" style={{ flex: "0 0 auto" }}>
                <Tooltip content="Format" placement="top">
                  <span className="dsw-icon-input-icon">
                    <IconTemplate size={12} />
                  </span>
                </Tooltip>
                <select
                  className="dsw-form-input dsw-abilities-format-select"
                  value={category.format}
                  onChange={(e) => handleCategoryFormatChange(index, e.target.value)}
                  data-testid={`dsw-abilities-category-format-${index}`}>
                  {FORMAT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="dsw-icon-input" style={{ flex: "1 0 100%" }}>
                <Tooltip content="Header" placement="top">
                  <span className="dsw-icon-input-icon">
                    <IconHeading size={12} />
                  </span>
                </Tooltip>
                <input
                  className="dsw-form-input dsw-abilities-header-input"
                  type="text"
                  value={category.header || ""}
                  onChange={(e) => handleCategoryHeaderChange(index, e.target.value)}
                  placeholder="Header (optional)"
                  data-testid={`dsw-abilities-category-header-${index}`}
                />
              </div>
            </div>

            <div className="dsw-stats-field-actions">
              <button
                type="button"
                className="dsw-stats-action-btn"
                onClick={() => handleMoveUp(index)}
                disabled={index === 0}
                aria-label={`Move ${category.label || category.key} up`}
                data-testid={`dsw-abilities-move-up-${index}`}>
                <ChevronUp size={14} />
              </button>
              <button
                type="button"
                className="dsw-stats-action-btn"
                onClick={() => handleMoveDown(index)}
                disabled={index === categories.length - 1}
                aria-label={`Move ${category.label || category.key} down`}
                data-testid={`dsw-abilities-move-down-${index}`}>
                <ChevronDown size={14} />
              </button>
              <button
                type="button"
                className="dsw-stats-action-btn dsw-stats-action-btn--danger"
                onClick={() => handleRemoveCategory(index)}
                aria-label={`Remove ${category.label || category.key}`}
                data-testid={`dsw-abilities-remove-${index}`}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
