import { ExclamationCircleOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  Divider,
  Dropdown,
  Image,
  Input,
  Layout,
  List,
  Menu,
  Modal,
  Row,
  Select,
  Space,
  Tooltip,
  Typography,
} from "antd";
import "antd/dist/antd.min.css";
import clone from "just-clone";
import { useRef, useState } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { v4 as uuidv4 } from "uuid";
import "./App.css";
import { AboutModal } from "./Components/AboutModal";
import { FactionSettingsModal } from "./Components/FactionSettingsModal";
import { NecromundaCardDisplay } from "./Components/Necromunda/CardDisplay";
import { NecromundaCardEditor } from "./Components/Necromunda/CardEditor";
import { SettingsModal } from "./Components/SettingsModal";
import { ShareModal } from "./Components/ShareModal";
import { Toolbar } from "./Components/Toolbar";
import { TreeCategory } from "./Components/TreeCategory";
import { TreeItem } from "./Components/TreeItem";
import { UpdateReminder } from "./Components/UpdateReminder";
import { Warhammer40K10eCardDisplay } from "./Components/Warhammer40k-10e/CardDisplay";
import { Warhammer40K10eCardEditor } from "./Components/Warhammer40k-10e/CardEditor";
import { Warhammer40KCardDisplay } from "./Components/Warhammer40k/CardDisplay";
import { Warhammer40KCardEditor } from "./Components/Warhammer40k/CardEditor";
import { WelcomeWizard } from "./Components/WelcomeWizard";
import { WhatsNew } from "./Components/WhatsNew";
import { getBackgroundColor, getListFactionId, getMinHeight, move, reorder } from "./Helpers/treeview.helpers";
import { useCardStorage } from "./Hooks/useCardStorage";
import { useDataSourceStorage } from "./Hooks/useDataSourceStorage";
import { useSettingsStorage } from "./Hooks/useSettingsStorage";
import { AddCard } from "./Icons/AddCard";
import { Discord } from "./Icons/Discord";
import logo from "./Images/logo.png";
import "./style.less";

const { Header, Content } = Layout;
const { Option } = Select;
const { confirm } = Modal;

function App() {
  const { dataSource, selectedFactionIndex, selectedFaction, updateSelectedFaction } = useDataSourceStorage();
  const { settings } = useSettingsStorage();
  const [selectedContentType, setSelectedContentType] = useState("datasheets");
  const [isLoading] = useState(false);

  const [showPrint, setShowPrint] = useState(false);

  const [searchText, setSearchText] = useState(undefined);

  const [selectedTreeIndex, setSelectedTreeIndex] = useState(null);

  const [cardsPerPage, setCardsPerPage] = useState(9);
  const [cardsPerRow, setCardsPerRow] = useState(3);
  const [cardScaling, setCardScaling] = useState(100);

  const printRef = useRef(null);
  const {
    cardStorage,
    activeCard,
    setActiveCard,
    cardUpdated,
    addCardToCategory,
    updateCategory,
    activeCategory,
    setActiveCategory,
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
    if (selectedContentType === "stratagems") {
      const filteredStratagems = selectedFaction?.stratagems.filter((stratagem) => {
        return !settings?.ignoredSubFactions?.includes(stratagem.subfaction_id);
      });
      const mainStratagems = searchText
        ? filteredStratagems?.filter((stratagem) => stratagem.name.toLowerCase().includes(searchText.toLowerCase()))
        : filteredStratagems;

      if (settings.hideBasicStratagems || settings?.noStratagemOptions) {
        return mainStratagems;
      } else {
        const basicStratagems = searchText
          ? selectedFaction.basicStratagems?.filter((stratagem) =>
              stratagem.name.toLowerCase().includes(searchText.toLowerCase())
            )
          : selectedFaction.basicStratagems ?? [{ name: "Update your datasources" }];

        return [
          { type: "header", name: "Basic stratagems" },
          ...basicStratagems,
          { type: "header", name: "Faction stratagems" },
          ...mainStratagems,
        ];
      }
    }
    if (selectedContentType === "secondaries") {
      if (selectedContentType === "secondaries") {
        const filteredSecondaries = selectedFaction?.secondaries.filter((secondary) => {
          return !settings?.ignoredSubFactions?.includes(secondary.faction_id);
        });

        if (settings.hideBasicSecondaries || settings?.noSecondaryOptions) {
          return filteredSecondaries;
        } else {
          const basicSecondaries = searchText
            ? selectedFaction.basicSecondaries?.filter((secondary) =>
                secondary.name.toLowerCase().includes(searchText.toLowerCase())
              )
            : selectedFaction.basicSecondaries ?? [{ name: "Update your datasources" }];

          return [
            { type: "header", name: "Basic secondaries" },
            ...basicSecondaries,
            { type: "header", name: "Faction secondaries" },
            ...filteredSecondaries,
          ];
        }
      }
    }
    if (selectedContentType === "psychicpowers") {
      const filteredPowers = selectedFaction?.psychicpowers.filter((power) => {
        return !settings?.ignoredSubFactions?.includes(power.faction_id);
      });

      return searchText
        ? filteredPowers?.filter((power) => power.name.toLowerCase().includes(searchText.toLowerCase()))
        : filteredPowers;
    }
  };

  return (
    <Layout>
      <WelcomeWizard />
      <WhatsNew />
      <UpdateReminder />
      <Header>
        <Row style={{ justifyContent: "space-between" }}>
          <Col>
            <Space size={"large"}>
              <Image preview={false} src={logo} width={50} />
              <Typography.Title level={2} style={{ color: "white", marginBottom: 0, lineHeight: "4rem" }}>
                Game Datacards
              </Typography.Title>
            </Space>
          </Col>
          <Col>
            <Space>
              {activeCategory && activeCategory.cards.length > 0 && <ShareModal />}
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
      </Header>
      <Content style={{ height: "calc(100vh - 64px)" }}>
        <PanelGroup direction="horizontal" autoSaveId="mainLayout">
          <Panel defaultSize={25} order={1}>
            <Toolbar
              setShowPrint={setShowPrint}
              selectedTreeKey={selectedTreeIndex}
              setSelectedTreeKey={setSelectedTreeIndex}
            />
            <PanelGroup direction="vertical" autoSaveId="toolbarLayout">
              <Panel defaultSize={50} minSize={20} maxSize={80}>
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
                                    width: "calc(100% - 32px)",
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
                        {selectedFaction && (
                          <Row style={{ marginBottom: "4px" }}>
                            <Col span={24}>
                              <Select
                                loading={isLoading}
                                style={{ width: "100%" }}
                                onChange={(value) => {
                                  setSelectedContentType(value);
                                }}
                                placeholder="Select a type"
                                value={selectedContentType}>
                                {selectedFaction?.datasheets && selectedFaction?.datasheets.length > 0 && (
                                  <Option value={"datasheets"} key={`datasheets`}>
                                    Datasheets
                                  </Option>
                                )}
                                {selectedFaction?.stratagems && selectedFaction?.stratagems.length > 0 && (
                                  <Option value={"stratagems"} key={`stratagems`}>
                                    Stratagems
                                  </Option>
                                )}
                                {selectedFaction?.secondaries && selectedFaction?.secondaries.length > 0 && (
                                  <Option value={"secondaries"} key={`secondaries`}>
                                    Secondaries
                                  </Option>
                                )}
                                {selectedFaction?.psychicpowers && selectedFaction?.psychicpowers.length > 0 && (
                                  <Option value={"psychicpowers"} key={`psychicpowers`}>
                                    Psychic powers
                                  </Option>
                                )}
                              </Select>
                            </Col>
                          </Row>
                        )}
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
                              if (cardUpdated) {
                                confirm({
                                  title: "You have unsaved changes",
                                  content: "Are you sure you want to discard your changes?",
                                  icon: <ExclamationCircleOutlined />,
                                  okText: "Yes",
                                  okType: "danger",
                                  cancelText: "No",
                                  onOk: () => {
                                    setActiveCard(card);
                                    setSelectedTreeIndex(null);
                                  },
                                });
                              } else {
                                setActiveCard(card);
                                setSelectedTreeIndex(null);
                              }
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
              </Panel>
            </PanelGroup>
          </Panel>
          <PanelResizeHandle className="vertical-resizer" />
          <Panel defaultSize={41} order={2}>
            <div
              style={{ height: "calc(100vh - 64px)", display: "block", overflow: "auto" }}
              className={`data-${activeCard?.source}`}>
              <Row style={{ overflow: "hidden" }}>
                {activeCard?.source === "40k" && <Warhammer40KCardDisplay />}
                {activeCard?.source === "40k-10e" && <Warhammer40K10eCardDisplay />}
                {activeCard?.source === "basic" && <Warhammer40KCardDisplay />}
                {activeCard?.source === "necromunda" && <NecromundaCardDisplay />}
              </Row>
              <Row style={{ overflow: "hidden", justifyContent: "center" }}>
                {activeCard && !activeCard.isCustom && (
                  <Col
                    span={20}
                    style={{
                      overflow: "hidden",
                      justifyContent: "center",
                      display: "flex",
                      marginTop: "16px",
                    }}>
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
                  </Col>
                )}
              </Row>
            </div>
          </Panel>
          <PanelResizeHandle className="vertical-resizer" />
          <Panel defaultSize={33} order={3}>
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
