import { InputNumber, Slider } from "antd";
import React from "react";
import "./SliderWithInput.css";

const derivePrecision = (step) => {
  if (!step || step >= 1) return 0;
  const str = String(step);
  const dot = str.indexOf(".");
  return dot === -1 ? 0 : str.length - dot - 1;
};

/**
 * Slider paired with an InputNumber for precise manual entry.
 *
 * Drop-in replacement for antd's <Slider>: every standard Slider prop passes through,
 * and the InputNumber to the right is kept in sync with the same value. The slider
 * tooltip formatter (if any) is intentionally NOT mirrored onto the input — the input
 * displays the bare number to keep editing unambiguous. Callers that want a unit label
 * next to the input can pass inputProps={{ addonAfter: "px" }}.
 */
export const SliderWithInput = ({
  min,
  max,
  step,
  value,
  onChange,
  marks,
  tooltip,
  disabled,
  inputWidth = 80,
  formatter,
  parser,
  precision,
  sliderProps = {},
  inputProps = {},
}) => {
  const handleChange = (next) => {
    if (next === null || next === undefined || Number.isNaN(next)) return;
    onChange?.(next);
  };

  const resolvedPrecision = precision ?? derivePrecision(step);

  return (
    <div className="slider-with-input">
      <div className="slider-with-input-track">
        <Slider
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          tooltip={tooltip}
          disabled={disabled}
          marks={marks}
          {...sliderProps}
        />
      </div>
      <div className="slider-with-input-number">
        <InputNumber
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          precision={resolvedPrecision}
          formatter={formatter}
          parser={parser}
          size="small"
          style={{ width: inputWidth }}
          {...inputProps}
        />
      </div>
    </div>
  );
};
