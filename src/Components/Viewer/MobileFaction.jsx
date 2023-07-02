import { Col, Collapse } from "antd";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";
import { MarkdownDisplay } from "../MarkdownDisplay";

export const MobileFaction = () => {
  const { selectedFaction } = useDataSourceStorage();
  return (
    <Col style={{ width: "100dvw" }} className="mobile-faction">
      {/* <div className="title">
        <div className="heading">
          <div className="title">Stats</div>
        </div>
      </div> */}
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
      <div className="stratagems">
        <div className="heading">
          <div className="title">Stratagems</div>
        </div>
        {/* <Collapse style={{ margin: 16 }}>
          {selectedFaction?.enhancements?.map((val) => (
            <Collapse.Panel key={val.name} header={val.name}>
              <MarkdownDisplay content={val.description.replaceAll("■", "\n\r ■")} />
            </Collapse.Panel>
          ))}
        </Collapse> */}
      </div>
      <div className="enhancements">
        <div className="heading">
          <div className="title">Enhancements</div>
        </div>
        <Collapse style={{ margin: 16 }}>
          {selectedFaction?.enhancements?.map((val) => (
            <Collapse.Panel key={val.name} header={val.name}>
              <MarkdownDisplay content={val.description.replaceAll("■", "\n\r ■")} />
            </Collapse.Panel>
          ))}
        </Collapse>
      </div>
    </Col>
  );
};
