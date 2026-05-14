import { Layout } from "antd";
import { message } from "./Components/Toast/message";
import "antd/dist/antd.min.css";
import React, { useState, useEffect } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { v4 as uuidv4 } from "uuid";
import "./App.css";
import { AppHeader } from "./Components/AppHeader";
import { LeftPanel } from "./Components/LeftPanel";
import { AgeOfSigmarCardEditor } from "./Components/AgeOfSigmar/CardEditor";
import { NecromundaCardEditor } from "./Components/Necromunda/CardEditor";
import { Warhammer40K10eCardEditor } from "./Components/Warhammer40k-10e/CardEditor";
import { Warhammer40KCardEditor } from "./Components/Warhammer40k/CardEditor";
import { MiddlePanel, getEffectiveMiddleView } from "./Components/MiddlePanel";
import { useCardStorage } from "./Hooks/useCardStorage";
import { useDataSourceStorage } from "./Hooks/useDataSourceStorage";
import { useSettingsStorage } from "./Hooks/useSettingsStorage";
import { CustomCardEditor } from "./Premium";
import "./style.less";

const { Content } = Layout;

function App() {
  const { dataSource, isCustomDatasource } = useDataSourceStorage();
  const { settings, updateSettings } = useSettingsStorage();

  const [selectedTreeIndex, setSelectedTreeIndex] = useState(null);

  // Which view the middle panel shows. "card" is the default; selecting a
  // card always returns here (see effect below). "glossary" is opened
  // explicitly from the DataSourcePanel.
  const [middleView, setMiddleView] = useState("card");

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

  // Selecting any card (tree, datasource list, add-to-category) snaps the
  // middle panel back to the card view without each call site knowing about
  // the view state.
  useEffect(() => {
    if (activeCard) setMiddleView("card");
  }, [activeCard]);

  const hasGlossary = dataSource?.schema?.keywordGlossary?.length > 0;
  const effectiveMiddleView = getEffectiveMiddleView(middleView, activeCard, hasGlossary);

  // Handle add to category from toolbar
  const handleAddToCategory = (categoryUuid, cardOrCards = undefined) => {
    const cat = cardStorage.categories.find((c) => c.uuid === categoryUuid);
    if (!cat) {
      message.error("Category not found");
      return;
    }

    const cards = Array.isArray(cardOrCards) ? cardOrCards : [cardOrCards ?? activeCard];

    let lastCard = null;
    cards.forEach((cardContent) => {
      const newCard = {
        ...cardContent,
        isCustom: true,
        uuid: uuidv4(),
      };
      addCardToCategory(newCard, cat.uuid);
      lastCard = newCard;
    });

    if (lastCard) {
      setActiveCard(lastCard);
      setActiveCategory(cat);
      setSelectedTreeIndex(`card-${lastCard.uuid}`);
    }

    if (cards.length === 1) {
      message.success(`Added "${cards[0].name}" to ${cat.name}`);
    } else {
      message.success(`Added ${cards.length} cards to ${cat.name}`);
    }
  };

  // Open the keyword glossary in the middle panel. Clearing the active card
  // also hides the right-hand editor panel.
  const handleOpenGlossary = () => {
    setActiveCard(null);
    setMiddleView("glossary");
  };

  return (
    <Layout>
      <AppHeader />
      <Content style={{ height: "calc(100vh - 64px)" }}>
        <PanelGroup direction="horizontal" autoSaveId="mainLayout">
          <Panel defaultSize={18} minSize={5} order={1}>
            <LeftPanel
              selectedTreeIndex={selectedTreeIndex}
              setSelectedTreeIndex={setSelectedTreeIndex}
              onAddToCategory={handleAddToCategory}
              onOpenGlossary={handleOpenGlossary}
            />
          </Panel>
          <PanelResizeHandle className="vertical-resizer" />
          <Panel defaultSize={41} minSize={10} order={2}>
            <MiddlePanel
              view={effectiveMiddleView}
              activeCard={activeCard}
              settings={settings}
              updateSettings={updateSettings}
              cardUpdated={cardUpdated}
              cardStorage={cardStorage}
              updateActiveCard={updateActiveCard}
              saveActiveCard={saveActiveCard}
              isCustomDatasource={isCustomDatasource}
              dataSource={dataSource}
              onAddToCategory={handleAddToCategory}
            />
          </Panel>
          <PanelResizeHandle className="vertical-resizer" />
          <Panel defaultSize={20} minSize={5} order={3}>
            {activeCard && (
              <div
                style={{ overflowY: "auto", height: "calc(100vh - 64px)" }}
                className={`${isCustomDatasource || activeCard?.source === "starcraft-tmg" ? "data-custom" : `data-${activeCard?.source}`}`}>
                {activeCard?.source === "40k" && <Warhammer40KCardEditor />}
                {activeCard?.source === "40k-10e" && <Warhammer40K10eCardEditor />}
                {activeCard?.source === "basic" && <Warhammer40KCardEditor />}
                {activeCard?.source === "necromunda" && <NecromundaCardEditor />}
                {activeCard?.source === "aos" && <AgeOfSigmarCardEditor />}
                {activeCard?.source === "starcraft-tmg" && <CustomCardEditor />}
                {activeCard?.source?.startsWith("custom-") && <CustomCardEditor />}
              </div>
            )}
          </Panel>
        </PanelGroup>
      </Content>
    </Layout>
  );
}

export default App;
