import { MinusSquareOutlined, PlusSquareOutlined, SettingOutlined } from "@ant-design/icons";
import { Button, Card, Col, Row, Switch, Tabs, Typography } from "antd";
import React from "react";
import * as ReactDOM from "react-dom";
import { useDataSourceStorage } from "../Hooks/useDataSourceStorage";
import { useSettingsStorage } from "../Hooks/useSettingsStorage";

const modalRoot = document.getElementById("modal-root");

export const FactionSettingsModal = () => {
  const [isFactionSettingsVisible, setIsFactionSettingsVisible] = React.useState(false);

  const { dataSource, selectedFaction } = useDataSourceStorage();

  const { settings, updateSettings } = useSettingsStorage();

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
                  height: "60px",
                  textAlign: "center",
                }}>
                <h1
                  style={{
                    height: "100%",
                    lineHeight: "60px",
                    fontSize: "24px",
                    color: "white",
                  }}>
                  {selectedFaction?.name} settings
                </h1>
              </div>
              <div className="factionsettings-cover">
                <Tabs
                  tabPosition="left"
                  defaultActiveKey={() => {
                    if (!selectedFaction?.subfactions || selectedFaction?.subfactions?.length === 0) {
                      return "2";
                    }
                    return "1";
                  }}>
                  {!dataSource.noSubfactionOptions && (
                    <Tabs.TabPane
                      tab="Subfactions"
                      key="1"
                      style={{ overflowY: "auto", minHeight: "350px", maxHeight: "450px" }}
                      disabled={!selectedFaction?.subfactions || selectedFaction?.subfactions?.length === 0}>
                      <Row style={{ paddingTop: "8px" }}>
                        <Col span={23}>
                          <Typography.Paragraph>
                            By default all subfactions are shown. If you want to hide certain subfactions you can toggle
                            them here. This will filter stratagems &amp; secondaries. At the moment Datasheets cannot be
                            filtered by subfaction yet because of datasource limitations.
                          </Typography.Paragraph>
                        </Col>
                      </Row>
                      <Row style={{ paddingTop: "0px" }}>
                        <Col span={3} push={20} style={{ textAlign: "right" }}>
                          <Button.Group>
                            <Button
                              icon={<MinusSquareOutlined />}
                              size={"small"}
                              title={"De-select all"}
                              onClick={() => {
                                const newSubFactions = settings.ignoredSubFactions ?? [];

                                selectedFaction?.subfactions?.map((subfaction) => {
                                  newSubFactions.push(subfaction.id);
                                });
                                updateSettings({ ...settings, ignoredSubFactions: newSubFactions });
                              }}></Button>
                            <Button
                              icon={<PlusSquareOutlined />}
                              title={"Select all"}
                              size={"small"}
                              onClick={() => {
                                const newSubFactions = settings.ignoredSubFactions ?? [];

                                selectedFaction?.subfactions?.map((subfaction) => {
                                  newSubFactions.splice(
                                    newSubFactions.findIndex((el) => el === subfaction.id),
                                    1
                                  );
                                });
                                updateSettings({ ...settings, ignoredSubFactions: newSubFactions });
                              }}></Button>
                          </Button.Group>
                        </Col>
                      </Row>
                      <Row style={{ paddingTop: "0px" }}>
                        {selectedFaction?.subfactions?.map((subfaction) => {
                          return (
                            <Col span={23} key={`${selectedFaction.id}-${subfaction.id}`}>
                              <Card
                                type={"inner"}
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
                                        newSubFactions?.splice(
                                          newSubFactions?.findIndex((el) => el === subfaction.id),
                                          1
                                        );
                                      } else {
                                        newSubFactions?.push(subfaction.id);
                                      }

                                      updateSettings({ ...settings, ignoredSubFactions: newSubFactions });
                                    }}
                                  />
                                }></Card>
                            </Col>
                          );
                        })}
                      </Row>
                    </Tabs.TabPane>
                  )}
                  {!dataSource.noDatasheetOptions && (
                    <Tabs.TabPane tab="Datasheets" key="2" style={{ overflowY: "auto", minHeight: "350px" }}>
                      {!dataSource.noDatasheetByRole && (
                        <>
                          <Row style={{ paddingTop: "8px" }}>
                            <Col span={23}>
                              <Typography.Paragraph
                                style={{
                                  fontSize: "0.9rem",
                                  fontWeight: 600,
                                  textTransform: "uppercase",
                                  marginBottom: 0,
                                  color: "#888888",
                                  borderBottom: "2px solid #f0f0f0",
                                }}>
                                Generic options
                              </Typography.Paragraph>
                            </Col>
                          </Row>
                          <Row style={{ paddingTop: "0px" }}>
                            <Col span={23}>
                              <Card
                                type={"inner"}
                                key={`display-01`}
                                size={"small"}
                                title={"Split datasheets by role"}
                                bodyStyle={{ padding: 0 }}
                                style={{ marginBottom: "8px", marginTop: "8px" }}
                                extra={
                                  <Switch
                                    checked={settings.splitDatasheetsByRole}
                                    onChange={(value) => {
                                      updateSettings({ ...settings, splitDatasheetsByRole: value });
                                    }}
                                  />
                                }></Card>
                            </Col>
                          </Row>
                        </>
                      )}
                      {settings.selectedDataSource === "40k-10e" && (
                        <>
                          <Row style={{ paddingTop: "8px" }}>
                            <Col span={23}>
                              <Typography.Paragraph
                                style={{
                                  fontSize: "0.9rem",
                                  fontWeight: 600,
                                  textTransform: "uppercase",
                                  marginBottom: 0,
                                  color: "#888888",
                                  borderBottom: "2px solid #f0f0f0",
                                }}>
                                Warhammer 10th edition options
                              </Typography.Paragraph>
                            </Col>
                          </Row>
                          <Row style={{ paddingTop: "8px" }}>
                            <Col span={23}>
                              <Typography.Paragraph
                                style={{
                                  fontSize: "0.8rem",
                                  fontWeight: 400,
                                  textTransform: "uppercase",
                                  marginBottom: 0,
                                  color: "#888888",
                                }}>
                                Datacards
                              </Typography.Paragraph>
                            </Col>
                          </Row>
                          <Row style={{ paddingTop: "0px" }}>
                            <Col span={23}>
                              <Card
                                type={"inner"}
                                key={`display-02`}
                                size={"small"}
                                title={"Add Legends datacards to factions"}
                                bodyStyle={{ padding: 0 }}
                                style={{ marginBottom: "8px", marginTop: "8px" }}
                                extra={
                                  <Switch
                                    checked={settings.showLegends}
                                    onChange={(value) => {
                                      updateSettings({ ...settings, showLegends: value });
                                    }}
                                  />
                                }></Card>
                            </Col>
                          </Row>
                          <Row style={{ paddingTop: "0px" }}>
                            <Col span={23}>
                              <Card
                                type={"inner"}
                                key={`display-03`}
                                size={"small"}
                                title={"Add Space Marine cards to subchapter factions"}
                                bodyStyle={{ padding: 0 }}
                                style={{ marginBottom: "8px", marginTop: "8px" }}
                                extra={
                                  <Switch
                                    checked={settings.combineParentFactions}
                                    onChange={(value) => {
                                      updateSettings({ ...settings, combineParentFactions: value });
                                    }}
                                  />
                                }></Card>
                            </Col>
                          </Row>
                          <Row style={{ paddingTop: "0px" }}>
                            <Col span={23}>
                              <Card
                                type={"inner"}
                                key={`display-04`}
                                size={"small"}
                                title={"Add allied faction cards to factions"}
                                bodyStyle={{ padding: 0 }}
                                style={{ marginBottom: "8px", marginTop: "8px" }}
                                extra={
                                  <Switch
                                    checked={settings.combineAlliedFactions}
                                    onChange={(value) => {
                                      updateSettings({ ...settings, combineAlliedFactions: value });
                                    }}
                                  />
                                }></Card>
                            </Col>
                          </Row>
                          <Row style={{ paddingTop: "8px" }}>
                            <Col span={23}>
                              <Typography.Paragraph
                                style={{
                                  fontSize: "0.8rem",
                                  fontWeight: 400,
                                  textTransform: "uppercase",
                                  marginBottom: 0,
                                  color: "#888888",
                                }}>
                                display
                              </Typography.Paragraph>
                            </Col>
                          </Row>
                          {/* <Row style={{ paddingTop: "0px" }}>
                        <Col span={23}>
                          <Card
                            type={"inner"}
                            key={`display-04`}
                            size={"small"}
                            title={"Group cards by faction"}
                            bodyStyle={{ padding: 0 }}
                            style={{ marginBottom: "8px", marginTop: "8px" }}
                            extra={
                              <Switch
                                checked={settings.groupByFaction}
                                onChange={(value) => {
                                  updateSettings({ ...settings, groupByFaction: value });
                                }}
                              />
                            }></Card>
                        </Col>
                      </Row> */}
                          <Row style={{ paddingTop: "0px" }}>
                            <Col span={23}>
                              <Card
                                type={"inner"}
                                key={`display-01`}
                                size={"small"}
                                title={"Show points in listview"}
                                bodyStyle={{ padding: 0 }}
                                extra={
                                  <Switch
                                    checked={settings.showPointsInListview}
                                    onChange={(value) => {
                                      updateSettings({ ...settings, showPointsInListview: value });
                                    }}
                                  />
                                }></Card>
                            </Col>
                          </Row>
                          <Row style={{ paddingTop: "0px" }}>
                            <Col span={23}>
                              <Card
                                type={"inner"}
                                key={`display-01`}
                                size={"small"}
                                title={"Always show cards in single-side view"}
                                bodyStyle={{ padding: 0 }}
                                style={{ marginTop: "8px" }}
                                extra={
                                  <Switch
                                    checked={settings.showCardsAsDoubleSided || false}
                                    onChange={(value) => {
                                      updateSettings({ ...settings, showCardsAsDoubleSided: value });
                                    }}
                                  />
                                }></Card>
                            </Col>
                          </Row>
                          <Row style={{ paddingTop: "0px" }}>
                            <Col span={23}>
                              <Card
                                type={"inner"}
                                key={`display-04`}
                                size={"small"}
                                title={"Group cards by role"}
                                bodyStyle={{ padding: 0 }}
                                style={{ marginBottom: "8px", marginTop: "8px" }}
                                extra={
                                  <Switch
                                    checked={settings.groupByRole}
                                    onChange={(value) => {
                                      updateSettings({ ...settings, groupByRole: value });
                                    }}
                                  />
                                }></Card>
                            </Col>
                          </Row>
                        </>
                      )}
                    </Tabs.TabPane>
                  )}
                  {!dataSource.noStratagemOptions && (
                    <Tabs.TabPane tab="Stratagems" key="3" style={{ overflowY: "auto", minHeight: "350px" }}>
                      <Row style={{ paddingTop: "8px" }}>
                        <Col span={23}>
                          <Typography.Paragraph>Please select your preferred options here.</Typography.Paragraph>
                        </Col>
                      </Row>
                      <Row style={{ paddingTop: "0px" }}>
                        <Col span={23}>
                          <Card
                            type={"inner"}
                            key={`display-01`}
                            size={"small"}
                            title={"Hide basic stratagems"}
                            bodyStyle={{ padding: 0 }}
                            style={{ marginBottom: "8px", marginTop: "8px" }}
                            extra={
                              <Switch
                                checked={settings.hideBasicStratagems}
                                onChange={(value) => {
                                  updateSettings({ ...settings, hideBasicStratagems: value });
                                }}
                              />
                            }></Card>
                        </Col>
                      </Row>
                    </Tabs.TabPane>
                  )}
                  {!dataSource.noSecondaryOptions && (
                    <Tabs.TabPane tab="Secondaries" key="4" style={{ overflowY: "auto", minHeight: "350px" }}>
                      <Row style={{ paddingTop: "8px" }}>
                        <Col span={23}>
                          <Typography.Paragraph>Please select your preferred options here.</Typography.Paragraph>
                        </Col>
                      </Row>
                      <Row style={{ paddingTop: "0px" }}>
                        <Col span={23}>
                          <Card
                            type={"inner"}
                            key={`display-01`}
                            size={"small"}
                            title={"Hide basic secondaries"}
                            bodyStyle={{ padding: 0 }}
                            style={{ marginBottom: "8px", marginTop: "8px" }}
                            extra={
                              <Switch
                                checked={settings.hideBasicSecondaries}
                                onChange={(value) => {
                                  updateSettings({ ...settings, hideBasicSecondaries: value });
                                }}
                              />
                            }></Card>
                        </Col>
                      </Row>
                    </Tabs.TabPane>
                  )}
                </Tabs>
                <Row style={{ padding: "8px", textAlign: "right", borderTop: "1px solid #F0F0F0" }}>
                  <Col span={24}>
                    <Button
                      type="primary"
                      onClick={() => {
                        setIsFactionSettingsVisible(false);
                      }}>
                      Close
                    </Button>
                  </Col>
                </Row>
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
        disabled={!selectedFaction}
        onClick={() => setIsFactionSettingsVisible(true)}>
        <SettingOutlined />
      </Button>
    </>
  );
};
