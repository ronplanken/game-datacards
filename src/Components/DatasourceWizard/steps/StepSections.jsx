import React, { useCallback, useMemo } from "react";
import { nanoid } from "nanoid";
import { Plus, Trash2, ChevronUp, ChevronDown, LayoutList } from "lucide-react";
import { IconKey, IconTag, IconTemplate } from "@tabler/icons-react";
import { Tooltip } from "../../Tooltip/Tooltip";
import { ensureIds } from "../../DatasourceEditor/editors/editorUtils";

const DEFAULT_SECTIONS = {
  label: "Sections",
  sections: [],
};

const FORMAT_OPTIONS = [
  { value: "list", label: "List" },
  { value: "richtext", label: "Rich Text" },
];

const generateUniqueKey = (existingSections) => {
  const existingKeys = new Set(existingSections.map((s) => s.key));
  let counter = existingSections.length + 1;
  while (existingKeys.has(`section${counter}`)) {
    counter++;
  }
  return `section${counter}`;
};

/**
 * StepSections - Configure content sections for a unit card type.
 * Sections are content blocks like Wargear Options, Unit Composition, Loadout.
 */
export const StepSections = ({ wizard }) => {
  const data = wizard.stepData["sections"] || {};
  const sectionsData = data.sections || DEFAULT_SECTIONS;
  const sections = ensureIds(sectionsData.sections);

  const updateSections = useCallback(
    (updater) => {
      wizard.updateStepData("sections", (prev) => {
        const current = prev?.sections || DEFAULT_SECTIONS;
        const newSections = typeof updater === "function" ? updater(current) : updater;
        return { ...prev, sections: newSections };
      });
    },
    [wizard],
  );

  const handleAdd = useCallback(() => {
    updateSections((prev) => {
      const current = prev.sections || [];
      const newKey = generateUniqueKey(current);
      return {
        ...prev,
        sections: [...current, { _id: nanoid(), key: newKey, label: `Section ${current.length + 1}`, format: "list" }],
      };
    });
  }, [updateSections]);

  const handleRemove = useCallback(
    (index) => {
      updateSections((prev) => ({
        ...prev,
        sections: prev.sections.filter((_, i) => i !== index),
      }));
    },
    [updateSections],
  );

  const handleFieldChange = useCallback(
    (index, field, value) => {
      updateSections((prev) => ({
        ...prev,
        sections: prev.sections.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
      }));
    },
    [updateSections],
  );

  const handleMoveUp = useCallback(
    (index) => {
      if (index === 0) return;
      updateSections((prev) => {
        const newSections = [...prev.sections];
        [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
        return { ...prev, sections: newSections };
      });
    },
    [updateSections],
  );

  const handleMoveDown = useCallback(
    (index) => {
      updateSections((prev) => {
        if (index >= prev.sections.length - 1) return prev;
        const newSections = [...prev.sections];
        [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
        return { ...prev, sections: newSections };
      });
    },
    [updateSections],
  );

  const hasKeyConflict = useMemo(() => {
    const keys = sections.map((s) => s.key).filter(Boolean);
    return new Set(keys).size !== keys.length;
  }, [sections]);

  return (
    <div className="dsw-step-sections" data-testid="dsw-step-sections">
      <h2 className="dsw-step-title">Sections</h2>
      <p className="dsw-step-description">
        Define content sections for unit cards. Sections are blocks like Wargear Options, Unit Composition, or Loadout.
      </p>

      <div className="dsw-stats-fields" data-testid="dsw-sections-list">
        <div className="dsw-stats-fields-header">
          <span className="dsw-stats-fields-title">
            <LayoutList size={14} />
            Sections ({sections.length})
          </span>
          <button
            type="button"
            className="dsw-btn dsw-btn--secondary dsw-btn--sm"
            onClick={handleAdd}
            data-testid="dsw-sections-add">
            <Plus size={14} />
            Add Section
          </button>
        </div>

        {sections.length === 0 && (
          <div className="dsw-stats-empty" data-testid="dsw-sections-empty">
            <p>No sections defined yet. Add sections for content blocks on the card.</p>
          </div>
        )}

        {hasKeyConflict && (
          <div className="dsw-stats-warning" data-testid="dsw-sections-key-conflict">
            Duplicate keys detected. Each section must have a unique key.
          </div>
        )}

        {sections.map((section, index) => (
          <div className="dsw-stats-field-row" key={section._id} data-testid={`dsw-sections-item-${index}`}>
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
                  value={section.key}
                  onChange={(e) => handleFieldChange(index, "key", e.target.value)}
                  placeholder="key"
                  data-testid={`dsw-sections-key-${index}`}
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
                  value={section.label}
                  onChange={(e) => handleFieldChange(index, "label", e.target.value)}
                  placeholder="Label"
                  data-testid={`dsw-sections-label-${index}`}
                />
              </div>
              <div className="dsw-icon-input" style={{ flex: "0 0 auto" }}>
                <Tooltip content="Format" placement="top">
                  <span className="dsw-icon-input-icon">
                    <IconTemplate size={12} />
                  </span>
                </Tooltip>
                <select
                  className="dsw-form-input dsw-sections-format-select"
                  value={section.format}
                  onChange={(e) => handleFieldChange(index, "format", e.target.value)}
                  data-testid={`dsw-sections-format-${index}`}>
                  {FORMAT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="dsw-stats-field-actions">
              <button
                type="button"
                className="dsw-stats-action-btn"
                onClick={() => handleMoveUp(index)}
                disabled={index === 0}
                aria-label={`Move ${section.label || section.key} up`}
                data-testid={`dsw-sections-move-up-${index}`}>
                <ChevronUp size={14} />
              </button>
              <button
                type="button"
                className="dsw-stats-action-btn"
                onClick={() => handleMoveDown(index)}
                disabled={index === sections.length - 1}
                aria-label={`Move ${section.label || section.key} down`}
                data-testid={`dsw-sections-move-down-${index}`}>
                <ChevronDown size={14} />
              </button>
              <button
                type="button"
                className="dsw-stats-action-btn dsw-stats-action-btn--danger"
                onClick={() => handleRemove(index)}
                aria-label={`Remove ${section.label || section.key}`}
                data-testid={`dsw-sections-remove-${index}`}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
