import React from "react";
import { nanoid } from "nanoid";
import { BarChart3, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import {
  IconKey,
  IconTag,
  IconCategory,
  IconList,
  IconArrowsHorizontal,
  IconPalette,
  IconSparkles,
  IconEyeOff,
  IconCopy,
  IconLayoutBottombar,
} from "@tabler/icons-react";
import { Section, CompactInput } from "../components";
import { Tooltip } from "../../Tooltip/Tooltip";
import { ensureIds } from "./editorUtils";

const FIELD_TYPES = [
  { value: "string", label: "Text" },
  { value: "enum", label: "Enum" },
  { value: "boolean", label: "Boolean" },
];

/**
 * Editor for unit stat field definitions.
 * Allows add/remove/reorder stat fields and toggling allowMultipleProfiles.
 */
export const StatsSchemaEditor = ({ schema, onChange, baseSystem }) => {
  const stats = schema?.stats;
  if (!stats) return null;

  const fields = ensureIds(stats.fields);

  const updateStats = (updatedStats) => {
    onChange({ ...schema, stats: { ...stats, ...updatedStats } });
  };

  const updateField = (index, key, value) => {
    const updated = fields.map((f, i) => (i === index ? { ...f, [key]: value } : f));
    updateStats({ fields: updated });
  };

  const addField = () => {
    const nextOrder = fields.length > 0 ? Math.max(...fields.map((f) => f.displayOrder || 0)) + 1 : 1;
    const newField = {
      _id: nanoid(),
      key: `stat_${nextOrder}`,
      label: `Stat ${nextOrder}`,
      type: "string",
      displayOrder: nextOrder,
    };
    updateStats({ fields: [...fields, newField] });
  };

  const removeField = (index) => {
    const updated = fields.filter((_, i) => i !== index);
    updateStats({ fields: updated });
  };

  const moveField = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= fields.length) return;
    const updated = [...fields];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    // Reassign display orders based on new positions
    const reordered = updated.map((f, i) => ({ ...f, displayOrder: i + 1 }));
    updateStats({ fields: reordered });
  };

  const toggleMultipleProfiles = () => {
    updateStats({ allowMultipleProfiles: !stats.allowMultipleProfiles });
  };

  return (
    <Section title="Stats" icon={BarChart3} defaultOpen={true} onAdd={addField} addLabel="Add stat">
      <CompactInput
        label={<IconCopy size={10} stroke={1.5} />}
        ariaLabel="Multiple profiles"
        tooltip="Allow multiple stat profiles"
        type="toggle"
        value={!!stats.allowMultipleProfiles}
        onChange={(val) => updateStats({ allowMultipleProfiles: val })}
      />

      <div className="props-field-list">
        {fields.length === 0 && <div className="props-field-list-empty">No stat fields yet</div>}
        {fields.map((field, index) => (
          <div key={field._id} className="props-field-item">
            <div className="props-field-item-inputs">
              <CompactInput
                label={<IconKey size={10} stroke={1.5} />}
                ariaLabel="Key"
                tooltip="Key"
                type="text"
                value={field.key}
                onChange={(val) => updateField(index, "key", val)}
              />
              <CompactInput
                label={<IconTag size={10} stroke={1.5} />}
                ariaLabel="Label"
                tooltip="Label"
                type="text"
                value={field.label}
                onChange={(val) => updateField(index, "label", val)}
              />
              <div className="props-compact-row-2col">
                <div className="props-compact-input">
                  <Tooltip content="Type" placement="top">
                    <span className="props-compact-label">
                      <IconCategory size={10} stroke={1.5} />
                    </span>
                  </Tooltip>
                  <select
                    className="props-compact-field"
                    value={field.type}
                    onChange={(e) => updateField(index, "type", e.target.value)}
                    aria-label="Type">
                    {FIELD_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                {baseSystem !== "40k-10e" && (
                  <div className="props-compact-input">
                    <Tooltip content="Position" placement="top">
                      <span className="props-compact-label">
                        <IconArrowsHorizontal size={10} stroke={1.5} />
                      </span>
                    </Tooltip>
                    <select
                      className="props-compact-field"
                      value={field.position || "left"}
                      onChange={(e) => updateField(index, "position", e.target.value)}
                      aria-label="Position">
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                      <option value="above">Above</option>
                      <option value="below">Below</option>
                    </select>
                  </div>
                )}
              </div>
              {(field.type === "enum" ||
                field.type === "boolean" ||
                (field.type === "string" && baseSystem !== "40k-10e")) && (
                <div className="props-tree-children">
                  {field.type === "enum" && (
                    <div className="props-tree-child">
                      <CompactInput
                        label={<IconList size={10} stroke={1.5} />}
                        ariaLabel="Options"
                        tooltip="Options (comma-separated)"
                        type="text"
                        value={(field.options || []).join(", ")}
                        onChange={(val) =>
                          updateField(
                            index,
                            "options",
                            val.split(",").map((s) => s.trim()),
                          )
                        }
                        onBlur={(val) =>
                          updateField(
                            index,
                            "options",
                            val
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean),
                          )
                        }
                      />
                    </div>
                  )}
                  {field.type === "boolean" && (
                    <>
                      <div className="props-tree-child">
                        <CompactInput
                          label="On"
                          ariaLabel="On value"
                          tooltip="Display value when true"
                          type="text"
                          value={field.onValue || ""}
                          onChange={(val) => updateField(index, "onValue", val || undefined)}
                        />
                      </div>
                      <div className="props-tree-child">
                        <CompactInput
                          label="Off"
                          ariaLabel="Off value"
                          tooltip="Display value when false"
                          type="text"
                          value={field.offValue || ""}
                          onChange={(val) => updateField(index, "offValue", val || undefined)}
                        />
                      </div>
                    </>
                  )}
                  {field.type === "string" && baseSystem !== "40k-10e" && (
                    <div className="props-tree-child">
                      <div className="props-compact-input">
                        <Tooltip content="Width" placement="top">
                          <span className="props-compact-label">
                            <IconLayoutBottombar size={10} stroke={1.5} />
                          </span>
                        </Tooltip>
                        <select
                          className="props-compact-field"
                          value={field.width || "fixed"}
                          onChange={(e) =>
                            updateField(index, "width", e.target.value === "fixed" ? undefined : e.target.value)
                          }
                          aria-label="Width">
                          <option value="fixed">Fixed</option>
                          <option value="fit">Fit Content</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {baseSystem !== "40k-10e" && (
                <CompactInput
                  label={<IconPalette size={10} stroke={1.5} />}
                  ariaLabel="Badge color"
                  tooltip="Badge color"
                  type="color"
                  value={field.color || "#111111"}
                  onChange={(val) => updateField(index, "color", val === "#111111" ? undefined : val)}
                />
              )}
              <CompactInput
                label={<IconSparkles size={10} stroke={1.5} />}
                ariaLabel="Special"
                tooltip="Special stat styling"
                type="toggle"
                value={!!field.special}
                onChange={(val) => {
                  const special = val;
                  const updated = { ...field, special };
                  if (!special) {
                    delete updated.specialColor;
                    delete updated.hideWhenEmpty;
                  }
                  const newFields = fields.map((f, i) => (i === index ? updated : f));
                  updateStats({ fields: newFields });
                }}
              />
              {field.special && (
                <div className="props-tree-children">
                  <div className="props-tree-child">
                    <CompactInput
                      label={<IconPalette size={10} stroke={1.5} />}
                      ariaLabel="Special color"
                      tooltip="Special color"
                      type="color"
                      value={field.specialColor || "#5b21b6"}
                      onChange={(val) => updateField(index, "specialColor", val)}
                    />
                  </div>
                  <div className="props-tree-child">
                    <CompactInput
                      label={<IconEyeOff size={10} stroke={1.5} />}
                      ariaLabel="Hide when empty"
                      tooltip="Hide when empty"
                      type="toggle"
                      value={!!field.hideWhenEmpty}
                      onChange={(val) => updateField(index, "hideWhenEmpty", val)}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="props-field-item-actions">
              <button
                className="designer-layer-action-btn"
                onClick={() => moveField(index, -1)}
                disabled={index === 0}
                aria-label={`Move ${field.label} up`}
                title="Move up">
                <ChevronUp size={14} />
              </button>
              <button
                className="designer-layer-action-btn"
                onClick={() => moveField(index, 1)}
                disabled={index === fields.length - 1}
                aria-label={`Move ${field.label} down`}
                title="Move down">
                <ChevronDown size={14} />
              </button>
              <button
                className="designer-layer-action-btn danger"
                onClick={() => removeField(index)}
                aria-label={`Remove ${field.label}`}
                title="Remove field">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
};
