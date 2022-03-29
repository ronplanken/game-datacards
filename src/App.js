import { FileOutlined, ProfileOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Col, Input, Layout, List, message, Modal, Row, Select, Tree, Typography } from 'antd';
import 'antd/dist/antd.min.css';
import gtag from 'ga-gtag';
import clone from 'just-clone';
import { useEffect, useState } from 'react';
import NewWindow from 'react-new-window';
import './App.css';
import { About } from './Components/About';
import { Toolbar } from './Components/Toolbar';
import { UnitCard } from './Components/UnitCard';
import { UnitCardEditor } from './Components/UnitCardEditor';

const { Header, Content } = Layout;
const { Option } = Select;

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

const readCsv = async (file) => {
  if (!file) {
    return;
  }

  return fetch(file)
    .then((response) => response.text())
    .then((text) => JSON.parse(text));
};

const generateTree = (data, selected) => {
  const temp = [
    {
      title: 'Page 1',
      key: 'page-0',
      children: [],
      icon: <FileOutlined />,
    },
  ];

  if (!data) {
    return temp;
  }
  data.forEach((card, index) => {
    temp[0].children.push({
      title: card.name,
      key: `${card.id}-${index}`,
      icon: <ProfileOutlined />,
    });
  });
  return temp;
};

function App() {
  const [selectedFaction, setSelectedFaction] = useState(null);
  const [factions, setFactions] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isLoading, setLoading] = useState(false);

  const [showPrint, setShowPrint] = useState(false);

  const [searchText, setSearchText] = useState(undefined);

  const [selectedTreeKey, setSelectedTreeKey] = useState(null);

  const [cards, setCards] = useState(() => {
    try {
      const lsCards = localStorage.getItem('cards');
      return lsCards ? JSON.parse(lsCards.replace(/(<([^>]+)>)/gi, '')) : [];
    } catch (e) {
      message.error('An error occored while trying to load your cards.');
      return [];
    }
  });

  useEffect(() => {
    async function fetchData() {
      const dataDatasheetAbilities = await readCsv(
        'https://raw.githubusercontent.com/ronplanken/40k-jsons/main/json/Datasheets_abilities.json'
      );
      const dataAbilities = await readCsv(
        'https://raw.githubusercontent.com/ronplanken/40k-jsons/main/json/Abilities.json'
      );
      const dataDatasheetWargear = await readCsv(
        'https://raw.githubusercontent.com/ronplanken/40k-jsons/main/json/Datasheets_wargear.json'
      );
      const dataWargearList = await readCsv(
        'https://raw.githubusercontent.com/ronplanken/40k-jsons/main/json/Wargear_list.json'
      );
      const dataWargear = await readCsv(
        'https://raw.githubusercontent.com/ronplanken/40k-jsons/main/json/Wargear.json'
      );
      const dataModels = await readCsv(
        'https://raw.githubusercontent.com/ronplanken/40k-jsons/main/json/Datasheets_models.json'
      );
      const dataKeywords = await readCsv(
        'https://raw.githubusercontent.com/ronplanken/40k-jsons/main/json/Datasheets_keywords.json'
      );
      const dataFactions = await readCsv(
        'https://raw.githubusercontent.com/ronplanken/40k-jsons/main/json/Factions.json'
      );
      const sheets = await readCsv('https://raw.githubusercontent.com/ronplanken/40k-jsons/main/json/Datasheets.json');

      const mappedSheets = sheets.map((row) => {
        row['keywords'] = [
          ...new Map(
            dataKeywords
              .filter((keyword) => keyword.datasheet_id === row.id)
              .map((model) => {
                return { ...model, active: true };
              })
              .map((item) => [item['keyword'], item])
          ).values(),
        ];
        row['datasheet'] = dataModels
          .filter((model) => model.datasheet_id === row.id)
          .filter(onlyUnique)
          .map((model, index) => {
            return { ...model, active: index === 0 ? true : false };
          });
        const linkedWargear = [
          ...new Map(
            dataDatasheetWargear
              .filter((wargear) => wargear.datasheet_id === row.id && wargear.is_index_wargear === 'false')
              .map((item) => [item['wargear_id'], item])
          ).values(),
        ];

        row['wargear'] = [];
        linkedWargear.forEach((wargear, index) => {
          row['wargear'][index] = clone(dataWargear.find((gear) => gear.id === wargear.wargear_id));
          if (row['wargear'][index]) {
            row['wargear'][index]['active'] = index === 0 ? true : false;
            row['wargear'][index]['profiles'] = clone(
              dataWargearList.filter((wargearList) => wargearList.wargear_id === wargear.wargear_id)
            );
          }
        });
        const linkedAbilities = dataDatasheetAbilities.filter((ability) => ability.datasheet_id === row.id);
        row['abilities'] = [];
        linkedAbilities.forEach((ability, index) => {
          row['abilities'].push(dataAbilities.find((abilityInfo) => abilityInfo.id === ability.ability_id));
        });
        row['abilities'] = row['abilities'].map((ability, index) => {
          return { ...ability, showDescription: false, showAbility: index === 0 ? true : false };
        });
        return row;
      });
      mappedSheets.shift();
      dataFactions.map((faction) => {
        faction['datasheets'] = mappedSheets
          .filter((datasheet) => datasheet.faction_id === faction.id)
          .sort((a, b) => {
            return a.name.localeCompare(b.name);
          });
        return faction;
      });

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
                gtag('event', 'Show help', {
                  event_category: 'Actions',
                });

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
                  selectedTreeKey={selectedTreeKey}
                  setSelectedTreeKey={setSelectedTreeKey}
                  cards={cards}
                  setCards={setCards}
                  selectedCard={selectedCard}
                  setSelectedCard={setSelectedCard}
                />
                <Row>
                  <Col span={24}>
                    <Tree
                      style={{ height: '300px', overflow: 'auto' }}
                      treeData={generateTree(cards, selectedTreeKey)}
                      selectedKeys={[selectedTreeKey]}
                      defaultExpandAll={true}
                      showIcon={true}
                      blockNode
                      onSelect={(selectedKeys, info) => {
                        if (selectedKeys.length === 0 && selectedTreeKey.includes('page')) {
                          setSelectedTreeKey(null);
                          return;
                        }
                        if (selectedKeys.length === 0 && !selectedTreeKey.includes('page')) {
                          setSelectedCard(null);
                          setSelectedTreeKey(null);
                          return;
                        }
                        if (selectedKeys[0].includes('page')) {
                          return;
                        }
                        setSelectedTreeKey(selectedKeys[0]);

                        if (!selectedKeys[0].includes('undefined')) {
                          const foundCard = cards[selectedKeys[0].split('-')[1]];
                          setSelectedCard(foundCard);
                        }
                      }}
                    />
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
                              gtag('event', 'Faction', {
                                event_category: 'Sources',
                                value: value,
                              });
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
                        gtag('event', 'Unit', {
                          event_category: 'Sources',
                          value: card.name,
                        });
                        setSelectedCard(card);
                        setSelectedTreeKey(null);
                      }}
                      className={`list-item ${
                        selectedCard && !selectedCard.isCustom && selectedCard.id === card.id ? 'selected' : ''
                      }`}
                    >
                      {card.name}
                    </List.Item>
                  )}
                />
              </Col>
            </Row>
          </Col>
          <Col span={9} style={{ display: 'flex', flexDirection: 'column', justifyContent: ' space-between' }}>
            <Row style={{ overflow: 'hidden' }}>
              {selectedCard && (
                <Col span={24}>
                  <UnitCard unit={selectedCard} />
                </Col>
              )}
            </Row>
          </Col>
          {selectedCard && (
            <Col span={9} style={{ overflowY: 'auto', height: 'calc(100vh - 64px)' }}>
              <UnitCardEditor selectedCard={selectedCard} setSelectedCard={setSelectedCard} />
            </Col>
          )}
        </Row>
      </Content>
      {showPrint && (
        <NewWindow onUnload={() => setShowPrint(false)} center='screen' title='Datacards'>
          <div className='flex'>
            {cards.map((card) => {
              return <UnitCard unit={card} key={card.id} />;
            })}
          </div>
        </NewWindow>
      )}
    </Layout>
  );
}

export default App;
