import { Col, InputNumber, Row, Slider } from "antd";
import React from "react";

const derivePrecision = (step) => {
  if (!step || step >= 1) return 0;
  const decimals = -Math.floor(Math.log10(step));
  return Math.max(0, decimals);
};

/**
 * Slider paired with an InputNumber for precise manual entry.
 *
 * Drop-in replacement for antd's <Slider>: every standard Slider prop passes through,
 * and the InputNumber to the right is kept in sync with the same value.
 *
 * When `tooltip.formatter` is provided and no explicit `formatter` is passed, the
 * tooltip formatter is mirrored onto the InputNumber so the displayed value matches
 * the slider tooltip (e.g. "+12px", "150%").
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

  const inputFormatter = formatter || tooltip?.formatter;
  const resolvedPrecision = precision ?? derivePrecision(step);

  return (
    <Row gutter={[8, 0]} align="middle" wrap={false}>
      <Col flex="auto">
        <Slider
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          marks={marks}
          tooltip={tooltip}
          disabled={disabled}
          {...sliderProps}
        />
      </Col>
      <Col flex="none">
        <InputNumber
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          precision={resolvedPrecision}
          formatter={inputFormatter}
          parser={parser}
          size="small"
          style={{ width: inputWidth }}
          {...inputProps}
        />
      </Col>
    </Row>
  );
};
