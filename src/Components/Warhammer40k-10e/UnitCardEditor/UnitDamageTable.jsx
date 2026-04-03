import { CustomMarkdownEditor } from "../../CustomMarkdownEditor";
import { Form, Input, Switch } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";

export function UnitDamageTable() {
  const { activeCard, updateActiveCard } = useCardStorage();
  const ability = activeCard?.abilities?.damaged;
  return (
    <Form size="small">
      <Form.Item label={"Range"}>
        <Input
          type={"text"}
          value={ability.range}
          onChange={(e) => {
            updateActiveCard(() => {
              const newDamaged = { ...activeCard.abilities.damaged };
              newDamaged.range = e.target.value;
              return {
                ...activeCard,
                abilities: { ...activeCard.abilities, damaged: newDamaged },
              };
            });
          }}
        />
      </Form.Item>
      <Form.Item label={"Show Description"}>
        <Switch
          checked={ability.showDescription}
          onChange={(value) => {
            updateActiveCard(() => {
              const newDamaged = { ...activeCard.abilities.damaged };
              newDamaged.showDescription = value;
              return {
                ...activeCard,
                abilities: { ...activeCard.abilities, damaged: newDamaged },
              };
            });
          }}
        />
      </Form.Item>
      <Form.Item label={"Description"}>
        <CustomMarkdownEditor
          value={ability.description}
          onChange={(value) => {
            updateActiveCard(() => {
              const newDamaged = { ...activeCard.abilities.damaged };
              newDamaged.description = value;
              return {
                ...activeCard,
                abilities: { ...activeCard.abilities, damaged: newDamaged },
              };
            });
          }}
        />
      </Form.Item>
    </Form>
  );
}
