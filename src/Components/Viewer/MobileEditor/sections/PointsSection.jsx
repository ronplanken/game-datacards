import { Plus, Trash2 } from "lucide-react";
import { EditorAccordion } from "../shared/EditorAccordion";
import { EditorNumberField } from "../shared/EditorNumberField";
import { EditorTextField } from "../shared/EditorTextField";
import { EditorToggle } from "../shared/EditorToggle";

export const PointsSection = ({ card, config, label, icon, updateField, replaceCard }) => {
  // Check actual data type first, then fall back to config hint
  if (Array.isArray(card.points)) {
    return <PointsArray card={card} config={config} label={label} icon={icon} replaceCard={replaceCard} />;
  }

  // Scalar points (number or string)
  return (
    <EditorAccordion title={label} icon={icon}>
      <EditorNumberField
        label={config?.pointsLabel || "Points"}
        value={card.points}
        onChange={(value) => updateField("points", value)}
      />
    </EditorAccordion>
  );
};

const PointsArray = ({ card, config = {}, label, icon, replaceCard }) => {
  const points = card.points || [];

  // 11e tiers have no active flag — the first entry is the primary cost and the
  // rest are listed when "Show All Points" is on — and a tier can be priced for
  // a single detachment or a single faction.
  const hasActive = config.hasActive !== false;
  const hasRestrictions = config.hasRestrictions === true;
  const hasAdditionalCost = config.hasAdditionalCost === true;
  const additionalCost = card.additionalCost || null;

  const handleUpdate = (index, field, value) => {
    const updated = [...points];
    updated[index] = { ...updated[index], [field]: value };
    replaceCard({ ...card, points: updated });
  };

  // A tier is priced for a detachment or for a faction, never both, and an
  // emptied restriction drops back to null — the shape the datasource uses for
  // an unrestricted tier and the one the points helpers test for.
  const handleUpdateRestriction = (index, field, value) => {
    handleUpdate(index, field, value.trim() === "" ? null : value);
  };

  const handleAdd = () => {
    const blank = hasActive ? { models: 1, cost: 0, active: true, keyword: "" } : { models: "", cost: "", keyword: "" };
    replaceCard({ ...card, points: [...points, blank] });
  };

  const handleRemove = (index) => {
    replaceCard({ ...card, points: points.filter((_, i) => i !== index) });
  };

  // Clearing the surcharge removes it entirely, matching the desktop editor and
  // the cards that never had one.
  const handleUpdateAdditionalCost = (field, value) => {
    if (field === "cost" && String(value).trim() === "") {
      const { additionalCost: _removed, ...rest } = card;
      replaceCard(rest);
      return;
    }
    replaceCard({
      ...card,
      additionalCost: { cost: "", afterSelections: 1, ...(additionalCost || {}), [field]: value },
    });
  };

  return (
    <EditorAccordion title={label} icon={icon} badge={points.length}>
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
          {hasRestrictions && (
            <>
              <div className="mobile-editor-points-field">
                <EditorTextField
                  label="Detachment"
                  value={entry.detachment || ""}
                  disabled={Boolean(entry.faction)}
                  onChange={(value) => handleUpdateRestriction(index, "detachment", value)}
                  placeholder="All detachments"
                />
              </div>
              <div className="mobile-editor-points-field">
                <EditorTextField
                  label="Faction"
                  value={entry.faction || ""}
                  disabled={Boolean(entry.detachment)}
                  onChange={(value) => handleUpdateRestriction(index, "faction", value)}
                  placeholder="All factions"
                />
              </div>
            </>
          )}
          {hasActive && (
            <EditorToggle
              label="Active"
              checked={entry.active !== false}
              onChange={(value) => handleUpdate(index, "active", value)}
            />
          )}
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
      {hasAdditionalCost && (
        <div className="mobile-editor-points-entry" style={{ marginTop: 12 }}>
          <label className="mobile-editor-field-label">Additional selection cost</label>
          <div className="mobile-editor-points-field">
            <EditorNumberField
              label="Cost"
              value={additionalCost?.cost ?? ""}
              onChange={(value) => handleUpdateAdditionalCost("cost", value)}
            />
          </div>
          <div className="mobile-editor-points-field">
            <EditorNumberField
              label="Included"
              value={additionalCost?.afterSelections ?? ""}
              onChange={(value) => handleUpdateAdditionalCost("afterSelections", Number(value) || 0)}
            />
          </div>
        </div>
      )}
    </EditorAccordion>
  );
};
