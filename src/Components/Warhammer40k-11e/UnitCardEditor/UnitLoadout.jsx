import { Form } from "antd";
import { CustomMarkdownEditor } from "../../CustomMarkdownEditor";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { localize, setLocalizedField } from "../../../Helpers/localization.helpers";

// 11th edition loadout is a single language-keyed markdown string.
export function UnitLoadout() {
  const { activeCard, updateActiveCard } = useCardStorage();
  const { settings } = useSettingsStorage();
  const lang = settings.language;

  return (
    <Form size="small">
      <Form.Item>
        <CustomMarkdownEditor
          value={localize(activeCard.loadout, lang)}
          onChange={(value) => {
            updateActiveCard(() => {
              return { ...activeCard, loadout: setLocalizedField(activeCard.loadout, lang, value || "") };
            });
          }}
        />
      </Form.Item>
    </Form>
  );
}
