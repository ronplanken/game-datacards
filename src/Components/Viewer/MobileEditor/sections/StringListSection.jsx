import { Plus, Trash2 } from "lucide-react";
import { EditorAccordion } from "../shared/EditorAccordion";
import { EditorTextField } from "../shared/EditorTextField";

/**
 * Generic editor for string arrays (wargear options, composition, leadBy).
 * Auto-detects whether each item is a string or object.
 */
export const StringListSection = ({ card, config, label, icon, replaceCard }) => {
  const { dataPath, itemLabel = "Item" } = config;
  const items = card[dataPath] || [];

  const getValue = (item) => {
    if (typeof item === "string") return item;
    return item?.name || "";
  };

  const setValue = (item, value) => {
    if (typeof item === "string") return value;
    return { ...item, name: value };
  };

  const handleUpdate = (index, value) => {
    const updated = [...items];
    updated[index] = setValue(updated[index], value);
    replaceCard({ ...card, [dataPath]: updated });
  };

  const handleAdd = () => {
    replaceCard({ ...card, [dataPath]: [...items, ""] });
  };

  const handleRemove = (index) => {
    replaceCard({ ...card, [dataPath]: items.filter((_, i) => i !== index) });
  };

  return (
    <EditorAccordion title={label} icon={icon} badge={items.length}>
      {items.map((item, index) => (
        <div key={index} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <EditorTextField
              value={getValue(item)}
              onChange={(value) => handleUpdate(index, value)}
              placeholder={`${itemLabel} ${index + 1}`}
              multiline
            />
          </div>
          <button
            className="mobile-editor-weapon-delete"
            onClick={() => handleRemove(index)}
            type="button"
            style={{ marginTop: 4 }}>
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button className="mobile-editor-add-btn" onClick={handleAdd} type="button">
        <Plus size={14} />
        <span>Add {itemLabel}</span>
      </button>
    </EditorAccordion>
  );
};
