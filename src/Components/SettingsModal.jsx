import { SettingOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import {
  Badge,
  Button,
  Card,
  Col,
  Collapse,
  Modal,
  Popconfirm,
  Row,
  Space,
  Switch,
  Tabs,
  Tooltip,
  Typography,
} from "antd";
import React from "react";
import { useDataSourceStorage } from "../Hooks/useDataSourceStorage";
import { useSettingsStorage } from "../Hooks/useSettingsStorage";

const { Panel } = Collapse;
const { TabPane } = Tabs;

export const SettingsModal = () => {
  const [isModalVisible, setIsModalVisible] = React.useState(false);

  const { settings, updateSettings } = useSettingsStorage();
  const { dataSource, checkForUpdate, clearData } = useDataSourceStorage();

  const [checkingForUpdate, setCheckingForUpdate] = React.useState(false);

  const refreshData = () => {
    setCheckingForUpdate(true);
    checkForUpdate().then(() => setCheckingForUpdate(false));
  };

  return (
    <>
      <Modal
        title={
          <Row justify="space-between">
            <Col>
              <Typography.Text>Configuration</Typography.Text>
            </Col>
            <Col pull={1}>
              <Typography.Text type="secondary">Version {process.env.REACT_APP_VERSION}</Typography.Text>
            </Col>
          </Row>
        }
        width={"850px"}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        bodyStyle={{ paddingLeft: 0, paddingRight: 0 }}
        footer={
          <Space>
            <Button
              type="primary"
              onClick={() => {
                setIsModalVisible(false);
              }}>
              Close
            </Button>
          </Space>
        }>
        <Tabs tabPosition="left">
          {/* <TabPane tab='Preferences' key='1'>
            Content of Tab 1
          </TabPane> */}
          <TabPane tab="Datasources" key="2">
            <Row>
              <Col>
                Please select your prefered game and datasource system. If no system is selected it will default to the
                Basic Card system.
              </Col>
            </Row>
            <Row style={{ paddingTop: "8px" }}>
              <Col span={23}>
                <Card
                  type={"inner"}
                  size={"small"}
                  title={"Basic Cards"}
                  bodyStyle={{ padding: 0 }}
                  style={{ marginBottom: "16px" }}
                  extra={
                    <Switch
                      onChange={() =>
                        updateSettings({
                          ...settings,
                          selectedDataSource: "basic",
                          selectedFactionIndex: 0,
                        })
                      }
                      disabled={settings.selectedDataSource === "basic"}
                      checked={settings.selectedDataSource === "basic"}
                    />
                  }></Card>
              </Col>
              <Col span={23}>
                <Card
                  type={"inner"}
                  size={"small"}
                  title={"Wahapedia data import"}
                  bodyStyle={{
                    padding: settings.selectedDataSource === "40k" ? 8 : 0,
                  }}
                  style={{ marginBottom: "16px" }}
                  extra={
                    <Switch
                      onChange={() =>
                        updateSettings({
                          ...settings,
                          selectedDataSource: "40k",
                        })
                      }
                      disabled={settings.selectedDataSource === "40k"}
                      checked={settings.selectedDataSource === "40k"}
                    />
                  }>
                  {settings.selectedDataSource === "40k" && (
                    <>
                      <Row>
                        <Col span={7} style={{ textAlign: "right" }}>
                          <Typography.Text strong={true}>Checked for update:</Typography.Text>
                        </Col>
                        <Col span={14} push={1}>
                          <Typography>{dataSource.lastCheckedForUpdate}</Typography>
                        </Col>
                      </Row>
                      <Row>
                        <Col span={7} style={{ textAlign: "right" }}>
                          <Typography.Text strong={true}>Data snapshot:</Typography.Text>
                        </Col>
                        <Col span={14} push={1}>
                          <Typography>{dataSource.lastUpdated}</Typography>
                        </Col>
                      </Row>
                      <Row>
                        <Col span={7} style={{ textAlign: "right" }}>
                          <Typography.Text strong={true}>Version:</Typography.Text>
                        </Col>
                        <Col span={14} push={1}>
                          <Typography>{dataSource.version}</Typography>
                        </Col>
                      </Row>
                      <Row>
                        <Col span={7} style={{ textAlign: "right" }}>
                          <Typography.Text strong={true}>Number of factions:</Typography.Text>
                        </Col>
                        <Col span={14} push={1}>
                          <Typography>{dataSource.data.length || 0}</Typography>
                        </Col>
                      </Row>
                      <Row>
                        <Col span={7} style={{ textAlign: "right" }}>
                          <Typography.Text strong={true}>Data store method:</Typography.Text>
                        </Col>
                        <Col span={14} push={1}>
                          <Typography>Locally on IndexDB</Typography>
                        </Col>
                      </Row>
                      <Row style={{ paddingTop: 16 }} justify="center">
                        <Col span={4}>
                          <Button type="default" loading={checkingForUpdate} onClick={refreshData}>
                            Check for update
                          </Button>
                        </Col>
                      </Row>
                    </>
                  )}
                </Card>
              </Col>
              <Col span={23}>
                <Card
                  type={"inner"}
                  size={"small"}
                  title={"Necromunda"}
                  bodyStyle={{ padding: 0 }}
                  style={{ marginBottom: "16px" }}
                  extra={
                    <Switch
                      onChange={() =>
                        updateSettings({
                          ...settings,
                          selectedDataSource: "necromunda",
                          selectedFactionIndex: 0,
                        })
                      }
                      disabled={settings.selectedDataSource === "necromunda"}
                      checked={settings.selectedDataSource === "necromunda"}
                    />
                  }></Card>
              </Col>
            </Row>
          </TabPane>
          <TabPane tab="Storage" key="3">
            <Row>
              <Col>
                If you would like to clear the local storage please use the button below. Please be noted that this is a
                one way operation and will remove all stored data including saved cards.
              </Col>
            </Row>
            <Row style={{ paddingTop: "16px" }}>
              <Col span={4}>
                <Popconfirm title={"Are you sure you want to remove all data?"} onConfirm={clearData}>
                  <Button danger type="primary" loading={checkingForUpdate}>
                    Clear data
                  </Button>
                </Popconfirm>
              </Col>
            </Row>
          </TabPane>
          <TabPane tab="Changelog" key="4">
            <Row>
              <Col span={23}>
                <Collapse>
                  <Panel header={"Version 1.3.1"} key={"1.3.1"}>
                    <b>11-08-2022</b>
                    <Typography.Title level={5}>New Features</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Added a Markdown editor to all textfields.</strong>
                          <br />
                          All textarea&apos;s have been replaced with a simple Markdown editor. This is in preparation
                          to add a table that certain texts might have.
                        </li>
                        <li>
                          <strong>Note option added to Necromunda cards</strong>
                          <br />
                          Fighter &amp; Vehicle cards now have a <strong>Note</strong> section where you can write down
                          stuff you want to remember but don&apos;t need to print on a card. Please note that this will
                          also be shared when sharing your category.
                        </li>
                        <li>
                          <strong>Drag &amp; Drop</strong>
                          <br />
                          All card types now have the ability to drag &amp; drop lines / cards in the card editor.
                        </li>
                      </ul>
                    </Typography.Paragraph>
                    <Typography.Title level={5}>Changes</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Necromunda:</strong> Renamed the <strong>Gang card</strong> to{" "}
                          <strong>Fighter card</strong> to better represent what kind of card it is.
                        </li>
                        <li>
                          <strong>Necromunda:</strong> Renamed the <strong>Empty Type Card</strong> to{" "}
                          <strong>Type Card (for pen &amp; paper)</strong> to better represent what their purpose is.
                        </li>
                        <li>
                          <strong>Necromunda:</strong> Wargear, rules and abilities are now textfields and are no longer
                          uppercased. You have full control over the text in this field.
                        </li>
                        <li>
                          <strong>40K:</strong> Newly added cards with multiple damage tables now have a proper title.
                        </li>
                      </ul>
                    </Typography.Paragraph>
                    <Typography.Title level={5}>Fixes</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Necromunda:</strong> Adding a new weapon to a card will no longer crash the app.
                        </li>
                      </ul>
                    </Typography.Paragraph>
                  </Panel>
                  <Panel header={"Version 1.3.0"} key={"1.3.0"}>
                    <b>06-08-2022</b>
                    <Typography.Title level={5}>New Features</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Added basic Necromunda card support.</strong>
                          <br />A ganger and a vehicle card (empty and/or editable) are now available. You can use these
                          cards by switching to the Necromunda Datasource.
                        </li>
                        <li>
                          <strong>Added Warhammer 40k secondary support. </strong>
                          <br />
                          When the datasource has secondaries enabled you can find them in the dropdown select list in
                          the card viewer. <i>Be sure to check for datasource updates.</i>
                        </li>
                        <li>
                          <strong>Window to show changes for a new version. </strong>
                          <br />
                          The panel are you are currently looking at 😅
                        </li>
                      </ul>
                    </Typography.Paragraph>
                    <Typography.Title level={5}>Changes</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Datasources:</strong> Some changes have been made to the stored cards format. If you
                          experience any issues please let us know on Discord.
                        </li>
                        <li>
                          <strong>Icons:</strong> Changed the icons based on the card type.
                        </li>
                      </ul>
                    </Typography.Paragraph>
                    <Typography.Title level={5}>Fixes</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Warhammer 40K:</strong> The card editor icons are no longer missing.
                        </li>
                        <li>
                          <strong>Warhammer 40K:</strong> Added proper Grenade &amp; Dakka icons
                        </li>
                        <li>
                          <strong>Warhammer 40K:</strong> You can now toggle the unit composition on/off
                        </li>
                        <li>
                          <strong>Basic:</strong> Basic Stratagem and Secondary now actually show up when selected.
                        </li>
                        <li>
                          <strong>All:</strong> Cleaned up the styling and added print + share support for all types of
                          cards.
                        </li>
                      </ul>
                    </Typography.Paragraph>
                  </Panel>
                  <Panel header={"Version 1.2.0"} key={"1.2.0"}>
                    <b>15-07-2022</b>
                    <ul>
                      <li>Added an welcome screen to introduce the app and configure it.</li>
                      <li>Added an default Basic Cards datasource</li>
                      <li>Added an Configuration screen in order to change settings and switch datasources.</li>
                      <li>Switched to IndexDB from localstorage for all datasources.</li>
                      <li>Game-Datacards app now remembers the last faction you had selected.</li>
                      <li>Added card and sheet variants without icons.</li>
                    </ul>
                  </Panel>
                  <Panel header={"Version 1.1.0"} key={"1.1.0"}>
                    <b>Changelog</b>
                    <ul>
                      <li>Added stratagem cards.</li>
                      <li>Fixed a bug with saving cards.</li>
                    </ul>
                  </Panel>
                  <Panel header={"Version 1.0.2"} key={"1.0.2"}>
                    <b>Changelog (01-07-2022)</b>
                    <ul>
                      <li>
                        <b>1.0.2: </b>Fixed a crash when saving a newly added card.{" "}
                      </li>
                      <li>
                        <b>1.0.2: </b>Added card Variants.{" "}
                      </li>
                      <li>
                        <b>1.0.1: </b>Added mobile view for Shared page.{" "}
                      </li>
                      <li>
                        <b>1.0.1: </b>Added an help message on the print screen.
                      </li>
                      <li>
                        <b>1.0.1: </b>Made the abilities block have unlimited height on the card. (Will be clipped if
                        larger then the card)
                      </li>
                      <li>Added ability to fully customize all sections on the card.</li>
                      <li>Auto-hide the header for empty sections on a card.</li>
                      <li>Added a sharing page to share your setup with other players.</li>
                      <li>Added the ability to add / delete / rename categories.</li>
                      <li>Added the ability to drag &amp; drop cards into categories.</li>
                      <li>Added an prompt when changing to a different card and not saving.</li>
                    </ul>
                  </Panel>
                  <Panel header={"Version 0.5.0"} key={"0.5.0"}>
                    <b>Changelog</b>
                    <ul>
                      <li>Added more printing options.</li>
                    </ul>
                  </Panel>
                  <Panel header={"Version 0.4.0"} key={"0.4.0"}>
                    <b>Changelog</b>
                    <ul>
                      <li>Added a json export / import function.</li>
                    </ul>
                  </Panel>
                  <Panel header={"Version 0.3.3"} key={"0.3.3"}>
                    <b>Changelog</b>
                    <ul>
                      <li>Added a search option to the unit list.</li>
                      <li>Units are now sorted by alphabetical order.</li>
                      <li>Made more fields on the card truncate or have a maximum shown length.</li>
                      <li>
                        <b>0.3.1: </b>Removed html tags from descriptions and abilities.
                      </li>
                      <li>
                        <b>0.3.2: </b>Added an example card to the mobile landingpage.
                      </li>
                      <li>
                        <b>0.3.2: </b>Made all text fields optional and not prone to crash if they were non-existant.
                      </li>
                      <li>
                        <b>0.3.3: </b>Nested weaponprofiles are now unique for all units.
                      </li>
                    </ul>
                  </Panel>
                  <Panel header={"Version 0.2.0"} key={"0.2.0"}>
                    <b>Changelog</b>
                    <ul>
                      <li>Updated the Page menu to use an icon bar instead of text buttons.</li>
                      <li>
                        Having a &quote;broken&quote; card in your page will now allow you to select and delete it.
                      </li>
                      <li>
                        The default selection of external data set cards now includes less data visible by Default.
                      </li>
                    </ul>
                  </Panel>
                </Collapse>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Modal>
      <Tooltip title={`Configuration`} placement="bottomLeft">
        {/* <Badge dot style={{ color: "#f5222d", width: "12px", height: "12px" }}> */}
        <Button
          type={"ghost"}
          icon={<SettingOutlined />}
          style={{ color: "white", fontSize: "16px" }}
          size={"large"}
          onClick={() => {
            setIsModalVisible(true);
          }}
        />
        {/* </Badge> */}
      </Tooltip>
    </>
  );
};
