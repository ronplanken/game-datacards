import { Collapse, Input } from "antd";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { EmptyCardBasicInfo } from "./EmptyCardEditor/EmptyCardBasicInfo";

const { Panel } = Collapse;
const { TextArea } = Input;

export const EmptyCardEditor = () => {
  return (
    <Collapse defaultActiveKey={["1"]}>
      <Panel header="Basic information" style={{ width: "100%" }} key="1">
        <EmptyCardBasicInfo />
      </Panel>
    </Collapse>
  );
};
