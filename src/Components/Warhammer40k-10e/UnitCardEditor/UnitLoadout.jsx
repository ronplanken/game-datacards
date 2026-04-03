import { Form } from "antd";
import { CustomMarkdownEditor } from "../../CustomMarkdownEditor";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";

export function UnitLoadout() {
  const { activeCard, updateActiveCard } = useCardStorage();

  return (
    <Form size="small">
      <Form.Item>
        <CustomMarkdownEditor
          value={activeCard.loadout}
          onChange={(value) => {
            updateActiveCard(() => {
              return {
                ...activeCard,
                loadout: value || "",
              };
            });
          }}
        />
      </Form.Item>
    </Form>
  );
}
