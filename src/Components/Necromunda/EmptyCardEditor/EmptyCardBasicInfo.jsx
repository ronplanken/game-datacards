import { Form, Select } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";

const { Option } = Select;

export function EmptyCardBasicInfo() {
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
    </>
  );
}
