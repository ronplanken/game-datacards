import { Form, Input, InputNumber, Switch } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { FactionSelect } from "../FactionSelect";

export function WarscrollBasicInfo() {
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
      <Form.Item label={"Subtitle"}>
        <Input
          type={"text"}
          value={activeCard.subname}
          onChange={(e) => updateActiveCard({ ...activeCard, subname: e.target.value })}
        />
      </Form.Item>
      <Form.Item label={"Faction"}>
        <FactionSelect
          value={activeCard.faction_id || "NONE"}
          onChange={(value) => updateActiveCard({ ...activeCard, faction_id: value })}
        />
      </Form.Item>
      <Form.Item label={"Points"}>
        <InputNumber
          value={activeCard.points}
          min={0}
          onChange={(value) => updateActiveCard({ ...activeCard, points: value })}
        />
      </Form.Item>
      <Form.Item label={"Model Count"}>
        <Input
          type={"text"}
          value={activeCard.modelCount}
          onChange={(e) => updateActiveCard({ ...activeCard, modelCount: e.target.value })}
        />
      </Form.Item>
      <Form.Item label={"Base Size"}>
        <Input
          type={"text"}
          value={activeCard.baseSize}
          onChange={(e) => updateActiveCard({ ...activeCard, baseSize: e.target.value })}
        />
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
