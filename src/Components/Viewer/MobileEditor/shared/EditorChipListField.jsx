import { Plus, Trash2 } from "lucide-react";
import { EditorTextField } from "./EditorTextField";
import { EditorSelectField } from "./EditorSelectField";

/**
 * Editable list of {amount, unit} chips. Mirrors the cost-chip UX in the
 * desktop SchemaAbilitiesEditor so the same data shape (e.g. ability.costs
 * for Starcraft TMG) round-trips between the mobile and desktop editors.
 *
 * Props:
 *  - label    Section label
 *  - value    Array of { amount, unit } (defaults to [])
 *  - units    Array of allowed unit strings (e.g. ["CP","BM","VP","PE"])
 *  - onChange Called with the next array on every mutation
 *  - addLabel Text shown on the add button
 */
export const EditorChipListField = ({ label, value, units, onChange, addLabel = "Add" }) => {
  const items = Array.isArray(value) ? value : [];
  const unitOptions = (units || []).map((u) => ({ value: u, label: u }));
  const defaultUnit = units?.[0] ?? "";

  const setAt = (index, patch) => {
    const next = [...items];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };
  const removeAt = (index) => onChange(items.filter((_, i) => i !== index));
  const add = () => onChange([...items, { amount: "", unit: defaultUnit }]);

  return (
    <div className="mobile-editor-field">
      {label && <label className="mobile-editor-field-label">{label}</label>}
      {items.map((chip, index) => (
        <div key={index} className="mobile-editor-chip-row">
          <div className="mobile-editor-chip-amount">
            <EditorTextField
              value={chip.amount ?? ""}
              onChange={(amount) => setAt(index, { amount })}
              placeholder="Amount"
            />
          </div>
          {unitOptions.length > 0 ? (
            <div className="mobile-editor-chip-unit">
              <EditorSelectField
                value={chip.unit ?? defaultUnit}
                onChange={(unit) => setAt(index, { unit })}
                options={unitOptions}
              />
            </div>
          ) : (
            <div className="mobile-editor-chip-unit">
              <EditorTextField value={chip.unit ?? ""} onChange={(unit) => setAt(index, { unit })} placeholder="Unit" />
            </div>
          )}
          <button className="mobile-editor-weapon-delete" onClick={() => removeAt(index)} type="button">
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button className="mobile-editor-add-btn" onClick={add} type="button">
        <Plus size={14} />
        <span>{addLabel}</span>
      </button>
    </div>
  );
};
