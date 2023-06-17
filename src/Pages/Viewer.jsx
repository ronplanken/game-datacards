import { ZoomInOutlined, ZoomOutOutlined } from "@ant-design/icons";
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
import { MobileHeader } from "../Components/Viewer/MobileHeader";
import { MobileNav } from "../Components/Viewer/MobileNav";
import { MobileWelcome } from "../Components/Viewer/MobileWelcome";
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

  const [side, setSide] = useState("front");

  const { activeCard, setActiveCard } = useCardStorage();

  const screens = useBreakpoint();

  const [open, setOpen] = useState(false);

  useEffect(() => {
    updateSettings({
      ...settings,
      selectedDataSource: "40k-10e",
    });
  }, []);

  const cardFaction = dataSource.data.find((faction) => faction.id === activeCard?.faction_id);
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
      <Header
        style={{
          paddingLeft: screens.xs ? "8px" : "32px",
          paddingRight: screens.xs ? "12px" : "32px",
        }}>
        {screens.xs && <MobileHeader setOpen={setOpen} padding={"24px"} />}
        {screens.sm && !screens.lg && <MobileHeader setOpen={setOpen} padding={"64px"} />}
        {screens.lg && (
          <Row style={{ justifyContent: "space-between" }}>
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
          </Row>
        )}
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

      <Content style={{ height: "calc(100vh - 64px)", paddingBottom: "54px" }}>
        <Row>
          {screens.lg && !screens.md && (
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
          {screens.sm && !screens.lg && (
            <Col>
              <div
                style={{
                  height: "calc(100vh - 64px)",
                  display: "block",
                  overflow: "auto",
                  "--banner-colour": cardFaction?.colours?.banner,
                  "--header-colour": cardFaction?.colours?.header,
                  backgroundColor: "#d8d8da",
                }}
                className={`data-${activeCard?.source}`}>
                <Row style={{ overflow: "hidden" }}>
                  {activeCard?.source === "40k" && <Warhammer40KCardDisplay />}
                  {activeCard?.source === "40k-10e" && <Warhammer40K10eCardDisplay type={"viewer"} side={side} />}
                  {activeCard?.source === "basic" && <Warhammer40KCardDisplay />}
                  {activeCard?.source === "necromunda" && <NecromundaCardDisplay />}
                </Row>
                {!activeCard && <MobileWelcome />}
              </div>
              <MobileNav setSide={setSide} side={side} />
            </Col>
          )}
          {screens.xs && (
            <>
              <Col>
                <div
                  style={{
                    height: "calc(100vh - 64px)",
                    display: "block",
                    overflow: "auto",
                    "--banner-colour": cardFaction?.colours?.banner,
                    "--header-colour": cardFaction?.colours?.header,
                    backgroundColor: "#d8d8da",
                    paddingBottom: "64px",
                  }}
                  className={`data-${activeCard?.source}`}>
                  <Row style={{ overflow: "hidden" }}>
                    {activeCard?.source === "40k" && <Warhammer40KCardDisplay />}
                    {activeCard?.source === "40k-10e" && <Warhammer40K10eCardDisplay type={"viewer"} side={side} />}
                    {activeCard?.source === "basic" && <Warhammer40KCardDisplay />}
                    {activeCard?.source === "necromunda" && <NecromundaCardDisplay />}
                  </Row>
                  {!activeCard && <MobileWelcome />}
                </div>
                <MobileNav setSide={setSide} side={side} />
              </Col>
            </>
          )}
        </Row>
      </Content>
    </Layout>
  );
};
