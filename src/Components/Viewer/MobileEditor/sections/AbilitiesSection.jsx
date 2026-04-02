import { Plus, Trash2 } from "lucide-react";
import { EditorAccordion } from "../shared/EditorAccordion";
import { EditorTextField } from "../shared/EditorTextField";
import { EditorTagInput } from "../shared/EditorTagInput";

export const AbilitiesSection = ({ card, config, label, icon, updateField, replaceCard }) => {
  const { format } = config;

  if (format === "40k")
    return (
      <Abilities40k
        card={card}
        label={label}
        icon={icon}
        updateField={updateField}
        replaceCard={replaceCard}
        config={config}
      />
    );
  if (format === "aos") return <AbilitiesAos card={card} label={label} icon={icon} replaceCard={replaceCard} />;
  if (format === "custom")
    return <AbilitiesCustom card={card} label={label} icon={icon} replaceCard={replaceCard} config={config} />;

  return null;
};

// 40k abilities: categorized object with core (string[]), faction (string[]), other/wargear/special (ability objects[])
const Abilities40k = ({ card, label, icon, replaceCard, config }) => {
  const abilities = card.abilities || {};
  const { categories } = config;

  const handleUpdateNameOnly = (categoryKey, index, value) => {
    const arr = [...(abilities[categoryKey] || [])];
    arr[index] = value;
    replaceCard({ ...card, abilities: { ...abilities, [categoryKey]: arr } });
  };

  const handleAddNameOnly = (categoryKey) => {
    const arr = [...(abilities[categoryKey] || []), "New Ability"];
    replaceCard({ ...card, abilities: { ...abilities, [categoryKey]: arr } });
  };

  const handleRemoveNameOnly = (categoryKey, index) => {
    const arr = (abilities[categoryKey] || []).filter((_, i) => i !== index);
    replaceCard({ ...card, abilities: { ...abilities, [categoryKey]: arr } });
  };

  const handleUpdateAbility = (categoryKey, index, field, value) => {
    const arr = [...(abilities[categoryKey] || [])];
    arr[index] = { ...arr[index], [field]: value };
    replaceCard({ ...card, abilities: { ...abilities, [categoryKey]: arr } });
  };

  const handleAddAbility = (categoryKey) => {
    const arr = [
      ...(abilities[categoryKey] || []),
      { name: "New Ability", description: "", showAbility: true, showDescription: true },
    ];
    replaceCard({ ...card, abilities: { ...abilities, [categoryKey]: arr } });
  };

  const handleRemoveAbility = (categoryKey, index) => {
    const arr = (abilities[categoryKey] || []).filter((_, i) => i !== index);
    replaceCard({ ...card, abilities: { ...abilities, [categoryKey]: arr } });
  };

  return (
    <EditorAccordion title={label} icon={icon}>
      {categories.map((cat) => {
        const items = abilities[cat.key] || [];
        if (cat.format === "name-only") {
          return (
            <div key={cat.key} style={{ marginBottom: 16 }}>
              <EditorTagInput
                label={cat.label}
                tags={items}
                onChange={(tags) => replaceCard({ ...card, abilities: { ...abilities, [cat.key]: tags } })}
              />
            </div>
          );
        }

        // name-description format
        return (
          <div key={cat.key} style={{ marginBottom: 16 }}>
            <label className="mobile-editor-field-label">{cat.label}</label>
            {items.map((ability, index) => (
              <div key={index} className="mobile-editor-ability-item">
                <div className="mobile-editor-ability-header">
                  <EditorTextField
                    value={ability.name}
                    onChange={(value) => handleUpdateAbility(cat.key, index, "name", value)}
                    placeholder="Ability name"
                    className="mobile-editor-ability-name-input"
                  />
                  <button
                    className="mobile-editor-weapon-delete"
                    onClick={() => handleRemoveAbility(cat.key, index)}
                    type="button">
                    <Trash2 size={14} />
                  </button>
                </div>
                <EditorTextField
                  value={ability.description}
                  onChange={(value) => handleUpdateAbility(cat.key, index, "description", value)}
                  placeholder="Description"
                  multiline
                />
              </div>
            ))}
            <button className="mobile-editor-add-btn" onClick={() => handleAddAbility(cat.key)} type="button">
              <Plus size={14} />
              <span>Add {cat.label.replace(/s$/, "")}</span>
            </button>
          </div>
        );
      })}
    </EditorAccordion>
  );
};

// AoS abilities: flat array with phase, declare, effect fields
const AbilitiesAos = ({ card, label, icon, replaceCard }) => {
  const abilities = card.abilities || [];

  const handleUpdate = (index, field, value) => {
    const updated = [...abilities];
    updated[index] = { ...updated[index], [field]: value };
    replaceCard({ ...card, abilities: updated });
  };

  const handleAdd = () => {
    replaceCard({
      ...card,
      abilities: [...abilities, { name: "New Ability", phase: "Passive", declare: "", effect: "" }],
    });
  };

  const handleRemove = (index) => {
    replaceCard({ ...card, abilities: abilities.filter((_, i) => i !== index) });
  };

  return (
    <EditorAccordion title={label} icon={icon} badge={abilities.length}>
      {abilities.map((ability, index) => (
        <div key={index} className="mobile-editor-ability-item">
          <div className="mobile-editor-ability-header">
            <EditorTextField
              value={ability.name}
              onChange={(value) => handleUpdate(index, "name", value)}
              placeholder="Ability name"
              className="mobile-editor-ability-name-input"
            />
            <button className="mobile-editor-weapon-delete" onClick={() => handleRemove(index)} type="button">
              <Trash2 size={14} />
            </button>
          </div>
          <EditorTextField
            label="Phase"
            value={ability.phase}
            onChange={(value) => handleUpdate(index, "phase", value)}
            placeholder="e.g. Passive, Hero Phase"
          />
          {ability.declare !== undefined && (
            <EditorTextField
              label="Declare"
              value={ability.declare}
              onChange={(value) => handleUpdate(index, "declare", value)}
              placeholder="Declare text"
              multiline
            />
          )}
          <EditorTextField
            label="Effect"
            value={ability.effect}
            onChange={(value) => handleUpdate(index, "effect", value)}
            placeholder="Effect text"
            multiline
          />
        </div>
      ))}
      <button className="mobile-editor-add-btn" onClick={handleAdd} type="button">
        <Plus size={14} />
        <span>Add Ability</span>
      </button>
    </EditorAccordion>
  );
};

// Custom datasource abilities: categorized, format determined by schema
const AbilitiesCustom = ({ card, label, icon, replaceCard, config }) => {
  const { categories } = config;
  const abilities = card.abilities || {};

  // Support both array and object formats
  const isArray = Array.isArray(abilities);

  const getItems = (categoryKey) => {
    if (isArray) {
      return abilities.filter((a) => a.category === categoryKey);
    }
    return abilities[categoryKey] || [];
  };

  const handleUpdate = (categoryKey, index, field, value) => {
    if (isArray) {
      const updated = [...abilities];
      const categoryItems = updated.filter((a) => a.category === categoryKey);
      const item = categoryItems[index];
      const globalIndex = updated.indexOf(item);
      updated[globalIndex] = { ...item, [field]: value };
      replaceCard({ ...card, abilities: updated });
    } else {
      const arr = [...(abilities[categoryKey] || [])];
      arr[index] = { ...arr[index], [field]: value };
      replaceCard({ ...card, abilities: { ...abilities, [categoryKey]: arr } });
    }
  };

  const handleAdd = (categoryKey) => {
    const newItem = { name: "New Ability", description: "" };
    if (isArray) {
      replaceCard({ ...card, abilities: [...abilities, { ...newItem, category: categoryKey }] });
    } else {
      const arr = [...(abilities[categoryKey] || []), newItem];
      replaceCard({ ...card, abilities: { ...abilities, [categoryKey]: arr } });
    }
  };

  const handleRemove = (categoryKey, index) => {
    if (isArray) {
      // Find the global index of the nth item in this category
      let count = 0;
      const globalIndex = abilities.findIndex((a) => a.category === categoryKey && count++ === index);
      if (globalIndex !== -1) {
        replaceCard({ ...card, abilities: abilities.filter((_, i) => i !== globalIndex) });
      }
    } else {
      const arr = (abilities[categoryKey] || []).filter((_, i) => i !== index);
      replaceCard({ ...card, abilities: { ...abilities, [categoryKey]: arr } });
    }
  };

  return (
    <EditorAccordion title={label} icon={icon}>
      {categories.map((cat) => {
        const items = getItems(cat.key);
        if (cat.format === "name-only") {
          return (
            <div key={cat.key} style={{ marginBottom: 16 }}>
              <EditorTagInput
                label={cat.label}
                tags={items.map((i) => (typeof i === "string" ? i : i.name))}
                onChange={(tags) => {
                  if (isArray) {
                    const others = abilities.filter((a) => a.category !== cat.key);
                    const newItems = tags.map((t) => ({ name: t, category: cat.key }));
                    replaceCard({ ...card, abilities: [...others, ...newItems] });
                  } else {
                    replaceCard({ ...card, abilities: { ...abilities, [cat.key]: tags } });
                  }
                }}
              />
            </div>
          );
        }

        return (
          <div key={cat.key} style={{ marginBottom: 16 }}>
            <label className="mobile-editor-field-label">{cat.label}</label>
            {items.map((ability, index) => (
              <div key={index} className="mobile-editor-ability-item">
                <div className="mobile-editor-ability-header">
                  <EditorTextField
                    value={ability.name}
                    onChange={(value) => handleUpdate(cat.key, index, "name", value)}
                    placeholder="Ability name"
                    className="mobile-editor-ability-name-input"
                  />
                  <button
                    className="mobile-editor-weapon-delete"
                    onClick={() => handleRemove(cat.key, index)}
                    type="button">
                    <Trash2 size={14} />
                  </button>
                </div>
                {ability.description !== undefined && (
                  <EditorTextField
                    value={ability.description}
                    onChange={(value) => handleUpdate(cat.key, index, "description", value)}
                    placeholder="Description"
                    multiline
                  />
                )}
              </div>
            ))}
            <button className="mobile-editor-add-btn" onClick={() => handleAdd(cat.key)} type="button">
              <Plus size={14} />
              <span>Add</span>
            </button>
          </div>
        );
      })}
    </EditorAccordion>
  );
};
