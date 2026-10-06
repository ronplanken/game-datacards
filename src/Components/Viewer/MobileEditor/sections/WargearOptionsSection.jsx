import { Plus, Trash2 } from "lucide-react";
import { EditorAccordion } from "../shared/EditorAccordion";
import { EditorNumberField } from "../shared/EditorNumberField";
import { EditorTextField } from "../shared/EditorTextField";

/**
 * Structured wargear groups (11e `wargearOptions`): an instruction plus the
 * swaps it offers, each with a points cost.
 *
 * These are what the card back lists and what the list builder charges points
 * for, so they win over the free-form `wargear` sentences whenever a card has
 * any — the resolver shows one or the other, never both, mirroring the desktop
 * panel. Costs stay strings, the shape the datasource uses.
 */
export const WargearOptionsSection = ({ card, label, icon, replaceCard }) => {
  const groups = card.wargearOptions || [];

  const setGroups = (updated) => replaceCard({ ...card, wargearOptions: updated });

  const updateGroup = (groupIndex, changes) => {
    const updated = [...groups];
    updated[groupIndex] = { ...updated[groupIndex], ...changes };
    setGroups(updated);
  };

  const updateOption = (groupIndex, optionIndex, changes) => {
    const options = [...(groups[groupIndex]?.options || [])];
    options[optionIndex] = { ...options[optionIndex], ...changes };
    updateGroup(groupIndex, { options });
  };

  const removeOption = (groupIndex, optionIndex) => {
    const options = (groups[groupIndex]?.options || []).filter((_, i) => i !== optionIndex);
    updateGroup(groupIndex, { options });
  };

  const addOption = (groupIndex) => {
    updateGroup(groupIndex, { options: [...(groups[groupIndex]?.options || []), { name: "", cost: "0" }] });
  };

  return (
    <EditorAccordion title={label} icon={icon} badge={groups.length}>
      {groups.map((group, groupIndex) => (
        <div key={groupIndex} className="mobile-editor-ability-item">
          <div className="mobile-editor-ability-header">
            <label className="mobile-editor-field-label">Option {groupIndex + 1}</label>
            <button
              className="mobile-editor-weapon-delete"
              onClick={() => setGroups(groups.filter((_, i) => i !== groupIndex))}
              type="button">
              <Trash2 size={14} />
            </button>
          </div>
          <EditorTextField
            label="Instruction"
            value={group.instruction}
            onChange={(value) => updateGroup(groupIndex, { instruction: value })}
            placeholder="e.g. This model's boltgun can be replaced with one of the following:"
            multiline
          />
          {(group.options || []).map((option, optionIndex) => (
            <div
              key={optionIndex}
              style={{ display: "flex", gap: 8, alignItems: "flex-end", marginBottom: 8 }}
              aria-label={`Option ${optionIndex + 1}`}>
              <div style={{ flex: "1 1 auto", minWidth: 0 }}>
                <EditorTextField
                  value={option.name}
                  onChange={(value) => updateOption(groupIndex, optionIndex, { name: value })}
                  placeholder={`Swap ${optionIndex + 1}`}
                />
              </div>
              <div style={{ flex: "0 0 72px" }}>
                <EditorNumberField
                  label="Pts"
                  value={option.cost ?? ""}
                  onChange={(value) => updateOption(groupIndex, optionIndex, { cost: value })}
                />
              </div>
              <button
                className="mobile-editor-weapon-delete"
                onClick={() => removeOption(groupIndex, optionIndex)}
                type="button">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button className="mobile-editor-add-btn" onClick={() => addOption(groupIndex)} type="button">
            <Plus size={14} />
            <span>Add Swap</span>
          </button>
        </div>
      ))}
      <button
        className="mobile-editor-add-btn"
        onClick={() => setGroups([...groups, { instruction: "", options: [] }])}
        type="button">
        <Plus size={14} />
        <span>Add Wargear Option</span>
      </button>
    </EditorAccordion>
  );
};
