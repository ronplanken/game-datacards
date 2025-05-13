import { Card, Form, Input, Select, Slider } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { FactionSelect } from "../FactionSelect";

const { Option } = Select;

export function EnhancementStylingInfo() {
  const { activeCard, updateActiveCard } = useCardStorage();
  return (
    <Form>
      <Card style={{ width: "100%" }} title={"Card"} type="inner">
        <Form.Item label={"Width"}>
          <Slider
            min={100}
            max={1000}
            step={10}
            marks={{ 260: "260" }}
            onChange={(val) => updateActiveCard({ ...activeCard, styling: { ...activeCard.styling, width: val } })}
            value={activeCard.styling?.width || "260"}></Slider>
        </Form.Item>
        <Form.Item label={"Height"}>
          <Slider
            min={100}
            max={1000}
            step={1}
            marks={{ 458: "458" }}
            onChange={(val) => updateActiveCard({ ...activeCard, styling: { ...activeCard.styling, height: val } })}
            value={activeCard.styling?.height || "458"}></Slider>
        </Form.Item>
      </Card>
      <Card style={{ width: "100%" }} title={"Content"} type="inner">
        <Form.Item label={"Text size"}>
          <Slider
            min={4}
            max={64}
            step={1}
            marks={{ 16: "16" }}
            onChange={(val) => updateActiveCard({ ...activeCard, styling: { ...activeCard.styling, textSize: val } })}
            value={activeCard.styling?.textSize || "16"}></Slider>
        </Form.Item>
        <Form.Item label={"Line height"}>
          <Slider
            min={0.2}
            max={3}
            step={0.1}
            marks={{ 1: "1" }}
            onChange={(val) => updateActiveCard({ ...activeCard, styling: { ...activeCard.styling, lineHeight: val } })}
            value={activeCard.styling?.lineHeight || "1"}></Slider>
        </Form.Item>
      </Card>
    </Form>
  );
}
