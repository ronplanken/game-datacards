import { Plus, Trash2 } from "lucide-react";
import { EditorAccordion } from "../shared/EditorAccordion";
import { EditorTextField } from "../shared/EditorTextField";
import { EditorNumberField } from "../shared/EditorNumberField";

const ModelsSupplyTiersField = ({ sectionDef, items, onChange }) => {
  const rows = Array.isArray(items) ? items : [];

  const setRow = (index, patch) => {
    const next = [...rows];
    next[index] = { ...(next[index] || {}), ...patch };
    onChange(next);
  };
  const removeRow = (index) => onChange(rows.filter((_, i) => i !== index));
  const addRow = () => onChange([...rows, { models: "", supply: "0" }]);

  return (
    <div style={{ marginBottom: 16 }}>
      <label className="mobile-editor-field-label">{sectionDef.label}</label>
      {rows.map((row, index) => {
        const value = typeof row === "object" && row !== null ? row : { models: String(row ?? ""), supply: "0" };
        return (
          <div key={index} className="mobile-editor-tier-row">
            <EditorNumberField
              label="Models"
              value={value.models ?? ""}
              onChange={(models) => setRow(index, { models })}
            />
            <EditorNumberField
              label="Supply"
              value={value.supply ?? ""}
              onChange={(supply) => setRow(index, { supply })}
            />
            <button className="mobile-editor-weapon-delete" onClick={() => removeRow(index)} type="button">
              <Trash2 size={14} />
            </button>
          </div>
        );
      })}
      <button className="mobile-editor-add-btn" onClick={addRow} type="button">
        <Plus size={14} />
        <span>Add tier</span>
      </button>
    </div>
  );
};

export const CustomSectionsEditor = ({ card, config, label, icon, replaceCard }) => {
  const { sections: sectionDefs } = config;
  const cardSections = card.sections || {};

  const writeSection = (key, value) => {
    replaceCard({
      ...card,
      sections: { ...cardSections, [key]: value },
    });
  };

  return (
    <EditorAccordion title={label} icon={icon}>
      {sectionDefs.map((sectionDef) => {
        const items = cardSections[sectionDef.key] || [];

        if (sectionDef.format === "modelsSupplyTiers") {
          return (
            <ModelsSupplyTiersField
              key={sectionDef.key}
              sectionDef={sectionDef}
              items={items}
              onChange={(value) => writeSection(sectionDef.key, value)}
            />
          );
        }

        if (sectionDef.format === "richtext") {
          return (
            <div key={sectionDef.key} style={{ marginBottom: 16 }}>
              <EditorTextField
                label={sectionDef.label}
                value={Array.isArray(items) ? items.join("\n") : items}
                onChange={(value) => writeSection(sectionDef.key, value)}
                placeholder={sectionDef.label}
                multiline
              />
            </div>
          );
        }

        // list format
        return (
          <div key={sectionDef.key} style={{ marginBottom: 16 }}>
            <label className="mobile-editor-field-label">{sectionDef.label}</label>
            {items.map((item, index) => (
              <div key={index} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <EditorTextField
                  value={item}
                  onChange={(value) => {
                    const updated = [...items];
                    updated[index] = value;
                    writeSection(sectionDef.key, updated);
                  }}
                  placeholder={`${sectionDef.label} item`}
                />
                <button
                  className="mobile-editor-weapon-delete"
                  onClick={() =>
                    writeSection(
                      sectionDef.key,
                      items.filter((_, i) => i !== index),
                    )
                  }
                  type="button">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button
              className="mobile-editor-add-btn"
              onClick={() => writeSection(sectionDef.key, [...items, ""])}
              type="button">
              <Plus size={14} />
              <span>Add Item</span>
            </button>
          </div>
        );
      })}
    </EditorAccordion>
  );
};
