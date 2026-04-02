import { Plus, Trash2 } from "lucide-react";
import { EditorAccordion } from "../shared/EditorAccordion";
import { EditorNumberField } from "../shared/EditorNumberField";
import { EditorTextField } from "../shared/EditorTextField";
import { EditorToggle } from "../shared/EditorToggle";

export const PointsSection = ({ card, config, label, icon, updateField, replaceCard }) => {
  // Check actual data type first, then fall back to config hint
  if (Array.isArray(card.points)) {
    return <PointsArray card={card} label={label} replaceCard={replaceCard} />;
  }

  // Scalar points (number or string)
  return (
    <EditorAccordion title={label} icon={icon}>
      <EditorNumberField label="Points" value={card.points} onChange={(value) => updateField("points", value)} />
    </EditorAccordion>
  );
};

const PointsArray = ({ card, label, replaceCard }) => {
  const points = card.points || [];

  const handleUpdate = (index, field, value) => {
    const updated = [...points];
    updated[index] = { ...updated[index], [field]: value };
    replaceCard({ ...card, points: updated });
  };

  const handleAdd = () => {
    replaceCard({
      ...card,
      points: [...points, { models: 1, cost: 0, active: true, keyword: "" }],
    });
  };

  const handleRemove = (index) => {
    replaceCard({ ...card, points: points.filter((_, i) => i !== index) });
  };

  return (
    <EditorAccordion title={label} badge={points.length}>
      {points.map((entry, index) => (
        <div key={index} className="mobile-editor-points-entry">
          <div className="mobile-editor-points-field">
            <EditorNumberField
              label="Models"
              value={entry.models}
              onChange={(value) => handleUpdate(index, "models", value)}
            />
          </div>
          <div className="mobile-editor-points-field">
            <EditorNumberField
              label="Cost"
              value={entry.cost}
              onChange={(value) => handleUpdate(index, "cost", value)}
            />
          </div>
          <div className="mobile-editor-points-field">
            <EditorTextField
              label="Keyword"
              value={entry.keyword}
              onChange={(value) => handleUpdate(index, "keyword", value)}
              placeholder="e.g. Jump Packs"
            />
          </div>
          <EditorToggle
            label="Active"
            checked={entry.active !== false}
            onChange={(value) => handleUpdate(index, "active", value)}
          />
          {points.length > 1 && (
            <button className="mobile-editor-weapon-delete" onClick={() => handleRemove(index)} type="button">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      ))}
      <button className="mobile-editor-add-btn" onClick={handleAdd} type="button">
        <Plus size={14} />
        <span>Add Points Option</span>
      </button>
    </EditorAccordion>
  );
};
