import { Form, Input, Row, Col } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";

export function WarscrollStats() {
  const { activeCard, updateActiveCard } = useCardStorage();

  const updateStat = (statName, value) => {
    updateActiveCard({
      ...activeCard,
      stats: {
        ...activeCard.stats,
        [statName]: value,
      },
    });
  };

  return (
    <Form>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label={"Move"}>
            <Input
              type={"text"}
              value={activeCard.stats?.move || ""}
              onChange={(e) => updateStat("move", e.target.value)}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label={"Save"}>
            <Input
              type={"text"}
              value={activeCard.stats?.save || ""}
              onChange={(e) => updateStat("save", e.target.value)}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label={"Control"}>
            <Input
              type={"text"}
              value={activeCard.stats?.control || ""}
              onChange={(e) => updateStat("control", e.target.value)}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label={"Health"}>
            <Input
              type={"text"}
              value={activeCard.stats?.health || ""}
              onChange={(e) => updateStat("health", e.target.value)}
            />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item label={"Ward"}>
        <Input
          type={"text"}
          value={activeCard.stats?.ward || ""}
          onChange={(e) => updateStat("ward", e.target.value)}
        />
      </Form.Item>
    </Form>
  );
}
