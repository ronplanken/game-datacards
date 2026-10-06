import { Plus, Trash2 } from "lucide-react";
import { EditorAccordion } from "../shared/EditorAccordion";
import { EditorTextField } from "../shared/EditorTextField";

export const RulesListSection = ({ card, label, icon, replaceCard }) => {
  const rules = card.rules || [];

  const handleUpdate = (index, field, value) => {
    const updated = [...rules];
    updated[index] = { ...updated[index], [field]: value };
    replaceCard({ ...card, rules: updated });
  };

  const handleAdd = () => {
    const nextOrder = rules.length > 0 ? Math.max(...rules.map((r) => r.order || 0)) + 1 : 0;
    replaceCard({
      ...card,
      rules: [...rules, { type: "text", text: "", title: "", order: nextOrder }],
    });
  };

  const handleRemove = (index) => {
    replaceCard({ ...card, rules: rules.filter((_, i) => i !== index) });
  };

  const typeOptions = ["text", "header", "accordion", "quote", "textItalic"];

  return (
    <EditorAccordion title={label} icon={icon} badge={rules.length}>
      {rules.map((rule, index) => (
        <div key={index} className="mobile-editor-rule-item">
          <div className="mobile-editor-rule-header">
            <select
              className="mobile-editor-select"
              value={rule.type || "text"}
              onChange={(e) => handleUpdate(index, "type", e.target.value)}
              style={{ width: "auto", flex: "0 0 auto" }}>
              {typeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <button className="mobile-editor-weapon-delete" onClick={() => handleRemove(index)} type="button">
              <Trash2 size={14} />
            </button>
          </div>
          {(rule.type === "header" || rule.type === "accordion") && (
            <EditorTextField
              label="Title"
              value={rule.title}
              onChange={(value) => handleUpdate(index, "title", value)}
              placeholder="Title"
            />
          )}
          <EditorTextField
            label="Text"
            value={rule.text}
            onChange={(value) => handleUpdate(index, "text", value)}
            placeholder="Rule text"
            multiline
          />
        </div>
      ))}
      <button className="mobile-editor-add-btn" onClick={handleAdd} type="button">
        <Plus size={14} />
        <span>Add Rule</span>
      </button>
    </EditorAccordion>
  );
};
