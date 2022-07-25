import { Collapse, Input } from "antd";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { GangerBasicInfo } from "./GangerCardEditor/GangerBasicInfo";
import { GangerDatasheets } from "./GangerCardEditor/GangerDatasheets";
import { GangerWeapons } from "./GangerCardEditor/GangerWeapons";

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
        key="4"
        extra={
          <div>
            ({`${activeCard?.weapons?.filter((sheet) => sheet.active).length} / ${activeCard?.weapons?.length}`})
          </div>
        }>
        <GangerWeapons />
      </Panel>
      {/* <Panel
        header="Abilities"
        key="5"
        extra={
          <div>
            (
            {`${
              activeCard?.abilities?.filter((sheet) => sheet.showAbility).length
            } / ${activeCard?.abilities?.length}`}
            )
          </div>
        }
      >
        <UnitAbilities />
      </Panel>
      <Panel
        header="Keywords"
        key="6"
        extra={
          <div>
            (
            {`${
              activeCard?.keywords?.filter((sheet) => sheet.active).length
            } / ${activeCard?.keywords?.length}`}
            )
          </div>
        }
      >
        <UnitKeywords />
      </Panel> */}
    </Collapse>
  );
};
