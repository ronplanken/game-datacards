import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

/**
 * Collapsible section wrapper for properties panel
 */
export const Section = ({ title, icon: Icon, defaultOpen = true, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="props-section">
      <button className="props-section-header" onClick={() => setIsOpen(!isOpen)}>
        {Icon && <Icon size={12} stroke={1.5} className="props-section-icon" />}
        <span className="props-section-title">{title}</span>
        {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
      </button>
      {isOpen && <div className="props-section-content">{children}</div>}
    </div>
  );
};
