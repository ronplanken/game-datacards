import { Collapse } from "antd";
import { EnhancementBasicInfo } from "./EnhancementEditor/EnhancementBasicInfo";
import { EnhancementCardInfo } from "./EnhancementEditor/EnhancementCardInfo";
import { EnhancementEligibility } from "./EnhancementEditor/EnhancementEligibility";
import { EnhancementStylingInfo } from "./EnhancementEditor/EnhancementStylingInfo";

const { Panel } = Collapse;

export const EnhancementEditor = () => {
  return (
    <Collapse defaultActiveKey={["1"]}>
      <Panel header="Basic information" style={{ width: "100%" }} key="1">
        <EnhancementBasicInfo />
      </Panel>
      <Panel header="Styling" style={{ width: "100%" }} key="2">
        <EnhancementStylingInfo />
      </Panel>
      <Panel header="Detailed information" style={{ width: "100%" }} key="3">
        <EnhancementCardInfo />
      </Panel>
      {/* Not printed on the card: this drives which units may take the
          enhancement in the list builder. */}
      <Panel header="List eligibility" style={{ width: "100%" }} key="4">
        <EnhancementEligibility />
      </Panel>
    </Collapse>
  );
};
