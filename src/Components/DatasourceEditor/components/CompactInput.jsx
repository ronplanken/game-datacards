import React, { useRef } from "react";
import { Tooltip } from "../../Tooltip/Tooltip";

/**
 * Compact input with inline label for properties panel.
 * Mirrors gdc-premium Designer CompactInput with identical API.
 *
 * Supports type="color" which renders a clickable swatch + hex text field.
 */
export const CompactInput = ({
  label,
  ariaLabel,
  tooltip,
  value,
  onChange,
  onBlur,
  type = "number",
  suffix,
  min,
  max,
  step,
  style,
}) => {
  const colorRef = useRef(null);

  if (type === "toggle") {
    return (
      <div className="props-compact-input" style={style}>
        <Tooltip content={tooltip} placement="top">
          <span className="props-compact-label">{label}</span>
        </Tooltip>
        <label className="props-compact-toggle">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            aria-label={ariaLabel || (typeof label === "string" ? label : undefined)}
          />
          <span className="props-compact-toggle-text">{ariaLabel}</span>
        </label>
      </div>
    );
  }

  if (type === "color") {
    return (
      <div className="props-compact-input" style={style}>
        <Tooltip content={tooltip} placement="top">
          <span className="props-compact-label">{label}</span>
        </Tooltip>
        <input
          ref={colorRef}
          type="color"
          value={value || "#000000"}
          onChange={(e) => onChange(e.target.value)}
          style={{ display: "none" }}
        />
        <button
          className="props-compact-swatch"
          style={{ backgroundColor: value || "#000000" }}
          onClick={() => colorRef.current?.click()}
          type="button"
          aria-label={`Pick ${ariaLabel || "color"}`}
        />
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur ? (e) => onBlur(e.target.value) : undefined}
          className="props-compact-field"
          aria-label={ariaLabel || (typeof label === "string" ? label : undefined)}
          placeholder="#000000"
        />
      </div>
    );
  }

  return (
    <div className="props-compact-input" style={style}>
      <Tooltip content={tooltip} placement="top">
        <span className="props-compact-label">{label}</span>
      </Tooltip>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur ? (e) => onBlur(e.target.value) : undefined}
        min={min}
        max={max}
        step={step}
        className="props-compact-field"
        aria-label={ariaLabel || (typeof label === "string" ? label : undefined)}
      />
      {suffix && <span className="props-compact-suffix">{suffix}</span>}
    </div>
  );
};
