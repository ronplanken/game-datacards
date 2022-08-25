import MDEditor, { commands } from "@uiw/react-md-editor";
import { Card, Col, Form, Input, Row, Select } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";

const { Option } = Select;

export function SecondaryBasicInfo() {
  const { activeCard, updateActiveCard } = useCardStorage();

  return (
    <>
      <Form.Item label={"Name"}>
        <Input
          type={"text"}
          value={activeCard.name}
          onChange={(e) => updateActiveCard({ ...activeCard, name: e.target.value })}
        />
      </Form.Item>
      <Form.Item label={"Type"}>
        <Input
          type={"text"}
          value={activeCard.type}
          onChange={(e) => updateActiveCard({ ...activeCard, type: e.target.value })}
        />
      </Form.Item>
      <Form.Item label={"Category"}>
        <Input
          type={"text"}
          value={activeCard.category}
          onChange={(e) => updateActiveCard({ ...activeCard, category: e.target.value })}
        />
      </Form.Item>
      <Form.Item label={"Faction"}>
        <Select
          value={activeCard.faction || "basic"}
          onChange={(value) => updateActiveCard({ ...activeCard, faction: value })}>
          <Option value="NONE">None</Option>
          <Option value="basic">Basic</Option>
        </Select>
      </Form.Item>
      <Card
        type={"inner"}
        size={"small"}
        title={"Description"}
        bodyStyle={{ padding: 0 }}
        style={{ marginBottom: "16px" }}>
        <Row justify="space-between" align="middle">
          <Col span={24}>
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
              value={activeCard.description}
              onChange={(value) =>
                updateActiveCard(() => {
                  return { ...activeCard, description: value };
                })
              }
            />
          </Col>
        </Row>
      </Card>
    </>
  );
}
