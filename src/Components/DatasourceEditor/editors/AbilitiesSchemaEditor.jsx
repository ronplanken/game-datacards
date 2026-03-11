import React from "react";
import { Sparkles, Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { Section, CompactInput } from "../components";

const FORMAT_OPTIONS = [
  { value: "name-only", label: "Name Only" },
  { value: "name-description", label: "Name + Description" },
];

/**
 * Editor for ability category definitions.
 * Editable category list (key, label, format dropdown),
 * hasInvulnerableSave/hasDamagedAbility toggles.
 */
export const AbilitiesSchemaEditor = ({ schema, onChange }) => {
  const abilities = schema?.abilities;
  if (!abilities) return null;

  const categories = abilities.categories || [];

  const updateAbilities = (updates) => {
    onChange({ ...schema, abilities: { ...abilities, ...updates } });
  };

  const updateCategory = (index, key, value) => {
    const updated = categories.map((c, i) => (i === index ? { ...c, [key]: value } : c));
    updateAbilities({ categories: updated });
  };

  const addCategory = () => {
    const nextNum = categories.length + 1;
    const newCategory = {
      key: `category_${nextNum}`,
      label: `Category ${nextNum}`,
      format: "name-description",
    };
    updateAbilities({ categories: [...categories, newCategory] });
  };

  const removeCategory = (index) => {
    updateAbilities({ categories: categories.filter((_, i) => i !== index) });
  };

  const moveCategory = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= categories.length) return;
    const updated = [...categories];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    updateAbilities({ categories: updated });
  };

  return (
    <Section title="Abilities" icon={Sparkles} defaultOpen={true}>
      <label className="props-checkbox">
        <input
          type="checkbox"
          checked={!!abilities.hasInvulnerableSave}
          onChange={() => updateAbilities({ hasInvulnerableSave: !abilities.hasInvulnerableSave })}
        />
        <span>Include invulnerable save</span>
      </label>
      <label className="props-checkbox">
        <input
          type="checkbox"
          checked={!!abilities.hasDamagedAbility}
          onChange={() => updateAbilities({ hasDamagedAbility: !abilities.hasDamagedAbility })}
        />
        <span>Include damaged ability</span>
      </label>

      <div className="props-field-list">
        {categories.length === 0 && <div className="props-field-list-empty">No categories defined yet</div>}
        {categories.map((category, index) => (
          <div key={category.key + "-" + index} className="props-field-item">
            <div className="props-field-item-inputs">
              <CompactInput
                label="Key"
                type="text"
                value={category.key}
                onChange={(val) => updateCategory(index, "key", val)}
              />
              <CompactInput
                label="Label"
                type="text"
                value={category.label}
                onChange={(val) => updateCategory(index, "label", val)}
              />
              <div className="props-compact-input">
                <span className="props-compact-label">Format</span>
                <select
                  className="props-compact-field"
                  value={category.format}
                  onChange={(e) => updateCategory(index, "format", e.target.value)}
                  aria-label="Format">
                  {FORMAT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="props-field-item-actions">
              <button
                className="designer-layer-action-btn"
                onClick={() => moveCategory(index, -1)}
                disabled={index === 0}
                aria-label={`Move ${category.label} up`}
                title="Move up">
                <ChevronUp size={14} />
              </button>
              <button
                className="designer-layer-action-btn"
                onClick={() => moveCategory(index, 1)}
                disabled={index === categories.length - 1}
                aria-label={`Move ${category.label} down`}
                title="Move down">
                <ChevronDown size={14} />
              </button>
              <button
                className="designer-layer-action-btn danger"
                onClick={() => removeCategory(index)}
                aria-label={`Remove ${category.label}`}
                title="Remove category">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className="designer-btn designer-btn-sm" onClick={addCategory} aria-label="Add category">
        <Plus size={14} />
        Add Category
      </button>
    </Section>
  );
};
