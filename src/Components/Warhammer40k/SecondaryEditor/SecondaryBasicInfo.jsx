import { Form, Input, Select } from "antd";
import TextArea from "antd/lib/input/TextArea";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";

const { Option } = Select;

export function SecondaryBasicInfo() {
  const { activeCard, updateActiveCard } = useCardStorage();

  return (
    <>
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
      <Form.Item label={"Category"}>
        <Select
          value={activeCard.category || "PURGE THE ENEMY"}
          onChange={(value) => updateActiveCard({ ...activeCard, category: value })}>
          <Option value="PURGE THE ENEMY">PURGE THE ENEMY</Option>
          <Option value="NO MERCY, NO RESPITE">NO MERCY, NO RESPITE</Option>
          <Option value="WARPCRAFT">WARPCRAFT</Option>
          <Option value="BATTLEFIELD SUPREMACY">BATTLEFIELD SUPREMACY</Option>
          <Option value="SHADOW OPERATIONS">SHADOW OPERATIONS</Option>
        </Select>
      </Form.Item>
      <Form.Item label={"Description"}>
        <TextArea
          type="text"
          value={activeCard.description}
          name="description"
          rows={4}
          onChange={(e) => updateActiveCard({ ...activeCard, description: e.target.value })}
        />
      </Form.Item>
      <Form.Item label={"Faction"}>
        <Input
          type={"text"}
          value={activeCard.faction}
          onChange={(e) => updateActiveCard({ ...activeCard, faction: e.target.value })}
        />
      </Form.Item>
      {activeCard.subfaction && (
        <Form.Item label={"Subfaction"}>
          <Input
            type={"text"}
            value={activeCard.subfaction}
            onChange={(e) => updateActiveCard({ ...activeCard, subfaction: e.target.value })}
          />
        </Form.Item>
      )}
    </>
  );
}
