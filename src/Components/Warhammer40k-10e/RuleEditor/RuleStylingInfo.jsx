import { Card, Form, Switch } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { SliderWithInput } from "../../Shared/SliderWithInput";

export function RuleStylingInfo() {
  const { activeCard, updateActiveCard } = useCardStorage();

  return (
    <Form>
      <Card style={{ width: "100%" }} title={"Card"} type="inner">
        <Form.Item label={"Width"}>
          <SliderWithInput
            min={200}
            max={800}
            step={10}
            marks={{ 460: "460" }}
            onChange={(val) => updateActiveCard({ ...activeCard, styling: { ...activeCard.styling, width: val } })}
            value={activeCard.styling?.width || 460}
          />
        </Form.Item>
        <Form.Item label={"Auto Height"}>
          <Switch
            checked={activeCard.styling?.autoHeight !== false}
            onChange={(val) => updateActiveCard({ ...activeCard, styling: { ...activeCard.styling, autoHeight: val } })}
          />
        </Form.Item>
        {activeCard.styling?.autoHeight === false && (
          <Form.Item label={"Height"}>
            <SliderWithInput
              min={200}
              max={1200}
              step={10}
              marks={{ 620: "620" }}
              onChange={(val) => updateActiveCard({ ...activeCard, styling: { ...activeCard.styling, height: val } })}
              value={activeCard.styling?.height || 620}
            />
          </Form.Item>
        )}
      </Card>
      <Card style={{ width: "100%", marginTop: "8px" }} title={"Content"} type="inner">
        <Form.Item label={"Text size"}>
          <SliderWithInput
            min={8}
            max={24}
            step={1}
            marks={{ 14: "14" }}
            onChange={(val) => updateActiveCard({ ...activeCard, styling: { ...activeCard.styling, textSize: val } })}
            value={activeCard.styling?.textSize || 14}
          />
        </Form.Item>
      </Card>
    </Form>
  );
}
