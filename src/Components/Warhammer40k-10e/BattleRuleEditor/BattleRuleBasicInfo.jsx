import { Form, Input, Select } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";

const { Option } = Select;

export function BattleRuleBasicInfo() {
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
      <Form.Item label={"Flavor Text"}>
        <Input
          type={"text"}
          value={activeCard.flavor_text}
          onChange={(e) => updateActiveCard({ ...activeCard, flavor_text: e.target.value })}
        />
      </Form.Item>
      <Form.Item label={"Main Description"}>
        <Input
          type={"text"}
          value={activeCard.main_desc}
          onChange={(e) => updateActiveCard({ ...activeCard, main_desc: e.target.value })}
        />
      </Form.Item>
    </Form>
  );
}
