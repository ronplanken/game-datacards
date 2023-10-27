import { Collapse } from "antd";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { UnitBasicInfo } from "./UnitCardEditor/UnitBasicInfo";
import { UnitComposition } from "./UnitCardEditor/UnitComposition";
import { UnitKeywords } from "./UnitCardEditor/UnitKeywords";
import { UnitLeader } from "./UnitCardEditor/UnitLeads";
import { UnitLedBy } from "./UnitCardEditor/UnitLedBy";
import { UnitLoadout } from "./UnitCardEditor/UnitLoadout";
import { UnitTransport } from "./UnitCardEditor/UnitTransport";
import { UnitWargearOptions } from "./UnitCardEditor/UnitWargearOptions";

const { Panel } = Collapse;

export const UnitCardBackEditor = () => {
  const { activeCard } = useCardStorage();

  return (
    <Collapse defaultActiveKey={["1"]}>
      <Panel header="Basic information" style={{ width: "100%" }} key="1">
        <UnitBasicInfo />
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
