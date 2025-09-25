import { Card, Col, Row, Space, Switch } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { CustomMarkdownEditor } from "../../CustomMarkdownEditor";

export function UnitDescription() {
  const { activeCard, updateActiveCard } = useCardStorage();

  return (
    <Card
      type={"inner"}
      size={"small"}
      title={"Description"}
      bodyStyle={{ padding: 0 }}
      extra={
        <Space>
          <Switch
            checked={activeCard.unit_composition_active}
            onChange={(value) => {
              updateActiveCard(() => {
                return { ...activeCard, unit_composition_active: value };
              });
            }}
          />
        </Space>
      }>
      {activeCard.unit_composition_active && (
        <Row justify="space-between" align="middle">
          <Col span={24}>
            <CustomMarkdownEditor
              value={activeCard.unit_composition}
              onChange={(e) =>
                updateActiveCard(() => {
                  return { ...activeCard, unit_composition: e };
                })
              }
            />
          </Col>
        </Row>
      )}
    </Card>
  );
}
