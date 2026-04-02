import { Plus, Trash2 } from "lucide-react";
import { EditorAccordion } from "../shared/EditorAccordion";
import { EditorTextField } from "../shared/EditorTextField";

// Units can be strings (legacy) or objects with { name, type, uuid }
const getUnitName = (unit) => {
  if (typeof unit === "string") return unit;
  return unit?.name || "";
};

const setUnitName = (unit, value) => {
  if (typeof unit === "string") return value;
  return { ...unit, name: value };
};

export const LeaderInfoSection = ({ card, config, label, icon, replaceCard }) => {
  const { dataPath } = config;
  const leads = card[dataPath] || { units: [], extra: "" };
  const units = leads.units || [];

  const handleUpdateUnit = (index, value) => {
    const updated = [...units];
    updated[index] = setUnitName(updated[index], value);
    replaceCard({ ...card, [dataPath]: { ...leads, units: updated } });
  };

  const handleAddUnit = () => {
    replaceCard({
      ...card,
      [dataPath]: { ...leads, units: [...units, ""] },
    });
  };

  const handleRemoveUnit = (index) => {
    replaceCard({
      ...card,
      [dataPath]: { ...leads, units: units.filter((_, i) => i !== index) },
    });
  };

  const handleExtraChange = (value) => {
    replaceCard({ ...card, [dataPath]: { ...leads, extra: value } });
  };

  return (
    <EditorAccordion title={label} icon={icon} badge={units.length}>
      {units.map((unit, index) => (
        <div key={index} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <EditorTextField
              value={getUnitName(unit)}
              onChange={(value) => handleUpdateUnit(index, value)}
              placeholder={`Unit ${index + 1}`}
            />
          </div>
          <button className="mobile-editor-weapon-delete" onClick={() => handleRemoveUnit(index)} type="button">
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button className="mobile-editor-add-btn" onClick={handleAddUnit} type="button">
        <Plus size={14} />
        <span>Add Unit</span>
      </button>
      {leads.extra !== undefined && (
        <div style={{ marginTop: 12 }}>
          <EditorTextField
            label="Extra Info"
            value={leads.extra}
            onChange={handleExtraChange}
            placeholder="e.g. This unit can also lead..."
            multiline
          />
        </div>
      )}
    </EditorAccordion>
  );
};
