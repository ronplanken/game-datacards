import { Collapse } from "antd";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { GangerBasicInfo } from "./GangerCardEditor/GangerBasicInfo";
import { GangerDatasheets } from "./GangerCardEditor/GangerDatasheets";
import { GangerNotes } from "./GangerCardEditor/GangerNotes";
import { GangerRules } from "./GangerCardEditor/GangerRules";
import { GangerSkills } from "./GangerCardEditor/GangerSkills";
import { GangerWargear } from "./GangerCardEditor/GangerWargear";
import { GangerWeapons } from "./GangerCardEditor/GangerWeapons";

const { Panel } = Collapse;

export const GangerCardEditor = () => {
  const { activeCard } = useCardStorage();

  return (
    <Collapse defaultActiveKey={["1"]}>
      <Panel header="Basic information" style={{ width: "100%" }} key="1">
        <GangerBasicInfo />
      </Panel>
      <Panel header="Notes" style={{ width: "100%" }} key="7">
        <GangerNotes />
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
          <div>({`${activeCard?.skills?.filter((sheet) => sheet.active).length} / ${activeCard?.skills?.length}`})</div>
        }>
        <GangerSkills />
      </Panel>
      <Panel
        header="Rules"
        key="6"
        extra={
          <div>({`${activeCard?.rules?.filter((sheet) => sheet.active).length} / ${activeCard?.rules?.length}`})</div>
        }>
        <GangerRules />
      </Panel>
    </Collapse>
  );
};
