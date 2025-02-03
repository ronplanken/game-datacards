import { DownOutlined, RightOutlined, ZoomInOutlined, ZoomOutOutlined } from "@ant-design/icons";
import { Button, Col, Divider, Dropdown, Grid, Input, Layout, List, Menu, Row, Select, Space } from "antd";
import "antd/dist/antd.min.css";
import classNames from "classnames";
import clone from "just-clone";
import React, { useState } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import "./App.css";
import { AppHeader } from "./Components/AppHeader";
import { FactionSettingsModal } from "./Components/FactionSettingsModal";
import { NecromundaCardDisplay } from "./Components/Necromunda/CardDisplay";
import { NecromundaCardEditor } from "./Components/Necromunda/CardEditor";
import { Toolbar } from "./Components/Toolbar";
import { TreeCategory } from "./Components/TreeCategory";
import { TreeItem } from "./Components/TreeItem";
import { Warhammer40K10eCardDisplay } from "./Components/Warhammer40k-10e/CardDisplay";
import { Warhammer40K10eCardEditor } from "./Components/Warhammer40k-10e/CardEditor";
import { Warhammer40KCardDisplay } from "./Components/Warhammer40k/CardDisplay";
import { Warhammer40KCardEditor } from "./Components/Warhammer40k/CardEditor";
import { getBackgroundColor, getMinHeight, move, reorder } from "./Helpers/treeview.helpers";
import { useCardStorage } from "./Hooks/useCardStorage";
import { useDataSourceStorage } from "./Hooks/useDataSourceStorage";
import { useSettingsStorage } from "./Hooks/useSettingsStorage";
import { AddCard } from "./Icons/AddCard";
import "./style.less";
import CardList from "./Components/CardList"; // Import CardList
import CardDisplayArea from "./Components/CardDisplayArea"; // Import CardDisplayArea
import CardEditorArea from "./Components/CardEditorArea"; // Import CardEditorArea
import { getDataSourceType } from "./Helpers/datasource.helpers"; // Import getDataSourceType

const { Header, Content } = Layout;
const { Option } = Select;
const { useBreakpoint } = Grid;

function App() {
  const { dataSource, selectedFactionIndex, selectedFaction, updateSelectedFaction } = useDataSourceStorage();

  const { settings, updateSettings } = useSettingsStorage();
  const [selectedContentType, setSelectedContentType] = useState("datasheets");
  const [isLoading] = useState(false);

  const screens = useBreakpoint();
  const navigate = useNavigate();

  const [searchTextRaw, setSearchTextRaw] = useState(undefined);
  const searchText = (value) => {
    if (value.length > 0) {
      setSearchTextRaw(value);
    } else {
      setSearchTextRaw(undefined);
    }
  };

  const [selectedTreeIndex, setSelectedTreeIndex] = useState(null);

  const {
    cardStorage,
    activeCard,
    setActiveCard,
    addCardToCategory,
    updateCategory,
    activeCategory,
    setActiveCategory,
    updateActiveCard,
  } = useCardStorage();
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
            <Toolbar selectedTreeKey={selectedTreeIndex} setSelectedTreeKey={setSelectedTreeIndex} />
            <PanelGroup direction="vertical" autoSaveId="toolbarLayout">
              <Panel defaultSize={30} minSize={20} maxSize={80}>
                <div
                  style={{
                    height: "100%",
                    overflow: "auto",
                    background: "white",
                  }}>
                  <DragDropContext
                    onDragEnd={(result) => {
                      const { source, destination } = result;

                      // dropped outside the list
                      if (!destination) {
                        return;
                      }
                      const sInd = source.droppableId;
                      const dInd = destination.droppableId;
                      if (sInd === dInd) {
                        const sourceCat = clone(cardStorage.categories.find((cat) => cat.uuid === sInd));
                        sourceCat.cards = reorder(sourceCat.cards, source.index, destination.index);
                        updateCategory(sourceCat, sInd);
                      } else {
                        const sourceCat = clone(cardStorage.categories.find((cat) => cat.uuid === sInd));
                        const destCat = clone(cardStorage.categories.find((cat) => cat.uuid === dInd));

                        const newCategories = move(sourceCat.cards, destCat.cards, source, destination);
                        sourceCat.cards = newCategories[sInd];
                        destCat.cards = newCategories[dInd];
                        destCat.closed = false;

                        updateCategory(sourceCat, sInd);
                        updateCategory(destCat, dInd);
                      }
                    }}>
                    {cardStorage.categories.map((category, categoryIndex) => {
                      return (
                        <div key={`category-${category.name}-${categoryIndex}`}>
                          <Droppable key={`${category.uuid}-droppable`} droppableId={category.uuid}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                style={{
                                  minHeight: getMinHeight(snapshot),
                                  backgroundColor: getBackgroundColor(snapshot),
                                }}>
                                <TreeCategory
                                  category={category}
                                  selectedTreeIndex={selectedTreeIndex}
                                  setSelectedTreeIndex={setSelectedTreeIndex}>
                                  {category.cards.map((card, cardIndex) => (
                                    <TreeItem
                                      card={card}
                                      category={category}
                                      selectedTreeIndex={selectedTreeIndex}
                                      setSelectedTreeIndex={setSelectedTreeIndex}
                                      index={cardIndex}
                                      key={`${category.uuid}-item-${cardIndex}`}
                                    />
                                  ))}
                                </TreeCategory>
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </div>
                      );
                    })}
                  </DragDropContext>
                </div>
              </Panel>
              <PanelResizeHandle className="horizontal-resizer" />
              <Panel defaultSize={50} minSize={20} maxSize={80}>
                <div
                  style={{
                    height: "100%",
                    overflow: "auto",
                  }}>
                  <CardList
                    dataSourceType={getDataSourceType(
                      selectedContentType,
                      selectedFaction,
                      settings,
                      dataSource,
                      searchTextRaw
                    )} // Use imported function
                    isLoading={isLoading}
                    selectedFaction={selectedFaction}
                    settings={settings}
                    searchText={searchText}
                    activeCard={activeCard}
                    setActiveCard={setActiveCard}
                    updateSettings={updateSettings}
                    dataSource={dataSource}
                    updateSelectedFaction={updateSelectedFaction}
                    selectedFactionIndex={selectedFactionIndex}
                    setSelectedContentType={setSelectedContentType} // Pass setSelectedContentType
                    selectedContentType={selectedContentType} // Pass selectedContentType
                  />
                </div>
              </Panel>
            </PanelGroup>
          </Panel>
          <PanelResizeHandle className="vertical-resizer" />
          <Panel defaultSize={41} order={2}>
            <CardDisplayArea
              activeCard={activeCard}
              settings={settings}
              updateSettings={updateSettings}
              cardFaction={cardFaction}
              categoryMenu={categoryMenu}
              cardStorage={cardStorage}
              setActiveCard={setActiveCard}
              addCardToCategory={addCardToCategory}
              setActiveCategory={setActiveCategory}
              setSelectedTreeIndex={setSelectedTreeIndex}
              activeCategory={activeCategory}
              updateActiveCard={updateActiveCard} // Pass updateActiveCard
            />
          </Panel>
          <PanelResizeHandle className="vertical-resizer" />
          <Panel defaultSize={20} order={3}>
            <CardEditorArea activeCard={activeCard} />
          </Panel>
        </PanelGroup>
      </Content>
    </Layout>
  );
}

export default App;
