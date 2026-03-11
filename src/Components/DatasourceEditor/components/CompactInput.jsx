import React from "react";

/**
 * Compact input with inline label for properties panel.
 * Mirrors gdc-premium Designer CompactInput with identical API.
 */
export const CompactInput = ({ label, value, onChange, type = "number", suffix, min, max, step, style }) => (
  <div className="props-compact-input" style={style}>
    <span className="props-compact-label">{label}</span>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      min={min}
      max={max}
      step={step}
      className="props-compact-field"
      aria-label={label}
    />
    {suffix && <span className="props-compact-suffix">{suffix}</span>}
  </div>
);
