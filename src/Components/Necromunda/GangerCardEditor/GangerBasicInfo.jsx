import { Form, Input, Select } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";

const { Option } = Select;

export function GangerBasicInfo() {
  const { activeCard, updateActiveCard } = useCardStorage();

  return (
    <>
      <Form.Item label={"Name"}>
        <Input
          type={"text"}
          value={activeCard.name}
          onChange={(e) =>
            updateActiveCard({ ...activeCard, name: e.target.value })
          }
        />
      </Form.Item>
      <Form.Item label={"Type"}>
        <Input
          type={"text"}
          value={activeCard.type}
          onChange={(e) =>
            updateActiveCard({ ...activeCard, type: e.target.value })
          }
        />
      </Form.Item>
    </>
  );
}
