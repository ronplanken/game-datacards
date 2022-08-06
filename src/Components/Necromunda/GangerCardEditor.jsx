import { Collapse, Input } from "antd";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { GangerBasicInfo } from "./GangerCardEditor/GangerBasicInfo";
import { GangerDatasheets } from "./GangerCardEditor/GangerDatasheets";
import { GangerWargear } from "./GangerCardEditor/GangerWargear";
import { GangerSkills } from './GangerCardEditor/GangerSkills';
import { GangerWeapons } from "./GangerCardEditor/GangerWeapons";
import { GangerRules } from './GangerCardEditor/GangerRules';

const { Panel } = Collapse;
const { TextArea } = Input;

export const GangerCardEditor = () => {
  const { activeCard, updateActiveCard } = useCardStorage();

  return (
    <Collapse defaultActiveKey={["1"]}>
      <Panel header="Basic information" style={{ width: "100%" }} key="1">
        <GangerBasicInfo />
      </Panel>
      <Panel header="Datasheet" key="2">
        <GangerDatasheets />
      </Panel>
      <Panel
        header="Weapon profiles"
        key="3"
        extra={
          <div>
            ({`${activeCard?.weapons?.filter((sheet) => sheet.active).length} / ${activeCard?.weapons?.length}`})
          </div>
        }>
        <GangerWeapons />
      </Panel>
      <Panel
        header="Wargear"
        key="4"
        extra={
          <div>
            ({`${activeCard?.wargear?.filter((sheet) => sheet.active).length} / ${activeCard?.wargear?.length}`})
          </div>
        }>
        <GangerWargear />
      </Panel>
      <Panel
        header="Abilities"
        key="5"
        extra={
          <div>
            ({`${activeCard?.skills?.filter((sheet) => sheet.active).length} / ${activeCard?.skills?.length}`})
          </div>
        }>
        <GangerSkills />
      </Panel>
      <Panel
        header="Rules"
        key="6"
        extra={
          <div>
            ({`${activeCard?.rules?.filter((sheet) => sheet.active).length} / ${activeCard?.rules?.length}`})
          </div>
        }>
        <GangerRules />
      </Panel>
    </Collapse>
  );
};
