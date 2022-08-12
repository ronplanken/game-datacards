import { ExclamationCircleOutlined, PrinterOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  Divider,
  Form,
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
import clone from "just-clone";
import split from "just-split";
import { useRef, useState } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import NewWindow from "react-new-window";
import { v4 as uuidv4 } from "uuid";
import "./App.css";
import { AboutModal } from "./Components/AboutModal";
import { NecromundaCardDisplay } from "./Components/Necromunda/CardDisplay";
import { NecromundaCardEditor } from "./Components/Necromunda/CardEditor";
import { SettingsModal } from "./Components/SettingsModal";
import { ShareModal } from "./Components/ShareModal";
import { Toolbar } from "./Components/Toolbar";
import { TreeCategory } from "./Components/TreeCategory";
import { TreeItem } from "./Components/TreeItem";
import { Warhammer40KCardDisplay } from "./Components/Warhammer40k/CardDisplay";
import { Warhammer40KCardEditor } from "./Components/Warhammer40k/CardEditor";
import { WelcomeWizard } from "./Components/WelcomeWizard";
import { WhatsNew } from "./Components/WhatsNew";
import { getBackgroundColor, getMinHeight, move, reorder } from "./Helpers/treeview.helpers";
import { useCardStorage } from "./Hooks/useCardStorage";
import { useDataSourceStorage } from "./Hooks/useDataSourceStorage";
import { AddCard } from "./Icons/AddCard";
import { Discord } from "./Icons/Discord";
import logo from "./Images/logo.png";
import "./style.less";

const { Header, Content } = Layout;
const { Option } = Select;
const { confirm } = Modal;

function App() {
  const { dataSource, selectedFactionIndex, selectedFaction, updateSelectedFaction } = useDataSourceStorage();

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

  const getDataSourceType = () => {
    if (selectedContentType === "datasheets") {
      return searchText
        ? selectedFaction?.datasheets.filter((sheet) => sheet.name.toLowerCase().includes(searchText.toLowerCase()))
        : selectedFaction?.datasheets;
    }
    if (selectedContentType === "stratagems") {
      return searchText
        ? selectedFaction?.stratagems.filter((stratagem) =>
            stratagem.name.toLowerCase().includes(searchText.toLowerCase())
          )
        : selectedFaction?.stratagems;
    }
    if (selectedContentType === "secondaries") {
      return searchText
        ? selectedFaction?.secondaries.filter((stratagem) =>
            stratagem.name.toLowerCase().includes(searchText.toLowerCase())
          )
        : selectedFaction?.secondaries;
    }
  };

  return (
    <Layout>
      <WelcomeWizard />
      <WhatsNew />
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
      <Content>
        <Row>
          <Col span={6}>
            <Row>
              <Col span={24}>
                <Toolbar
                  setShowPrint={setShowPrint}
                  selectedTreeKey={selectedTreeIndex}
                  setSelectedTreeKey={setSelectedTreeIndex}
                />
                <Row>
                  <Col span={24}>
                    <div
                      style={{
                        height: "300px",
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
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <List
                  bordered
                  size="small"
                  loading={isLoading}
                  dataSource={getDataSourceType()}
                  style={{ overflowY: "auto", height: "calc(100vh - 398px)" }}
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
                                style={{ width: "100%" }}
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
                            </Select>
                          </Col>
                        </Row>
                      )}
                    </>
                  }
                  renderItem={(card) => (
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
                      <div className={`${card.subfaction ? card.subfaction : ""}`}>{card.name}</div>
                    </List.Item>
                  )}
                />
              </Col>
            </Row>
          </Col>
          <Col span={9} style={{ display: "flex", flexDirection: "column" }} className={`data-${activeCard?.source}`}>
            <Row style={{ overflow: "hidden" }}>
              {activeCard?.source === "40k" && <Warhammer40KCardDisplay />}
              {activeCard?.source === "basic" && <Warhammer40KCardDisplay />}
              {activeCard?.source === "necromunda" && <NecromundaCardDisplay />}
            </Row>
            <Row style={{ overflow: "hidden", justifyContent: "center" }}>
              {activeCard && !activeCard.isCustom && (
                <Col
                  span={9}
                  style={{
                    overflow: "hidden",
                    justifyContent: "center",
                    display: "flex",
                    marginTop: "16px",
                  }}>
                  <Button
                    icon={<AddCard />}
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
                    Add card to category
                  </Button>
                </Col>
              )}
            </Row>
          </Col>
          {activeCard && (
            <Col span={9} style={{ overflowY: "auto", height: "calc(100vh - 64px)" }}>
              {activeCard?.source === "40k" && <Warhammer40KCardEditor />}
              {activeCard?.source === "basic" && <Warhammer40KCardEditor />}
              {activeCard?.source === "necromunda" && <NecromundaCardEditor />}
            </Col>
          )}
        </Row>
      </Content>
      {showPrint && (
        <NewWindow
          onUnload={() => setShowPrint(false)}
          ref={printRef}
          center="screen"
          features={{ width: "500px" }}
          title="Datacards">
          <style>
            {`@media print
          {    
              .no-print, .no-print *
              {
                  display: none !important;
              }
          }`}
          </style>
          <div className={"no-print"} style={{ marginTop: "32px", padding: "32px" }}>
            <Form layout="vertical">
              <Row gutter={16}>
                <Col span={3}>
                  <Form.Item label={"Cards per page:"}>
                    <Input
                      type={"number"}
                      value={cardsPerPage}
                      min={1}
                      max={9}
                      onChange={(e) => setCardsPerPage(Number(e.target.value))}
                    />
                  </Form.Item>
                </Col>
                <Col span={3}>
                  <Form.Item label={"Cards per row:"}>
                    <Input
                      type={"number"}
                      value={cardsPerRow}
                      min={1}
                      max={4}
                      onChange={(e) => setCardsPerRow(Number(e.target.value))}
                    />
                  </Form.Item>
                </Col>
                <Col span={3}>
                  <Form.Item label={"Scaling of cards:"}>
                    <Input
                      type={"number"}
                      value={cardScaling}
                      min={25}
                      max={250}
                      onChange={(e) => setCardScaling(Number(e.target.value))}
                    />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item label={"Print"}>
                    <Button
                      type="primary"
                      icon={<PrinterOutlined />}
                      size={"medium"}
                      onClick={() => printRef.current.window.print()}>
                      Print
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col span={12}>
                  <Typography.Paragraph>
                    When printing the cards make sure to enable the &quote;Background graphics&quote; option in order to
                    print the icons and borders.
                  </Typography.Paragraph>
                </Col>
              </Row>
            </Form>
          </div>
          {split(activeCategory.cards, cardsPerPage).map((row, RowIndex) => {
            return (
              <div
                className="flex"
                key={`print-${RowIndex}`}
                style={{
                  pageBreakAfter: "always",
                  gridTemplateColumns: `${cardsPerRow}fr `.repeat(cardsPerRow),
                }}>
                {row.map((card, index) => {
                  return (
                    <div className={`data-${card?.source}`} key={`${card.id}-${index}`}>
                      {card?.source === "40k" && (
                        <Warhammer40KCardDisplay card={card} type="print" cardScaling={cardScaling} />
                      )}
                      {card?.source === "basic" && (
                        <Warhammer40KCardDisplay card={card} type="print" cardScaling={cardScaling} />
                      )}
                      {card?.source === "necromunda" && (
                        <NecromundaCardDisplay card={card} type="print" cardScaling={cardScaling} />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </NewWindow>
      )}
    </Layout>
  );
}

export default App;
