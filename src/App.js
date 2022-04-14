import {
  AppstoreAddOutlined,
  ExclamationCircleOutlined,
  QuestionCircleOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import { Button, Col, Form, Input, Layout, List, Modal, Row, Select, Typography } from 'antd';
import 'antd/dist/antd.min.css';
import clone from 'just-clone';
import split from 'just-split';
import { useEffect, useRef, useState } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import NewWindow from 'react-new-window';
import { v4 as uuidv4 } from 'uuid';
import './App.css';
import { About } from './Components/About';
import { Toolbar } from './Components/Toolbar';
import { TreeCategory } from './Components/TreeCategory';
import { TreeItem } from './Components/TreeItem';
import { UnitCard } from './Components/UnitCard';
import { UnitCardEditor } from './Components/UnitCardEditor';
import { get40KData } from './Helpers/external.helpers';
import { getBackgroundColor, getMinHeight, move, reorder } from './Helpers/treeview.helpers';
import { useCardStorage } from './Hooks/useCardStorage';

const { Header, Content } = Layout;
const { Option } = Select;
const { confirm } = Modal;

function App() {
  const [selectedFaction, setSelectedFaction] = useState(null);
  const [factions, setFactions] = useState([]);
  const [isLoading, setLoading] = useState(false);

  const [showPrint, setShowPrint] = useState(false);

  const [searchText, setSearchText] = useState(undefined);

  const [selectedTreeIndex, setSelectedTreeIndex] = useState(null);

  const [cardsPerPage, setCardsPerPage] = useState(9);
  const [cardsPerRow, setCardsPerRow] = useState(3);
  const [cardScaling, setCardScaling] = useState(100);

  const printRef = useRef(null);

  const { cardStorage, activeCard, setActiveCard, cardUpdated, addCardToCategory, updateCategory, activeCategory } =
    useCardStorage();

  useEffect(() => {
    async function fetchData() {
      const dataFactions = await get40KData();
      setFactions(dataFactions);
      setLoading(false);
    }
    setLoading(true);
    fetchData();
  }, []);

  return (
    <Layout>
      <Header>
        <Row style={{ justifyContent: 'space-between' }}>
          <Col>
            <Typography.Title level={2} style={{ color: 'white', marginBottom: 0, marginTop: '8px' }}>
              Game Datacards
            </Typography.Title>
          </Col>
          <Col>
            <Button
              size='large'
              shape='circle'
              type={'text'}
              icon={<QuestionCircleOutlined />}
              style={{ color: 'white' }}
              onClick={() => {
                Modal.info({
                  title: 'Game Datacards',
                  width: 850,
                  content: <About />,
                });
              }}
            />
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
                    <div style={{ height: '300px', overflow: 'auto', background: 'white' }}>
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

                            updateCategory(sourceCat, sInd);
                            updateCategory(destCat, dInd);
                          }
                        }}
                      >
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
                                    }}
                                  >
                                    <TreeCategory
                                      category={category}
                                      selectedTreeIndex={selectedTreeIndex}
                                      setSelectedTreeIndex={setSelectedTreeIndex}
                                    />
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
                  size='small'
                  loading={isLoading}
                  dataSource={
                    searchText
                      ? selectedFaction?.datasheets.filter((sheet) =>
                          sheet.name.toLowerCase().includes(searchText.toLowerCase())
                        )
                      : selectedFaction?.datasheets
                  }
                  style={{ overflowY: 'auto', height: 'calc(100vh - 398px)' }}
                  locale={{ emptyText: selectedFaction ? 'No datasheets found' : 'No faction selected' }}
                  header={
                    <>
                      <Row style={{ marginBottom: '4px' }}>
                        <Col span={24}>
                          <Select
                            loading={isLoading}
                            style={{ width: '100%' }}
                            onChange={(value) => {
                              setSelectedFaction(factions.find((faction) => faction.id === value));
                            }}
                            placeholder='Select a faction'
                          >
                            {factions.map((faction, index) => (
                              <Option value={faction.id} key={`${faction.id}-${index}`}>
                                {faction.name}
                              </Option>
                            ))}
                          </Select>
                        </Col>
                      </Row>
                      <Row>
                        <Col span={24}>
                          <Input.Search
                            placeholder={'Search'}
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
                  renderItem={(card) => (
                    <List.Item
                      key={`list-${card.id}`}
                      onClick={() => {
                        if (cardUpdated) {
                          confirm({
                            title: 'You have unsaved changes',
                            content: 'Are you sure you want to discard your changes?',
                            icon: <ExclamationCircleOutlined />,
                            okText: 'Yes',
                            okType: 'danger',
                            cancelText: 'No',
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
                        activeCard && !activeCard.isCustom && activeCard.id === card.id ? 'selected' : ''
                      }`}
                    >
                      {card.name}
                    </List.Item>
                  )}
                />
              </Col>
            </Row>
          </Col>
          <Col span={9} style={{ display: 'flex', flexDirection: 'column' }}>
            <Row style={{ overflow: 'hidden' }}>
              {activeCard && (
                <Col span={24}>
                  <UnitCard unit={activeCard} />
                </Col>
              )}
            </Row>
            <Row style={{ overflow: 'hidden', justifyContent: 'center' }}>
              {activeCard && !activeCard.isCustom && (
                <Col
                  span={9}
                  style={{ overflow: 'hidden', justifyContent: 'center', display: 'flex', marginTop: '16px' }}
                >
                  <Button
                    icon={<AppstoreAddOutlined />}
                    type={'primary'}
                    onClick={() => {
                      const newCard = { ...activeCard, isCustom: true, uuid: uuidv4() };
                      addCardToCategory(newCard);
                      setActiveCard(newCard);
                      setSelectedTreeIndex(`card-${newCard.uuid}`);
                    }}
                  >
                    Add card to category
                  </Button>
                </Col>
              )}
            </Row>
          </Col>
          {activeCard && (
            <Col span={9} style={{ overflowY: 'auto', height: 'calc(100vh - 64px)' }}>
              <UnitCardEditor />
            </Col>
          )}
        </Row>
      </Content>
      {showPrint && (
        <NewWindow onUnload={() => setShowPrint(false)} ref={printRef} center='screen' features={{ width: '500px' }} title='Datacards'>
          <style>
            {`@media print
          {    
              .no-print, .no-print *
              {
                  display: none !important;
              }
          }`}
          </style>
          <div className={'no-print'} style={{ marginTop: '32px', padding: '32px' }}>
            <Form layout='vertical'>
              <Row gutter={16}>
                <Col span={3}>
                  <Form.Item label={'Cards per page:'}>
                    <Input
                      type={'number'}
                      value={cardsPerPage}
                      min={3}
                      max={9}
                      onChange={(e) => setCardsPerPage(Number(e.target.value))}
                    />
                  </Form.Item>
                </Col>
                <Col span={3}>
                  <Form.Item label={'Cards per row:'}>
                    <Input
                      type={'number'}
                      value={cardsPerRow}
                      min={1}
                      max={4}
                      onChange={(e) => setCardsPerRow(Number(e.target.value))}
                    />
                  </Form.Item>
                </Col>
                <Col span={3}>
                  <Form.Item label={'Scaling of cards:'}>
                    <Input
                      type={'number'}
                      value={cardScaling}
                      min={50}
                      max={150}
                      onChange={(e) => setCardScaling(Number(e.target.value))}
                    />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item label={'Print'}>
                    <Button type='primary' icon={ <PrinterOutlined />} size={"medium"} onClick={() => printRef.current.window.print()}>
                      Print
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </div>
          {split(activeCategory.cards, cardsPerPage).map((row) => {
            return (
              <div
                className='flex'
                style={{ pageBreakAfter: 'always', gridTemplateColumns: `${cardsPerRow}fr `.repeat(cardsPerRow) }}
              >
                {row.map((card, index) => {
                  return (
                    <UnitCard
                      unit={card}
                      key={`${card.id}-${index}`}
                      style={{
                        paddingTop: '8px',
                      }}
                      cardStyle={{ transformOrigin: '0% 0%', transform: `scale(${cardScaling / 100})` }}
                    />
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
