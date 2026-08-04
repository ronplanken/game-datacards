import { useState } from "react";
import { ChevronDown } from "lucide-react";

export const EditorAccordion = ({ title, badge, icon: Icon, defaultOpen = true, actions, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`mobile-editor-section ${isOpen ? "is-open" : ""}`}>
      <button className="mobile-editor-section-header" onClick={() => setIsOpen(!isOpen)} type="button">
        <div className="mobile-editor-section-header-left">
          {Icon && (
            <span className="mobile-editor-section-icon">
              <Icon size={16} />
            </span>
          )}
          <span>{title}</span>
          {badge !== undefined && <span className="mobile-editor-section-badge">{badge}</span>}
        </div>
        <div className="mobile-editor-section-header-right">
          {actions && (
            <div className="mobile-editor-section-actions" onClick={(e) => e.stopPropagation()}>
              {actions}
            </div>
          )}
          <ChevronDown size={16} className={`mobile-editor-chevron ${isOpen ? "open" : ""}`} />
        </div>
      </button>
      <div className={`mobile-editor-section-body ${isOpen ? "is-open" : ""}`}>{isOpen && children}</div>
    </div>
  );
};
