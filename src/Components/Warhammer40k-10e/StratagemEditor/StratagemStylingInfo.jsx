import { Form, Input, Select, Slider } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { FactionSelect } from "../FactionSelect";

const { Option } = Select;

export function StratagemStylingInfo() {
  const { activeCard, updateActiveCard } = useCardStorage();
  console.log(activeCard);
  return (
    <Form>
      <Form.Item label={"Text size"}>
        <Slider
          min={4}
          max={32}
          step={1}
          onChange={(val) => updateActiveCard({ ...activeCard, textSize: val })}
          value={activeCard.textSize || 16}></Slider>
      </Form.Item>
    </Form>
  );
}
