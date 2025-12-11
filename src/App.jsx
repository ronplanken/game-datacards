import { Layout, Row } from "antd";
import "antd/dist/antd.min.css";
import React, { useState, useRef } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { v4 as uuidv4 } from "uuid";
import "./App.css";
import { FloatingToolbar } from "./Components/Toolbar/FloatingToolbar";
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

  const {
    cardStorage,
    activeCard,
    setActiveCard,
    addCardToCategory,
    setActiveCategory,
    updateActiveCard,
    saveActiveCard,
    cardUpdated,
  } = useCardStorage();

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

  // Zoom settings
  const currentZoom = settings.zoom || 100;
  const isAutoFit = settings.autoFitEnabled !== false;

  // Handle add to category from toolbar
  const handleAddToCategory = (categoryUuid, card = undefined) => {
    const cardContent = card ?? activeCard;
    console.log("App.jsx:handleAddToCategory", categoryUuid, cardContent, card, activeCard);
    const newCard = {
      ...card,
      isCustom: true,
      uuid: uuidv4(),
    };
    const cat = { ...cardStorage.categories.find((c) => c.uuid === categoryUuid) };
    addCardToCategory(newCard, cat.uuid);
    setActiveCard(newCard);
    setActiveCategory(cat);
    setSelectedTreeIndex(`card-${newCard.uuid}`);
  };

  const cardFaction = dataSource.data.find((faction) => faction.id === activeCard?.faction_id);

  return (
    <Layout>
      <AppHeader />
      <Content style={{ height: "calc(100vh - 64px)" }}>
        <PanelGroup direction="horizontal" autoSaveId="mainLayout">
          <Panel defaultSize={18} order={1}>
            <LeftPanel
              selectedTreeIndex={selectedTreeIndex}
              setSelectedTreeIndex={setSelectedTreeIndex}
              onAddToCategory={handleAddToCategory}
            />
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
                "--banner-colour": activeCard?.useCustomColours
                  ? activeCard.customBannerColour
                  : cardFaction?.colours?.banner,
                "--header-colour": activeCard?.useCustomColours
                  ? activeCard.customHeaderColour
                  : cardFaction?.colours?.header,
              }}
              className={`data-${activeCard?.source}`}>
              <Row style={{ overflow: "hidden", justifyContent: "center" }}>
                {activeCard?.source === "40k" && <Warhammer40KCardDisplay />}
                {activeCard?.source === "40k-10e" && (
                  <Warhammer40K10eCardDisplay side={activeCard.print_side || "front"} />
                )}
                {activeCard?.source === "basic" && <Warhammer40KCardDisplay />}
                {activeCard?.source === "necromunda" && <NecromundaCardDisplay />}
              </Row>
              <FloatingToolbar
                activeCard={activeCard}
                settings={settings}
                cardUpdated={cardUpdated}
                currentZoom={currentZoom}
                isAutoFit={isAutoFit}
                categories={cardStorage.categories}
                updateActiveCard={updateActiveCard}
                saveActiveCard={saveActiveCard}
                onZoomChange={(zoom) => updateSettings({ ...settings, autoFitEnabled: false, zoom })}
                onAutoFitToggle={() => updateSettings({ ...settings, autoFitEnabled: true })}
                onAddToCategory={handleAddToCategory}
              />
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
