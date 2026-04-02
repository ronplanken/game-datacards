import { useState } from "react";
import { X, Plus } from "lucide-react";

/**
 * Tag chip editor with add/remove.
 * Tags display as chips with X to remove, plus an inline add input.
 */
export const EditorTagInput = ({ label, tags = [], onChange, placeholder = "Type and press Enter" }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTag, setNewTag] = useState("");

  const handleRemove = (index) => {
    const updated = tags.filter((_, i) => i !== index);
    onChange?.(updated);
  };

  const handleAdd = () => {
    const trimmed = newTag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange?.([...tags, trimmed]);
    }
    setNewTag("");
    setIsAdding(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    } else if (e.key === "Escape") {
      setNewTag("");
      setIsAdding(false);
    }
  };

  return (
    <div className="mobile-editor-tags">
      {label && <label className="mobile-editor-field-label">{label}</label>}
      <div className="mobile-editor-tags-wrap">
        {tags.map((tag, index) => (
          <span key={`${tag}-${index}`} className="mobile-editor-tag">
            <span className="mobile-editor-tag-text">{tag}</span>
            <button className="mobile-editor-tag-remove" onClick={() => handleRemove(index)} type="button">
              <X size={12} />
            </button>
          </span>
        ))}
        {isAdding ? (
          <input
            className="mobile-editor-tag-input"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleAdd}
            placeholder={placeholder}
            autoFocus
          />
        ) : (
          <button className="mobile-editor-tag-add" onClick={() => setIsAdding(true)} type="button">
            <Plus size={14} />
            <span>Add</span>
          </button>
        )}
      </div>
    </div>
  );
};
