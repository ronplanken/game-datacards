import { Collapse } from "antd";
import { PsychicPowerBasicInfo } from "./PsychicPowerEditor/PsychicPowerBasicInfo";

const { Panel } = Collapse;

export const PsychicPowerEditor = () => {
  return (
    <Collapse defaultActiveKey={["1"]}>
      <Panel header="Basic information" style={{ width: "100%" }} key="1">
        <PsychicPowerBasicInfo />
      </Panel>
    </Collapse>
  );
};
