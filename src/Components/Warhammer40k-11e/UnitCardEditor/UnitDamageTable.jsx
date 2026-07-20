import { CustomMarkdownEditor } from "../../CustomMarkdownEditor";
import { Form, Input } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { localize, setLocalizedField } from "../../../Helpers/localization.helpers";

// 11th edition damaged ability: { range:{lang}, description:{lang} }. The 11e
// renderer shows it whenever range or description has content, so there is no
// per-field show flag here (panel visibility is handled by the top-level
// showDamaged flag).
export function UnitDamageTable() {
  const { activeCard, updateActiveCard } = useCardStorage();
  const { settings } = useSettingsStorage();
  const lang = settings.language;
  const damaged = activeCard?.abilities?.damaged || {};

  const updateDamaged = (field, value) => {
    updateActiveCard(() => {
      const newDamaged = { ...(activeCard.abilities?.damaged || {}) };
      newDamaged[field] = setLocalizedField(newDamaged[field], lang, value);
      return {
        ...activeCard,
        abilities: { ...activeCard.abilities, damaged: newDamaged },
      };
    });
  };

  return (
    <Form size="small">
      <Form.Item label={"Range"}>
        <Input
          type={"text"}
          value={localize(damaged.range, lang)}
          onChange={(e) => updateDamaged("range", e.target.value)}
        />
      </Form.Item>
      <Form.Item label={"Description"}>
        <CustomMarkdownEditor
          value={localize(damaged.description, lang)}
          onChange={(value) => updateDamaged("description", value || "")}
        />
      </Form.Item>
    </Form>
  );
}
