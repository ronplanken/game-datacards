import { Form, Input, Select, Switch } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { FactionSelect } from "../FactionSelect";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";

const { Option } = Select;

export function UnitStylingInfo() {
  const { activeCard, updateActiveCard } = useCardStorage();
  const { settings, updateSettings } = useSettingsStorage();

  return (
    <Form>
      <Form.Item label={"External Image"}>
        <Input
          type={"text"}
          value={activeCard.externalImage}
          onChange={(e) => updateActiveCard({ ...activeCard, externalImage: e.target.value })}
        />
      </Form.Item>
    </Form>
  );
}
