import { Form, Input, Select } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { FactionSelect } from "../FactionSelect";

const { Option } = Select;

export function RuleBasicInfo() {
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
      <Form.Item label={"Rule Type"}>
        <Select
          value={activeCard.ruleType || "army"}
          onChange={(value) => updateActiveCard({ ...activeCard, ruleType: value })}>
          <Option value="army">Army Rule</Option>
          <Option value="detachment">Detachment Rule</Option>
        </Select>
      </Form.Item>
      {activeCard.ruleType === "detachment" && (
        <Form.Item label={"Detachment"}>
          <Input
            type={"text"}
            value={activeCard.detachment}
            onChange={(e) => updateActiveCard({ ...activeCard, detachment: e.target.value })}
          />
        </Form.Item>
      )}
    </Form>
  );
}
