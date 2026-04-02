import { Plus, Trash2 } from "lucide-react";
import { EditorAccordion } from "../shared/EditorAccordion";
import { EditorTextField } from "../shared/EditorTextField";
import { EditorToggle } from "../shared/EditorToggle";

export const FieldCollectionSection = ({ card, config, label, icon, replaceCard }) => {
  const { collectionPath, fields, allowMultiple } = config;
  const items = card[collectionPath] || [];

  const handleUpdate = (index, fieldKey, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [fieldKey]: value };
    replaceCard({ ...card, [collectionPath]: updated });
  };

  const handleAdd = () => {
    const blank = {};
    fields.forEach((f) => {
      blank[f.key] = f.type === "boolean" ? false : "";
    });
    replaceCard({ ...card, [collectionPath]: [...items, blank] });
  };

  const handleRemove = (index) => {
    replaceCard({ ...card, [collectionPath]: items.filter((_, i) => i !== index) });
  };

  return (
    <EditorAccordion title={label} icon={icon} badge={items.length}>
      {items.map((item, index) => (
        <div key={index} className="mobile-editor-collection-item">
          <div className="mobile-editor-collection-item-header">
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--bs-text-muted)" }}>#{index + 1}</span>
            <button className="mobile-editor-weapon-delete" onClick={() => handleRemove(index)} type="button">
              <Trash2 size={14} />
            </button>
          </div>
          {fields.map((field) => {
            if (field.type === "boolean") {
              return (
                <EditorToggle
                  key={field.key}
                  label={field.label}
                  checked={!!item[field.key]}
                  onChange={(value) => handleUpdate(index, field.key, value)}
                />
              );
            }
            return (
              <EditorTextField
                key={field.key}
                label={field.label}
                value={item[field.key]}
                onChange={(value) => handleUpdate(index, field.key, value)}
                placeholder={field.label}
                multiline={field.type === "richtext"}
              />
            );
          })}
        </div>
      ))}
      {(allowMultiple || items.length === 0) && (
        <button className="mobile-editor-add-btn" onClick={handleAdd} type="button">
          <Plus size={14} />
          <span>Add</span>
        </button>
      )}
    </EditorAccordion>
  );
};
