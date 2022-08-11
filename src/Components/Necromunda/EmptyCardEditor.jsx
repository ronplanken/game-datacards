import { Collapse } from "antd";
import { EmptyCardBasicInfo } from "./EmptyCardEditor/EmptyCardBasicInfo";

const { Panel } = Collapse;

export const EmptyCardEditor = () => {
  return (
    <Collapse defaultActiveKey={["1"]}>
      <Panel header="Basic information" style={{ width: "100%" }} key="1">
        <EmptyCardBasicInfo />
      </Panel>
    </Collapse>
  );
};
