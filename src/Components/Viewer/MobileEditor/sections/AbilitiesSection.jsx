import { Plus, Trash2 } from "lucide-react";
import { EditorAccordion } from "../shared/EditorAccordion";
import { EditorTextField } from "../shared/EditorTextField";
import { EditorSelectField } from "../shared/EditorSelectField";
import { EditorTagInput } from "../shared/EditorTagInput";
import { EditorToggle } from "../shared/EditorToggle";
import { EditorChipListField } from "../shared/EditorChipListField";
import { AOS_PHASE_OPTIONS, AOS_ICON_OPTIONS } from "../../../AgeOfSigmar/constants";
import { VALID_ABILITY_TYPES, VALID_ABILITY_COST_UNITS } from "../../../../Helpers/customSchema.helpers";

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

// AoS abilities: flat array with phase, icon, declare, effect fields
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
      abilities: [
        ...abilities,
        {
          name: "New Ability",
          phase: "Passive",
          icon: "special",
          phaseDetails: "",
          declare: "",
          effect: "",
          keywords: [],
        },
      ],
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
          <EditorSelectField
            label="Phase"
            value={ability.phase}
            onChange={(value) => handleUpdate(index, "phase", value)}
            options={AOS_PHASE_OPTIONS}
          />
          <EditorSelectField
            label="Icon"
            value={ability.icon}
            onChange={(value) => handleUpdate(index, "icon", value)}
            options={AOS_ICON_OPTIONS}
          />
          <EditorTextField
            label="Phase Details"
            value={ability.phaseDetails}
            onChange={(value) => handleUpdate(index, "phaseDetails", value)}
            placeholder="e.g. Once Per Turn (Army), Any Combat Phase"
          />
          <EditorTextField
            label="Casting/Chant Value"
            value={ability.castingValue || ability.chantValue || ""}
            onChange={(value) => handleUpdate(index, "castingValue", value ? parseInt(value) : null)}
            placeholder="e.g. 7"
          />
          <EditorTextField
            label="Declare"
            value={ability.declare}
            onChange={(value) => handleUpdate(index, "declare", value)}
            placeholder="Declare text"
            multiline
          />
          <EditorTextField
            label="Effect"
            value={ability.effect}
            onChange={(value) => handleUpdate(index, "effect", value)}
            placeholder="Effect text"
            multiline
          />
          <EditorTextField
            label="Keywords"
            value={Array.isArray(ability.keywords) ? ability.keywords.join(", ") : ability.keywords || ""}
            onChange={(value) =>
              handleUpdate(
                index,
                "keywords",
                value
                  .split(",")
                  .map((k) => k.trim())
                  .filter(Boolean),
              )
            }
            placeholder="Comma-separated keywords"
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

// Custom datasource abilities: categorized, format and schema flags determined
// by the resolver's `categories` config. Mirrors the desktop
// SchemaAbilitiesEditor so the same fields (type/costs/triggered/phase/color)
// round-trip between mobile and desktop edits.
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

  const handleAdd = (categoryKey, format) => {
    const newItem = { name: "New Ability", showAbility: true };
    if (format === "name-description") {
      newItem.description = "";
      newItem.showDescription = true;
    }
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

        const typeOptions = (cat.typeOptions || VALID_ABILITY_TYPES).map((t) => ({ value: t, label: t }));
        const costUnits = cat.costUnitOptions || VALID_ABILITY_COST_UNITS;

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
                {cat.hasType && (
                  <EditorSelectField
                    label="Type pill"
                    value={ability.type || ""}
                    onChange={(value) => handleUpdate(cat.key, index, "type", value || undefined)}
                    options={[{ value: "", label: "None" }, ...typeOptions]}
                  />
                )}
                {cat.hasCost && (
                  <EditorChipListField
                    label="Cost chips"
                    value={ability.costs}
                    units={costUnits}
                    onChange={(costs) => handleUpdate(cat.key, index, "costs", costs.length ? costs : undefined)}
                    addLabel="Add cost"
                  />
                )}
                {cat.hasTriggerIcon && (
                  <>
                    <EditorToggle
                      label="Triggered"
                      checked={!!ability.triggered}
                      onChange={(value) => handleUpdate(cat.key, index, "triggered", value || undefined)}
                    />
                    <EditorToggle
                      label="Upgrade"
                      checked={!!ability.upgrade}
                      onChange={(value) => handleUpdate(cat.key, index, "upgrade", value || undefined)}
                    />
                  </>
                )}
                {cat.hasPhase && (
                  <EditorTextField
                    label="Phase"
                    value={ability.phase || ""}
                    onChange={(value) => handleUpdate(cat.key, index, "phase", value || undefined)}
                    placeholder="e.g. Hero, Movement, Passive"
                  />
                )}
                {cat.hasColor && (
                  <div className="mobile-editor-field">
                    <label className="mobile-editor-field-label">Strip Color</label>
                    <input
                      type="color"
                      value={ability.color ?? "#4a5568"}
                      onChange={(e) => handleUpdate(cat.key, index, "color", e.target.value)}
                      className="mobile-editor-color-input"
                    />
                  </div>
                )}
                {ability.description !== undefined && (
                  <EditorTextField
                    label="Description"
                    value={ability.description}
                    onChange={(value) => handleUpdate(cat.key, index, "description", value)}
                    placeholder="Description"
                    multiline
                  />
                )}
                <EditorToggle
                  label="Visible"
                  checked={ability.showAbility !== false}
                  onChange={(value) => handleUpdate(cat.key, index, "showAbility", value)}
                />
              </div>
            ))}
            <button className="mobile-editor-add-btn" onClick={() => handleAdd(cat.key, cat.format)} type="button">
              <Plus size={14} />
              <span>Add {cat.label}</span>
            </button>
          </div>
        );
      })}
    </EditorAccordion>
  );
};
