import { ZoomInOutlined, ZoomOutOutlined } from "@ant-design/icons";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Button, Col, Grid, Image, Layout, Modal, Row, Select, Space, Tooltip, Typography } from "antd";
import "antd/dist/antd.min.css";
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "../App.css";
import { AboutModal } from "../Components/AboutModal";
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
import { useCardStorage } from "../Hooks/useCardStorage";
import { useDataSourceStorage } from "../Hooks/useDataSourceStorage";
import { useSettingsStorage } from "../Hooks/useSettingsStorage";
import { useAutoFitScale } from "../Hooks/useAutoFitScale";
import { Discord } from "../Icons/Discord";

import logo from "../Images/logo.png";
import "../style.less";
import "../mobile.less";

const { Header, Content } = Layout;
const { Option } = Select;
const { confirm } = Modal;

const { useBreakpoint } = Grid;

import { DesktopUnitList } from "../Components/Viewer/DesktopUnitList";
import { ListAdd } from "../Components/Viewer/ListCreator/ListAdd";
import { MobileDrawer } from "../Components/Viewer/MobileDrawer";
import { MobileFaction } from "../Components/Viewer/MobileFaction";
import { MobileSharingMenu } from "../Components/Viewer/MobileSharingMenu";
import { useMobileSharing } from "../Hooks/useMobileSharing";

export const Viewer = () => {
  const [parent] = useAutoAnimate({ duration: 75 });
  const { dataSource, selectedFaction, updateSelectedFaction } = useDataSourceStorage();
  const { settings, updateSettings } = useSettingsStorage();
  const [isMobileMenuVisible, setIsMobileMenuVisible] = React.useState(false);
  const [isListAddVisible, setIsListAddVisible] = React.useState(false);
  const [isMobileSharingMenuVisible, setIsMobileSharingMenuVisible] = React.useState(false);
  const [side, setSide] = useState("front");

  const { shareLink, htmlToImageConvert } = useMobileSharing();

  const { faction, unit, alliedFaction, alliedUnit, stratagem } = useParams();

  const { activeCard, setActiveCard } = useCardStorage();

  const fullCardRef = useRef(null);
  const viewerCardRef = useRef(null);
  const overlayRef = useRef(null);
  const desktopCardContainerRef = useRef(null);

  // Determine card type for proper scaling
  const getCardType = () => {
    if (!activeCard) return "unit";
    if (activeCard.cardType === "stratagem") return "stratagem";
    if (activeCard.cardType === "enhancement") return "enhancement";
    if (settings.showCardsAsDoubleSided || activeCard.variant === "full") return "unitFull";
    return "unit";
  };

  // Use auto-fit hook for desktop view
  const { autoScale } = useAutoFitScale(desktopCardContainerRef, getCardType(), settings.autoFitEnabled !== false);

  // Determine effective scale based on mode
  const effectiveScale = settings.autoFitEnabled !== false ? autoScale : (settings.zoom || 100) / 100;

  const screens = useBreakpoint();

  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  useEffect(() => {
    updateSettings({
      ...settings,
      selectedDataSource: "40k-10e",
    });
  }, []);

  const cardFaction = dataSource.data.find((faction) => faction.id === activeCard?.faction_id);

  useEffect(() => {
    if (faction && !alliedFaction && !stratagem) {
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
    if (faction && !alliedFaction && stratagem) {
      const foundFaction = dataSource.data.find((f) => {
        return f.name.toLowerCase().replaceAll(" ", "-") === faction;
      });

      if (selectedFaction?.id !== foundFaction?.id) {
        updateSelectedFaction(foundFaction);
      }
      if (stratagem) {
        let foundStratagem = foundFaction?.stratagems?.find((u) => {
          return u.name.replaceAll(" ", "-").toLowerCase() === stratagem;
        });

        if (!foundStratagem) {
          foundStratagem = foundFaction?.basicStratagems?.find((u) => {
            return u.name.replaceAll(" ", "-").toLowerCase() === stratagem;
          });
          foundStratagem.faction_id = foundFaction.id;
        }

        setActiveCard(foundStratagem);
      } else {
        setActiveCard();
      }
    }
    if (faction && alliedFaction) {
      const foundFaction = dataSource.data.find((f) => {
        return f.name.toLowerCase().replaceAll(" ", "-") === faction;
      });

      if (selectedFaction?.id !== foundFaction?.id) {
        updateSelectedFaction(foundFaction);
      }

      const foundAlliedFaction = dataSource.data.find((f) => {
        return f.name.toLowerCase().replaceAll(" ", "-") === alliedFaction;
      });

      if (alliedUnit) {
        const foundUnit = foundAlliedFaction?.datasheets?.find((u) => {
          return u.name.replaceAll(" ", "-").toLowerCase() === alliedUnit;
        });

        setActiveCard(foundUnit);
      } else {
        setActiveCard();
      }
    }
  }, [faction, unit, alliedFaction, alliedUnit, dataSource]);

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

      <MobileDrawer open={open} setOpen={setOpen} />

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
                <DesktopUnitList />
              </div>
            </Col>
          )}
          {screens.md && (
            <Col sm={24} lg={20}>
              <div
                ref={desktopCardContainerRef}
                style={{
                  height: "calc(100vh - 64px)",
                  display: "block",
                  overflow: "auto",
                  "--card-scaling-factor": effectiveScale,
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
                            type={settings.autoFitEnabled !== false ? "primary" : "default"}
                            onClick={() => {
                              updateSettings({
                                ...settings,
                                autoFitEnabled: !settings.autoFitEnabled,
                              });
                            }}
                            title={
                              settings.autoFitEnabled !== false
                                ? "Auto-fit enabled (click for manual)"
                                : "Manual mode (click for auto-fit)"
                            }>
                            {settings.autoFitEnabled !== false ? "Auto" : "Manual"}
                          </Button>
                          <Button
                            type={"primary"}
                            icon={<ZoomInOutlined />}
                            disabled={settings.autoFitEnabled !== false || settings.zoom === 100}
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
                            disabled={settings.autoFitEnabled !== false || settings.zoom === 25}
                            onClick={() => {
                              let newZoom = settings.zoom || 100;
                              newZoom = newZoom - 5;
                              if (newZoom <= 25) {
                                newZoom = 25;
                              }
                              updateSettings({ ...settings, zoom: newZoom });
                            }}
                          />
                        </Space.Compact>
                        {settings.showCardsAsDoubleSided !== true && activeCard?.variant !== "full" && (
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
                        )}
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
                    shareFullCard={() => htmlToImageConvert(fullCardRef, overlayRef)}
                    shareMobileCard={() => htmlToImageConvert(viewerCardRef, overlayRef)}
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
