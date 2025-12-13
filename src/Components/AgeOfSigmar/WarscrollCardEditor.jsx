import { Collapse, Switch } from "antd";
import { useState } from "react";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { WarscrollBasicInfo } from "./WarscrollCardEditor/WarscrollBasicInfo";
import { WarscrollStylingInfo } from "./WarscrollCardEditor/WarscrollStylingInfo";
import { WarscrollStats } from "./WarscrollCardEditor/WarscrollStats";
import { WarscrollWeaponsEditor } from "./WarscrollCardEditor/WarscrollWeaponsEditor";
import { WarscrollAbilitiesEditor } from "./WarscrollCardEditor/WarscrollAbilitiesEditor";
import { WarscrollKeywordsEditor } from "./WarscrollCardEditor/WarscrollKeywordsEditor";

const { Panel } = Collapse;

export const WarscrollCardEditor = () => {
  const { activeCard, updateActiveCard } = useCardStorage();
  const [activeKeys, setActiveKeys] = useState(["1"]);

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
    </Collapse>
  );
};
