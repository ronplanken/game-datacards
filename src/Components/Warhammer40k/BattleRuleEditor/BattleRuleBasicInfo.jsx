import MDEditor, { commands } from "@uiw/react-md-editor";
import { Card, Col, Form, Input, Row, Select } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { FactionSelect } from "../FactionSelect";

const { Option } = Select;

export function BattleRuleBasicInfo() {
  const { activeCard, updateActiveCard } = useCardStorage();

  return (
    <Form>
      <Form.Item label={"Name"}>
        <Input
          type={"text"}
          value={activeCard.name}
          onChange={(e) => updateActiveCard({ ...activeCard, name: e.target.value })}
        />
      </Form.Item>
      <Form.Item label={"Rule type"}>
        <Input
          type={"text"}
          value={activeCard.rule_type}
          onChange={(e) => updateActiveCard({ ...activeCard, rule_type: e.target.value })}
        />
      </Form.Item>
      <Form.Item label={"Rule subtype"}>
        <Input
          type={"text"}
          value={activeCard.rule_subtype}
          onChange={(e) => updateActiveCard({ ...activeCard, rule_subtype: e.target.value })}
        />
      </Form.Item>
      <Form.Item label={"Flavor Text"}>
        <Input
          type={"text"}
          value={activeCard.flavor_text}
          onChange={(e) => updateActiveCard({ ...activeCard, flavor_text: e.target.value })}
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
              value={activeCard.main_desc}
              onChange={(value) =>
                updateActiveCard(() => {
                  return { ...activeCard, main_desc: value };
                })
              }
            />
          </Col>
        </Row>
      </Card>
    </Form>
  );
}
