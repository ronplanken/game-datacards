import { SettingOutlined } from "@ant-design/icons";
import { Button, Card, Col, Collapse, Modal, Popconfirm, Row, Space, Switch, Tabs, Tooltip, Typography } from "antd";
import React from "react";
import { useDataSourceStorage } from "../Hooks/useDataSourceStorage";
import { useSettingsStorage } from "../Hooks/useSettingsStorage";
import { AddCard } from "../Icons/AddCard";

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
            <Row style={{ paddingRight: "16px" }}>
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
                  title={"40k 10th Edition import"}
                  bodyStyle={{ padding: 0 }}
                  style={{ marginBottom: "16px" }}
                  extra={
                    <Switch
                      onChange={() =>
                        updateSettings({
                          ...settings,
                          selectedDataSource: "40k-10e",
                          selectedFactionIndex: 0,
                        })
                      }
                      disabled={settings.selectedDataSource === "40k-10e"}
                      checked={settings.selectedDataSource === "40k-10e"}
                    />
                  }>
                  {settings.selectedDataSource === "40k-10e" && (
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
                  title={"40k 10th Combat Patrol import"}
                  bodyStyle={{ padding: 0 }}
                  style={{ marginBottom: "16px" }}
                  extra={
                    <Switch
                      onChange={() =>
                        updateSettings({
                          ...settings,
                          selectedDataSource: "40k-10e-cp",
                          selectedFactionIndex: 0,
                        })
                      }
                      disabled={settings.selectedDataSource === "40k-10e-cp"}
                      checked={settings.selectedDataSource === "40k-10e-cp"}
                    />
                  }>
                  {settings.selectedDataSource === "40k-10e-cp" && (
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
                  title={"Wahapedia data import 9th edition"}
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
          <TabPane tab="Printing" key="4">
            <Row>
              <Col>You can configure printing options here.</Col>
            </Row>
            <Row style={{ paddingTop: "16px" }}>
              <Col span={23}>
                <Card
                  type={"inner"}
                  size={"small"}
                  title={"Legacy Printing"}
                  bodyStyle={{ padding: 0 }}
                  style={{ marginBottom: "16px" }}
                  extra={
                    <Switch
                      onChange={() =>
                        updateSettings({
                          ...settings,
                          legacyPrinting: !settings.legacyPrinting,
                        })
                      }
                      checked={settings.legacyPrinting}
                    />
                  }></Card>
              </Col>
            </Row>
          </TabPane>
          <TabPane tab="Changelog" key="5">
            <Row style={{ overflowY: "scroll", maxHeight: "400px" }}>
              <Col span={23}>
                <Collapse>
                  {/* <Panel header={"Version 1.3.1"} key={"1.3.1"}>
                    <b> DATE </b>
                    <Typography.Title level={5}>New Features</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong> feature</strong>
                          <br />
                          description
                        </li>
                      </ul>
                    </Typography.Paragraph>
                    <Typography.Title level={5}>Changes</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong> datasource:</strong> Description
                        </li>
                      </ul>
                    </Typography.Paragraph>
                    <Typography.Title level={5}>Fixes</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong> datasource:</strong> Description
                        </li>
                      </ul>
                    </Typography.Paragraph>
                  </Panel> */}
                  <Panel header={"Version 2.12.1"} key={"2.12.1"}>
                    <b> 12-06-2025</b>
                    <Typography.Title level={4}>Added</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Added Deathwatch to 10e cards</strong>
                          <br />
                          Deathwatch faction is now available for Warhammer 40k 10th edition cards.
                        </li>
                      </ul>
                    </Typography.Paragraph>
                    <Typography.Title level={4}>Fixes</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>
                            Fixed the delete modal not showing up and Line Height not working correct with
                            StratagemCards
                          </strong>
                          <br />
                          Resolved issues with delete confirmation modal visibility and improved line height formatting
                          for Stratagem cards.
                        </li>
                        <li>
                          <strong>Fixed multi-line not working properly on Stratagems and Enhancements</strong>
                          <br />
                          Improved text formatting to properly handle multi-line content in Stratagem and Enhancement
                          cards.
                        </li>
                      </ul>
                    </Typography.Paragraph>
                  </Panel>
                  <Panel header={"Version 2.12.0"} key={"2.12.0"}>
                    <b> 04-06-2025</b>
                    <Typography.Title level={4}>Features</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Panel visibility toggles for 10e cards</strong>
                          <br />
                          Added toggle switches to show/hide Wargear, Loadout, and Abilities sections in the card
                          editor.
                        </li>
                      </ul>
                    </Typography.Paragraph>
                  </Panel>
                  <Panel header={"Version 2.11.0"} key={"2.11.0"}>
                    <b> 13-05-2025</b>
                    <Typography.Title level={4}>Added</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Enhancement Cards</strong>
                          <br />A new option for the desktop editor has been added. You can now add Enhancement Cards to
                          your collections.
                        </li>
                        <li>
                          <strong>Resizeable 10e stratagems & enhancement cards</strong>
                          <br />
                          We have added the first kind of resizeable cards to the desktop editor. You can now resize
                          then using a slider, and change the font-size of the content.
                          <br /> <br />
                          <i>
                            More customization will be added in a later update, join the Discord to let me know what
                            should be prioritised.
                          </i>
                        </li>
                      </ul>
                    </Typography.Paragraph>
                    <Typography.Title level={4}>Fixes</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Unsaved changes popup</strong>
                          <br />
                          After our previous change to the unsaved changes popup, you could get in a loop where you did
                          not want to save changes but couldnt swap cards. You now have the extra option to discard your
                          changes.
                        </li>
                      </ul>
                    </Typography.Paragraph>
                  </Panel>
                  <Panel header={"Version 2.10.0"} key={"2.10.0"}>
                    <b> 13-05-2025</b>
                    <Typography.Title level={4}>Added</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Added external image option for 10e Unit Cards</strong>
                          <br />
                          Based on our previous update, we added the option to add an external image to your 10e cards.
                          This image has to be hosted on an external website and have a direct link to the image. You
                          can add this image in the card editor.
                        </li>
                        <li>
                          <strong>Text Size option for 10e Stratagem Cards</strong>
                          <br />
                          You can now manually set the text size for your stratagem cards. This is useful if you want to
                          make sure the text fits on the card.
                        </li>
                      </ul>
                    </Typography.Paragraph>
                    <Typography.Title level={4}>Fixes</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Unsaved changes popup</strong>
                          <br />
                          We have changed the logic when the unsaved changes popup is shown. It will now give you the
                          option to immediately save your changes and continue or cancel the action.
                        </li>
                        <li>
                          <strong>10e Stratagem Card type</strong>
                          <br />
                          The text size of a Stratagem Card&apos;s type will now auto scale based on the available
                          space.
                        </li>
                        <li>
                          <strong>Agents of the Imperium</strong>
                          <br />
                          Agents of the Imperium are now correctly displayed in the list of factions.
                        </li>
                      </ul>
                    </Typography.Paragraph>
                  </Panel>
                  <Panel header={"Version 2.9.3"} key={"2.9.3"}>
                    <b> 09-05-2025</b>
                    <Typography.Title level={4}>Added</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>html-data tags for external CSS</strong>
                          <br />
                          Thanks to ambre-m we have now added html-data tags to the Datacards that allow you to use
                          custom CSS and finetune cards to your liking. Join us on Discord if you want an example or
                          help!
                        </li>
                      </ul>
                    </Typography.Paragraph>
                    <Typography.Title level={4}>Updated</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Latest Coded support</strong>
                          <br />
                          We have updated to the latest Pointy-eared Codex!
                        </li>
                      </ul>
                    </Typography.Paragraph>
                    <Typography.Title level={4}>Fixed</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Double Sided cards on Mobile</strong>
                          <br />
                          Somehow we missed that new users would not get the button to swap between front / back of
                          mobile cards. That has now been fixed.
                        </li>
                      </ul>
                    </Typography.Paragraph>
                  </Panel>
                  <Panel header={"Version 2.9.1"} key={"2.9.1"}>
                    <b> 18-10-2024 </b>
                    <Typography.Title level={4}>Features</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Updated to latest datasources</strong>
                          <br />
                          All the latest changes are now available!
                        </li>
                        <li>
                          <strong>Points values with multiple keywords</strong>
                          <br />
                          If a points value is used with a certain keyword (such as Agents of the Imperium) it will now
                          be displayed using the specific keyword.
                        </li>
                      </ul>
                    </Typography.Paragraph>
                  </Panel>
                  <Panel header={"Version 2.9.0"} key={"2.9.0"}>
                    <b> 16-10-2024 </b>
                    <Typography.Title level={4}>Features</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Agents of the Imperium</strong>
                          <br />
                          The new Agents of the Imperium faction is now available for 10th edition.
                        </li>
                        <li>
                          <strong>New Combat Patrols</strong>
                          <br />
                          New Combat patrols have been added.
                        </li>
                      </ul>
                    </Typography.Paragraph>
                    <Typography.Title level={4}>Removed</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Deathwatch</strong>
                          <br />
                          The Deatchwatch faction has been removed from 10th edition.
                        </li>
                      </ul>
                    </Typography.Paragraph>
                  </Panel>
                  <Panel header={"Version 2.8.0"} key={"2.8.0"}>
                    <b> 26-08-2024 </b>
                    <Typography.Title level={4}>Features</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Genestealer Cults & Sisters of Battle</strong>
                          <br />
                          Two new codexes have been added.
                        </li>
                        <li>
                          <strong>Datasources updated</strong>
                          <br />
                          The latest datasources have been updated for errata and point values. Make sure to update
                          them.
                        </li>
                      </ul>
                    </Typography.Paragraph>
                    <Typography.Title level={4}>Fixes</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Keywords updated</strong>
                          <br />
                          Several keywords have been updated based on the latest core rules changes. If you find any
                          that might have been missed, make sure to let us know.
                        </li>
                      </ul>
                    </Typography.Paragraph>
                  </Panel>
                  <Panel header={"Version 2.7.0"} key={"2.7.0"}>
                    <b> 20-06-2024 </b>
                    <Typography.Title level={4}>Features</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Chaos Space Marines</strong>
                          <br />
                          The new Chaos Space Marines have popped up in the 10th edition.
                        </li>
                        <li>
                          <strong>Emperor&apos;s Children</strong>
                          <br />
                          The Emperor&apos;s Children faction is now available for 10th edition.
                        </li>
                        <li>
                          <strong>New Combat Patrols</strong>
                          <br />
                          New Combat patrols have been added.
                        </li>
                      </ul>
                    </Typography.Paragraph>
                  </Panel>
                  <Panel header={"Version 2.6.0"} key={"2.6.0"}>
                    <b> 29-04-2024 </b>
                    <Typography.Title level={5}>Features</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Full sized cards display</strong>
                          <br />
                          Finally! The technology has arrived to display Warhammer 10e cards in a single full sized card
                          side. This is a feature that has been requested for a long time and is finally here. You can
                          toggle the feature per card (as a Variant) or globally in the settings.
                          <br />
                          The settings option can be found next to the faction selection dropdown on desktop and in the
                          settings menu on mobile. Please note this overrides any options regarding the back & front
                          options of a card.
                        </li>
                        <li>
                          <strong>Complete and thorough cleanup of datasources</strong>
                          <br />
                          We have set all our servitors to work and managed to automate the error checking and cleanup
                          of our datasources. This means we are now able to provide a more consistent and reliable
                          experience with your datacards!
                          <br />
                          During this setup we also changed all cards to default to the invulnerable save at the top of
                          the card. Your old cards are unfortunately not updated to this new standard and need a manual
                          update or create a new duplicate card.
                        </li>
                      </ul>
                    </Typography.Paragraph>
                    <Typography.Title level={5}>Known issues</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Printing full sized cards</strong>
                          <br />
                          Unfortunately the full sized cards currently do not play nice with other cards while printing.
                          This means when you try to print multiple cards on a page they might take up more space then
                          you wish. You can still print them, but min/maxing the page might be tricky. We are working on
                          a fix and will keep you updated.
                        </li>
                      </ul>
                    </Typography.Paragraph>
                    <Typography.Title level={5}>Social</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>We need your help!</strong>
                          <br />
                          Please report any issues you find to the Discord or join us to chat about new and upcoming
                          features!
                        </li>
                      </ul>
                      <Row style={{ padding: "16px" }} justify={"center"}>
                        <Col span={24} style={{ textAlign: "center" }}>
                          <a href="https://discord.gg/anfn4qTYC4" target={"_blank"} rel="noreferrer">
                            <img src="https://discordapp.com/api/guilds/997166169540788244/widget.png?style=banner2"></img>
                          </a>
                        </Col>
                      </Row>
                    </Typography.Paragraph>
                  </Panel>
                  <Panel header={"Version 2.5.0"} key={"2.5.0"}>
                    <b> 19-03-2024 </b>
                    <Typography.Title level={5}>Updates</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Dark Angels update</strong>
                          <br />
                          The new Dark Angels 10e codex has been added to the website.
                        </li>
                        <li>
                          <strong>Chaos Space Marines</strong>
                          <br />
                          The CSM stratagems have been updated to comply with the latest index.
                        </li>
                      </ul>
                    </Typography.Paragraph>
                    <Typography.Title level={5}>Features</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Markdown</strong>
                          <br />
                          Markdown has been re-enabled for most description fields. Please note that some options are
                          not fully compatible yet. (Such as newlines)
                        </li>
                        <li>
                          <strong>Invulnerable save display</strong>
                          <br />
                          The invulnerable save is now displayed at the top of the unit card. Old datasheets still
                          default to the old location. Updated ones are by default displayed at the top.
                        </li>
                        <li>
                          <strong>Combined weapon profiles</strong>
                          <br />
                          Weapons that have exclusive profiles (such as sweep & strike for melee) now have the maker to
                          show they are exclusive.
                        </li>
                        <li>
                          <strong>Weapon abilities</strong>
                          <br />
                          Weapon abilities (such as one-shot) can now be edited and added.
                        </li>
                        <li>
                          <strong>Image Generator</strong>
                          <br />A Image Generator has been added to the website. This allows you to create images of
                          complete factions. This is an experimental feature and can be found{" "}
                          <a href="/image-generator">here</a>.
                        </li>
                        <li>
                          <strong>Various fixes</strong>
                          <br />
                          Various fixes and improvements have been made to the website.
                        </li>
                      </ul>
                    </Typography.Paragraph>
                  </Panel>
                  <Panel header={"Version 2.4.0"} key={"2.4.0"}>
                    <b> 16-03-2024 </b>
                    <Typography.Title level={5}>Updates</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Space Marines update</strong>
                          <br />
                          The 10e Space Marines have been updated to their latest source. Make sure to update your
                          datasources.
                        </li>
                      </ul>
                      <ul>
                        <li>
                          <strong>Necron update</strong>
                          <br />
                          The 10e Necrons have been updated to their latest source. Make sure to update your
                          datasources.
                        </li>
                      </ul>
                    </Typography.Paragraph>
                    <Typography.Title level={5}>Features</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Service Messages</strong>
                          <br />
                          We are now able to add a simple message to the website to inform you of any issues or updates
                          without having to make a new release.
                        </li>
                      </ul>
                    </Typography.Paragraph>
                  </Panel>
                  <Panel header={"Version 2.3.3"} key={"2.3.3"}>
                    <b> 15-12-2023 </b>
                    <Typography.Title level={5}>New Features</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Flip side button for Shared cards</strong>
                          <br />
                          When using a shared set of cards the flip button was missing for 10e cards. It is not
                          available for mobile and desktop.
                        </li>
                      </ul>
                    </Typography.Paragraph>
                  </Panel>
                  <Panel header={"Version 2.3.2"} key={"2.3.2"}>
                    <b> 8-12-2023 </b>
                    <Typography.Title level={5}>New Features</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Printer Ink Friendly Backgrounds</strong>
                          <br />
                          There are now two new backgrounds in the printer settings. Coloured Ink Saver, which keeps the
                          original feel but with mostly white backgrounds instead of grey, and Greyscale Ink Saver which
                          is the same but greyscale for even more printer ink friendliness.
                        </li>
                      </ul>
                    </Typography.Paragraph>
                  </Panel>
                  <Panel header={"Version 2.3.1"} key={"2.3.1"}>
                    <b> 28-11-2023 </b>
                    <Typography.Title level={5}>New Features</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Detachments</strong>
                          <br />
                          Factions that have a detachment can now be shown properly. Also when adding a unit to a list
                          you can first select a detachment to filter the enhancements.
                        </li>
                        <li>
                          <strong>Tyranids</strong>
                          <br />
                          In the 10e datasource Tyranids are now available for detachments.
                        </li>
                      </ul>
                    </Typography.Paragraph>
                    <Typography.Title level={5}>Visual Changes</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Stratagems</strong>
                          <br />
                          Stratagems on mobile will now remember their opened state.
                        </li>
                      </ul>
                    </Typography.Paragraph>
                  </Panel>
                  <Panel header={"Version 2.3.0"} key={"2.3.0"}>
                    <b> 01-11-2023 </b>
                    <Typography.Title level={5}>New Features</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Desktop List creation</strong>
                          <br />
                          You can now create a simple Warhammer 40k 10th edition with GameDatacards.
                        </li>
                        <li>
                          <strong>Points costs in list</strong>
                          <br />
                          You can toggle the display of points costs in the faction settings window.
                        </li>
                        <li>
                          <strong>Leads, Led by</strong>
                          <br />
                          You can now edit the leader section of 10th datacards.
                        </li>
                      </ul>
                    </Typography.Paragraph>
                    <Typography.Title level={5}>Visual Changes</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Mobile stratagems</strong>
                          <br />
                          Stratagems on mobile now have better art / styling.
                        </li>
                      </ul>
                    </Typography.Paragraph>
                  </Panel>
                  <Panel header={"Version 2.2.0"} key={"2.2.0"}>
                    <b> 27-10-2023 </b>
                    <Typography.Title level={5}>New Features</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Stratagem editor</strong>
                          <br />
                          Stratagems are now editable & printable in the card editor on desktop.
                        </li>
                        <li>
                          <strong>Basic stratagems</strong>
                          <br />
                          The mobile viewer now shows basic stratagems in the faction overview.
                        </li>
                      </ul>
                    </Typography.Paragraph>
                    <Typography.Title level={5}>Visual changes</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Multi-model units</strong>
                          <br />
                          Changes have been made to the way unit names in multi-model units are shown. They now
                          auto-scale on the available space, even though this might cause the names not to have the same
                          size it will fix the card overflowing outside its boundaries.
                        </li>
                        <li>
                          <strong>Weapon keywords</strong>
                          <br />
                          When the keywords on a weapon do not fit on the same line as the name the entire block will be
                          moved to the second line.
                        </li>
                        <li>
                          <strong>Legends</strong>
                          <br />
                          The Legends text is now properly shown in the mobile viewer.
                        </li>
                      </ul>
                    </Typography.Paragraph>
                  </Panel>
                  <Panel header={"Version 2.1.2"} key={"2.1.2"}>
                    <b> 20-07-2023 </b>
                    <Typography.Title level={5}>New Features</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Backcard printing</strong>
                          <br />A new feature has been added by a code-contributor that allows you to swap the cards
                          directly during printing. You can now simply do two print actions, one for the front and a
                          second for the back without having to swap cards manually.
                        </li>
                        <li>
                          <strong>Enhancement costs</strong>
                          <br />
                          The mobile version now shows the costs for enhancements in the overview.
                        </li>
                      </ul>
                    </Typography.Paragraph>
                  </Panel>
                  <Panel header={"Version 2.1.0"} key={"2.1.0"}>
                    <b> 14-07-2023 </b>
                    <Typography.Title level={5}>New Features</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Backcard editing</strong>
                          <br />
                          You can now edit the back of the cards while in the Desktop card editor. Since &nbsp;
                          <strong>Leads</strong> and <strong>Led by</strong> are derrived fields they are not editable
                          at the moment.
                        </li>
                        <li>
                          <strong>Legends cards</strong>
                          <br />A first pass has been added for Legends cards for 10th edition. Please note that for now
                          only the &quot;main&quot; faction of the cards have them available. The Traitoris versions
                          will be coming at a later date.
                        </li>
                        <li>
                          <strong>Allied & Parent factions</strong>
                          <br />
                          You can add Allied & Parent factions to faction that have available. They will show up at the
                          bottom of the datasheet list.
                        </li>
                        <li>
                          <strong>Group by role</strong>
                          <br />
                          Datasheets can now be grouped by role for listbuilding.
                        </li>
                        <li>
                          <strong>More settings</strong>
                          <br />A couple of settings and filters have been added. Check them out in the Faction settings
                          and the mobile options menu.
                        </li>
                      </ul>
                    </Typography.Paragraph>
                  </Panel>
                  <Panel header={"Version 2.1.0"} key={"2.1.0"}>
                    <b> 01-07-2023 </b>
                    <Typography.Title level={5}>New Features</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Mobile List Creation</strong>
                          <br />
                          When using the mobile version you can now create a list on the go. Simply open up a DataCard
                          and press the new button <AddCard /> at the bottom, select a size, warlord and optional
                          enhancement and add it to your list. <br /> <br /> The button on the left&nbsp;
                          <Button
                            type="ghost"
                            size="small"
                            className="button-bar"
                            shape="round"
                            style={{ color: "white", backgroundColor: "rgb(0, 21, 41)" }}>
                            0 pts
                          </Button>
                          &nbsp; will show the amount of points and gives you an overview. You can also export it to
                          text through the list overview.
                        </li>
                        <li>
                          <strong>Stratagem & Enhancement overview</strong>
                          <br />
                          You can now select an Faction in the top header. Doing this will show an overview of faction
                          stratagems and enhancements. Pressing the GDC logo will always let you return here. <br />
                          <br /> An extra special thanks to ZiggyQubert for working on the Stratagem datasource!
                        </li>
                      </ul>
                    </Typography.Paragraph>
                    <Typography.Title level={5}>Bug fixes</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Background colours</strong>
                          <br />
                          You can select a low-ink print option for 40k 10e cards.
                        </li>
                        <li>
                          <strong>Swapping front to back save message</strong>
                          <br />
                          When swapping between front & back on the desktop version GDC will not bother you with a
                          &quot;unsaved changes&quot; popup anymore.
                        </li>
                      </ul>
                    </Typography.Paragraph>
                  </Panel>
                  <Panel header={"Version 2.0.1"} key={"2.0.1"}>
                    <b> 19-06-2023 </b>
                    <Typography.Title level={5}>New Features</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Genestealer Cults available</strong>
                          <br />
                          The GSC were hiding in the ground, waiting for the blips to arrive. And arrived they have! The
                          Patriarch came bearing gifts!
                        </li>
                        <li>
                          <strong>Faction based colours</strong>
                          <br />
                          All factions now have their own colour scheme based on original documentation. <br />
                          Unfortunately the Chaos Daemons are scared colourless and cannot make up their mind, their
                          specific colours will be coming later.
                        </li>
                        <li>
                          <strong>Composition, loadouts &amp; more</strong>
                          <br />
                          The GSC are scary. So press a button and flip the datacard around to see what it was hiding.
                          (It was hiding data..)
                        </li>
                      </ul>
                    </Typography.Paragraph>
                    <Typography.Title level={5}>Bug fixes</Typography.Title>
                    <Typography.Paragraph style={{ fontSize: "16px" }}>
                      <ul>
                        <li>
                          <strong>Melee weapons</strong>
                          <br />
                          Melee weapons now show WS instead of BS.
                          <br />
                          (Courtesy of the first ever contribution by a different author then me!)
                        </li>
                      </ul>
                    </Typography.Paragraph>
                  </Panel>
                  <Panel header={"Older versions"} key={"older"}>
                    <Collapse>
                      <Panel header={"Version 2.0.0"} key={"2.0.0"}>
                        <b> 15-06-2023 </b>
                        <Typography.Title level={5}>New Features</Typography.Title>
                        <Typography.Paragraph style={{ fontSize: "16px" }}>
                          <ul>
                            <li>
                              <strong>Warhammer 40k 10th edition support</strong>
                              <br />
                              We now support Warhammer 40k 10th edition datacards. You can edit and modify them as you
                              wish. All data is retrieve from an external datasource and not included in game-datacards.
                              <br />
                              <br /> Make sure you enable the Warhammer 40k 10th edition datasource in the settings
                              window.
                              <br /> If you have any suggestions or questions make sure to join our discord!
                            </li>
                            <li>
                              <strong>Scalable panels</strong>
                              <br />
                              You can now move and scale both side panels as you wish.
                            </li>
                          </ul>
                        </Typography.Paragraph>
                      </Panel>
                      <Panel header={"Version 1.6.0"} key={"1.6.0"}>
                        <b> 14-01-2023 </b>
                        <Typography.Title level={5}>New Features</Typography.Title>
                        <Typography.Paragraph style={{ fontSize: "16px" }}>
                          <ul>
                            <li>
                              <strong>New printing options</strong>
                              <br />
                              You can now select card scaling and page orientation in the print settings.
                            </li>
                            <li>
                              <strong>Legacy Printing options</strong>
                              <br />
                              By popular demand the old printing feature has returned as a legacy option. You can toggle
                              this in the configuration window.
                            </li>
                          </ul>
                        </Typography.Paragraph>
                      </Panel>
                      <Panel header={"Version 1.5.0"} key={"1.5.0"}>
                        <b> 21-12-2022 </b>
                        <Typography.Title level={5}>New Features</Typography.Title>
                        <Typography.Paragraph style={{ fontSize: "16px" }}>
                          <ul>
                            <li>
                              <strong>Printing feature has been updated</strong>
                              <br />
                              In order to help you create the perfect prints the print feature has been updated to be
                              more inline to what you will actually print. For now it supports A4 and Letter US page
                              formats. You will also have more control over the way the cards are spaced around the
                              pages.
                              <br />
                              <br />
                              Card scaling has been removed in favor of more fine-tuned control for all card sizes. You
                              now have the ability to select all kinds of different sizes or go full custom and manually
                              enter the card size. (Yes, unfortunately I&aposm one of those metric kind of programmers,
                              so cm only for now.)
                              <br />
                              <br />
                              You can expect more custom styling / printing options in a future update. Stuff like
                              font-size, custom images and more.
                            </li>
                            <li>
                              <strong>Reworked styling</strong>
                              <br />
                              All styling for all types of cards has been reworked. Since I was supposed to do this from
                              the start but didn&apos;t this might cause some styling issues. Please report any issues
                              you find to the Discord!
                            </li>
                          </ul>
                        </Typography.Paragraph>
                      </Panel>
                      <Panel header={"Version 1.4.2"} key={"1.4.2"}>
                        <b> 17-10-2022 </b>
                        <Typography.Title level={5}>New Features</Typography.Title>
                        <Typography.Paragraph style={{ fontSize: "16px" }}>
                          <ul>
                            <li>
                              <strong>Datasheets can now be sorted by role.</strong>
                              <br />A new setting has been added to the faction settings to sort and group all
                              datasheets by their role.
                            </li>
                            <li>
                              <strong>Basic stratagems have been added.</strong>
                              <br />
                              Basic stratagems are now shown in addition to the faction stratagems. You have the option
                              to hide these using the faction settings.
                            </li>
                            <li>
                              <strong>Basic secondaries can now be filtered.</strong>
                              <br />
                              Basic secondaries are now shown as a seperate group. You have the option to hide these
                              using the faction settings.
                            </li>
                            <li>
                              <strong>Add cards to a specific category</strong>
                              <br />
                              You can now add a card to a specific category instead of just the first one.
                            </li>
                          </ul>
                        </Typography.Paragraph>
                      </Panel>
                      <Panel header={"Version 1.4.1"} key={"1.4.1"}>
                        <b> 21-09-2022 </b>
                        <Typography.Title level={5}>New Features</Typography.Title>
                        <Typography.Paragraph style={{ fontSize: "16px" }}>
                          <ul>
                            <li>
                              <strong>Full support for Wahapedia&apos;s Psychic Powers.</strong>
                              <br />
                              Game-datacards.eu now has full support for all Psychic abilities that are available in the
                              Wahapedia datasource.
                              <em>
                                Please note that you need to update your datasources in order to use the latest data.
                              </em>
                            </li>
                            <li>
                              <strong>Datasheets can now show a header</strong>
                              <br />
                              Using the new settings button on a datasheet you can toggle the header on/off.
                            </li>
                          </ul>
                        </Typography.Paragraph>
                      </Panel>
                      <Panel header={"Version 1.4.0"} key={"1.4.0"}>
                        <b> 02-09-2022 </b>
                        <Typography.Title level={5}>New Features</Typography.Title>
                        <Typography.Paragraph style={{ fontSize: "16px" }}>
                          <ul>
                            <li>
                              <strong>Full support for Wahapedia&apos;s secondaries &amp; subfactions.</strong>
                              <br />
                              Game-datacards.eu now has full support for all secondaries &amp; subfactions that are
                              available in the Wahapedia datasource.{" "}
                              <em>
                                Please note that you need to update your datasources in order to use the latest data.
                              </em>
                            </li>
                            <li>
                              <strong>Filter stratagems &amp; secondaries on subfaction</strong>
                              <br />
                              You can now select which subfactions you want to show for the stratagems &amp; secondaries
                              using the new button next to the faction select. By default all subfactions are shown.
                            </li>
                            <li>
                              <strong>Update reminder</strong>
                              <br />
                              An update reminder has been added to remind you to check for datasource updates.
                            </li>
                          </ul>
                        </Typography.Paragraph>
                        <Typography.Title level={5}>Changes</Typography.Title>
                        <Typography.Paragraph style={{ fontSize: "16px" }}>
                          <ul>
                            <li>
                              <strong>40K</strong> Secondaries now have full table support if the text has them.
                            </li>
                            <li>
                              <strong>40K</strong> Changes have been made to certain faction id fields. This might cause
                              some backgrounds not working, if this occurs you can manually select a new background /
                              faction.
                            </li>
                          </ul>
                        </Typography.Paragraph>
                      </Panel>
                      <Panel header={"Version 1.3.2"} key={"1.3.2"}>
                        <b>25-08-2022</b>
                        <Typography.Title level={5}>New Features</Typography.Title>
                        <Typography.Paragraph style={{ fontSize: "16px" }}>
                          <ul>
                            <li>
                              <strong>You can now collapse categories.</strong>
                              <br />
                              By clicking on the arrow in front of a category you can collapse the category showing /
                              hiding the cards. Click on the line itself will still select it.
                            </li>
                            <li>
                              <strong>Backgrounds for unit cards</strong>
                              <br />
                              You can now select an optional background for unit cards (40k / Basic)
                            </li>
                            <li>
                              <strong>Necromunda has an empty action / stratagem card</strong>
                              <br />
                              You can now select an empty action / stratagem card from the Necromunda datasource.
                            </li>
                          </ul>
                        </Typography.Paragraph>
                        <Typography.Title level={5}>Changes</Typography.Title>
                        <Typography.Paragraph style={{ fontSize: "16px" }}>
                          <ul>
                            <li>
                              <strong>Basic / 40K</strong> The faction select box now has full names instead of just a
                              string.
                            </li>
                          </ul>
                        </Typography.Paragraph>
                      </Panel>
                      <Panel header={"Version 1.3.1"} key={"1.3.1"}>
                        <b>11-08-2022</b>
                        <Typography.Title level={5}>New Features</Typography.Title>
                        <Typography.Paragraph style={{ fontSize: "16px" }}>
                          <ul>
                            <li>
                              <strong>Added a Markdown editor to all textfields.</strong>
                              <br />
                              All textarea&apos;s have been replaced with a simple Markdown editor. This is in
                              preparation to add a table that certain texts might have.
                            </li>
                            <li>
                              <strong>Note option added to Necromunda cards</strong>
                              <br />
                              Fighter &amp; Vehicle cards now have a <strong>Note</strong> section where you can write
                              down stuff you want to remember but don&apos;t need to print on a card. Please note that
                              this will also be shared when sharing your category.
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
                              <strong>Type Card (for pen &amp; paper)</strong> to better represent what their purpose
                              is.
                            </li>
                            <li>
                              <strong>Necromunda:</strong> Wargear, rules and abilities are now textfields and are no
                              longer uppercased. You have full control over the text in this field.
                            </li>
                            <li>
                              <strong>40K:</strong> Newly added cards with multiple damage tables now have a proper
                              title.
                            </li>
                          </ul>
                        </Typography.Paragraph>
                        <Typography.Title level={5}>Fixes</Typography.Title>
                        <Typography.Paragraph style={{ fontSize: "16px" }}>
                          <ul>
                            <li>
                              <strong>Necromunda:</strong> Adding a new weapon to a card will no longer crash the app.
                            </li>
                            <li>
                              <strong>Basic:</strong> Stratagem type can now be edited instead of pointing towards the
                              name of the card.
                            </li>
                            <li>
                              <strong>Necromunda:</strong> Hiding a weapon will now actually hide the weapon.
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
                              <br />A ganger and a vehicle card (empty and/or editable) are now available. You can use
                              these cards by switching to the Necromunda Datasource.
                            </li>
                            <li>
                              <strong>Added Warhammer 40k secondary support. </strong>
                              <br />
                              When the datasource has secondaries enabled you can find them in the dropdown select list
                              in the card viewer. <i>Be sure to check for datasource updates.</i>
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
                              <strong>Datasources:</strong> Some changes have been made to the stored cards format. If
                              you experience any issues please let us know on Discord.
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
                              <strong>All:</strong> Cleaned up the styling and added print + share support for all types
                              of cards.
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
                            <b>1.0.1: </b>Made the abilities block have unlimited height on the card. (Will be clipped
                            if larger then the card)
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
                            <b>0.3.2: </b>Made all text fields optional and not prone to crash if they were
                            non-existant.
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
