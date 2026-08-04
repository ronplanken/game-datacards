import { Form, Input } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { FactionSelect } from "../FactionSelect";
import { localize, setLocalizedField } from "../../../Helpers/localization.helpers";

// 11th edition enhancement name / detachment are language-keyed; cost is plain.
export function EnhancementBasicInfo() {
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
      <Form.Item label={"Cost"}>
        <Input
          type={"text"}
          value={activeCard.cost}
          onChange={(e) => updateActiveCard({ ...activeCard, cost: e.target.value })}
        />
      </Form.Item>
    </Form>
  );
}
