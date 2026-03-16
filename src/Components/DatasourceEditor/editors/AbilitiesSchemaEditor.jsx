import React from "react";
import { nanoid } from "nanoid";
import { Sparkles, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { IconKey, IconTag, IconTemplate, IconHeading, IconClock, IconPalette, IconColumns } from "@tabler/icons-react";
import { Section, CompactInput } from "../components";
import { Tooltip } from "../../Tooltip/Tooltip";
import { ensureIds } from "./editorUtils";

const FORMAT_OPTIONS = [
  { value: "name-only", label: "Name Only" },
  { value: "name-description", label: "Name + Description" },
];

/**
 * Editor for ability category definitions.
 * Editable category list (key, label, format dropdown, optional header).
 */
export const AbilitiesSchemaEditor = ({ schema, onChange, baseSystem }) => {
  const abilities = schema?.abilities;
  if (!abilities) return null;

  const categories = ensureIds(abilities.categories);

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
      _id: nanoid(),
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
    <Section title="Abilities" icon={Sparkles} defaultOpen={true} onAdd={addCategory} addLabel="Add category">
      <div className="props-field-list">
        {categories.length === 0 && <div className="props-field-list-empty">No categories yet</div>}
        {categories.map((category, index) => (
          <div key={category._id} className="props-field-item">
            <div className="props-field-item-inputs">
              <CompactInput
                label={<IconKey size={10} stroke={1.5} />}
                ariaLabel="Key"
                tooltip="Key"
                type="text"
                value={category.key}
                onChange={(val) => updateCategory(index, "key", val)}
              />
              <CompactInput
                label={<IconTag size={10} stroke={1.5} />}
                ariaLabel="Label"
                tooltip="Label"
                type="text"
                value={category.label}
                onChange={(val) => updateCategory(index, "label", val)}
              />
              <div className="props-compact-input">
                <Tooltip content="Format" placement="top">
                  <span className="props-compact-label">
                    <IconTemplate size={10} stroke={1.5} />
                  </span>
                </Tooltip>
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
              <div className="props-compact-input">
                <Tooltip content="Layout" placement="top">
                  <span className="props-compact-label">
                    <IconColumns size={10} stroke={1.5} />
                  </span>
                </Tooltip>
                <select
                  className="props-compact-field"
                  value={category.layout || "full"}
                  onChange={(e) =>
                    updateCategory(index, "layout", e.target.value === "full" ? undefined : e.target.value)
                  }
                  aria-label="Layout">
                  <option value="full">Full Width</option>
                  <option value="half">50%</option>
                  <option value="third">33%</option>
                  <option value="quarter">25%</option>
                </select>
              </div>
              <CompactInput
                label={<IconHeading size={10} stroke={1.5} />}
                ariaLabel="Header"
                tooltip="Header"
                type="text"
                value={category.header || ""}
                onChange={(val) => updateCategory(index, "header", val || undefined)}
              />
              {baseSystem !== "40k-10e" && (
                <div className="props-compact-row-2col">
                  <CompactInput
                    label={<IconClock size={10} stroke={1.5} />}
                    ariaLabel="Phase"
                    tooltip="Enable phase text per ability"
                    type="toggle"
                    value={!!category.hasPhase}
                    onChange={(val) => updateCategory(index, "hasPhase", val)}
                  />
                  <CompactInput
                    label={<IconPalette size={10} stroke={1.5} />}
                    ariaLabel="Banner color"
                    tooltip="Enable per-ability banner color"
                    type="toggle"
                    value={!!category.hasColor}
                    onChange={(val) => updateCategory(index, "hasColor", val)}
                  />
                </div>
              )}
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
    </Section>
  );
};
