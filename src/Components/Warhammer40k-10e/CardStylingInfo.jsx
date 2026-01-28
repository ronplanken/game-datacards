import { Card, Form, Slider } from "antd";
import React from "react";
import { useCardStorage } from "../../Hooks/useCardStorage";

/**
 * Shared card styling component for Enhancement and Stratagem editors.
 *
 * Both card types have identical styling options: width, height, text size, and line height.
 * This component extracts that common functionality.
 *
 * @param {Object} props
 * @param {Object} props.defaults - Default values for the styling options
 * @param {number} props.defaults.width - Default width (default: 260)
 * @param {number} props.defaults.height - Default height (default: 458)
 * @param {number} props.defaults.textSize - Default text size (default: 16)
 * @param {number} props.defaults.lineHeight - Default line height (default: 1)
 */
export function CardStylingInfo({
  defaults = {
    width: 260,
    height: 458,
    textSize: 16,
    lineHeight: 1,
  },
}) {
  const { activeCard, updateActiveCard } = useCardStorage();

  return (
    <Form>
      <Card style={{ width: "100%" }} title={"Card"} type="inner">
        <Form.Item label={"Width"}>
          <Slider
            min={100}
            max={1000}
            step={10}
            marks={{ [defaults.width]: String(defaults.width) }}
            onChange={(val) => updateActiveCard({ ...activeCard, styling: { ...activeCard.styling, width: val } })}
            value={activeCard.styling?.width || defaults.width}
          />
        </Form.Item>
        <Form.Item label={"Height"}>
          <Slider
            min={100}
            max={1000}
            step={1}
            marks={{ [defaults.height]: String(defaults.height) }}
            onChange={(val) => updateActiveCard({ ...activeCard, styling: { ...activeCard.styling, height: val } })}
            value={activeCard.styling?.height || defaults.height}
          />
        </Form.Item>
      </Card>
      <Card style={{ width: "100%" }} title={"Content"} type="inner">
        <Form.Item label={"Text size"}>
          <Slider
            min={4}
            max={64}
            step={1}
            marks={{ [defaults.textSize]: String(defaults.textSize) }}
            onChange={(val) => updateActiveCard({ ...activeCard, styling: { ...activeCard.styling, textSize: val } })}
            value={activeCard.styling?.textSize || defaults.textSize}
          />
        </Form.Item>
        <Form.Item label={"Line height"}>
          <Slider
            min={0.2}
            max={3}
            step={0.1}
            marks={{ [defaults.lineHeight]: String(defaults.lineHeight) }}
            onChange={(val) => updateActiveCard({ ...activeCard, styling: { ...activeCard.styling, lineHeight: val } })}
            value={activeCard.styling?.lineHeight || defaults.lineHeight}
          />
        </Form.Item>
      </Card>
    </Form>
  );
}
