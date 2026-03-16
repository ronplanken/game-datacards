import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { useSectionStateContext } from "../hooks/useSectionState";

/**
 * Collapsible section wrapper for properties panel.
 * Optional onAdd callback renders a "+" button in the header.
 *
 * Automatically uses SectionStateContext when available to persist open/closed state.
 * The `sectionKey` prop (defaults to `title`) identifies this section in the persisted state.
 */
export const Section = ({ title, sectionKey, icon: Icon, defaultOpen = true, onAdd, addLabel, children }) => {
  const ctx = useSectionStateContext();
  const key = sectionKey || title;

  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const hasContext = ctx !== null;
  const isOpen = hasContext ? ctx.isSectionOpen(key) : internalOpen;

  // Sync internal state when defaultOpen changes (e.g. switching card types)
  useEffect(() => {
    if (!hasContext) {
      setInternalOpen(defaultOpen);
    }
  }, [defaultOpen, hasContext]);

  const handleToggle = () => {
    if (hasContext) {
      ctx.toggleSection(key, !isOpen);
    } else {
      setInternalOpen(!isOpen);
    }
  };

  return (
    <div className="props-section">
      <div className="props-section-header-row">
        <button
          className="props-section-header"
          onClick={handleToggle}
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
