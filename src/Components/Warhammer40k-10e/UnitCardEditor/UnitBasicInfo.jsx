import { Form, Input, Select } from "antd";
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
    </Form>
  );
}
