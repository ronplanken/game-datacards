import { Collapse } from "antd";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { UnitBasicAbility } from "./UnitCardEditor/UnitBasicAbility";
import { UnitBasicInfo } from "./UnitCardEditor/UnitBasicInfo";
import { UnitDamageTable } from "./UnitCardEditor/UnitDamageTable";
import { UnitExtendedAbilities } from "./UnitCardEditor/UnitExtendedAbilities";
import { UnitInvulnerableSave } from "./UnitCardEditor/UnitInvulnerableSave";
import { UnitKeywords } from "./UnitCardEditor/UnitKeywords";
import { UnitStats } from "./UnitCardEditor/UnitStats";
import { UnitWeapons } from "./UnitCardEditor/UnitWeapons";

const { Panel } = Collapse;

export const UnitCardEditor = () => {
  const { activeCard } = useCardStorage();

  return (
    <Collapse defaultActiveKey={["1"]}>
      <Panel header="Basic information" style={{ width: "100%" }} key="1">
        <UnitBasicInfo />
      </Panel>
      <Panel header="Datasheets" style={{ width: "100%" }} key="2">
        <UnitStats />
      </Panel>
      <Panel header="Ranged weapons" style={{ width: "100%" }} key="3">
        <UnitWeapons type={"rangedWeapons"} />
      </Panel>
      <Panel header="Melee weapons" style={{ width: "100%" }} key="4">
        <UnitWeapons type={"meleeWeapons"} />
      </Panel>
      <Panel header="Basic abilities" style={{ width: "100%" }} key="5">
        <UnitBasicAbility type={"core"} />
        <UnitBasicAbility type={"faction"} />
      </Panel>
      <Panel header="Extended abilities" style={{ width: "100%" }} key="6">
        <UnitExtendedAbilities />
      </Panel>
      <Panel header="Damaged ability" style={{ width: "100%" }} key="7">
        <UnitDamageTable />
      </Panel>
      <Panel header="Invulnerable save" style={{ width: "100%" }} key="8">
        <UnitInvulnerableSave />
      </Panel>
      <Panel header="Keywords" style={{ width: "100%" }} key="9">
        <UnitKeywords type={"keywords"} />
        <UnitKeywords type={"factions"} />
      </Panel>
    </Collapse>
  );
};
