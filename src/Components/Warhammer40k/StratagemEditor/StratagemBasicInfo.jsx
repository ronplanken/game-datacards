import MDEditor, { commands } from "@uiw/react-md-editor";
import { Card, Col, Form, Input, Row, Select } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";

const { Option } = Select;

export function StratagemBasicInfo() {
  const { activeCard, updateActiveCard } = useCardStorage();

  return (
    <>
      <Form.Item label={"Variant"}>
        <Select
          value={activeCard.variant || "card"}
          onChange={(value) => updateActiveCard({ ...activeCard, variant: value })}>
          <Option value="card">Game-datacard</Option>
          <Option value="playingcard">Playingcard</Option>
          <Option value="poker">Poker / MTG</Option>
          <Option value="sheet">Sheet (A5)</Option>
          <Option value="a4">Sheet (A4)</Option>
          <Option value="letter">Sheet (US Letter)</Option>
          <Option value="letter-half">Sheet (Half US letter)</Option>
          <Option value="custom">Custom (Advanced)</Option>
        </Select>
      </Form.Item>
      {activeCard.variant === "custom" && (
        <>
          <Form.Item label={"Custom height (cm)"}>
            <Input
              type={"text"}
              placeholder={"Height in centimeters"}
              value={activeCard.height}
              onChange={(e) => updateActiveCard({ ...activeCard, height: e.target.value })}
            />
          </Form.Item>
          <Form.Item label={"Custom width (cm)"}>
            <Input
              type={"text"}
              placeholder={"Width in centimeters"}
              value={activeCard.width}
              onChange={(e) => updateActiveCard({ ...activeCard, width: e.target.value })}
            />
          </Form.Item>
        </>
      )}
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
      <Form.Item label={"CP Cost"}>
        <Input
          type={"text"}
          value={activeCard.cp_cost}
          onChange={(e) => updateActiveCard({ ...activeCard, cp_cost: e.target.value })}
        />
      </Form.Item>
      <Card type={"inner"} size={"small"} title={"Description"} bodyStyle={{ padding: 0 }}>
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
