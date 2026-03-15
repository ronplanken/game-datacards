import React from "react";
import { nanoid } from "nanoid";
import { LayoutList, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { IconKey, IconTag, IconTemplate } from "@tabler/icons-react";
import { Section, CompactInput } from "../components";
import { Tooltip } from "../../Tooltip/Tooltip";
import { ensureIds } from "./editorUtils";

const FORMAT_OPTIONS = [
  { value: "list", label: "List" },
  { value: "richtext", label: "Rich Text" },
];

/**
 * Editor for unit section definitions.
 * Allows add/remove/reorder sections with key, label, and format.
 */
export const SectionsSchemaEditor = ({ schema, onChange }) => {
  const sectionsData = schema?.sections;
  const sections = ensureIds(sectionsData?.sections);

  const updateSections = (updatedSections) => {
    onChange({
      ...schema,
      sections: {
        ...sectionsData,
        label: sectionsData?.label || "Sections",
        sections: updatedSections,
      },
    });
  };

  const updateSection = (index, key, value) => {
    const updated = sections.map((s, i) => (i === index ? { ...s, [key]: value } : s));
    updateSections(updated);
  };

  const addSection = () => {
    const nextNum = sections.length + 1;
    const newSection = {
      _id: nanoid(),
      key: `section_${nextNum}`,
      label: `Section ${nextNum}`,
      format: "list",
    };
    updateSections([...sections, newSection]);
  };

  const removeSection = (index) => {
    updateSections(sections.filter((_, i) => i !== index));
  };

  const moveSection = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sections.length) return;
    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    updateSections(updated);
  };

  return (
    <Section title="Sections" icon={LayoutList} defaultOpen={true} onAdd={addSection} addLabel="Add section">
      <div className="props-field-list">
        {sections.length === 0 && <div className="props-field-list-empty">No sections yet</div>}
        {sections.map((section, index) => (
          <div key={section._id} className="props-field-item">
            <div className="props-field-item-inputs">
              <CompactInput
                label={<IconKey size={10} stroke={1.5} />}
                ariaLabel="Key"
                tooltip="Key"
                type="text"
                value={section.key}
                onChange={(val) => updateSection(index, "key", val)}
              />
              <CompactInput
                label={<IconTag size={10} stroke={1.5} />}
                ariaLabel="Label"
                tooltip="Label"
                type="text"
                value={section.label}
                onChange={(val) => updateSection(index, "label", val)}
              />
              <div className="props-compact-input">
                <Tooltip content="Format" placement="top">
                  <span className="props-compact-label">
                    <IconTemplate size={10} stroke={1.5} />
                  </span>
                </Tooltip>
                <select
                  className="props-compact-field"
                  value={section.format}
                  onChange={(e) => updateSection(index, "format", e.target.value)}
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
                onClick={() => moveSection(index, -1)}
                disabled={index === 0}
                aria-label={`Move ${section.label} up`}
                title="Move up">
                <ChevronUp size={14} />
              </button>
              <button
                className="designer-layer-action-btn"
                onClick={() => moveSection(index, 1)}
                disabled={index === sections.length - 1}
                aria-label={`Move ${section.label} down`}
                title="Move down">
                <ChevronDown size={14} />
              </button>
              <button
                className="designer-layer-action-btn danger"
                onClick={() => removeSection(index)}
                aria-label={`Remove ${section.label}`}
                title="Remove section">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
};
