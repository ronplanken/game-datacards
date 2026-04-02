import { Plus, Trash2 } from "lucide-react";
import { EditorAccordion } from "../shared/EditorAccordion";
import { EditorTextField } from "../shared/EditorTextField";

export const LeaderInfoSection = ({ card, config, label, icon, replaceCard }) => {
  const { dataPath } = config;
  const leads = card[dataPath] || { units: [], extra: "" };
  const units = leads.units || [];

  const handleUpdateUnit = (index, value) => {
    const updated = [...units];
    updated[index] = { ...updated[index], name: value };
    replaceCard({ ...card, [dataPath]: { ...leads, units: updated } });
  };

  const handleAddUnit = () => {
    replaceCard({
      ...card,
      [dataPath]: { ...leads, units: [...units, { type: "official", name: "" }] },
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
              value={unit.name}
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
            placeholder="Additional leader info"
            multiline
          />
        </div>
      )}
    </EditorAccordion>
  );
};
