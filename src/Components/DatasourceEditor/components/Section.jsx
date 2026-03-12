import React, { useState } from "react";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";

/**
 * Collapsible section wrapper for properties panel.
 * Optional onAdd callback renders a "+" button in the header.
 */
export const Section = ({ title, icon: Icon, defaultOpen = true, onAdd, addLabel, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="props-section">
      <div className="props-section-header-row">
        <button
          className="props-section-header"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label={`${isOpen ? "Collapse" : "Expand"} ${title}`}>
          {Icon && <Icon size={12} stroke={1.5} className="props-section-icon" />}
          <span className="props-section-title">{title}</span>
          {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>
        {onAdd && (
          <button
            className="props-section-header-action"
            onClick={onAdd}
            aria-label={addLabel || `Add ${title.toLowerCase()}`}
            title={addLabel || `Add ${title.toLowerCase()}`}>
            <Plus size={12} />
          </button>
        )}
      </div>
      {isOpen && <div className="props-section-content">{children}</div>}
    </div>
  );
};
