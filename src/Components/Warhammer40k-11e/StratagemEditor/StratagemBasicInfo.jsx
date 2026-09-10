import { Form, Input, Select } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { FactionSelect } from "../FactionSelect";
import { localize, setLocalizedField } from "../../../Helpers/localization.helpers";

const { Option } = Select;

// 11th edition stratagem name / detachment / type are language-keyed; turn, cost
// and phase are plain values rendered directly by the card.
export function StratagemBasicInfo() {
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
      <Form.Item label={"Turn"}>
        <Select
          value={activeCard.turn || "your"}
          onChange={(value) => updateActiveCard({ ...activeCard, turn: value })}>
          <Option value="your">Your turn</Option>
          <Option value="either">Either turn</Option>
          <Option value="opponents">Opponents turn</Option>
        </Select>
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
      <Form.Item label={"Type"}>
        <Input
          type={"text"}
          value={localize(activeCard.type, lang)}
          onChange={(e) =>
            updateActiveCard({ ...activeCard, type: setLocalizedField(activeCard.type, lang, e.target.value) })
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
      <Form.Item label={"Phases"}>
        <Select
          mode="multiple"
          allowClear
          style={{ width: "100%" }}
          placeholder="Select a phase"
          value={activeCard.phase || []}
          onChange={(val) => updateActiveCard({ ...activeCard, phase: val })}
          options={[
            { label: "Any phase", value: "any" },
            { label: "Charge phase", value: "charge" },
            { label: "Fight phase", value: "fight" },
            { label: "Command phase", value: "command" },
            { label: "Movement phase", value: "movement" },
            { label: "Shooting phase", value: "shooting" },
          ]}
        />
      </Form.Item>
    </Form>
  );
}
