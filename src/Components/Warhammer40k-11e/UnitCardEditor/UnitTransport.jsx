import { Form } from "antd";
import { CustomMarkdownEditor } from "../../CustomMarkdownEditor";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { localize, setLocalizedField } from "../../../Helpers/localization.helpers";

// 11th edition transport is a single language-keyed markdown string
// ("This model has a transport capacity of N ... models.").
export function UnitTransport() {
  const { activeCard, updateActiveCard } = useCardStorage();
  const { settings } = useSettingsStorage();
  const lang = settings.language;

  return (
    <Form size="small">
      <Form.Item>
        <CustomMarkdownEditor
          value={localize(activeCard.transport, lang)}
          onChange={(value) => {
            updateActiveCard(() => {
              return { ...activeCard, transport: setLocalizedField(activeCard.transport, lang, value || "") };
            });
          }}
        />
      </Form.Item>
    </Form>
  );
}
