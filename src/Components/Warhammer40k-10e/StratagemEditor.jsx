import { Collapse } from "antd";
import { StratagemBasicInfo } from "./StratagemEditor/StratagemBasicInfo";

const { Panel } = Collapse;

export const StratagemEditor = () => {
  return (
    <Collapse defaultActiveKey={["1"]}>
      <Panel header="Basic information" style={{ width: "100%" }} key="1">
        <StratagemBasicInfo />
      </Panel>
    </Collapse>
  );
};
