import { ArrowLeft } from "lucide-react";

/**
 * Full-screen sub-view that slides in from the right.
 * Used for weapon list and weapon profile drill-downs.
 * Scroll lock is managed by the parent MobileCardEditor (which already locks body scroll).
 */
export const DrillDownView = ({ isOpen, onClose, title, children }) => {
  return (
    <div className={`mobile-editor-drilldown ${isOpen ? "open" : ""}`}>
      <div className="mobile-editor-header">
        <button className="mobile-editor-back" onClick={onClose} type="button">
          <ArrowLeft size={20} />
        </button>
        <span className="mobile-editor-header-title">{title}</span>
        <div style={{ width: 36 }} />
      </div>
      <div className="mobile-editor-content">{children}</div>
    </div>
  );
};
