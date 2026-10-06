import { Plus, Trash2 } from "lucide-react";
import { EditorAccordion } from "../shared/EditorAccordion";
import { SchemaFieldEditor } from "../shared/SchemaFieldEditor";
import { getDefaultValueForType } from "../../../../Helpers/customSchema.helpers";

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
      blank[f.key] = getDefaultValueForType(f);
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
          {fields.map((field) => (
            <SchemaFieldEditor
              key={field.key}
              field={field}
              value={item[field.key]}
              onChange={(value) => handleUpdate(index, field.key, value)}
            />
          ))}
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
