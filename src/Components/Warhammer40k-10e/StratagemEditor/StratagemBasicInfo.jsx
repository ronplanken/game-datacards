import { Form, Input, Select, Slider } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { FactionSelect } from "../FactionSelect";

const { Option } = Select;

export function StratagemBasicInfo() {
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
      <Form.Item label={"Faction"}>
        <FactionSelect
          value={activeCard.faction_id || "basic"}
          onChange={(value) => updateActiveCard({ ...activeCard, faction_id: value })}
        />
      </Form.Item>
      <Form.Item label={"Turn"}>
        <Select
          value={activeCard.turn || "card"}
          onChange={(value) => updateActiveCard({ ...activeCard, turn: value })}>
          <Option value="your">Your turn</Option>
          <Option value="either">Either turn</Option>
          <Option value="opponents">Opponents turn</Option>
        </Select>
      </Form.Item>
      <Form.Item label={"Detachment"}>
        <Input
          type={"text"}
          value={activeCard.detachment}
          onChange={(e) => updateActiveCard({ ...activeCard, detachment: e.target.value })}
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
      <Form.Item label={"Phases"}>
        <Select
          mode="multiple"
          allowClear
          style={{ width: "100%" }}
          placeholder="Select a phase"
          value={[...activeCard.phase]}
          onChange={(val) => updateActiveCard({ ...activeCard, phase: val })}
          options={[
            {
              label: "Any phase",
              value: "any",
            },
            {
              label: "Charge phase",
              value: "charge",
            },
            {
              label: "Fight phase",
              value: "fight",
            },
            {
              label: "Command phase",
              value: "command",
            },
            {
              label: "Movement phase",
              value: "movement",
            },
            {
              label: "Shooting phase",
              value: "shooting",
            },
          ]}
        />
      </Form.Item>
    </Form>
  );
}
