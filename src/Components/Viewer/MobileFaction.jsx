import { Col, Collapse } from "antd";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";
import { MarkdownDisplay } from "../MarkdownDisplay";

export const MobileFaction = () => {
  const { selectedFaction } = useDataSourceStorage();
  return (
    <Col style={{ width: "100dvw" }}>
      <p style={{ padding: "32px", fontSize: "1.4rem", fontWeight: "600", textAlign: "center" }}>
        {selectedFaction.name}
      </p>
      {/* <p style={{ padding: 32, paddingBottom: 4, fontSize: "1.3rem", fontWeight: "600", textAlign: "center" }}>
        Stratagems
      </p>
      <Collapse>
        {selectedFaction?.stratagems?.map((val) => (
          <Collapse.Panel key={val.name} header={val.name}>
            {val.description}
          </Collapse.Panel>
        ))}
      </Collapse> */}
      <p style={{ padding: 32, paddingBottom: 0, fontSize: "1.3rem", fontWeight: "600", textAlign: "center" }}>
        Enhancements
      </p>
      <Collapse style={{ margin: 16 }}>
        {selectedFaction.enhancements.map((val) => (
          <Collapse.Panel key={val.name} header={val.name}>
            <MarkdownDisplay content={val.description.replaceAll("■", "\n\r ■")} />
          </Collapse.Panel>
        ))}
      </Collapse>
    </Col>
  );
};
