import { ZoomInOutlined, ZoomOutOutlined } from "@ant-design/icons";
import { useAutoAnimate } from "@formkit/auto-animate/react";
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
  message,
} from "antd";
import "antd/dist/antd.min.css";
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "../App.css";
import { AboutModal } from "../Components/AboutModal";
import { FactionSettingsModal } from "../Components/FactionSettingsModal";
import { NecromundaCardDisplay } from "../Components/Necromunda/CardDisplay";
import { SettingsModal } from "../Components/SettingsModal";
import { UpdateReminder } from "../Components/UpdateReminder";
import { MobileHeader } from "../Components/Viewer/MobileHeader";
import { MobileMenu } from "../Components/Viewer/MobileMenu";
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

import { toBlob, toPng } from "html-to-image";

const { Header, Content } = Layout;
const { Option } = Select;
const { confirm } = Modal;

const { useBreakpoint } = Grid;

import { ListAdd } from "../Components/Viewer/ListCreator/ListAdd";
import { MobileSharingMenu } from "../Components/Viewer/MobileSharingMenu";
import { MobileFaction } from "../Components/Viewer/MobileFaction";

export const Viewer = () => {
  const [parent] = useAutoAnimate({ duration: 75 });
  const { dataSource, selectedFactionIndex, selectedFaction, updateSelectedFaction } = useDataSourceStorage();
  const { settings, updateSettings } = useSettingsStorage();
  const [selectedContentType, setSelectedContentType] = useState("datasheets");
  const [isLoading] = useState(false);
  const [searchText, setSearchText] = useState(undefined);
  const [isMobileMenuVisible, setIsMobileMenuVisible] = React.useState(false);
  const [isListAddVisible, setIsListAddVisible] = React.useState(false);
  const [isMobileSharingMenuVisible, setIsMobileSharingMenuVisible] = React.useState(false);
  const [side, setSide] = useState("front");

  const { faction, unit } = useParams();

  const { activeCard, setActiveCard } = useCardStorage();

  const fullCardRef = useRef(null);
  const viewerCardRef = useRef(null);
  const overlayRef = useRef(null);

  const screens = useBreakpoint();

  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  const htmlToImageConvert = (divRef) => {
    divRef.current.style.display = "block";
    overlayRef.current.style.display = "block";
    if (navigator.share) {
      toBlob(divRef.current, { cacheBust: false })
        .then((data) => {
          const fileData = {
            files: [
              new File([data], `${activeCard.name}.png`, {
                type: data.type,
              }),
            ],
            title: `${activeCard.name}`,
          };
          if (navigator.canShare(fileData)) {
            navigator.share(fileData);
          } else {
            message.warn("Your browser is not supported to share this file");
          }
          divRef.current.style.display = "none";
          overlayRef.current.style.display = "none";
        })
        .catch((err) => {
          divRef.current.style.display = "none";
          overlayRef.current.style.display = "none";
          message.error(err);
        });
    } else {
      toPng(divRef.current, { cacheBust: false })
        .then((data) => {
          divRef.current.style.display = "none";
          overlayRef.current.style.display = "none";
          const link = document.createElement("a");
          link.download = `${activeCard.name}.png`;
          link.href = data;
          link.click();
        })
        .catch((err) => {
          divRef.current.style.display = "none";
          overlayRef.current.style.display = "none";
          message.error(err.toString());
        });
    }
  };

  const shareLink = () => {
    if (navigator.share) {
      const data = { url: window.location.href, title: `Game-Datacards.eu - ${activeCard.name}` };
      if (navigator.canShare(data)) {
        navigator.share(data);
      } else {
        message.warn("Your browser is not supported to share this link");
      }
    } else {
      message.warn("Your browser is not supported to share this link");
    }
  };

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

  if (faction) {
    const foundFaction = dataSource.data.find((f) => {
      return f.name.toLowerCase().replaceAll(" ", "-") === faction;
    });

    if (selectedFaction?.id !== foundFaction?.id) {
      updateSelectedFaction(foundFaction);
    }

    if (unit) {
      const foundUnit = foundFaction?.datasheets?.find((u) => {
        return u.name.replaceAll(" ", "-").toLowerCase() === unit;
      });

      setActiveCard(foundUnit);
    } else {
      setActiveCard();
    }
  }

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
                <Space>
                  <div className="nav-menu-item" onClick={() => navigate("/")}>
                    <Typography.Text style={{ marginBottom: 0, lineHeight: "4rem" }}>
                      <Link to={"/"} style={{ fontSize: "1.1rem", color: "white" }}>
                        Editor
                      </Link>
                    </Typography.Text>
                  </div>
                  <div className="nav-menu-item selected" onClick={() => navigate("/viewer")}>
                    <Typography.Text style={{ marginBottom: 0, lineHeight: "4rem" }}>
                      <Link to={"/viewer"} style={{ fontSize: "1.1rem", color: "white" }}>
                        Viewer
                      </Link>
                    </Typography.Text>
                  </div>
                </Space>
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
                          navigate(`/viewer/${value.toLowerCase().replaceAll(" ", "-")}`);
                        }}
                        placeholder="Select a faction"
                        value={dataSource?.data[selectedFactionIndex]?.name}>
                        {dataSource.data.map((faction, index) => (
                          <Option value={faction.name} key={`${faction.id}-${faction.name}`}>
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
                    navigate(
                      `/viewer/${selectedFaction.name.toLowerCase().replaceAll(" ", "-")}/${card.name
                        .replaceAll(" ", "-")
                        .toLowerCase()}`
                    );

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
        <div
          ref={overlayRef}
          style={{
            display: "none",
            position: "absolute",
            height: "100vh",
            width: "100vw",
            backgroundColor: "#00000099",
            top: "0px",
            bottom: "0px",
            zIndex: 9999,
          }}
        />
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
                                  navigate(`/viewer/${value.toLowerCase().replaceAll(" ", "-")}`);
                                }}
                                placeholder="Select a faction"
                                value={dataSource?.data[selectedFactionIndex]?.name}>
                                {dataSource.data.map((faction, index) => (
                                  <Option value={faction.name} key={`${faction.id}-${index}`}>
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
                            navigate(
                              `/viewer/${selectedFaction.name.toLowerCase().replaceAll(" ", "-")}/${card.name
                                .replaceAll(" ", "-")
                                .toLowerCase()}`
                            );
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
                  "--banner-colour": cardFaction?.colours?.banner,
                  "--header-colour": cardFaction?.colours?.header,
                }}
                className={`data-${activeCard?.source}`}>
                <Row style={{ overflow: "hidden" }}>
                  {activeCard?.source === "40k" && <Warhammer40KCardDisplay />}
                  {activeCard?.source === "40k-10e" && <Warhammer40K10eCardDisplay side={side} />}
                  {activeCard?.source === "basic" && <Warhammer40KCardDisplay />}
                  {activeCard?.source === "necromunda" && <NecromundaCardDisplay />}
                </Row>
                <Row style={{ overflow: "hidden", justifyContent: "center" }}>
                  <Col
                    span={8}
                    style={{
                      overflow: "hidden",
                      justifyContent: "center",
                      display: "flex",
                      marginTop: "16px",
                    }}>
                    {activeCard?.source === "40k-10e" && (
                      <Space>
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
                        <Button
                          type={"primary"}
                          onClick={() => {
                            setSide((current) => {
                              if (current === "front") {
                                return "back";
                              }
                              return "front";
                            });
                          }}>
                          {side === "back" ? "Show front" : "Show back"}
                        </Button>
                      </Space>
                    )}
                  </Col>
                </Row>
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
                {!activeCard && !selectedFaction && <MobileWelcome />}
              </div>
              <MobileNav setSide={setSide} side={side} />
            </Col>
          )}
          {screens.xs && (
            <>
              <Col ref={parent}>
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
                  {!activeCard && !selectedFaction && <MobileWelcome />}
                  {!activeCard && selectedFaction && <MobileFaction />}
                </div>
                <MobileNav
                  setSide={setSide}
                  side={side}
                  setMenuVisible={setIsMobileMenuVisible}
                  setSharingVisible={setIsMobileSharingMenuVisible}
                  setAddListvisible={setIsListAddVisible}
                />
                {isListAddVisible && <ListAdd setIsVisible={setIsListAddVisible} />}
                {isMobileMenuVisible && <MobileMenu setIsVisible={setIsMobileMenuVisible} />}
                {isMobileSharingMenuVisible && (
                  <MobileSharingMenu
                    setIsVisible={setIsMobileSharingMenuVisible}
                    shareFullCard={() => htmlToImageConvert(fullCardRef)}
                    shareMobileCard={() => htmlToImageConvert(viewerCardRef)}
                    shareLink={() => shareLink()}
                  />
                )}
              </Col>
            </>
          )}
          <div
            ref={fullCardRef}
            style={{
              display: "none",
              "--banner-colour": cardFaction?.colours?.banner,
              "--header-colour": cardFaction?.colours?.header,
              backgroundColor: "#d8d8da",
              zIndex: "-9999",
              position: "absolute",
              top: "0px",
              left: "0px",
            }}
            className={`data-${activeCard?.source}`}>
            <Row style={{ overflow: "hidden" }}>
              {activeCard?.source === "40k" && <Warhammer40KCardDisplay />}
              {activeCard?.source === "40k-10e" && <Warhammer40K10eCardDisplay side={side} />}
              {activeCard?.source === "basic" && <Warhammer40KCardDisplay />}
              {activeCard?.source === "necromunda" && <NecromundaCardDisplay />}
            </Row>
          </div>
          <div
            ref={viewerCardRef}
            style={{
              display: "none",
              "--banner-colour": cardFaction?.colours?.banner,
              "--header-colour": cardFaction?.colours?.header,
              backgroundColor: "#d8d8da",
              zIndex: "-9999",
              position: "absolute",
              top: "0px",
              left: "0px",
            }}
            className={`data-${activeCard?.source}`}>
            <Row style={{ overflow: "hidden" }}>
              {activeCard?.source === "40k" && <Warhammer40KCardDisplay />}
              {activeCard?.source === "40k-10e" && <Warhammer40K10eCardDisplay side={side} type={"viewer"} />}
              {activeCard?.source === "basic" && <Warhammer40KCardDisplay />}
              {activeCard?.source === "necromunda" && <NecromundaCardDisplay />}
            </Row>
          </div>
        </Row>
      </Content>
    </Layout>
  );
};
