import { Collapse, Switch } from "antd";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { usePanelVisibility } from "./usePanelVisibility";
import { UnitBasicInfo } from "./UnitCardEditor/UnitBasicInfo";
import { UnitComposition } from "./UnitCardEditor/UnitComposition";
import { UnitKeywords } from "./UnitCardEditor/UnitKeywords";
import { UnitLeader } from "./UnitCardEditor/UnitLeader";
import { UnitLoadout } from "./UnitCardEditor/UnitLoadout";
import { UnitWargearOptions } from "./UnitCardEditor/UnitWargearOptions";

const { Panel } = Collapse;

export const UnitCardBackEditor = () => {
  const { activeCard, updateActiveCard } = useCardStorage();
  const { activeKeys, setActiveKeys, handleSimpleVisibilityChange } = usePanelVisibility(activeCard, updateActiveCard);

  return (
    <Collapse activeKey={activeKeys} onChange={setActiveKeys}>
      <Panel header="Basic information" style={{ width: "100%" }} key="1">
        <UnitBasicInfo />
      </Panel>
      <Panel
        header="Wargear Options"
        style={{ width: "100%" }}
        key="wargear_options"
        collapsible={activeCard.showWargear === false ? "disabled" : undefined}
        extra={
          <Switch
            size="small"
            checked={activeCard.showWargear !== false}
            onClick={(value, e) => handleSimpleVisibilityChange("showWargear", "wargear_options", value, e)}
          />
        }>
        {activeCard.showWargear !== false && <UnitWargearOptions />}
      </Panel>
      <Panel
        header="Composition"
        style={{ width: "100%" }}
        key="composition"
        collapsible={activeCard.showComposition === false ? "disabled" : undefined}
        extra={
          <Switch
            size="small"
            checked={activeCard.showComposition !== false}
            onClick={(value, e) => handleSimpleVisibilityChange("showComposition", "composition", value, e)}
          />
        }>
        {activeCard.showComposition !== false && <UnitComposition />}
      </Panel>
      <Panel
        header="Loadout"
        style={{ width: "100%" }}
        key="loadout"
        collapsible={activeCard.showLoadout === false ? "disabled" : undefined}
        extra={
          <Switch
            size="small"
            checked={activeCard.showLoadout !== false}
            onClick={(value, e) => handleSimpleVisibilityChange("showLoadout", "loadout", value, e)}
          />
        }>
        {activeCard.showLoadout !== false && <UnitLoadout />}
      </Panel>
      <Panel
        header="Leader"
        style={{ width: "100%" }}
        key="leader"
        collapsible={activeCard.showLeader === false ? "disabled" : undefined}
        extra={
          <Switch
            size="small"
            checked={activeCard.showLeader !== false}
            onClick={(value, e) => handleSimpleVisibilityChange("showLeader", "leader", value, e)}
          />
        }>
        {activeCard.showLeader !== false && <UnitLeader />}
      </Panel>
      <Panel header="Keywords" style={{ width: "100%" }} key="10">
        <UnitKeywords type={"keywords"} localized />
        <UnitKeywords type={"factions"} />
      </Panel>
    </Collapse>
  );
};
