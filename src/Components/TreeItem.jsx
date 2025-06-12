import {
  CloseOutlined,
  CopyOutlined,
  CrownFilled,
  DeleteOutlined,
  ExclamationCircleOutlined,
  HeatMapOutlined,
} from "@ant-design/icons";
import { Button, Col, Dropdown, List, Menu, Modal, Row, Select, Space, Tooltip, Typography, message } from "antd";
import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import { v4 as uuidv4 } from "uuid";
import { capitalizeSentence } from "../Helpers/external.helpers";
import { useCardStorage } from "../Hooks/useCardStorage";
import { useDataSourceStorage } from "../Hooks/useDataSourceStorage";
import { useSettingsStorage } from "../Hooks/useSettingsStorage";
import { AddCard } from "../Icons/AddCard";
import { Datacard } from "../Icons/Datacard";
import { Datacard10e } from "../Icons/Datacard10e";
import { Ganger } from "../Icons/Ganger";
import { PsychicPower } from "../Icons/PsychicPower";
import { Secondary } from "../Icons/Secondary";
import { Stratagem } from "../Icons/Stratagem";
import { Vehicle } from "../Icons/Vehicle";
import { confirmDialog } from "./ConfirmChangesModal";
import { Enhancement } from "../Icons/Enhancement";
import { Battlerule } from "../Icons/Battlerule";

const { confirm } = Modal;

const { Option } = Select;
export function TreeItem({ card, category, selectedTreeIndex, setSelectedTreeIndex, index }) {
  const {
    setActiveCard,
    activeCategory,
    setActiveCategory,
    cardUpdated,
    removeCardFromCategory,
    addCardToCategory,
    saveCard,
    saveActiveCard,
  } = useCardStorage();
  const cardIndex = `card-${card.uuid}`;
  const { dataSource } = useDataSourceStorage();
  const { settings, updateSettings } = useSettingsStorage();

  const [modalVisible, setModalVisible] = useState(false);

  const [selectedEnhancement, setSelectedEnhancement] = useState(() => card.selectedEnhancement);
  const [isWarlord, setIsWarlord] = useState(() => {
    if (card?.isWarlord) {
      return card.isWarlord;
    }
    return false;
  });
  const [selectedUnitSize, setSelectedUnitSize] = useState(() => {
    if (card.unitSize) {
      return card.unitSize;
    }
    if (card?.points?.length === 1) {
      return card.points[0];
    }
    return undefined;
  });

  useEffect(() => {
    setIsWarlord(card?.isWarlord);
    setSelectedEnhancement(card.selectedEnhancement);
    if (card.unitSize) {
      setSelectedUnitSize(card?.unitSize);
    }
    if (card?.points?.length === 1) {
      setSelectedUnitSize(card.points[0]);
    }
  }, [card, index]);

  const cardFaction = dataSource.data.find((faction) => faction.id === card?.faction_id);

  const [selectedDetachment, setSelectedDetachment] = useState();

  useEffect(() => {
    if (settings?.selectedDetachment?.[card?.faction_id]) {
      setSelectedDetachment(settings?.selectedDetachment?.[card?.faction_id]);
    } else {
      setSelectedDetachment(cardFaction?.detachments?.[0]);
    }
  }, [card, cardFaction, settings]);

  const warlordAlreadyAdded = category?.cards?.find((card) => card.warlord);
  const epicHeroAlreadyAdded = category?.cards?.find((foundCard) => {
    return card?.keywords?.includes("Epic Hero") && card?.id === foundCard?.card?.id;
  });

  const selectEnhancement = (enhancement) => {
    if (selectedEnhancement?.name === enhancement?.name) {
      setSelectedEnhancement(undefined);
    } else {
      setSelectedEnhancement(enhancement);
    }
  };

  const menu = (
    <Menu>
      <Menu.Item
        key="1"
        icon={<CopyOutlined />}
        onClick={() => {
          const newCard = {
            ...card,
            name: `${card.name} Copy`,
            unitSize: undefined,
            selectedEnhancement: undefined,
            isWarlord: undefined,
            isCustom: true,
            uuid: uuidv4(),
          };
          addCardToCategory(newCard, activeCategory.uuid);
          setActiveCard(newCard);
        }}>
        Duplicate
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        key="2"
        icon={<DeleteOutlined />}
        onClick={() => {
          confirm({
            title: "Are you sure you want to delete this card?",
            icon: <ExclamationCircleOutlined />,
            okText: "Yes",
            okType: "danger",
            cancelText: "No",
            onOk: () => {
              removeCardFromCategory(card.uuid, category.uuid);
              setActiveCard(null);
              setSelectedTreeIndex(null);
              message.success("Card has been deleted.");
            },
          });
        }}>
        Delete
      </Menu.Item>
    </Menu>
  );

  const onSelect = () => {
    if (selectedTreeIndex === cardIndex) {
      setSelectedTreeIndex(null);
      setActiveCard(null);
      setActiveCategory(null);
    } else {
      setSelectedTreeIndex(cardIndex);
      setActiveCard(card);
      setActiveCategory(category);
    }
  };

  const isListItem =
    category?.type === "list" && card?.source === "40k-10e" && card?.cardType === "DataCard" && !card?.unitSize;

  return (
    <>
      <Draggable key={`${cardIndex}-draggable`} draggableId={card.uuid} index={index}>
        {(provided) => (
          <Dropdown overlay={menu} trigger={["contextMenu"]}>
            <div
              className={["tree-item-container", selectedTreeIndex === cardIndex ? "selected" : ""].join(" ")}
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              style={{
                paddingLeft: 38,
                height: 24,
                fontSize: "14px",
                alignContent: "center",
                display: "flex",
                width: "100%",
                ...provided.draggableProps.style,
              }}>
              <div
                onClick={() => {
                  if (cardUpdated) {
                    confirmDialog({
                      title: "You have unsaved changes",
                      content: "Do you want to save before switching?",
                      handleSave: () => {
                        saveActiveCard();
                        onSelect();
                      },
                      handleDiscard: () => {
                        onSelect();
                      },
                      handleCancel: () => {
                        //do nothing
                      },
                    });
                  } else {
                    onSelect();
                  }
                }}
                className={"tree-item"}>
                {card.cardType === "datasheet" && <Datacard />}
                {card.cardType === "DataCard" && <Datacard10e />}
                {card.cardType === "stratagem" && <Stratagem />}
                {card.cardType === "enhancement" && <Enhancement />}
                {card.cardType === "battlerule" && <Battlerule />}
                {card.cardType === "secondary" && <Secondary />}
                {card.cardType === "psychic" && <PsychicPower />}
                {card.cardType === "ganger" && <Ganger />}
                {card.cardType === "vehicle" && <Vehicle />}
                {card.cardType === "empty-ganger" && <Ganger />}
                {card.cardType === "empty-vehicle" && <Vehicle />}
                &nbsp;{card.name}
              </div>
              {category?.type === "list" && card?.source === "40k-10e" && card?.selectedEnhancement && (
                <span style={{ paddingRight: "8px" }}>
                  <Tooltip
                    title={
                      <>
                        Enhancement:
                        <br /> <strong>{capitalizeSentence(card?.selectedEnhancement?.name)}</strong> (+
                        {card?.selectedEnhancement?.cost}pts)
                      </>
                    }>
                    <HeatMapOutlined />
                  </Tooltip>
                </span>
              )}
              {category?.type === "list" && card?.source === "40k-10e" && card?.isWarlord && (
                <span style={{ paddingRight: "8px" }}>
                  <Tooltip title={"This unit is the warlord."}>
                    <CrownFilled />
                  </Tooltip>
                </span>
              )}
              {category?.type === "list" && card?.source === "40k-10e" && card?.unitSize?.cost && (
                <span
                  className="list-select"
                  style={{
                    minWidth: "40px",
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    setModalVisible(true);
                  }}>
                  <strong>{Number(card?.unitSize?.cost) + (Number(card.selectedEnhancement?.cost) || 0)}</strong>
                </span>
              )}
              {isListItem && (
                <>
                  <button
                    type="primary"
                    className="list-select"
                    onClick={(e) => {
                      e.preventDefault();
                      setModalVisible(true);
                    }}>
                    <strong>select</strong>
                  </button>
                </>
              )}
            </div>
          </Dropdown>
        )}
      </Draggable>
      {modalVisible && (
        <div
          onClick={(e) => {
            if (e.target.getAttribute("class") === "modal-background") {
              setModalVisible(false);
            }
          }}
          className="modal-background"
          style={{
            display: "flex",
            alignContent: "center",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            width: "100vw",
            flexDirection: "row",
            zIndex: "2",
          }}>
          <div
            style={{
              backgroundColor: "white",
              width: "500px",
              padding: "8px",
              zIndex: "3",
            }}
            className="desktop-list">
            <div style={{ height: "100%", overflow: "auto" }}>
              <Space style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                <Typography.Title level={4}>Update {card.name}</Typography.Title>
                <Button
                  style={{ fontSize: "20px" }}
                  type="ghost"
                  shape="circle"
                  icon={<CloseOutlined />}
                  onClick={() => {
                    setModalVisible(false);
                  }}
                />
              </Space>
              <Typography.Text style={{ paddingTop: "8px" }}>Select unit size</Typography.Text>
              <Space direction="vertical" style={{ width: "100%" }}>
                <List
                  bordered
                  dataSource={card?.points
                    ?.filter((p) => p.active)
                    .map((point) => {
                      return {
                        models: point.models,
                        keyword: point.keyword,
                        cost: point.cost,
                        icon: <AddCard />,
                        onClick: () => {
                          setSelectedUnitSize(point);
                        },
                      };
                    })}
                  renderItem={(item) => {
                    return (
                      <List.Item
                        onClick={item.onClick}
                        className={
                          selectedUnitSize?.models === item?.models && selectedUnitSize.keyword === item.keyword
                            ? "selected"
                            : ""
                        }
                        style={{ cursor: "pointer" }}>
                        <Row style={{ width: "100%", fontSize: "1.2rem" }}>
                          <Col span={20}>
                            <Typography.Text>
                              {item.models} {item.models > 1 ? "models" : "model"}
                              {item.keyword ? ` (${item.keyword})` : ""}
                            </Typography.Text>
                          </Col>
                          <Col span={4} style={{ textAlign: "right" }}>
                            <Typography.Text>{item.cost} pts</Typography.Text>
                          </Col>
                        </Row>
                      </List.Item>
                    );
                  }}></List>
              </Space>
              {(card?.keywords?.includes("Character") || card?.keywords?.includes("Epic Hero")) && (
                <>
                  <div style={{ paddingTop: "16px" }}>
                    <Typography.Text>Warlord</Typography.Text>
                  </div>
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <List bordered>
                      <List.Item
                        onClick={() => {
                          if (!warlordAlreadyAdded) {
                            setIsWarlord((val) => !val);
                          }
                        }}
                        className={classNames({
                          listitem: true,
                          selected: isWarlord,
                          disabled: warlordAlreadyAdded,
                        })}
                        style={{ cursor: "pointer" }}>
                        <Row style={{ width: "100%", fontSize: "1.2rem" }}>
                          {warlordAlreadyAdded ? (
                            <Col span={24}>
                              <Typography.Text>You already have a warlord</Typography.Text>
                            </Col>
                          ) : (
                            <Col span={24}>
                              <Typography.Text>Warlord</Typography.Text>
                            </Col>
                          )}
                        </Row>
                      </List.Item>
                    </List>
                  </Space>
                </>
              )}
              {card?.keywords?.includes("Character") && !card?.keywords?.includes("Epic Hero") && (
                <>
                  {cardFaction?.detachments?.length > 1 && (
                    <>
                      <div style={{ paddingTop: "16px" }}>
                        <Typography.Text>Detachment</Typography.Text>
                      </div>
                      <Select
                        style={{ width: "100%" }}
                        onChange={(value) => {
                          setSelectedDetachment(value);
                          updateSettings({
                            ...settings,
                            selectedDetachment: { ...settings.selectedDetachment, [card.faction_id]: value },
                          });
                        }}
                        value={selectedDetachment}>
                        {cardFaction?.detachments?.map((d) => {
                          return (
                            <Option value={d} key={d}>
                              {d}
                            </Option>
                          );
                        })}
                      </Select>
                    </>
                  )}
                  <div style={{ paddingTop: "16px" }}>
                    <Typography.Text>Enhancements</Typography.Text>
                  </div>
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <List
                      bordered
                      dataSource={cardFaction?.enhancements
                        ?.filter(
                          (enhancement) =>
                            enhancement?.detachment?.toLowerCase() === selectedDetachment?.toLowerCase() ||
                            !enhancement.detachment
                        )
                        ?.filter((enhancement) => {
                          let isActiveEnhancement = false;
                          enhancement.keywords.forEach((keyword) => {
                            if (card?.keywords?.includes(keyword)) {
                              isActiveEnhancement = true;
                            }
                            if (card?.factions?.includes(keyword)) {
                              isActiveEnhancement = true;
                            }
                          });
                          enhancement?.excludes?.forEach((exclude) => {
                            if (card?.keywords?.includes(exclude)) {
                              isActiveEnhancement = false;
                            }
                            if (card?.factions?.includes(exclude)) {
                              isActiveEnhancement = false;
                            }
                          });
                          return isActiveEnhancement;
                        })
                        .map((enhancement) => {
                          return {
                            name: enhancement.name,
                            cost: enhancement.cost,
                            description: enhancement.description,
                            onClick: () => {
                              selectEnhancement(enhancement);
                            },
                            disabled: () => {
                              let isDisabled = false;
                              category.cards.forEach((card) => {
                                if (card?.enhancement?.name === enhancement?.name) {
                                  isDisabled = true;
                                }
                              });
                              return isDisabled;
                            },
                          };
                        })}
                      renderItem={(item) => {
                        return (
                          <List.Item
                            onClick={!item.disabled() ? item.onClick : undefined}
                            className={classNames({
                              listitem: true,
                              selected: selectedEnhancement?.name === item?.name,
                              disabled: item.disabled(),
                            })}
                            style={{ cursor: "pointer" }}>
                            <Row style={{ width: "100%", fontSize: "1.0rem" }}>
                              <Col span={20}>
                                <Typography.Text>{item.name}</Typography.Text>
                              </Col>
                              <Col span={4} style={{ textAlign: "right" }}>
                                <Typography.Text>{item.cost} pts</Typography.Text>
                              </Col>
                            </Row>
                          </List.Item>
                        );
                      }}></List>
                  </Space>
                </>
              )}
              <Button
                size="large"
                type="primary"
                block
                onClick={() => {
                  saveCard({ ...card, unitSize: selectedUnitSize, selectedEnhancement, isWarlord }, category);
                  setModalVisible(false);
                  message.success(`${card.name} update.`);
                }}
                icon={<AddCard />}
                disabled={!selectedUnitSize || epicHeroAlreadyAdded}
                style={{ marginTop: "16px" }}>
                Set unit values
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
