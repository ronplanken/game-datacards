import { Form, Input, Select } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { FactionSelect } from "../FactionSelect";
import { localize, setLocalizedField } from "../../../Helpers/localization.helpers";

const { Option } = Select;

// 11th edition rule name / detachment are language-keyed; ruleType is a plain
// enum (army | detachment).
export function RuleBasicInfo() {
  const { activeCard, updateActiveCard } = useCardStorage();
  const { settings } = useSettingsStorage();
  const lang = settings.language;

  return (
    <Form>
      <Form.Item label={"Name"}>
        <Input
          type={"text"}
          value={localize(activeCard.name, lang)}
          onChange={(e) =>
            updateActiveCard({ ...activeCard, name: setLocalizedField(activeCard.name, lang, e.target.value) })
          }
        />
      </Form.Item>
      <Form.Item label={"Faction"}>
        <FactionSelect
          value={activeCard.faction_id}
          onChange={(value) => updateActiveCard({ ...activeCard, faction_id: value })}
        />
      </Form.Item>
      <Form.Item label={"Rule Type"}>
        <Select
          value={activeCard.ruleType || "army"}
          onChange={(value) => updateActiveCard({ ...activeCard, ruleType: value })}>
          <Option value="army">Army Rule</Option>
          <Option value="detachment">Detachment Rule</Option>
        </Select>
      </Form.Item>
      {activeCard.ruleType === "detachment" && (
        <Form.Item label={"Detachment"}>
          <Input
            type={"text"}
            value={localize(activeCard.detachment, lang)}
            onChange={(e) =>
              updateActiveCard({
                ...activeCard,
                detachment: setLocalizedField(activeCard.detachment, lang, e.target.value),
              })
            }
          />
        </Form.Item>
      )}
    </Form>
  );
}
