import { Collapse, Form, Input, InputNumber, Select, Button } from "antd";
import { useState, useMemo } from "react";
import { Trash2 } from "lucide-react";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";
import { FactionSelect } from "./FactionSelect";
import { CustomMarkdownEditor } from "../CustomMarkdownEditor";

const { Panel } = Collapse;
const { TextArea } = Input;

export const SpellCardEditor = () => {
  const { activeCard, updateActiveCard } = useCardStorage();
  const { selectedFaction, dataSource } = useDataSourceStorage();
  const [activeKeys, setActiveKeys] = useState(["1"]);

  // Get faction for this card
  const cardFaction = dataSource?.data?.find((f) => f.id === activeCard?.faction_id) || selectedFaction;

  // Get all warscrolls for the dropdown (filter to manifestation type warscrolls if possible)
  const allWarscrolls = useMemo(() => {
    const warscrolls = [];
    cardFaction?.warscrolls?.forEach((warscroll) => {
      warscrolls.push({
        label: warscroll.name,
        value: warscroll.name,
      });
    });
    return warscrolls.sort((a, b) => a.label.localeCompare(b.label));
  }, [cardFaction]);

  const handleSetLinkedWarscroll = (warscrollName) => {
    updateActiveCard({
      ...activeCard,
      linkedWarscroll: warscrollName,
    });
  };

  const handleRemoveLinkedWarscroll = () => {
    const { linkedWarscroll, ...rest } = activeCard;
    updateActiveCard(rest);
  };

  const handleKeywordsChange = (value) => {
    const keywords = value
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k);
    updateActiveCard({ ...activeCard, keywords });
  };

  return (
    <Collapse activeKey={activeKeys} onChange={setActiveKeys}>
      <Panel header="Basic Information" style={{ width: "100%" }} key="1">
        <Form>
          <Form.Item label="Name">
            <Input
              type="text"
              value={activeCard.name}
              onChange={(e) => updateActiveCard({ ...activeCard, name: e.target.value })}
            />
          </Form.Item>
          <Form.Item label="Lore Name">
            <Input
              type="text"
              value={activeCard.loreName}
              onChange={(e) => updateActiveCard({ ...activeCard, loreName: e.target.value })}
            />
          </Form.Item>
          <Form.Item label="Faction">
            <FactionSelect
              value={activeCard.faction_id || "NONE"}
              onChange={(value) => updateActiveCard({ ...activeCard, faction_id: value })}
            />
          </Form.Item>
          <Form.Item label="Casting Value">
            <InputNumber
              value={activeCard.castingValue}
              min={1}
              max={12}
              onChange={(value) => updateActiveCard({ ...activeCard, castingValue: value })}
            />
          </Form.Item>
        </Form>
      </Panel>
      <Panel header="Spell Text" style={{ width: "100%" }} key="2">
        <Form layout="vertical">
          <Form.Item label="Declare">
            <CustomMarkdownEditor
              value={activeCard.declare || ""}
              onChange={(value) => updateActiveCard({ ...activeCard, declare: value })}
              height={120}
            />
          </Form.Item>
          <Form.Item label="Effect">
            <CustomMarkdownEditor
              value={activeCard.effect || ""}
              onChange={(value) => updateActiveCard({ ...activeCard, effect: value })}
              height={120}
            />
          </Form.Item>
        </Form>
      </Panel>
      <Panel header="Keywords" style={{ width: "100%" }} key="3">
        <Form>
          <Form.Item label="Keywords (comma-separated)">
            <TextArea
              rows={2}
              value={activeCard.keywords?.join(", ") || ""}
              onChange={(e) => handleKeywordsChange(e.target.value)}
              placeholder="Spell, Prayer, etc."
            />
          </Form.Item>
        </Form>
      </Panel>
      <Panel header="Links" style={{ width: "100%" }} key="4">
        <div style={{ marginBottom: "8px", color: "#666", fontSize: "12px" }}>
          Link this spell to a warscroll it summons.
        </div>
        {activeCard.linkedWarscroll ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 12px",
              background: "#f0f0f0",
              border: "1px solid #d9d9d9",
              borderRadius: "4px",
              width: "100%",
            }}>
            <div style={{ flex: 1 }}>
              <strong>Summons:</strong> {activeCard.linkedWarscroll}
            </div>
            <Button type="text" size="small" icon={<Trash2 size={14} />} onClick={handleRemoveLinkedWarscroll} />
          </div>
        ) : (
          <Select
            style={{ width: "100%" }}
            placeholder="Select a warscroll..."
            options={allWarscrolls}
            onChange={handleSetLinkedWarscroll}
            showSearch
            filterOption={(input, option) => option?.label?.toLowerCase().includes(input.toLowerCase())}
          />
        )}
      </Panel>
    </Collapse>
  );
};
