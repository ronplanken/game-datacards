import { Collapse } from "antd";
import { SecondaryBasicInfo } from './SecondaryEditor/SecondaryBasicInfo';

const { Panel } = Collapse;

export const SecondaryEditor = () => {
  return (
    <Collapse defaultActiveKey={["1"]}>
      <Panel header="Basic information" style={{ width: "100%" }} key="1">
        <SecondaryBasicInfo />
      </Panel>
    </Collapse>
  );
};
