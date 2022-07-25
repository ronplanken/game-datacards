import { Collapse, Input } from "antd";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { VehicleDatasheet } from "./VehicleCardEditor/VehicleDatasheets";
import { VehicleWargear } from "./VehicleCardEditor/VehicleWargear";
import { VehicleSkills } from './VehicleCardEditor/VehicleSkills';
import { VehicleWeapons } from "./VehicleCardEditor/VehicleWeapons";
import { VehicleRules } from './VehicleCardEditor/VehicleRules';
import { VehicleBasicInfo } from './VehicleCardEditor/VehicleBasicInfo';

const { Panel } = Collapse;
const { TextArea } = Input;

export const VehicleCardEditor = () => {
  const { activeCard, updateActiveCard } = useCardStorage();

  return (
    <Collapse defaultActiveKey={["1"]}>
      <Panel header="Basic information" style={{ width: "100%" }} key="1">
        <VehicleBasicInfo />
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
          <div>
            ({`${activeCard?.skills?.filter((sheet) => sheet.active).length} / ${activeCard?.skills?.length}`})
          </div>
        }>
        <VehicleSkills />
      </Panel>
      <Panel
        header="Rules"
        key="6"
        extra={
          <div>
            ({`${activeCard?.rules?.filter((sheet) => sheet.active).length} / ${activeCard?.rules?.length}`})
          </div>
        }>
        <VehicleRules />
      </Panel>
    </Collapse>
  );
};
