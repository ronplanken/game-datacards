import { SettingOutlined } from "@ant-design/icons";
import { Button, Card, Col, Row, Switch, Tabs, Typography } from "antd";
import { compare } from "compare-versions";
import React, { useEffect } from "react";
import * as ReactDOM from "react-dom";
import { useDataSourceStorage } from "../Hooks/useDataSourceStorage";
import { useSettingsStorage } from "../Hooks/useSettingsStorage";
import { LAST_WIZARD_VERSION } from "./WelcomeWizard";

const modalRoot = document.getElementById("modal-root");

export const FactionSettingsModal = () => {
  const [isFactionSettingsVisible, setIsFactionSettingsVisible] = React.useState(false);

  const { selectedFaction } = useDataSourceStorage();

  const { settings, updateSettings, ignoredSubFactions } = useSettingsStorage();

  return (
    <>
      {isFactionSettingsVisible &&
        ReactDOM.createPortal(
          <div className="modal-background">
            <div className="factionsettings-container">
              <div
                style={{
                  backgroundColor: "#001529",
                  width: "100%",
                  height: "90px",
                  textAlign: "center",
                }}>
                <h1
                  style={{
                    height: "100%",
                    lineHeight: "90px",
                    fontSize: "32px",
                    color: "white",
                  }}>
                  {selectedFaction.name} settings
                </h1>
              </div>
              <div className="factionsettings-cover">
                <Tabs tabPosition="left">
                  <Tabs.TabPane
                    tab="Subfactions"
                    key="1"
                    style={{ marginTop: "8px", overflowY: "auto", maxHeight: "450px" }}>
                    <Row style={{ paddingTop: "8px" }}>
                      <Col span={23}>
                        <Typography.Paragraph>
                          By default all subfactions are shown. If you want to hide certain subfactions you can toggle
                          them here. This will filter stratagems &amp; secondaries.
                        </Typography.Paragraph>
                      </Col>
                    </Row>
                    <Row style={{ paddingTop: "0px" }}>
                      <Col span={23}>
                        {selectedFaction.subfactions.map((subfaction) => {
                          return (
                            <Card
                              type={"inner"}
                              key={`${selectedFaction.id}-${subfaction.id}`}
                              size={"small"}
                              title={subfaction.name}
                              bodyStyle={{ padding: 0 }}
                              style={{ marginBottom: "8px", marginTop: "8px" }}
                              extra={
                                <Switch
                                  checked={!settings.ignoredSubFactions?.includes(subfaction.id)}
                                  onChange={(value) => {
                                    const newSubFactions = settings.ignoredSubFactions ?? [];
                                    if (value) {
                                      newSubFactions.splice(
                                        newSubFactions.findIndex((el) => el === subfaction.id),
                                        1
                                      );
                                    } else {
                                      newSubFactions.push(subfaction.id);
                                    }

                                    updateSettings({ ...settings, ignoredSubFactions: newSubFactions });
                                  }}
                                />
                              }></Card>
                          );
                        })}
                      </Col>
                    </Row>
                  </Tabs.TabPane>
                </Tabs>
              </div>
            </div>
          </div>,
          modalRoot
        )}
      <Button
        style={{
          width: "32px",
          padding: "0px",
        }}
        type="default"
        onClick={() => setIsFactionSettingsVisible(true)}>
        <SettingOutlined />
      </Button>
    </>
  );
};
