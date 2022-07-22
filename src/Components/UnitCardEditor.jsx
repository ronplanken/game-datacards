import { Collapse, Input } from "antd";
import { useCardStorage } from "../Hooks/useCardStorage";
import { UnitAbilities } from "./UnitCardEditor/UnitAbilities";
import { UnitBasicInfo } from "./UnitCardEditor/UnitBasicInfo";
import { UnitDatasheets } from "./UnitCardEditor/UnitDatasheets";
import { UnitDescription } from './UnitCardEditor/UnitDescription';
import { UnitKeywords } from "./UnitCardEditor/UnitKeywords";
import { UnitWeapons } from "./UnitCardEditor/UnitWeapons";

const { Panel } = Collapse;
const { TextArea } = Input;

export const UnitCardEditor = () => {
  const { activeCard, updateActiveCard } = useCardStorage();

  return (
    <Collapse defaultActiveKey={["1"]}>
      <Panel header="Basic information" style={{ width: "100%" }} key="1">
        <UnitBasicInfo />
      </Panel>
      <Panel
        header="Datasheets"
        key="2"
        extra={
          <div>
            (
            {`${
              activeCard?.datasheet?.filter((sheet) => sheet.active).length
            } / ${activeCard?.datasheet?.length}`}
            )
          </div>
        }
      >
        <UnitDatasheets />
      </Panel>
      <Panel header="Description" key="3">
        <UnitDescription />
      </Panel>
      <Panel
        header="Weapon profiles"
        key="4"
        extra={
          <div>
            (
            {`${
              activeCard?.wargear?.filter((sheet) => sheet.active).length
            } / ${activeCard?.wargear?.length}`}
            )
          </div>
        }
      >
        <UnitWeapons />
      </Panel>
      <Panel
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
      </Panel>
    </Collapse>
  );
};
