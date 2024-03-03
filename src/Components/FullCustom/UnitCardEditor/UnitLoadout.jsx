import MDEditor, { commands } from "@uiw/react-md-editor";
import { Card, Form, Select } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";

const { Option } = Select;

export function UnitLoadout() {
  const { activeCard, updateActiveCard } = useCardStorage();

  return (
    <>
      <Card type={"inner"} size={"small"} title={`Loadout`} style={{ marginBottom: "16px" }}>
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
