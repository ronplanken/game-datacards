/**
 * Select input for mobile editor, styled to match EditorTextField.
 */
export const EditorSelectField = ({ label, value, onChange, options, className = "" }) => {
  return (
    <div className={`mobile-editor-field ${className}`}>
      {label && <label className="mobile-editor-field-label">{label}</label>}
      <select className="mobile-editor-field-input" value={value || ""} onChange={(e) => onChange(e.target.value)}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};
