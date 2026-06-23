import { Collapse, Switch } from "antd";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { usePanelVisibility } from "./usePanelVisibility";
import { UnitBasicAbility } from "./UnitCardEditor/UnitBasicAbility";
import { UnitBasicInfo } from "./UnitCardEditor/UnitBasicInfo";
import { UnitComposition } from "./UnitCardEditor/UnitComposition";
import { UnitDamageTable } from "./UnitCardEditor/UnitDamageTable";
import { UnitExtendedAbilities } from "./UnitCardEditor/UnitExtendedAbilities";
import { UnitInvulnerableSave } from "./UnitCardEditor/UnitInvulnerableSave";
import { UnitKeywords } from "./UnitCardEditor/UnitKeywords";
import { UnitLeader } from "./UnitCardEditor/UnitLeader";
import { UnitLoadout } from "./UnitCardEditor/UnitLoadout";
import { UnitPoints } from "./UnitCardEditor/UnitPoints";
import { UnitStats } from "./UnitCardEditor/UnitStats";
import { UnitStylingInfo } from "./UnitCardEditor/UnitStylingInfo";
import { UnitWargearOptions } from "./UnitCardEditor/UnitWargearOptions";
import { UnitWeapons } from "./UnitCardEditor/UnitWeapons";

const { Panel } = Collapse;

export const UnitCardFullEditor = () => {
  const { activeCard, updateActiveCard } = useCardStorage();
  const {
    activeKeys,
    setActiveKeys,
    handleWeaponVisibilityChange,
    handleAbilityVisibilityChange,
    handleSimpleVisibilityChange,
  } = usePanelVisibility(activeCard, updateActiveCard);

  return (
    <Collapse activeKey={activeKeys} onChange={setActiveKeys}>
      <Panel header="Basic information" style={{ width: "100%" }} key="1">
        <UnitBasicInfo />
      </Panel>
      <Panel header="Styling" style={{ width: "100%" }} key="styling">
        <UnitStylingInfo />
      </Panel>
      <Panel header="Datasheets" style={{ width: "100%" }} key="2">
        <UnitStats />
      </Panel>
      <Panel
        header="Invulnerable save"
        style={{ width: "100%" }}
        key="9"
        collapsible={activeCard.showInvul === false ? "disabled" : undefined}
        extra={
          <Switch
            size="small"
            checked={activeCard.showInvul !== false}
            onClick={(value, e) => handleSimpleVisibilityChange("showInvul", "9", value, e)}
          />
        }>
        {activeCard.showInvul !== false && <UnitInvulnerableSave />}
      </Panel>
      <Panel header="Points" style={{ width: "100%" }} key="points">
        <UnitPoints />
      </Panel>
      <Panel
        header="Ranged weapons"
        style={{ width: "100%" }}
        key="3"
        collapsible={activeCard.showWeapons?.rangedWeapons === false ? "disabled" : undefined}
        extra={
          <Switch
            size="small"
            checked={activeCard.showWeapons?.rangedWeapons !== false}
            onClick={(value, e) => handleWeaponVisibilityChange("rangedWeapons", "3", value, e)}
          />
        }>
        {activeCard.showWeapons?.rangedWeapons !== false && <UnitWeapons type={"rangedWeapons"} />}
      </Panel>
      <Panel
        header="Melee weapons"
        style={{ width: "100%" }}
        key="4"
        collapsible={activeCard.showWeapons?.meleeWeapons === false ? "disabled" : undefined}
        extra={
          <Switch
            size="small"
            checked={activeCard.showWeapons?.meleeWeapons !== false}
            onClick={(value, e) => handleWeaponVisibilityChange("meleeWeapons", "4", value, e)}
          />
        }>
        {activeCard.showWeapons?.meleeWeapons !== false && <UnitWeapons type={"meleeWeapons"} />}
      </Panel>
      <Panel
        header="Core abilities"
        style={{ width: "100%" }}
        key="5a"
        collapsible={activeCard.showAbilities?.core === false ? "disabled" : undefined}
        extra={
          <Switch
            size="small"
            checked={activeCard.showAbilities?.core !== false}
            onClick={(value, e) => handleAbilityVisibilityChange("core", "5a", value, e)}
          />
        }>
        {activeCard.showAbilities?.core !== false && <UnitBasicAbility type={"core"} />}
      </Panel>
      <Panel
        header="Faction abilities"
        style={{ width: "100%" }}
        key="5b"
        collapsible={activeCard.showAbilities?.faction === false ? "disabled" : undefined}
        extra={
          <Switch
            size="small"
            checked={activeCard.showAbilities?.faction !== false}
            onClick={(value, e) => handleAbilityVisibilityChange("faction", "5b", value, e)}
          />
        }>
        {activeCard.showAbilities?.faction !== false && <UnitBasicAbility type={"faction"} />}
      </Panel>
      <Panel
        header="Other abilities"
        style={{ width: "100%" }}
        key="6"
        collapsible={activeCard.showAbilities?.other === false ? "disabled" : undefined}
        extra={
          <Switch
            size="small"
            checked={activeCard.showAbilities?.other !== false}
            onClick={(value, e) => handleAbilityVisibilityChange("other", "6", value, e)}
          />
        }>
        {activeCard.showAbilities?.other !== false && <UnitExtendedAbilities type={"other"} />}
      </Panel>
      <Panel
        header="Damaged ability"
        style={{ width: "100%" }}
        key="8"
        collapsible={activeCard.showDamaged === false ? "disabled" : undefined}
        extra={
          <Switch
            size="small"
            checked={activeCard.showDamaged !== false}
            onClick={(value, e) => handleSimpleVisibilityChange("showDamaged", "8", value, e)}
          />
        }>
        {activeCard.showDamaged !== false && <UnitDamageTable />}
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
