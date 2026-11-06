import { Form, Input, Select } from "antd";
import React, { useMemo } from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { useDataSourceStorage } from "../../../Hooks/useDataSourceStorage";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { FactionSelect } from "../FactionSelect";
import { localize, setLocalizedField } from "../../../Helpers/localization.helpers";
import { getDetachmentDispositionNames, getDetachmentForceDispositions } from "../../../Helpers/listRoster.helpers";

const { Option } = Select;

// 11th edition rule name / detachment are language-keyed; ruleType is a plain
// enum (army | detachment).
export function RuleBasicInfo() {
  const { activeCard, updateActiveCard } = useCardStorage();
  const { settings } = useSettingsStorage();
  const { dataSource } = useDataSourceStorage();
  const lang = settings.language;

  const dispositionOptions = useMemo(() => {
    const names = new Set();
    for (const faction of dataSource?.data || []) {
      for (const detachment of Array.isArray(faction?.detachments) ? faction.detachments : []) {
        getDetachmentDispositionNames(detachment, "en").forEach((name) => names.add(name));
      }
    }
    return [...names].sort().map((name) => ({ label: name, value: name }));
  }, [dataSource?.data]);

  const dispositionValues = getDetachmentForceDispositions(activeCard).map((entry) => localize(entry.name, "en"));

  const updateDispositions = (values) => {
    const names = [...new Set((values || []).map((value) => String(value).trim()).filter(Boolean))];
    const next = { ...activeCard, forceDispositions: names.map((name) => ({ name })) };
    delete next.forceDisposition;
    if (names.length === 0) delete next.forceDispositions;
    updateActiveCard(next);
  };

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
      {activeCard.ruleType === "detachment" && (
        <Form.Item label={"Detachment Points"}>
          <Select
            value={Number(activeCard.detachmentPoints) || 1}
            onChange={(value) => updateActiveCard({ ...activeCard, detachmentPoints: value })}>
            <Option value={1}>1 DP</Option>
            <Option value={2}>2 DP</Option>
            <Option value={3}>3 DP</Option>
          </Select>
        </Form.Item>
      )}
      {activeCard.ruleType === "detachment" && (
        <Form.Item label={"Force dispositions"}>
          <Select
            mode="tags"
            value={dispositionValues}
            options={dispositionOptions}
            placeholder="Select or type a force disposition"
            onChange={updateDispositions}
          />
        </Form.Item>
      )}
    </Form>
  );
}
