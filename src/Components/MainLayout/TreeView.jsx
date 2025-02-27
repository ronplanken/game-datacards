import { DownOutlined, RightOutlined } from "@ant-design/icons";
import { Col, Divider, Input, List, Row, Select } from "antd";
import classNames from "classnames";
import React, { useState } from "react";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import { Panel, PanelResizeHandle } from "react-resizable-panels";
import { getBackgroundColor, getMinHeight, move, reorder } from "../../Helpers/treeview.helpers";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";
import { useSettingsStorage } from "../../Hooks/useSettingsStorage";
import { FactionSettingsModal } from "../FactionSettingsModal";
import { TreeCategory } from "../TreeCategory";
import { TreeItem } from "../TreeItem";

const { Option } = Select;

export const TreeView = ({
  selectedTreeIndex,
  setSelectedTreeIndex,
  searchText,
  setSearchText,
  selectedContentType,
  setSelectedContentType,
}) => {
  const {
    cardStorage,
    activeCard,
    setActiveCard,
    addCardToCategory,
    updateCategory,
    activeCategory,
    setActiveCategory,
  } = useCardStorage();
  const { dataSource, selectedFactionIndex, selectedFaction, updateSelectedFaction } = useDataSourceStorage();
  const { settings, updateSettings } = useSettingsStorage();
  const [isLoading] = useState(false);

  /**
   * Filters and formats data based on selected content type and search text
   */
  const getDataSourceType = () => {
    if (selectedContentType === "datasheets") {
      let filteredSheets = [];
      if (
        selectedFaction &&
        (settings.selectedDataSource === "40k-10e" || settings.selectedDataSource === "40k-10e-cp")
      ) {
        try {
          filteredSheets = [
            { type: "category", name: selectedFaction.name, id: selectedFaction.id, closed: false },
            ...selectedFaction?.datasheets?.toSorted((a, b) => a.name.localeCompare(b.name)),
          ];
          if (selectedFaction.is_subfaction && settings.combineParentFactions) {
            let parentFaction = dataSource.data.find((faction) => faction.id === selectedFaction.parent_id);

            let parentDatasheets = parentFaction?.datasheets
              ?.filter((val) => val.factions.length === 1 && val.factions.includes(selectedFaction.parent_keyword))
              .map((val) => {
                return { ...val, nonBase: true };
              });

            filteredSheets = [
              ...filteredSheets,
              { type: "category", name: parentFaction.name, id: parentFaction.id, closed: true },
              ...parentDatasheets?.toSorted((a, b) => a.name.localeCompare(b.name)),
            ];
          }

          if (!settings?.showLegends) {
            filteredSheets = filteredSheets?.filter((sheet) => !sheet.legends);
          }
          if (!settings.groupByFaction) {
            filteredSheets = filteredSheets?.toSorted((a, b) => a.name.localeCompare(b.name));
          }
          if (settings.groupByRole) {
            const types = ["Battleline", "Character", "Dedicated Transport"];
            let byRole = [];

            types.map((role) => {
              byRole = [...byRole, { type: "role", name: role }];
              byRole = [
                ...byRole,
                ...filteredSheets
                  ?.filter((sheet) => sheet?.keywords?.includes(role))
                  .map((val) => {
                    return { ...val, role: role };
                  }),
              ];
            });

            byRole = [
              ...byRole,
              { type: "role", name: "Other" },
              ...filteredSheets
                ?.filter((sheet) => {
                  return types.every((t) => !sheet?.keywords?.includes(t));
                })
                .map((val) => {
                  return { ...val, role: "Other" };
                }),
            ];

            filteredSheets = byRole;
          }

          if (
            selectedFaction.allied_factions &&
            selectedFaction.allied_factions.length > 0 &&
            settings.combineAlliedFactions
          ) {
            selectedFaction.allied_factions.forEach((alliedFactionId) => {
              let alliedFaction = dataSource.data.find((faction) => faction.id === alliedFactionId);

              let alliedFactionDatasheets = alliedFaction?.datasheets.map((val) => {
                return { ...val, nonBase: true, allied: true };
              });

              filteredSheets = [
                ...filteredSheets,
                { type: "allied", name: alliedFaction.name, id: alliedFaction.id, closed: true },
                ...alliedFactionDatasheets?.toSorted((a, b) => a.name.localeCompare(b.name)),
              ];
            });
          }
          filteredSheets = searchText
            ? filteredSheets.filter((sheet) => {
                if (sheet.type === "category" || sheet.type === "header") {
                  return true;
                }
                return sheet.name.toLowerCase().includes(searchText.toLowerCase());
              })
            : filteredSheets;

          return filteredSheets;
        } catch (error) {
          console.error("An error occured", error);
          return [];
        }
      }

      filteredSheets = searchText
        ? selectedFaction?.datasheets.filter((sheet) => sheet.name.toLowerCase().includes(searchText.toLowerCase()))
        : selectedFaction?.datasheets;
      if (!settings?.showLegends) {
        filteredSheets = filteredSheets?.filter((sheet) => !sheet.legends);
      }
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
    <>
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
          <List
            bordered
            size="small"
            loading={isLoading}
            dataSource={getDataSourceType()}
            style={{ overflowY: "auto", height: "calc(100% - 36px)" }}
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
                  <List.Item key={`list-header-${index}`} className={`list-header`} onClick={() => {}}>
                    {card.name}
                  </List.Item>
                );
              }
              if (card.type === "category") {
                if (settings?.groupByFaction) {
                  return (
                    <List.Item
                      key={`list-category-${index}`}
                      className={`list-category`}
                      onClick={() => {
                        let newClosedFactions = [...(settings?.mobile?.closedFactions || [])];
                        if (newClosedFactions.includes(card.id)) {
                          newClosedFactions.splice(newClosedFactions.indexOf(card.id), 1);
                        } else {
                          newClosedFactions.push(card.id);
                        }
                        updateSettings({
                          ...settings,
                          mobile: { ...settings.mobile, closedFactions: newClosedFactions },
                        });
                      }}>
                      <span className="icon">
                        {settings?.mobile?.closedFactions?.includes(card.id) ? <RightOutlined /> : <DownOutlined />}
                      </span>
                      <span className="name">{card.name}</span>
                    </List.Item>
                  );
                }
                return <></>;
              }
              if (card.type === "allied") {
                return (
                  <List.Item
                    key={`list-category-${index}`}
                    className={`list-category`}
                    onClick={() => {
                      let newClosedFactions = [...(settings?.mobile?.closedFactions || [])];
                      if (newClosedFactions.includes(card.id)) {
                        newClosedFactions.splice(newClosedFactions.indexOf(card.id), 1);
                      } else {
                        newClosedFactions.push(card.id);
                      }
                      updateSettings({
                        ...settings,
                        mobile: { ...settings.mobile, closedFactions: newClosedFactions },
                      });
                    }}>
                    <span className="icon">
                      {settings?.mobile?.closedFactions?.includes(card.id) ? <RightOutlined /> : <DownOutlined />}
                    </span>
                    <span className="name">{card.name}</span>
                  </List.Item>
                );
              }
              if (card.type === "role") {
                return (
                  <List.Item
                    key={`list-role-${index}`}
                    className={`list-category`}
                    onClick={() => {
                      let newClosedRoles = [...(settings?.mobile?.closedRoles || [])];
                      if (newClosedRoles.includes(card.name)) {
                        newClosedRoles.splice(newClosedRoles.indexOf(card.name), 1);
                      } else {
                        newClosedRoles.push(card.name);
                      }
                      updateSettings({
                        ...settings,
                        mobile: { ...settings.mobile, closedRoles: newClosedRoles },
                      });
                    }}>
                    <span className="icon">
                      {settings?.mobile?.closedRoles?.includes(card.name) ? <RightOutlined /> : <DownOutlined />}
                    </span>
                    <span className="name">{card.name}</span>
                  </List.Item>
                );
              }
              const cardFaction = dataSource.data.find((faction) => faction.id === card?.faction_id);

              if (settings?.mobile?.closedFactions?.includes(card.faction_id) && card.allied) {
                return <></>;
              }
              if (settings?.mobile?.closedRoles?.includes(card.role)) {
                return <></>;
              }
              return (
                <List.Item
                  key={`list-${card.id}`}
                  onClick={() => {
                    setActiveCard(card);
                  }}
                  className={classNames({
                    "list-item": true,
                    selected: activeCard && !activeCard.isCustom && activeCard.id === card.id,
                    legends: card.legends,
                  })}>
                  <div
                    style={{
                      display: "flex",
                      width: "100%",
                      marginRight: "24px",
                      justifyContent: "space-between",
                    }}
                    className={card.nonBase ? card.faction_id : ""}>
                    <span style={{ flexDirection: "column", display: "flex" }}>
                      {card.name}
                      {card.detachment !== "core" && <span style={{ fontSize: "0.7rem" }}>{card.detachment}</span>}
                    </span>
                    {settings.showPointsInListview && card?.points?.length > 0 && (
                      <span className="list-cost">
                        <strong>{card.points[0]?.cost}</strong> pts
                      </span>
                    )}
                  </div>
                </List.Item>
              );
            }}
          />
        </div>
      </Panel>
    </>
  );
};
