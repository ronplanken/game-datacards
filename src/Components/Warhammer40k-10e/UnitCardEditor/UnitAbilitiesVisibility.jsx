import { Card, Switch, Space } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";

export function UnitAbilitiesVisibility() {
  const { activeCard, updateActiveCard } = useCardStorage();

  return (
    <Card
      type={"inner"}
      size={"small"}
      title={`Abilities Section Visibility`}
      style={{ marginBottom: "16px" }}
      extra={
        <Space>
          <Switch
            checked={activeCard.showAbilities !== false}
            onChange={(value) => {
              updateActiveCard(() => {
                return {
                  ...activeCard,
                  showAbilities: value,
                };
              });
            }}
          />
        </Space>
      }>
    </Card>
  );
}
