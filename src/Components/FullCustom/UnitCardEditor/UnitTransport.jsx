import MDEditor, { commands } from "@uiw/react-md-editor";
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
            <MDEditor
              preview="edit"
              commands={[
                commands.bold,
                commands.italic,
                commands.strikethrough,
                commands.hr,
                commands.divider,
                commands.unorderedListCommand,
                commands.orderedListCommand,
                commands.divider,
              ]}
              extraCommands={[]}
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
