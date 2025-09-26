import { CustomMarkdownEditor } from "../../CustomMarkdownEditor";
import { Card, Form, Select } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";

const { Option } = Select;

export function UnitTransport() {
  const { activeCard, updateActiveCard } = useCardStorage();

  return (
    <>
      <Card type={"inner"} size={"small"} title={`Transport`} style={{ marginBottom: "16px" }}>
        <Form size="small">
          <Form.Item>
            <CustomMarkdownEditor
              value={activeCard.transport}
              onChange={(value) => {
                updateActiveCard(() => {
                  return {
                    ...activeCard,
                    transport: value,
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
