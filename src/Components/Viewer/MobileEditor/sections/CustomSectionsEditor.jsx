import { Plus, Trash2 } from "lucide-react";
import { EditorAccordion } from "../shared/EditorAccordion";
import { EditorTextField } from "../shared/EditorTextField";

export const CustomSectionsEditor = ({ card, config, label, icon, replaceCard }) => {
  const { sections: sectionDefs } = config;
  const cardSections = card.sections || {};

  return (
    <EditorAccordion title={label} icon={icon}>
      {sectionDefs.map((sectionDef) => {
        const items = cardSections[sectionDef.key] || [];

        if (sectionDef.format === "richtext") {
          return (
            <div key={sectionDef.key} style={{ marginBottom: 16 }}>
              <EditorTextField
                label={sectionDef.label}
                value={Array.isArray(items) ? items.join("\n") : items}
                onChange={(value) => {
                  replaceCard({
                    ...card,
                    sections: { ...cardSections, [sectionDef.key]: value },
                  });
                }}
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
                    replaceCard({
                      ...card,
                      sections: { ...cardSections, [sectionDef.key]: updated },
                    });
                  }}
                  placeholder={`${sectionDef.label} item`}
                />
                <button
                  className="mobile-editor-weapon-delete"
                  onClick={() => {
                    replaceCard({
                      ...card,
                      sections: {
                        ...cardSections,
                        [sectionDef.key]: items.filter((_, i) => i !== index),
                      },
                    });
                  }}
                  type="button">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button
              className="mobile-editor-add-btn"
              onClick={() => {
                replaceCard({
                  ...card,
                  sections: { ...cardSections, [sectionDef.key]: [...items, ""] },
                });
              }}
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
