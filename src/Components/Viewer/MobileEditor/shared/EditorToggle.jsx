/**
 * Auto-saving boolean toggle matching the existing ListAdd toggle pattern.
 */
export const EditorToggle = ({ label, checked, onChange, disabled = false }) => {
  return (
    <div className="mobile-editor-toggle-row">
      {label && <span className="mobile-editor-toggle-label">{label}</span>}
      <button
        className={`mobile-editor-toggle ${checked ? "active" : ""} ${disabled ? "disabled" : ""}`}
        onClick={() => !disabled && onChange?.(!checked)}
        disabled={disabled}
        type="button">
        <span className="mobile-editor-toggle-thumb" />
      </button>
    </div>
  );
};
