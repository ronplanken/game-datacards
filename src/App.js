import { ZoomInOutlined, ZoomOutOutlined } from "@ant-design/icons";
import { Button, Col, Dropdown, Layout, Menu, Row, Space } from "antd";
import "antd/dist/antd.min.css";
import React, { useState, useRef } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { v4 as uuidv4 } from "uuid";
import "./App.css";
import { AppHeader } from "./Components/AppHeader";
import { LeftPanel } from "./Components/LeftPanel";
import { NecromundaCardDisplay } from "./Components/Necromunda/CardDisplay";
import { NecromundaCardEditor } from "./Components/Necromunda/CardEditor";
import { Warhammer40K10eCardDisplay } from "./Components/Warhammer40k-10e/CardDisplay";
import { Warhammer40K10eCardEditor } from "./Components/Warhammer40k-10e/CardEditor";
import { Warhammer40KCardDisplay } from "./Components/Warhammer40k/CardDisplay";
import { Warhammer40KCardEditor } from "./Components/Warhammer40k/CardEditor";
import { useCardStorage } from "./Hooks/useCardStorage";
import { useDataSourceStorage } from "./Hooks/useDataSourceStorage";
import { useSettingsStorage } from "./Hooks/useSettingsStorage";
import { useAutoFitScale } from "./Hooks/useAutoFitScale";
import { AddCard } from "./Icons/AddCard";
import "./style.less";

const { Content } = Layout;

function App() {
  const { dataSource } = useDataSourceStorage();
  const { settings, updateSettings } = useSettingsStorage();

  const [selectedTreeIndex, setSelectedTreeIndex] = useState(null);

  const { cardStorage, activeCard, setActiveCard, addCardToCategory, setActiveCategory, updateActiveCard } =
    useCardStorage();

  // Ref for the card display container
  const cardContainerRef = useRef(null);

  // Determine card type for proper scaling
  const getCardType = () => {
    if (!activeCard) return "unit";
    if (activeCard.cardType === "stratagem") return "stratagem";
    if (activeCard.cardType === "enhancement") return "enhancement";
    if (settings.showCardsAsDoubleSided || activeCard.variant === "full") return "unitFull";
    return "unit";
  };

  // Use auto-fit hook
  const { autoScale } = useAutoFitScale(cardContainerRef, getCardType(), settings.autoFitEnabled !== false);

  // Determine effective scale based on mode
  const effectiveScale = settings.autoFitEnabled !== false ? autoScale : (settings.zoom || 100) / 100;

  const categoryMenu = (
    <Menu
      onClick={(e) => {
        const newCard = {
          ...activeCard,
          isCustom: true,
          uuid: uuidv4(),
        };
        const cat = { ...cardStorage.categories.find((c) => c.uuid === e.key) };
        addCardToCategory(newCard, cat.uuid);
        setActiveCard(newCard);
        setActiveCategory(cat);
        setSelectedTreeIndex(`card-${newCard.uuid}`);
      }}
      items={cardStorage.categories.map((cat, index) => {
        if (index === 0) return;
        return {
          key: cat.uuid,
          label: `Add to ${cat.name}`,
        };
      })}
    />
  );

  const cardFaction = dataSource.data.find((faction) => faction.id === activeCard?.faction_id);

  return (
    <Layout>
      <AppHeader />
      <Content style={{ height: "calc(100vh - 64px)" }}>
        <PanelGroup direction="horizontal" autoSaveId="mainLayout">
          <Panel defaultSize={18} order={1}>
            <LeftPanel selectedTreeIndex={selectedTreeIndex} setSelectedTreeIndex={setSelectedTreeIndex} />
          </Panel>
          <PanelResizeHandle className="vertical-resizer" />
          <Panel defaultSize={41} order={2}>
            <div
              ref={cardContainerRef}
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
                {activeCard?.source === "40k-10e" && (
                  <Warhammer40K10eCardDisplay side={activeCard.print_side || "front"} />
                )}
                {activeCard?.source === "basic" && <Warhammer40KCardDisplay />}
                {activeCard?.source === "necromunda" && <NecromundaCardDisplay />}
              </Row>
              <Row style={{ overflow: "hidden", justifyContent: "center" }}>
                <Col
                  span={20}
                  style={{
                    overflow: "hidden",
                    justifyContent: "center",
                    display: "flex",
                    marginTop: "16px",
                  }}>
                  <Space>
                    {activeCard?.source === "40k-10e" && (
                      <>
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
                                newZoom = newZoom = 25;
                              }
                              updateSettings({ ...settings, zoom: newZoom });
                            }}
                          />
                        </Space.Compact>
                        {settings.showCardsAsDoubleSided !== true &&
                          activeCard?.variant !== "full" &&
                          activeCard?.cardType === "DataCard" && (
                            <Button
                              type={"primary"}
                              onClick={() => {
                                if (activeCard.print_side === "back") {
                                  updateActiveCard({ ...activeCard, print_side: "front" }, true);
                                } else {
                                  updateActiveCard({ ...activeCard, print_side: "back" }, true);
                                }
                              }}>
                              {activeCard.print_side === "back" ? "Show front" : "Show back"}
                            </Button>
                          )}
                      </>
                    )}
                    {activeCard && !activeCard.isCustom && (
                      <>
                        {cardStorage.categories?.length > 1 ? (
                          <Dropdown.Button
                            overlay={categoryMenu}
                            icon={<AddCard />}
                            type={"primary"}
                            style={{ width: "auto" }}
                            onClick={() => {
                              const newCard = {
                                ...activeCard,
                                isCustom: true,
                                uuid: uuidv4(),
                              };
                              const cat = { ...cardStorage.categories[0] };
                              addCardToCategory(newCard);
                              setActiveCard(newCard);
                              setActiveCategory(cat);
                              setSelectedTreeIndex(`card-${newCard.uuid}`);
                            }}>
                            Add card to {cardStorage.categories[0].name}
                          </Dropdown.Button>
                        ) : (
                          <Button
                            type={"primary"}
                            onClick={() => {
                              const newCard = {
                                ...activeCard,
                                isCustom: true,
                                uuid: uuidv4(),
                              };
                              const cat = { ...cardStorage.categories[0] };
                              addCardToCategory(newCard);
                              setActiveCard(newCard);
                              setActiveCategory(cat);
                              setSelectedTreeIndex(`card-${newCard.uuid}`);
                            }}>
                            Add card to {cardStorage.categories[0].name}
                          </Button>
                        )}
                      </>
                    )}
                  </Space>
                </Col>
              </Row>
            </div>
          </Panel>
          <PanelResizeHandle className="vertical-resizer" />
          <Panel defaultSize={20} order={3}>
            {activeCard && (
              <div style={{ overflowY: "auto", height: "calc(100vh - 64px)" }} className={`data-${activeCard?.source}`}>
                {activeCard?.source === "40k" && <Warhammer40KCardEditor />}
                {activeCard?.source === "40k-10e" && <Warhammer40K10eCardEditor />}
                {activeCard?.source === "basic" && <Warhammer40KCardEditor />}
                {activeCard?.source === "necromunda" && <NecromundaCardEditor />}
              </div>
            )}
          </Panel>
        </PanelGroup>
      </Content>
    </Layout>
  );
}

export default App;
