import { useState, useEffect } from "react";

/**
 * Auto-saving number/string input for stat values.
 * Allows non-numeric values like "3+" or "2d6" for game stats.
 */
export const EditorNumberField = ({ label, value, onChange, placeholder, className = "" }) => {
  const [localValue, setLocalValue] = useState(value ?? "");

  useEffect(() => {
    setLocalValue(value ?? "");
  }, [value]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
  };

  const handleBlur = () => {
    onChange?.(localValue);
  };

  return (
    <div className={`mobile-editor-stat-cell ${className}`}>
      {label && <label>{label}</label>}
      <input
        className="mobile-editor-stat-input"
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        inputMode="text"
      />
    </div>
  );
};
