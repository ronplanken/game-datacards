import { Collapse } from "antd";
import { BattleRuleBasicInfo } from "./BattleRuleEditor/BattleRuleBasicInfo";
import { BattleRuleCallouts } from "./BattleRuleEditor/BattleRuleCallouts";

const { Panel } = Collapse;

export const BattleRuleEditor = () => {
  return (
    <Collapse defaultActiveKey={["1"]}>
      <Panel header="Basic information" style={{ width: "100%" }} key="1">
        <BattleRuleBasicInfo />
      </Panel>
      <Panel header="Detailed information" style={{ width: "100%" }} key="2">
        <BattleRuleCallouts />
      </Panel>
    </Collapse>
  );
};
