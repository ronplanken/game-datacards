import { Button, Card, Form, Input, Space, Switch } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";

export function UnitPoints() {
  const { activeCard, updateActiveCard } = useCardStorage();

  return (
    <>
      {activeCard?.points?.map((point, index) => (
        <Card
          key={`points-${index}`}
          type={"inner"}
          size={"small"}
          title={"Points"}
          bodyStyle={{ padding: point.active ? 8 : 0 }}
          style={{ marginBottom: "16px" }}
          extra={
            <Space>
              <Switch
                checked={point.active}
                onChange={(value) =>
                  updateActiveCard(() => {
                    const newPoints = [...activeCard.points];
                    newPoints[index]["active"] = value;
                    return { ...activeCard, points: newPoints };
                  })
                }
              />
            </Space>
          }>
          <Form size="small">
            <Form.Item label={"Models"}>
              <Input
                type={"text"}
                value={point.models}
                onChange={(e) => {
                  updateActiveCard(() => {
                    const newPoints = [...activeCard.points];
                    newPoints[index]["models"] = e.target.value;
                    return { ...activeCard, points: newPoints };
                  });
                }}
              />
            </Form.Item>
            <Form.Item label={"Cost"}>
              <Input
                type={"text"}
                value={point.cost}
                onChange={(e) => {
                  updateActiveCard(() => {
                    const newPoints = [...activeCard.points];
                    newPoints[index]["cost"] = e.target.value;
                    return { ...activeCard, points: newPoints };
                  });
                }}
              />
            </Form.Item>
          </Form>
        </Card>
      ))}
      <Button
        type="dashed"
        style={{ width: "100%" }}
        onClick={() =>
          updateActiveCard(() => {
            if (activeCard?.points) {
              const newPoints = [...activeCard?.points];
              newPoints.push({ active: true, models: 0, cost: 0 });
              return { ...activeCard, points: newPoints };
            }
            return { ...activeCard, points: [{ active: true, models: 0, cost: 0 }] };
          })
        }>
        Add points
      </Button>
    </>
  );
}
