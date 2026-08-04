import { Form } from "antd";
import { CustomMarkdownEditor } from "../../CustomMarkdownEditor";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { localize, setLocalizedField } from "../../../Helpers/localization.helpers";

// 11th edition leader is a single language-keyed markdown string (rendered with
// ■ bullets by the card).
export function UnitLeader() {
  const { activeCard, updateActiveCard } = useCardStorage();
  const { settings } = useSettingsStorage();
  const lang = settings.language;

  return (
    <Form size="small">
      <Form.Item>
        <CustomMarkdownEditor
          value={localize(activeCard.leader, lang)}
          onChange={(value) => {
            updateActiveCard(() => {
              return { ...activeCard, leader: setLocalizedField(activeCard.leader, lang, value || "") };
            });
          }}
        />
      </Form.Item>
    </Form>
  );
}
