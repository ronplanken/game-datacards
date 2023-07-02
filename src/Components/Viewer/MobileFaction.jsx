import { Col, Collapse } from "antd";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";
import { MarkdownDisplay } from "../MarkdownDisplay";

export const MobileFaction = () => {
  const { selectedFaction } = useDataSourceStorage();
  return (
    <Col
      className="mobile-faction"
      style={{
        width: "100dvw",
        "--banner-colour": selectedFaction?.colours?.banner,
        "--header-colour": selectedFaction?.colours?.header,
      }}>
      {/* <div className="title">
        <div className="heading">
          <div className="title">Stats</div>
        </div>
      </div> */}
      <div className="stratagems">
        <div className="heading">
          <div className="title">Stratagems</div>
        </div>
        <Collapse style={{ margin: 16 }}>
          {selectedFaction?.stratagems?.map((val) => (
            <Collapse.Panel
              key={val.name}
              header={
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>{val.name}</span>
                  <span>{val.cost}CP</span>
                </div>
              }>
              WHEN: <MarkdownDisplay content={val.when} />
              TARGET: <MarkdownDisplay content={val.target} />
              EFFECT: <MarkdownDisplay content={val.effect} />
              {val.restrictions && (
                <>
                  RESTRICTIONS: <MarkdownDisplay content={val.restrictions} />
                </>
              )}
            </Collapse.Panel>
          ))}
        </Collapse>
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
