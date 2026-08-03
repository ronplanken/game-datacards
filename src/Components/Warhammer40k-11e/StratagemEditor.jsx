import { Collapse } from "antd";
import { StratagemBasicInfo } from "./StratagemEditor/StratagemBasicInfo";
import { StratagemCardInfo } from "./StratagemEditor/StratagemCardInfo";
import { StratagemStylingInfo } from "./StratagemEditor/StratagemStylingInfo";

const { Panel } = Collapse;

export const StratagemEditor = () => {
  return (
    <Collapse defaultActiveKey={["1"]}>
      <Panel header="Basic information" style={{ width: "100%" }} key="1">
        <StratagemBasicInfo />
      </Panel>
      <Panel header="Styling" style={{ width: "100%" }} key="2">
        <StratagemStylingInfo />
      </Panel>
      <Panel header="Detailed information" style={{ width: "100%" }} key="3">
        <StratagemCardInfo />
      </Panel>
    </Collapse>
  );
};
