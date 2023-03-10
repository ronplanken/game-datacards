import { Collapse } from "antd";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { UnitAbilities } from "./UnitCardEditor/UnitAbilities";
import { UnitBasicInfo } from "./UnitCardEditor/UnitBasicInfo";
import { UnitDatasheets } from "./UnitCardEditor/UnitDatasheets";
import { UnitDescription } from "./UnitCardEditor/UnitDescription";
import { UnitKeywords } from "./UnitCardEditor/UnitKeywords";
import { UnitPowers } from './UnitCardEditor/UnitPowers';
import { UnitWeapons } from "./UnitCardEditor/UnitWeapons";

const { Panel } = Collapse;

export const UnitCardEditor = () => {
  const { activeCard } = useCardStorage();

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
            ({`${activeCard?.datasheet?.filter((sheet) => sheet.active).length} / ${activeCard?.datasheet?.length}`})
          </div>
        }>
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
            ({`${activeCard?.wargear?.filter((sheet) => sheet.active).length} / ${activeCard?.wargear?.length}`})
          </div>
        }>
        <UnitWeapons />
      </Panel>
      <Panel
        header="Abilities"
        key="5"
        extra={
          <div>
            (
            {`${activeCard?.abilities?.filter((sheet) => sheet.showAbility).length} / ${activeCard?.abilities?.length}`}
            )
          </div>
        }>
        <UnitAbilities />
      </Panel>
      <Panel
        header="Powers"
        key="6"
        extra={
          <div>
            (
            {`${activeCard?.powers?.filter((sheet) => sheet.showPower).length || 0} / ${activeCard?.powers?.length || 0}`}
            )
          </div>
        }>
        <UnitPowers />
      </Panel>
      <Panel
        header="Keywords"
        key="7"
        extra={
          <div>
            ({`${activeCard?.keywords?.filter((sheet) => sheet.active).length} / ${activeCard?.keywords?.length}`})
          </div>
        }>
        <UnitKeywords />
      </Panel>
    </Collapse>
  );
};
