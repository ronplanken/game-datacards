import { Col, Collapse, Tabs } from "antd";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";
import { useSettingsStorage } from "../../Hooks/useSettingsStorage";
import { MarkdownDisplay } from "../MarkdownDisplay";
import { MarkdownSpanDisplay } from "../MarkdownSpanDisplay";

export const MobileFaction = () => {
  const { selectedFaction } = useDataSourceStorage();

  const { settings, updateSettings } = useSettingsStorage();
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
        <Tabs
          defaultActiveKey={settings.defaultStratagemTab || 1}
          centered
          onChange={(key) => {
            updateSettings({ ...settings, defaultStratagemTab: key });
          }}
          style={{ padding: 0 }}
          tabBarStyle={{ marginBottom: 0 }}
          size="small"
          items={[
            {
              label: `FACTION`,
              key: "1",
              children: (
                <Collapse style={{ margin: 16 }}>
                  {selectedFaction?.stratagems?.map((val) => (
                    <Collapse.Panel
                      key={val.name}
                      header={
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>{val.name}</span>
                          <span
                            style={{
                              fontSize: "0.90rem",
                              border: "1px solid white",
                              backgroundColor: "var(--header-colour)",
                              color: "white",
                              paddingTop: "2px",
                              paddingbottom: "2px",
                              paddingLeft: "8px",
                              paddingRight: "8px",
                              borderRadius: "6px",
                              textAlign: "center",
                            }}>
                            <strong>{val.cost}</strong> CP
                          </span>
                        </div>
                      }>
                      <div className="stratagem">
                        <div className="content">
                          {val.when && (
                            <div className="section">
                              <span className="title">When:</span>
                              <span className="text">
                                <MarkdownSpanDisplay content={val.when} />
                              </span>
                            </div>
                          )}
                          {val.target && (
                            <div className="section">
                              <span className="title">target:</span>
                              <span className="text">
                                <MarkdownSpanDisplay content={val.target} />
                              </span>
                            </div>
                          )}
                          {val.effect && (
                            <div className="section">
                              <span className="title">effect:</span>
                              <span className="text">
                                <MarkdownSpanDisplay content={val.effect} />
                              </span>
                            </div>
                          )}
                          {val.restrictions && (
                            <div className="section">
                              <span className="title">restrictions:</span>
                              <span className="text">
                                <MarkdownSpanDisplay content={val.restrictions} />
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Collapse.Panel>
                  ))}
                </Collapse>
              ),
            },
            {
              label: `CORE`,
              key: "2",
              children: (
                <Collapse style={{ margin: 16 }}>
                  {selectedFaction?.basicStratagems?.map((val) => (
                    <Collapse.Panel
                      key={val.name}
                      header={
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>{val.name}</span>
                          <span
                            style={{
                              fontSize: "0.90rem",
                              border: "1px solid white",
                              backgroundColor: "var(--header-colour)",
                              color: "white",
                              paddingTop: "2px",
                              paddingbottom: "2px",
                              paddingLeft: "8px",
                              paddingRight: "8px",
                              borderRadius: "6px",
                              textAlign: "center",
                            }}>
                            <strong>{val.cost}</strong> CP
                          </span>
                        </div>
                      }>
                      <div className="stratagem">
                        <div className="content">
                          {val.when && (
                            <div className="section">
                              <span className="title">When:</span>
                              <span className="text">
                                <MarkdownSpanDisplay content={val.when} />
                              </span>
                            </div>
                          )}
                          {val.target && (
                            <div className="section">
                              <span className="title">target:</span>
                              <span className="text">
                                <MarkdownSpanDisplay content={val.target} />
                              </span>
                            </div>
                          )}
                          {val.effect && (
                            <div className="section">
                              <span className="title">effect:</span>
                              <span className="text">
                                <MarkdownSpanDisplay content={val.effect} />
                              </span>
                            </div>
                          )}
                          {val.restrictions && (
                            <div className="section">
                              <span className="title">restrictions:</span>
                              <span className="text">
                                <MarkdownSpanDisplay content={val.restrictions} />
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Collapse.Panel>
                  ))}
                </Collapse>
              ),
            },
          ]}
        />
      </div>
      <div className="enhancements">
        <div className="heading">
          <div className="title">Enhancements</div>
        </div>
        <Collapse style={{ margin: 16 }}>
          {selectedFaction?.enhancements?.map((val) => (
            <Collapse.Panel
              key={val.name}
              header={
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>{val.name}</span>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      border: "1px solid white",
                      backgroundColor: "var(--header-colour)",
                      color: "white",
                      paddingTop: "2px",
                      paddingbottom: "2px",
                      paddingLeft: "8px",
                      paddingRight: "8px",
                      borderRadius: "6px",
                      textAlign: "center",
                    }}>
                    <strong>{val.cost}</strong> pts
                  </span>
                </div>
              }>
              <MarkdownDisplay content={val.description.replaceAll("■", "\n\r ■")} />
            </Collapse.Panel>
          ))}
        </Collapse>
      </div>
    </Col>
  );
};
