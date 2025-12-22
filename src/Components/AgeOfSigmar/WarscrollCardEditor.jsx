import { Collapse, Switch, Select, Button, InputNumber, Typography } from "antd";
import { useState, useMemo } from "react";
import { Trash2 } from "lucide-react";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";
import { WarscrollBasicInfo } from "./WarscrollCardEditor/WarscrollBasicInfo";
import { WarscrollStylingInfo } from "./WarscrollCardEditor/WarscrollStylingInfo";
import { WarscrollStats } from "./WarscrollCardEditor/WarscrollStats";
import { WarscrollWeaponsEditor } from "./WarscrollCardEditor/WarscrollWeaponsEditor";
import { WarscrollAbilitiesEditor } from "./WarscrollCardEditor/WarscrollAbilitiesEditor";
import { WarscrollKeywordsEditor } from "./WarscrollCardEditor/WarscrollKeywordsEditor";

const { Panel } = Collapse;

export const WarscrollCardEditor = () => {
  const { activeCard, updateActiveCard } = useCardStorage();
  const { selectedFaction, dataSource } = useDataSourceStorage();
  const [activeKeys, setActiveKeys] = useState(["1"]);

  // Get faction for this card
  const cardFaction = dataSource?.data?.find((f) => f.id === activeCard?.faction_id) || selectedFaction;

  // Get all manifestation spells for the dropdown
  const allManifestationSpells = useMemo(() => {
    const spells = [];
    cardFaction?.manifestationLores?.forEach((lore) => {
      lore.spells?.forEach((spell) => {
        spells.push({
          label: `${spell.name} (${lore.name})`,
          value: spell.name,
          castingValue: spell.castingValue,
          loreName: lore.name,
        });
      });
    });
    return spells;
  }, [cardFaction]);

  const handleSetSummonedBy = (spellName) => {
    const selectedSpell = allManifestationSpells.find((s) => s.value === spellName);
    updateActiveCard({
      ...activeCard,
      summonedBy: {
        spell: spellName,
        lore: selectedSpell?.loreName,
        castingValue: selectedSpell?.castingValue,
      },
    });
  };

  const handleUpdateCastingValue = (value) => {
    updateActiveCard({
      ...activeCard,
      summonedBy: {
        ...activeCard.summonedBy,
        castingValue: value,
      },
    });
  };

  const handleRemoveSummonedBy = () => {
    const { summonedBy, ...rest } = activeCard;
    updateActiveCard(rest);
  };

  const handleWeaponVisibilityChange = (type, value, e) => {
    e.stopPropagation();
    const panelKey = type === "ranged" ? "3" : "4";
    if (!value) {
      setActiveKeys(activeKeys.filter((k) => k !== panelKey));
    }
    updateActiveCard({
      ...activeCard,
      showWeapons: {
        ...activeCard.showWeapons,
        [type]: value,
      },
    });
  };

  return (
    <Collapse activeKey={activeKeys} onChange={setActiveKeys}>
      <Panel header="Basic information" style={{ width: "100%" }} key="1">
        <WarscrollBasicInfo />
      </Panel>
      <Panel header="Styling" style={{ width: "100%" }} key="styling">
        <WarscrollStylingInfo />
      </Panel>
      <Panel header="Stats" style={{ width: "100%" }} key="2">
        <WarscrollStats />
      </Panel>
      <Panel
        header="Ranged weapons"
        style={{ width: "100%" }}
        key="3"
        collapsible={activeCard.showWeapons?.ranged === false ? "disabled" : undefined}
        extra={
          <Switch
            size="small"
            checked={activeCard.showWeapons?.ranged !== false}
            onClick={(value, e) => handleWeaponVisibilityChange("ranged", value, e)}
          />
        }>
        {activeCard.showWeapons?.ranged !== false && <WarscrollWeaponsEditor type="ranged" />}
      </Panel>
      <Panel
        header="Melee weapons"
        style={{ width: "100%" }}
        key="4"
        collapsible={activeCard.showWeapons?.melee === false ? "disabled" : undefined}
        extra={
          <Switch
            size="small"
            checked={activeCard.showWeapons?.melee !== false}
            onClick={(value, e) => handleWeaponVisibilityChange("melee", value, e)}
          />
        }>
        {activeCard.showWeapons?.melee !== false && <WarscrollWeaponsEditor type="melee" />}
      </Panel>
      <Panel header="Abilities" style={{ width: "100%" }} key="5">
        <WarscrollAbilitiesEditor />
      </Panel>
      <Panel header="Keywords" style={{ width: "100%" }} key="6">
        <WarscrollKeywordsEditor />
      </Panel>
      <Panel header="Links" style={{ width: "100%" }} key="7">
        <div style={{ marginBottom: "8px", color: "#666", fontSize: "12px" }}>
          Link this warscroll to a manifestation spell that summons it.
        </div>
        {activeCard.summonedBy ? (
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
              <div style={{ marginBottom: "4px" }}>
                <strong>Summoned by:</strong> {activeCard.summonedBy.spell}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Typography.Text style={{ fontSize: "12px" }}>Casting Value:</Typography.Text>
                <InputNumber
                  size="small"
                  min={1}
                  max={12}
                  value={activeCard.summonedBy.castingValue}
                  onChange={handleUpdateCastingValue}
                  style={{ width: "60px" }}
                />
              </div>
            </div>
            <Button type="text" size="small" icon={<Trash2 size={14} />} onClick={handleRemoveSummonedBy} />
          </div>
        ) : (
          <Select
            style={{ width: "100%" }}
            placeholder="Select a manifestation spell..."
            options={allManifestationSpells}
            onChange={handleSetSummonedBy}
            showSearch
            filterOption={(input, option) => option?.label?.toLowerCase().includes(input.toLowerCase())}
          />
        )}
      </Panel>
    </Collapse>
  );
};
