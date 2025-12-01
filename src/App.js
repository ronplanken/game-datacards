import { CheckOutlined, SwapOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Dropdown, Layout, Menu, Row } from "antd";
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

  // Build menu items with sub-categories shown under their parents
  const buildCategoryMenuItems = () => {
    const items = [];
    // Get all top-level categories
    const topLevelCategories = cardStorage.categories.filter((cat) => !cat.parentId);

    topLevelCategories.forEach((cat) => {
      // Add parent category
      items.push({
        key: cat.uuid,
        label: cat.name,
      });

      // Add sub-categories with indent styling (only for regular categories)
      if (cat.type !== "list") {
        const subCategories = cardStorage.categories.filter((sub) => sub.parentId === cat.uuid);
        subCategories.forEach((sub) => {
          items.push({
            key: sub.uuid,
            label: <span style={{ paddingLeft: 12, opacity: 0.7 }}>└ {sub.name}</span>,
          });
        });
      }
    });

    return items;
  };

  const categoryMenu = (
    <Menu
      className="floating-toolbar-menu"
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
      items={buildCategoryMenuItems()}
    />
  );

  // Zoom dropdown menu
  const currentZoom = settings.zoom || 100;
  const isAutoFit = settings.autoFitEnabled !== false;

  const zoomMenuItems = [
    {
      key: "auto",
      label: (
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isAutoFit && <CheckOutlined />}
          <span style={{ marginLeft: isAutoFit ? 0 : 22 }}>Auto</span>
        </span>
      ),
    },
    { type: "divider" },
    { key: "100", label: renderZoomOption(100) },
    { key: "75", label: renderZoomOption(75) },
    { key: "50", label: renderZoomOption(50) },
    { key: "25", label: renderZoomOption(25) },
  ];

  function renderZoomOption(value) {
    const isSelected = !isAutoFit && currentZoom === value;
    return (
      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {isSelected && <CheckOutlined />}
        <span style={{ marginLeft: isSelected ? 0 : 22 }}>{value}%</span>
      </span>
    );
  }

  const zoomMenu = (
    <Menu
      className="floating-toolbar-menu"
      onClick={(e) => {
        if (e.key === "auto") {
          updateSettings({ ...settings, autoFitEnabled: true });
        } else {
          updateSettings({ ...settings, autoFitEnabled: false, zoom: parseInt(e.key) });
        }
      }}
      items={zoomMenuItems}
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
                position: "relative",
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
              {/* Floating Toolbar */}
              {activeCard && (
                <div className="floating-toolbar">
                  {activeCard?.source === "40k-10e" && (
                    <>
                      {/* Zoom dropdown */}
                      <Dropdown overlay={zoomMenu} trigger={["click"]}>
                        <Button type="text" className="zoom-button" title="Zoom level">
                          {isAutoFit ? "Auto" : `${currentZoom}%`}
                        </Button>
                      </Dropdown>
                      {/* Front/Back toggle */}
                      {settings.showCardsAsDoubleSided !== true &&
                        activeCard?.variant !== "full" &&
                        activeCard?.cardType === "DataCard" && (
                          <>
                            <div className="toolbar-divider" />
                            <Button
                              type="text"
                              icon={<SwapOutlined />}
                              onClick={() => {
                                if (activeCard.print_side === "back") {
                                  updateActiveCard({ ...activeCard, print_side: "front" }, true);
                                } else {
                                  updateActiveCard({ ...activeCard, print_side: "back" }, true);
                                }
                              }}
                              title={activeCard.print_side === "back" ? "Show front" : "Show back"}
                            />
                          </>
                        )}
                    </>
                  )}
                  {/* Add to category */}
                  {!activeCard.isCustom && (
                    <>
                      {activeCard?.source === "40k-10e" && <div className="toolbar-divider" />}
                      <Dropdown overlay={categoryMenu} trigger={["click"]}>
                        <Button type="text" icon={<PlusOutlined />} title="Add card to category" />
                      </Dropdown>
                    </>
                  )}
                </div>
              )}
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
