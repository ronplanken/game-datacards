import { MenuOutlined, ZoomInOutlined, ZoomOutOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  Divider,
  Drawer,
  Grid,
  Image,
  Input,
  Layout,
  List,
  Modal,
  Row,
  Select,
  Space,
  Tooltip,
  Typography,
} from "antd";
import "antd/dist/antd.min.css";
import { useEffect, useState } from "react";
import "../App.css";
import { AboutModal } from "../Components/AboutModal";
import { FactionSettingsModal } from "../Components/FactionSettingsModal";
import { NecromundaCardDisplay } from "../Components/Necromunda/CardDisplay";
import { SettingsModal } from "../Components/SettingsModal";
import { UpdateReminder } from "../Components/UpdateReminder";
import { Warhammer40K10eCardDisplay } from "../Components/Warhammer40k-10e/CardDisplay";
import { Warhammer40KCardDisplay } from "../Components/Warhammer40k/CardDisplay";
import { WhatsNew } from "../Components/WhatsNew";
import { getListFactionId } from "../Helpers/treeview.helpers";
import { useCardStorage } from "../Hooks/useCardStorage";
import { useDataSourceStorage } from "../Hooks/useDataSourceStorage";
import { useSettingsStorage } from "../Hooks/useSettingsStorage";
import { Discord } from "../Icons/Discord";
import logo from "../Images/logo.png";
import "../style.less";

const { Header, Content } = Layout;
const { Option } = Select;
const { confirm } = Modal;

const { useBreakpoint } = Grid;

export const Viewer = () => {
  const { dataSource, selectedFactionIndex, selectedFaction, updateSelectedFaction } = useDataSourceStorage();
  const { settings, updateSettings } = useSettingsStorage();
  const [selectedContentType, setSelectedContentType] = useState("datasheets");
  const [isLoading] = useState(false);
  const [searchText, setSearchText] = useState(undefined);

  const { activeCard, setActiveCard } = useCardStorage();

  const screens = useBreakpoint();

  const [open, setOpen] = useState(false);

  useEffect(() => {
    updateSettings({
      ...settings,
      selectedDataSource: "40k-10e",
    });
  }, []);
  console.log(selectedFaction);

  const getDataSourceType = () => {
    if (selectedContentType === "datasheets") {
      const filteredSheets = searchText
        ? selectedFaction?.datasheets.filter((sheet) => sheet.name.toLowerCase().includes(searchText.toLowerCase()))
        : selectedFaction?.datasheets;
      if (settings?.splitDatasheetsByRole && !settings?.noDatasheetOptions) {
        const types = [...new Set(filteredSheets?.map((item) => item.role))];
        let byRole = [];
        types.map((role) => {
          byRole = [...byRole, { type: "header", name: role }];
          byRole = [...byRole, ...filteredSheets?.filter((sheet) => sheet.role === role)];
        });
        return byRole;
      }
      return filteredSheets;
    }
  };

  return (
    <Layout>
      <WhatsNew />
      <UpdateReminder />
      <Header style={{ paddingLeft: screens.xs ? "8px" : "32px", paddingRight: screens.xs ? "12px" : "32px" }}>
        <Row style={{ justifyContent: "space-between" }}>
          {screens.xs && (
            <>
              <Col>
                <Space size={"large"}>
                  <Image preview={false} src={logo} width={50} />
                  <Typography.Title level={4} style={{ color: "white", marginBottom: 0, lineHeight: "4rem" }}>
                    Game Datacards
                  </Typography.Title>
                </Space>
              </Col>
              <Col>
                <Button
                  className="button-bar"
                  type="ghost"
                  size="large"
                  onClick={() => setOpen(true)}
                  icon={<MenuOutlined />}
                />
              </Col>
            </>
          )}
          {screens.sm && !screens.lg && (
            <>
              <Col>
                <Space size={"large"}>
                  <Image preview={false} src={logo} width={50} />
                  <Typography.Title level={2} style={{ color: "white", marginBottom: 0, marginTop: "0px" }}>
                    Game Datacards
                  </Typography.Title>
                </Space>
              </Col>
              <Col>
                <Button
                  className="button-bar"
                  type="ghost"
                  size="large"
                  onClick={() => setOpen(true)}
                  icon={<MenuOutlined />}
                />
              </Col>
            </>
          )}

          {screens.lg && (
            <>
              <Col>
                <Space size={"large"}>
                  <Image preview={false} src={logo} width={50} />
                  <Typography.Title level={2} style={{ color: "white", marginBottom: 0, marginTop: "0px" }}>
                    Game Datacards
                  </Typography.Title>
                </Space>
              </Col>
              <Col>
                <Space>
                  <AboutModal />
                  <Tooltip title={"Join us on discord!"} placement="bottomRight">
                    <Button
                      className="button-bar"
                      type="ghost"
                      size="large"
                      icon={<Discord />}
                      onClick={() => window.open("https://discord.gg/anfn4qTYC4", "_blank")}></Button>
                  </Tooltip>
                  <SettingsModal />
                </Space>
              </Col>
            </>
          )}
        </Row>
      </Header>

      <Drawer
        title="Unit selection"
        placement={"right"}
        closable={true}
        open={open}
        onClose={() => setOpen(false)}
        key={"drawer"}
        className="viewer-drawer"
        headerStyle={{ backgroundColor: "#001529", color: "white" }}>
        <List
          bordered
          size="small"
          loading={isLoading}
          dataSource={getDataSourceType()}
          style={{ overflowY: "auto", height: "100%" }}
          locale={{
            emptyText: selectedFaction ? "No datasheets found" : "No faction selected",
          }}
          header={
            <>
              {dataSource.data.length > 1 && (
                <>
                  <Row style={{ marginBottom: "4px" }}>
                    <Col span={24}>
                      <Select
                        loading={isLoading}
                        style={{
                          width: "100%",
                        }}
                        onChange={(value) => {
                          updateSelectedFaction(dataSource.data.find((faction) => faction.id === value));
                        }}
                        placeholder="Select a faction"
                        value={dataSource?.data[selectedFactionIndex]?.name}>
                        {dataSource.data.map((faction, index) => (
                          <Option value={faction.id} key={`${faction.id}-${index}`}>
                            {faction.name}
                          </Option>
                        ))}
                      </Select>
                      {!dataSource?.noFactionOptions && <FactionSettingsModal />}
                    </Col>
                  </Row>
                  <Row>
                    <Col span={24}>
                      <Divider style={{ marginTop: 4, marginBottom: 8 }} />
                    </Col>
                  </Row>
                </>
              )}
              <Row style={{ marginBottom: "4px" }}>
                <Col span={24}>
                  <Input.Search
                    placeholder={"Search"}
                    onChange={(value) => {
                      if (value.target.value.length > 0) {
                        setSearchText(value.target.value);
                      } else {
                        setSearchText(undefined);
                      }
                    }}
                    allowClear={true}
                  />
                </Col>
              </Row>
            </>
          }
          renderItem={(card, index) => {
            if (card.type === "header") {
              return (
                <List.Item key={`list-header-${index}`} className={`list-header`}>
                  {card.name}
                </List.Item>
              );
            }
            if (card.type !== "header") {
              return (
                <List.Item
                  key={`list-${card.id}`}
                  onClick={() => {
                    setActiveCard(card);
                    setOpen(false);
                  }}
                  className={`list-item ${
                    activeCard && !activeCard.isCustom && activeCard.id === card.id ? "selected" : ""
                  }`}>
                  <div className={getListFactionId(card, selectedFaction)}>{card.name}</div>
                </List.Item>
              );
            }
          }}
        />
      </Drawer>

      <Content style={{ height: "calc(100vh - 64px)" }}>
        <Row>
          {screens.lg && (
            <Col span={4}>
              <div
                style={{
                  height: "100%",
                  overflow: "auto",
                }}>
                <List
                  bordered
                  size="small"
                  loading={isLoading}
                  dataSource={getDataSourceType()}
                  style={{ overflowY: "auto", height: "calc(100vh - 64px)" }}
                  locale={{
                    emptyText: selectedFaction ? "No datasheets found" : "No faction selected",
                  }}
                  header={
                    <>
                      {dataSource.data.length > 1 && (
                        <>
                          <Row style={{ marginBottom: "4px" }}>
                            <Col span={24}>
                              <Select
                                loading={isLoading}
                                style={{
                                  width: "100%",
                                }}
                                onChange={(value) => {
                                  updateSelectedFaction(dataSource.data.find((faction) => faction.id === value));
                                }}
                                placeholder="Select a faction"
                                value={dataSource?.data[selectedFactionIndex]?.name}>
                                {dataSource.data.map((faction, index) => (
                                  <Option value={faction.id} key={`${faction.id}-${index}`}>
                                    {faction.name}
                                  </Option>
                                ))}
                              </Select>
                              {!dataSource?.noFactionOptions && <FactionSettingsModal />}
                            </Col>
                          </Row>
                          <Row>
                            <Col span={24}>
                              <Divider style={{ marginTop: 4, marginBottom: 8 }} />
                            </Col>
                          </Row>
                        </>
                      )}
                      <Row style={{ marginBottom: "4px" }}>
                        <Col span={24}>
                          <Input.Search
                            placeholder={"Search"}
                            onSearch={(value) => {
                              if (value.length > 0) {
                                setSearchText(value);
                              } else {
                                setSearchText(undefined);
                              }
                            }}
                            allowClear={true}
                          />
                        </Col>
                      </Row>
                    </>
                  }
                  renderItem={(card, index) => {
                    if (card.type === "header") {
                      return (
                        <List.Item key={`list-header-${index}`} className={`list-header`}>
                          {card.name}
                        </List.Item>
                      );
                    }
                    if (card.type !== "header") {
                      return (
                        <List.Item
                          key={`list-${card.id}`}
                          onClick={() => {
                            setActiveCard(card);
                          }}
                          className={`list-item ${
                            activeCard && !activeCard.isCustom && activeCard.id === card.id ? "selected" : ""
                          }`}>
                          <div className={getListFactionId(card, selectedFaction)}>{card.name}</div>
                        </List.Item>
                      );
                    }
                  }}
                />
              </div>
            </Col>
          )}
          {screens.md && (
            <Col sm={24} lg={20}>
              <div
                style={{
                  height: "calc(100vh - 64px)",
                  display: "block",
                  overflow: "auto",
                  "--card-scaling-factor": settings.zoom / 100,
                }}
                className={`data-${activeCard?.source}`}>
                <Row style={{ overflow: "hidden" }}>
                  {activeCard?.source === "40k" && <Warhammer40KCardDisplay />}
                  {activeCard?.source === "40k-10e" && <Warhammer40K10eCardDisplay />}
                  {activeCard?.source === "basic" && <Warhammer40KCardDisplay />}
                  {activeCard?.source === "necromunda" && <NecromundaCardDisplay />}
                </Row>
                <Row style={{ overflow: "hidden", justifyContent: "center" }}>
                  <Col
                    span={1}
                    style={{
                      overflow: "hidden",
                      justifyContent: "center",
                      display: "flex",
                      marginTop: "16px",
                    }}>
                    {activeCard?.source === "40k-10e" && (
                      <Space.Compact block>
                        <Button
                          type={"primary"}
                          icon={<ZoomInOutlined />}
                          disabled={settings.zoom === 100}
                          onClick={() => {
                            let newZoom = settings.zoom || 100;
                            newZoom = newZoom + 5;
                            if (newZoom >= 100) {
                              newZoom = 100;
                            }
                            updateSettings({ ...settings, zoom: newZoom });
                          }}
                        />
                        <Button
                          type={"primary"}
                          icon={<ZoomOutOutlined />}
                          disabled={settings.zoom === 25}
                          onClick={() => {
                            let newZoom = settings.zoom || 100;
                            newZoom = newZoom - 5;
                            if (newZoom <= 25) {
                              newZoom = newZoom = 25;
                            }
                            updateSettings({ ...settings, zoom: newZoom });
                          }}
                        />
                      </Space.Compact>
                    )}
                  </Col>
                </Row>
              </div>
            </Col>
          )}
          {screens.sm && !screens.lg && (
            <Col>
              <div
                style={{ height: "calc(100vh - 64px)", display: "block", overflow: "auto" }}
                className={`data-${activeCard?.source}`}>
                <Row style={{ overflow: "hidden" }}>
                  {activeCard?.source === "40k" && <Warhammer40KCardDisplay />}
                  {activeCard?.source === "40k-10e" && <Warhammer40K10eCardDisplay type={"viewer"} />}
                  {activeCard?.source === "basic" && <Warhammer40KCardDisplay />}
                  {activeCard?.source === "necromunda" && <NecromundaCardDisplay />}
                </Row>
              </div>
            </Col>
          )}
          {screens.xs && (
            <>
              <Col>
                <div
                  style={{ height: "calc(100vh - 64px)", display: "block", overflow: "auto" }}
                  className={`data-${activeCard?.source}`}>
                  <Row style={{ overflow: "hidden" }}>
                    {activeCard?.source === "40k" && <Warhammer40KCardDisplay />}
                    {activeCard?.source === "40k-10e" && <Warhammer40K10eCardDisplay type={"viewer"} />}
                    {activeCard?.source === "basic" && <Warhammer40KCardDisplay />}
                    {activeCard?.source === "necromunda" && <NecromundaCardDisplay />}
                  </Row>
                </div>
              </Col>
              {!activeCard && (
                <Col>
                  <p style={{ padding: "32px", fontSize: "1.2rem" }}>
                    You can select a datasheet using the menu at the top right.
                  </p>
                </Col>
              )}
            </>
          )}
        </Row>
      </Content>
    </Layout>
  );
};
