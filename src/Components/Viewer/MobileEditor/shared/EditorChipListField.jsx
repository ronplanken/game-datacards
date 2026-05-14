import { useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { EditorTextField } from "./EditorTextField";
import { EditorSelectField } from "./EditorSelectField";

// Editable list of {amount, unit} chips matching the desktop SchemaAbilitiesEditor cost-chip UX.
export const EditorChipListField = ({ label, value, units, onChange, addLabel = "Add" }) => {
  const items = Array.isArray(value) ? value : [];
  const unitOptions = (units || []).map((u) => ({ value: u, label: u }));
  const defaultUnit = units?.[0] ?? "";

  // Maintain a parallel array of stable React keys so removing a chip from the
  // middle doesn't reuse the deleted row's DOM (and pending debounce state) for
  // the chip that shifts up to take its place.
  const counterRef = useRef(0);
  const [keys, setKeys] = useState(() => items.map(() => `chip-${counterRef.current++}`));
  if (keys.length < items.length) {
    const next = [...keys];
    while (next.length < items.length) next.push(`chip-${counterRef.current++}`);
    setKeys(next);
  } else if (keys.length > items.length) {
    setKeys(keys.slice(0, items.length));
  }

  const setAt = (index, patch) => {
    const next = [...items];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };
  const removeAt = (index) => {
    setKeys((prev) => prev.filter((_, i) => i !== index));
    onChange(items.filter((_, i) => i !== index));
  };
  const add = () => {
    setKeys((prev) => [...prev, `chip-${counterRef.current++}`]);
    onChange([...items, { amount: "", unit: defaultUnit }]);
  };

  return (
    <div className="mobile-editor-field">
      {label && <label className="mobile-editor-field-label">{label}</label>}
      {items.map((chip, index) => (
        <div key={keys[index]} className="mobile-editor-chip-row">
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
