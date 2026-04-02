import { Plus, Trash2 } from "lucide-react";
import { EditorAccordion } from "../shared/EditorAccordion";
import { EditorTextField } from "../shared/EditorTextField";
import { EditorToggle } from "../shared/EditorToggle";

export const PrimarchSection = ({ card, label, icon, replaceCard }) => {
  const primarch = card.abilities?.primarch || [];

  const updatePrimarch = (updated) => {
    replaceCard({ ...card, abilities: { ...card.abilities, primarch: updated } });
  };

  const handleUpdateGroup = (groupIndex, field, value) => {
    const updated = [...primarch];
    updated[groupIndex] = { ...updated[groupIndex], [field]: value };
    updatePrimarch(updated);
  };

  const handleUpdateAbility = (groupIndex, abilityIndex, field, value) => {
    const updated = [...primarch];
    const abilities = [...(updated[groupIndex].abilities || [])];
    abilities[abilityIndex] = { ...abilities[abilityIndex], [field]: value };
    updated[groupIndex] = { ...updated[groupIndex], abilities };
    updatePrimarch(updated);
  };

  const handleAddAbility = (groupIndex) => {
    const updated = [...primarch];
    const abilities = [
      ...(updated[groupIndex].abilities || []),
      { name: "New Ability", description: "", showAbility: true, showDescription: true },
    ];
    updated[groupIndex] = { ...updated[groupIndex], abilities };
    updatePrimarch(updated);
  };

  const handleRemoveAbility = (groupIndex, abilityIndex) => {
    const updated = [...primarch];
    updated[groupIndex] = {
      ...updated[groupIndex],
      abilities: updated[groupIndex].abilities.filter((_, i) => i !== abilityIndex),
    };
    updatePrimarch(updated);
  };

  const handleAddGroup = () => {
    updatePrimarch([...primarch, { name: "Ability Group", showAbility: true, abilities: [] }]);
  };

  const handleRemoveGroup = (groupIndex) => {
    updatePrimarch(primarch.filter((_, i) => i !== groupIndex));
  };

  return (
    <EditorAccordion title={label} icon={icon} badge={primarch.length}>
      {primarch.map((group, groupIndex) => (
        <div key={groupIndex} style={{ marginBottom: 16 }}>
          <div className="mobile-editor-ability-header" style={{ marginBottom: 8 }}>
            <EditorTextField
              value={group.name}
              onChange={(value) => handleUpdateGroup(groupIndex, "name", value)}
              placeholder="Group name"
              className="mobile-editor-ability-name-input"
            />
            <button className="mobile-editor-weapon-delete" onClick={() => handleRemoveGroup(groupIndex)} type="button">
              <Trash2 size={14} />
            </button>
          </div>
          <EditorToggle
            label="Show on card"
            checked={group.showAbility !== false}
            onChange={(value) => handleUpdateGroup(groupIndex, "showAbility", value)}
          />
          <div
            style={{
              paddingLeft: 12,
              borderLeft: "2px solid var(--me-border-accent, var(--bs-border-light))",
              marginTop: 8,
            }}>
            {(group.abilities || []).map((ability, abilityIndex) => (
              <div key={abilityIndex} className="mobile-editor-ability-item">
                <div className="mobile-editor-ability-header">
                  <EditorTextField
                    value={ability.name}
                    onChange={(value) => handleUpdateAbility(groupIndex, abilityIndex, "name", value)}
                    placeholder="Ability name"
                    className="mobile-editor-ability-name-input"
                  />
                  <button
                    className="mobile-editor-weapon-delete"
                    onClick={() => handleRemoveAbility(groupIndex, abilityIndex)}
                    type="button">
                    <Trash2 size={14} />
                  </button>
                </div>
                <EditorTextField
                  value={ability.description}
                  onChange={(value) => handleUpdateAbility(groupIndex, abilityIndex, "description", value)}
                  placeholder="Description"
                  multiline
                />
              </div>
            ))}
            <button className="mobile-editor-add-btn" onClick={() => handleAddAbility(groupIndex)} type="button">
              <Plus size={14} />
              <span>Add Ability</span>
            </button>
          </div>
        </div>
      ))}
      <button className="mobile-editor-add-btn" onClick={handleAddGroup} type="button">
        <Plus size={14} />
        <span>Add Primarch Group</span>
      </button>
    </EditorAccordion>
  );
};
