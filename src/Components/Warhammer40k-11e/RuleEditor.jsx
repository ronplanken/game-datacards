import { Collapse } from "antd";
import { RuleBasicInfo } from "./RuleEditor/RuleBasicInfo";
import { RuleCardInfo } from "./RuleEditor/RuleCardInfo";
import { RuleStylingInfo } from "./RuleEditor/RuleStylingInfo";

const { Panel } = Collapse;

export const RuleEditor = () => {
  return (
    <Collapse defaultActiveKey={["1"]}>
      <Panel header="Basic information" style={{ width: "100%" }} key="1">
        <RuleBasicInfo />
      </Panel>
      <Panel header="Styling" style={{ width: "100%" }} key="2">
        <RuleStylingInfo />
      </Panel>
      <Panel header="Rule content" style={{ width: "100%" }} key="3">
        <RuleCardInfo />
      </Panel>
    </Collapse>
  );
};
