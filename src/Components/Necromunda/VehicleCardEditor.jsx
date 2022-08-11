import { Collapse } from "antd";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { VehicleBasicInfo } from "./VehicleCardEditor/VehicleBasicInfo";
import { VehicleDatasheet } from "./VehicleCardEditor/VehicleDatasheets";
import { VehicleNotes } from "./VehicleCardEditor/VehicleNotes";
import { VehicleRules } from "./VehicleCardEditor/VehicleRules";
import { VehicleSkills } from "./VehicleCardEditor/VehicleSkills";
import { VehicleWargear } from "./VehicleCardEditor/VehicleWargear";
import { VehicleWeapons } from "./VehicleCardEditor/VehicleWeapons";

const { Panel } = Collapse;

export const VehicleCardEditor = () => {
  const { activeCard } = useCardStorage();

  return (
    <Collapse defaultActiveKey={["1"]}>
      <Panel header="Basic information" style={{ width: "100%" }} key="1">
        <VehicleBasicInfo />
      </Panel>
      <Panel header="Notes" style={{ width: "100%" }} key="7">
        <VehicleNotes />
      </Panel>
      <Panel header="Datasheet" key="2">
        <VehicleDatasheet />
      </Panel>
      <Panel
        header="Weapon profiles"
        key="3"
        extra={
          <div>
            ({`${activeCard?.weapons?.filter((sheet) => sheet.active).length} / ${activeCard?.weapons?.length}`})
          </div>
        }>
        <VehicleWeapons />
      </Panel>
      <Panel
        header="Wargear"
        key="4"
        extra={
          <div>
            ({`${activeCard?.wargear?.filter((sheet) => sheet.active).length} / ${activeCard?.wargear?.length}`})
          </div>
        }>
        <VehicleWargear />
      </Panel>
      <Panel
        header="Abilities"
        key="5"
        extra={
          <div>({`${activeCard?.skills?.filter((sheet) => sheet.active).length} / ${activeCard?.skills?.length}`})</div>
        }>
        <VehicleSkills />
      </Panel>
      <Panel
        header="Rules"
        key="6"
        extra={
          <div>({`${activeCard?.rules?.filter((sheet) => sheet.active).length} / ${activeCard?.rules?.length}`})</div>
        }>
        <VehicleRules />
      </Panel>
    </Collapse>
  );
};
