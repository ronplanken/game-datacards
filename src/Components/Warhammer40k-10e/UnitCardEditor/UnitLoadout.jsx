import { Card, Form, Select, Switch, Space } from "antd";
import { CustomMarkdownEditor } from "../../CustomMarkdownEditor";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";

const { Option } = Select;

export function UnitLoadout() {
  const { activeCard, updateActiveCard } = useCardStorage();

  return (
    <>
      <Card
        type={"inner"}
        size={"small"}
        title={`Loadout`}
        style={{ marginBottom: "16px" }}
        extra={
          <Space>
            <Switch
              checked={activeCard.showLoadout !== false}
              onChange={(value) => {
                updateActiveCard(() => {
                  return {
                    ...activeCard,
                    showLoadout: value,
                  };
                });
              }}
            />
          </Space>
        }>
        <Form size="small">
          <Form.Item>
            <CustomMarkdownEditor
              value={activeCard.loadout}
              onChange={(value) => {
                updateActiveCard(() => {
                  return {
                    ...activeCard,
                    loadout: value,
                  };
                });
              }}
            />
          </Form.Item>
        </Form>
      </Card>
    </>
  );
}
