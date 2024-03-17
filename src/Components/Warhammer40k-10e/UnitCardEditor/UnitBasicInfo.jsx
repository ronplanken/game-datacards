import { Form, Input, Select, Switch } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { FactionSelect } from "../FactionSelect";

const { Option } = Select;

export function UnitBasicInfo() {
  const { activeCard, updateActiveCard } = useCardStorage();

  return (
    <Form>
      <Form.Item label={"Name"}>
        <Input
          type={"text"}
          value={activeCard.name}
          onChange={(e) => updateActiveCard({ ...activeCard, name: e.target.value })}
        />
      </Form.Item>
      <Form.Item label={"Extra"}>
        <Input
          type={"text"}
          value={activeCard.subname}
          onChange={(e) => updateActiveCard({ ...activeCard, subname: e.target.value })}
        />
      </Form.Item>
      <Form.Item label={"Faction"}>
        <FactionSelect
          value={activeCard.faction_id || "basic"}
          onChange={(value) => updateActiveCard({ ...activeCard, faction_id: value })}
        />
      </Form.Item>
      <Form.Item label={"Variant"}>
        <Select
          value={activeCard.variant || "double"}
          onChange={(value) => updateActiveCard({ ...activeCard, print_side: value })}>
          <Option value="front">Front</Option>
          <Option value="back">Back</Option>
        </Select>
      </Form.Item>
      <Form.Item label={"Print side"}>
        <Select
          value={activeCard.print_side || "front"}
          onChange={(value) => updateActiveCard({ ...activeCard, print_side: value })}>
          <Option value="front">Front</Option>
          <Option value="back">Back</Option>
        </Select>
      </Form.Item>
      <Form.Item label={"Legends"}>
        <Switch
          checked={activeCard.legends || false}
          onChange={(value) => updateActiveCard({ ...activeCard, legends: value })}
        />
      </Form.Item>
    </Form>
  );
}
