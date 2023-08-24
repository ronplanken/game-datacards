import { Collapse } from "antd";
import { StratagemBasicInfo } from "./StratagemEditor/StratagemBasicInfo";
import { StratagemCardInfo } from "./StratagemEditor/StratagemCardInfo";

const { Panel } = Collapse;

export const StratagemEditor = () => {
  return (
    <Collapse defaultActiveKey={["1"]}>
      <Panel header="Basic information" style={{ width: "100%" }} key="1">
        <StratagemBasicInfo />
      </Panel>
      <Panel header="Detailed information" style={{ width: "100%" }} key="2">
        <StratagemCardInfo />
      </Panel>
    </Collapse>
  );
};
