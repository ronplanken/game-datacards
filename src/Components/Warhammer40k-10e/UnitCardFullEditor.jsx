import { Collapse } from "antd";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { UnitBasicAbility } from "./UnitCardEditor/UnitBasicAbility";
import { UnitBasicInfo } from "./UnitCardEditor/UnitBasicInfo";
import { UnitDamageTable } from "./UnitCardEditor/UnitDamageTable";
import { UnitExtendedAbilities } from "./UnitCardEditor/UnitExtendedAbilities";
import { UnitInvulnerableSave } from "./UnitCardEditor/UnitInvulnerableSave";
import { UnitKeywords } from "./UnitCardEditor/UnitKeywords";
import { UnitPoints } from "./UnitCardEditor/UnitPoints";
import { UnitPrimarchAbilities } from "./UnitCardEditor/UnitPrimarchAbilities";
import { UnitStats } from "./UnitCardEditor/UnitStats";
import { UnitStylingInfo } from "./UnitCardEditor/UnitStylingInfo";
import { UnitWeapons } from "./UnitCardEditor/UnitWeapons";
import { UnitWargearOptions } from "./UnitCardEditor/UnitWargearOptions";
import { UnitComposition } from "./UnitCardEditor/UnitComposition";
import { UnitLoadout } from "./UnitCardEditor/UnitLoadout";
import { UnitTransport } from "./UnitCardEditor/UnitTransport";
import { UnitLeader } from "./UnitCardEditor/UnitLeads";
import { UnitLedBy } from "./UnitCardEditor/UnitLedBy";

const { Panel } = Collapse;

export const UnitCardFullEditor = () => {
  const { activeCard } = useCardStorage();

  return (
    <Collapse defaultActiveKey={["1"]}>
      <Panel header="Basic information" style={{ width: "100%" }} key="1">
        <UnitBasicInfo />
      </Panel>
      <Panel header="Styling" style={{ width: "100%" }} key="styling">
        <UnitStylingInfo />
      </Panel>
      <Panel header="Datasheets" style={{ width: "100%" }} key="2">
        <UnitStats />
      </Panel>
      <Panel header="Invulnerable save" style={{ width: "100%" }} key="9">
        <UnitInvulnerableSave />
      </Panel>
      <Panel header="Points" style={{ width: "100%" }} key="points">
        <UnitPoints />
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
        <UnitExtendedAbilities type={"other"} />
      </Panel>
      <Panel header="Wargear abilities" style={{ width: "100%" }} key="7">
        <UnitExtendedAbilities type={"wargear"} />
      </Panel>
      <Panel header="Special abilities" style={{ width: "100%" }} key="special">
        <UnitExtendedAbilities type={"special"} />
      </Panel>
      <Panel header="Damaged ability" style={{ width: "100%" }} key="8">
        <UnitDamageTable />
      </Panel>
      <Panel header="Primarch ability" style={{ width: "100%" }} key="primarch">
        <UnitPrimarchAbilities />
      </Panel>
      <Panel header="Wargear Options" style={{ width: "100%" }} key="wargear_options">
        <UnitWargearOptions />
      </Panel>
      <Panel header="Composition" style={{ width: "100%" }} key="composition">
        <UnitComposition />
      </Panel>
      <Panel header="Loadout" style={{ width: "100%" }} key="loadout">
        <UnitLoadout />
      </Panel>
      <Panel header="Transport" style={{ width: "100%" }} key="transport">
        <UnitTransport />
      </Panel>
      <Panel header="Leader" style={{ width: "100%" }} key="leader">
        <UnitLeader />
      </Panel>
      <Panel header="Led by" style={{ width: "100%" }} key="ledby">
        <UnitLedBy />
      </Panel>
      <Panel header="Keywords" style={{ width: "100%" }} key="10">
        <UnitKeywords type={"keywords"} />
        <UnitKeywords type={"factions"} />
      </Panel>
    </Collapse>
  );
};
