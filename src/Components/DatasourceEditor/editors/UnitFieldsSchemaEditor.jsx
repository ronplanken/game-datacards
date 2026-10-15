import React from "react";
import { nanoid } from "nanoid";
import { ListPlus, Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { IconKey, IconTag, IconCategory, IconList, IconToggleRight, IconLetterCase } from "@tabler/icons-react";
import { Section, CompactInput } from "../components";
import { Tooltip } from "../../Tooltip/Tooltip";
import { ensureIds } from "./editorUtils";
import { RESERVED_UNIT_FIELD_KEYS } from "../../../Helpers/customSchema.helpers";

export const UNIT_FIELD_TYPES = [
  { value: "boolean", label: "Toggle" },
  { value: "string", label: "Text" },
  { value: "enum", label: "Choice" },
];

const KEY_PATTERN = /^[A-Za-z][A-Za-z0-9_]*$/;

export const createUnitField = (fields = []) => {
  const taken = new Set(fields.map((field) => field.key));
  let number = fields.length + 1;
  while (taken.has(`field_${number}`)) number += 1;
  return {
    _id: nanoid(),
    key: `field_${number}`,
    label: `Field ${number}`,
    type: "boolean",
    default: false,
  };
};

export const unitFieldKeyError = (field, fields = []) => {
  const key = field?.key || "";
  if (key === "") return "Key is required.";
  if (!KEY_PATTERN.test(key)) return "Use letters, digits and _, starting with a letter.";
  if (RESERVED_UNIT_FIELD_KEYS.includes(key)) return `"${key}" is used by a built-in value.`;
  if (fields.filter((other) => other.key === key).length > 1) return `"${key}" is used twice.`;
  return null;
};

export const changeUnitFieldType = (field, type) => {
  const next = { ...field, type };
  delete next.options;
  delete next.onValue;
  delete next.offValue;
  if (type === "boolean") next.default = false;
  if (type === "string") next.default = "";
  if (type === "enum") {
    next.options = ["Option 1", "Option 2"];
    next.default = "Option 1";
  }
  return next;
};

const DefaultInput = ({ field, onChange }) => {
  if (field.type === "boolean") {
    return (
      <CompactInput
        label={<IconToggleRight size={10} stroke={1.5} />}
        ariaLabel="On by default"
        tooltip="Starting value for new cards and cards without a value"
        type="toggle"
        value={Boolean(field.default)}
        onChange={(val) => onChange(val)}
      />
    );
  }
  if (field.type === "enum") {
    return (
      <div className="props-compact-input">
        <Tooltip content="Default choice" placement="top">
          <span className="props-compact-label">
            <IconToggleRight size={10} stroke={1.5} />
          </span>
        </Tooltip>
        <select
          className="props-compact-field"
          value={field.default ?? field.options?.[0] ?? ""}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Default choice">
          {(field.options || []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  }
  return (
    <CompactInput
      label={<IconLetterCase size={10} stroke={1.5} />}
      ariaLabel="Default text"
      tooltip="Default text"
      type="text"
      value={field.default ?? ""}
      onChange={(val) => onChange(val)}
    />
  );
};

/**
 * Editor for extra per-card fields on unit card types (schema.metadata.fields).
 * Values are stored flat on each card as card[key].
 */
export const UnitFieldsSchemaEditor = ({ schema, onChange }) => {
  const metadata = schema?.metadata;
  if (!metadata) return null;

  const fields = ensureIds(metadata.fields);

  const update = (nextFields) => {
    onChange({ ...schema, metadata: { ...metadata, fields: nextFields } });
  };

  const updateField = (index, patch) => {
    update(fields.map((field, i) => (i === index ? { ...field, ...patch } : field)));
  };

  const moveField = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= fields.length) return;
    const next = [...fields];
    [next[index], next[target]] = [next[target], next[index]];
    update(next);
  };

  return (
    <Section title="Extra Fields" icon={ListPlus} defaultOpen={fields.length > 0}>
      <div className="props-section-note">
        Fields shown under Basic information on every card. Use a toggle to let users switch parts of the card on or
        off, then bind its key in the Card Designer.
      </div>
      <div className="props-field-list">
        {fields.length === 0 && <div className="props-field-list-empty">No extra fields yet</div>}
        {fields.map((field, index) => {
          const keyError = unitFieldKeyError(field, fields);
          return (
            <div key={field._id} className="props-field-item">
              <div className="props-field-item-inputs">
                <CompactInput
                  label={<IconKey size={10} stroke={1.5} />}
                  ariaLabel="Key"
                  tooltip="Key used in bindings, for example {{showRoleInName}}"
                  type="text"
                  value={field.key}
                  onChange={(val) => updateField(index, { key: val.trim() })}
                />
                {keyError && <div className="props-field-error">{keyError}</div>}
                <CompactInput
                  label={<IconTag size={10} stroke={1.5} />}
                  ariaLabel="Label"
                  tooltip="Label shown in the card editor"
                  type="text"
                  value={field.label}
                  onChange={(val) => updateField(index, { label: val })}
                />
                <div className="props-compact-input">
                  <Tooltip content="Type" placement="top">
                    <span className="props-compact-label">
                      <IconCategory size={10} stroke={1.5} />
                    </span>
                  </Tooltip>
                  <select
                    className="props-compact-field"
                    value={field.type}
                    onChange={(e) =>
                      update(fields.map((f, i) => (i === index ? changeUnitFieldType(f, e.target.value) : f)))
                    }
                    aria-label="Type">
                    {UNIT_FIELD_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                {field.type === "enum" && (
                  <CompactInput
                    label={<IconList size={10} stroke={1.5} />}
                    ariaLabel="Options"
                    tooltip="Options (comma-separated)"
                    type="text"
                    value={(field.options || []).join(", ")}
                    onChange={(val) => updateField(index, { options: val.split(",").map((s) => s.trim()) })}
                    onBlur={(val) => {
                      const options = val
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean);
                      updateField(index, {
                        options,
                        default: options.includes(field.default) ? field.default : options[0],
                      });
                    }}
                  />
                )}
                <DefaultInput field={field} onChange={(value) => updateField(index, { default: value })} />
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
                  onClick={() => update(fields.filter((_, i) => i !== index))}
                  aria-label={`Remove ${field.label}`}
                  title="Remove field">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <button
        className="designer-btn designer-btn-sm"
        onClick={() => update([...fields, createUnitField(fields)])}
        aria-label="Add extra field">
        <Plus size={14} />
        Add Field
      </button>
    </Section>
  );
};
