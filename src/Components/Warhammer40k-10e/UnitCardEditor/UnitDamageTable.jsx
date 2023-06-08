import MDEditor, { commands } from "@uiw/react-md-editor";
import { Card, Form, Select, Space, Switch, Typography } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";

const { Option } = Select;

export function UnitDamageTable() {
  const { activeCard, updateActiveCard } = useCardStorage();
  const ability = activeCard?.abilities?.damaged;
  return (
    <>
      <Card
        type={"inner"}
        size={"small"}
        title={
          <Typography.Text
            ellipsis={{ rows: 1 }}
            editable={{
              onChange: (value) => {
                const newDamaged = { ...activeCard.abilities.damaged };
                newDamaged.range = value;
                return {
                  ...activeCard,
                  abilities: { ...activeCard.abilities, damaged: newDamaged },
                };
              },
            }}>
            {ability.range || "1-2 wounds remaining"}
          </Typography.Text>
        }
        style={{ marginBottom: "16px" }}
        bodyStyle={{ padding: ability.showDamagedAbility ? 8 : 0 }}
        extra={
          <Space>
            <Switch
              checked={ability.showDamagedAbility}
              onChange={(value) => {
                updateActiveCard(() => {
                  const newDamaged = { ...activeCard.abilities.damaged };
                  newDamaged.showDamagedAbility = value;
                  return {
                    ...activeCard,
                    abilities: { ...activeCard.abilities, damaged: newDamaged },
                  };
                });
              }}
            />
          </Space>
        }>
        {ability.showDamagedAbility && (
          <Form size="small">
            <Form.Item label={"Show Description"}>
              <Switch
                checked={ability.showDescription}
                onChange={(value) => {
                  updateActiveCard(() => {
                    const newDamaged = { ...activeCard.abilities.damaged };
                    newDamaged.showDescription = value;
                    return {
                      ...activeCard,
                      abilities: { ...activeCard.abilities, damaged: newDamaged },
                    };
                  });
                }}
              />
            </Form.Item>
            <Form.Item label={"Description"}>
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
                value={ability.description}
                onChange={(value) => {
                  updateActiveCard(() => {
                    const newDamaged = { ...activeCard.abilities.damaged };
                    newDamaged.description = value;
                    return {
                      ...activeCard,
                      abilities: { ...activeCard.abilities, damaged: newDamaged },
                    };
                  });
                }}
              />
            </Form.Item>
          </Form>
        )}
      </Card>
    </>
  );
}
