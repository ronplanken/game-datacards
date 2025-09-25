import { CustomMarkdownEditor } from "../../CustomMarkdownEditor";
import { Card, Col, Form, Input, Row, Select } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";

const { Option } = Select;

export function StratagemBasicInfo() {
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
      <Form.Item label={"Cost"}>
        <Input
          type={"text"}
          value={activeCard.cost}
          onChange={(e) => updateActiveCard({ ...activeCard, cost: e.target.value })}
        />
      </Form.Item>
      <Form.Item label={"Faction"}>
        <Select
          value={activeCard.faction || "necrumunda"}
          onChange={(value) => updateActiveCard({ ...activeCard, faction: value })}>
          <Option value="NONE">None</Option>
          <Option value="basic">Basic</Option>
          <Option value="necromunda">Necromunda</Option>
        </Select>
      </Form.Item>
      <Card type={"inner"} size={"small"} title={"Description"} bodyStyle={{ padding: 0 }}>
        <Row justify="space-between" align="middle">
          <Col span={24}>
            <CustomMarkdownEditor
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
