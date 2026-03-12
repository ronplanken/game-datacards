import React from "react";
import { Tooltip } from "../../Tooltip/Tooltip";

/**
 * Compact input with inline label for properties panel.
 * Mirrors gdc-premium Designer CompactInput with identical API.
 */
export const CompactInput = ({
  label,
  ariaLabel,
  tooltip,
  value,
  onChange,
  type = "number",
  suffix,
  min,
  max,
  step,
  style,
}) => (
  <div className="props-compact-input" style={style}>
    <Tooltip content={tooltip} placement="top">
      <span className="props-compact-label">{label}</span>
    </Tooltip>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      min={min}
      max={max}
      step={step}
      className="props-compact-field"
      aria-label={ariaLabel || (typeof label === "string" ? label : undefined)}
    />
    {suffix && <span className="props-compact-suffix">{suffix}</span>}
  </div>
);
