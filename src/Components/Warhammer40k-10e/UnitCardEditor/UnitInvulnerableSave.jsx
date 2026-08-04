import { CustomMarkdownEditor } from "../../CustomMarkdownEditor";
import { Form, Input, Switch } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";

export function UnitInvulnerableSave() {
  const { activeCard, updateActiveCard } = useCardStorage();
  const ability = activeCard?.abilities?.invul;
  return (
    <Form size="small">
      <Form.Item label={"Save"}>
        <Input
          type={"text"}
          value={ability.value}
          onChange={(e) => {
            updateActiveCard(() => {
              const newAbility = { ...activeCard.abilities.invul };
              newAbility.value = e.target.value;
              return {
                ...activeCard,
                abilities: { ...activeCard.abilities, invul: newAbility },
              };
            });
          }}
        />
      </Form.Item>
      <Form.Item label={"Show extra info"}>
        <Switch
          checked={ability.showInfo}
          onChange={(value) => {
            updateActiveCard(() => {
              const newAbility = { ...activeCard.abilities.invul };
              newAbility.showInfo = value;
              return {
                ...activeCard,
                abilities: { ...activeCard.abilities, invul: newAbility },
              };
            });
          }}
        />
      </Form.Item>
      <Form.Item label={"Show at top"}>
        <Switch
          checked={ability.showAtTop}
          onChange={(value) => {
            updateActiveCard(() => {
              const newAbility = { ...activeCard.abilities.invul };
              newAbility.showAtTop = value;
              return {
                ...activeCard,
                abilities: { ...activeCard.abilities, invul: newAbility },
              };
            });
          }}
        />
      </Form.Item>
      <Form.Item label={"Extra info"}>
        <CustomMarkdownEditor
          value={ability.info}
          onChange={(value) => {
            updateActiveCard(() => {
              const newAbility = { ...activeCard.abilities.invul };
              newAbility.info = value;
              return {
                ...activeCard,
                abilities: { ...activeCard.abilities, invul: newAbility },
              };
            });
          }}
        />
      </Form.Item>
    </Form>
  );
}
