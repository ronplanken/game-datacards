import { Form, Input, Select } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";

const { Option } = Select;

export function GangerBasicInfo() {
  const { activeCard, updateActiveCard } = useCardStorage();

  return (
    <>
      <Form.Item label={"Variant"}>
        <Select
          value={activeCard.variant || "card"}
          onChange={(value) => updateActiveCard({ ...activeCard, variant: value })}>
          <Option value="card">Regular</Option>
          <Option value="large">Large</Option>
        </Select>
      </Form.Item>
      <Form.Item label={"Name"}>
        <Input
          type={"text"}
          value={activeCard.name}
          onChange={(e) => updateActiveCard({ ...activeCard, name: e.target.value })}
        />
      </Form.Item>
      <Form.Item label={"Type"}>
        <Input
          type={"text"}
          value={activeCard.type}
          onChange={(e) => updateActiveCard({ ...activeCard, type: e.target.value })}
        />
      </Form.Item>
      <Form.Item label={"Cost"}>
        <Input
          type={"text"}
          value={activeCard.cost}
          onChange={(e) => updateActiveCard({ ...activeCard, cost: e.target.value })}
        />
      </Form.Item>
    </>
  );
}
