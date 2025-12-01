import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { X } from "lucide-react";

export const RenameModal = ({ isOpen, title, initialValue, onConfirm, onCancel }) => {
  const [value, setValue] = useState(initialValue || "");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setValue(initialValue || "");
      // Focus input after a small delay to ensure it's rendered
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen, initialValue]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && isOpen) {
        onCancel();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onCancel]);

  const handleSubmit = () => {
    if (value.trim()) {
      onConfirm(value.trim());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("tree-rename-modal-overlay")) {
      onCancel();
    }
  };

  if (!isOpen) return null;

  const modal = (
    <div className="tree-rename-modal-overlay" onClick={handleOverlayClick}>
      <div className="tree-rename-modal">
        <div className="tree-rename-modal-header">
          <h3 className="tree-rename-modal-title">{title}</h3>
          <button className="tree-rename-modal-close" onClick={onCancel}>
            <X size={14} />
          </button>
        </div>
        <div className="tree-rename-modal-body">
          <input
            ref={inputRef}
            type="text"
            className="tree-rename-modal-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter name..."
          />
        </div>
        <div className="tree-rename-modal-footer">
          <button className="tree-rename-modal-btn tree-rename-modal-btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="tree-rename-modal-btn tree-rename-modal-btn-ok"
            onClick={handleSubmit}
            disabled={!value.trim()}>
            OK
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
};
