import MDEditor, { commands } from "@uiw/react-md-editor";
import { Card, Form, Input, Select, Space, Switch, Typography } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";

const { Option } = Select;

export function UnitInvulnerableSave() {
  const { activeCard, updateActiveCard } = useCardStorage();
  const ability = activeCard?.abilities?.invul;
  return (
    <>
      <Card
        type={"inner"}
        size={"small"}
        title={<Typography.Text>Invulnerable save</Typography.Text>}
        style={{ marginBottom: "16px" }}
        bodyStyle={{ padding: ability.showInvulnerableSave ? 8 : 0 }}
        extra={
          <Space>
            <Switch
              checked={ability.showInvulnerableSave}
              onChange={(value) => {
                updateActiveCard(() => {
                  const newAbility = { ...activeCard.abilities.invul };
                  newAbility.showInvulnerableSave = value;
                  return {
                    ...activeCard,
                    abilities: { ...activeCard.abilities, invul: newAbility },
                  };
                });
              }}
            />
          </Space>
        }>
        {ability.showInvulnerableSave && (
          <Form size="small">
            <Form.Item label={"Save"}>
              <Input
                type={"text"}
                value={ability.value}
                onChange={(e) => {
                  updateActiveCard(() => {
                    const newAbility = { ...activeCard.abilities.invul };
                    newAbility.value = e.target.value;
                    return {
                      ...activeCard,
                      abilities: { ...activeCard.abilities, invul: newAbility },
                    };
                  });
                }}
              />
            </Form.Item>
            <Form.Item label={"Show extra info"}>
              <Switch
                checked={ability.showInfo}
                onChange={(value) => {
                  updateActiveCard(() => {
                    const newAbility = { ...activeCard.abilities.invul };
                    newAbility.showInfo = value;
                    return {
                      ...activeCard,
                      abilities: { ...activeCard.abilities, invul: newAbility },
                    };
                  });
                }}
              />
            </Form.Item>
            <Form.Item label={"Extra info"}>
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
                value={ability.info}
                onChange={(value) => {
                  updateActiveCard(() => {
                    const newAbility = { ...activeCard.abilities.invul };
                    newAbility.info = value;
                    return {
                      ...activeCard,
                      abilities: { ...activeCard.abilities, invul: newAbility },
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
