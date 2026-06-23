import { Form, Input } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";

// 11th edition invulnerable save is a single plain value rendered in the header.
export function UnitInvulnerableSave() {
  const { activeCard, updateActiveCard } = useCardStorage();
  const invul = activeCard?.abilities?.invul || {};

  return (
    <Form size="small">
      <Form.Item label={"Save"}>
        <Input
          type={"text"}
          value={invul.value}
          onChange={(e) => {
            updateActiveCard(() => {
              const newInvul = { ...(activeCard.abilities?.invul || {}) };
              newInvul.value = e.target.value;
              return {
                ...activeCard,
                abilities: { ...activeCard.abilities, invul: newInvul },
              };
            });
          }}
        />
      </Form.Item>
    </Form>
  );
}
