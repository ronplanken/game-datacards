import { Form, Input, Select, Switch } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { FactionSelect } from "../FactionSelect";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";

const { Option } = Select;

export function UnitBasicInfo() {
  const { activeCard, updateActiveCard } = useCardStorage();
  const { settings } = useSettingsStorage();

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
      {settings.showCardsAsDoubleSided !== true && (
        <>
          <Form.Item label={"Variant"}>
            <Select
              value={activeCard.variant || "double"}
              onChange={(value) => {
                if (value === "basic") {
                  updateActiveCard({ ...activeCard, variant: value, cardVisualStyle: "basic" });
                } else {
                  updateActiveCard({ ...activeCard, variant: value, cardVisualStyle: "default" });
                }
              }}>
              <Option value="full">Full card</Option>
              <Option value="double">Double sided</Option>
              <Option value="basic">Basic</Option>
            </Select>
          </Form.Item>
          {activeCard.variant === "double" && (
            <Form.Item label={"Print side"}>
              <Select
                value={activeCard.print_side || "front"}
                onChange={(value) => updateActiveCard({ ...activeCard, print_side: value })}>
                <Option value="front">Front</Option>
                <Option value="back">Back</Option>
              </Select>
            </Form.Item>
          )}
        </>
      )}
      {settings.showCardsAsDoubleSided === true && (
        <Form.Item label={"Variant"}>
          <Select value={"full"} disabled={true}>
            <Option value="full">Full card</Option>
            <Option value="double">Double sided</Option>
          </Select>
        </Form.Item>
      )}

      <Form.Item label={"Legends"}>
        <Switch
          checked={activeCard.legends || false}
          onChange={(value) => updateActiveCard({ ...activeCard, legends: value })}
        />
      </Form.Item>
    </Form>
  );
}
