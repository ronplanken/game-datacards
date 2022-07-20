import { Form, Input } from "antd";
import TextArea from "antd/lib/input/TextArea";
import React from "react";
import { useCardStorage } from "../../Hooks/useCardStorage";

export function StratagemBasicInfo() {
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
          value={activeCard.name}
          onChange={(e) =>
            updateActiveCard({ ...activeCard, name: e.target.value })
          }
        />
      </Form.Item>
      <Form.Item label={"CP Cost"}>
        <Input
          type={"text"}
          value={activeCard.cp_cost}
          onChange={(e) =>
            updateActiveCard({ ...activeCard, cp_cost: e.target.value })
          }
        />
      </Form.Item>
      <Form.Item label={"Description"}>
        <TextArea
          type="text"
          value={activeCard.description}
          name="description"
          rows={4}
          onChange={(e) =>
            updateActiveCard({ ...activeCard, description: e.target.value })
          }
        />
      </Form.Item>
    </>
  );
}
