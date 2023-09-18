import {
  CloseOutlined,
  CopyOutlined,
  CrownFilled,
  DeleteOutlined,
  ExclamationCircleOutlined,
  HeatMapOutlined,
} from "@ant-design/icons";
import { Button, Col, Dropdown, List, Menu, Modal, Row, Space, Tooltip, Typography, message } from "antd";
import classNames from "classnames";
import React, { useRef, useState } from "react";
import { Draggable } from "react-beautiful-dnd";
import { createPortal } from "react-dom";
import OutsideClickHandler from "react-outside-click-handler";
import { v4 as uuidv4 } from "uuid";
import { useCardStorage } from "../Hooks/useCardStorage";
import { useDataSourceStorage } from "../Hooks/useDataSourceStorage";
import { AddCard } from "../Icons/AddCard";
import { Datacard } from "../Icons/Datacard";
import { Datacard10e } from "../Icons/Datacard10e";
import { Ganger } from "../Icons/Ganger";
import { PsychicPower } from "../Icons/PsychicPower";
import { Secondary } from "../Icons/Secondary";
import { Stratagem } from "../Icons/Stratagem";
import { Vehicle } from "../Icons/Vehicle";

const { confirm } = Modal;

export function TreeItem({ card, category, selectedTreeIndex, setSelectedTreeIndex, index }) {
  const {
    setActiveCard,
    activeCategory,
    setActiveCategory,
    cardUpdated,
    removeCardFromCategory,
    addCardToCategory,
    saveActiveCard,
    updateActiveCard,
    saveCard,
  } = useCardStorage();
  const cardIndex = `card-${card.uuid}`;
  const { dataSource } = useDataSourceStorage();

  const dropdown = useRef();

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

  const cardFaction = dataSource.data.find((faction) => faction.id === card?.faction_id);
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

  return (
    <>
      <Draggable key={`${cardIndex}-draggable`} draggableId={card.uuid} index={index}>
        {(provided, snapshot) => (
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
                    confirm({
                      title: "You have unsaved changes",
                      content: "Are you sure you want to discard your changes?",
                      icon: <ExclamationCircleOutlined />,
                      okText: "Yes",
                      okType: "danger",
                      cancelText: "No",
                      onOk: () => {
                        onSelect();
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
                  <Tooltip title={`Selected enhancement: ${card?.selectedEnhancement?.name}`}>
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
                    dropdown.current.style.display = "flex";
                  }}>
                  <strong>{card?.unitSize?.cost}</strong>
                </span>
              )}
              {category?.type === "list" &&
                card?.source === "40k-10e" &&
                card?.cardType === "DataCard" &&
                !card?.unitSize && (
                  <>
                    <button
                      type="primary"
                      className="list-select"
                      onClick={(e) => {
                        e.preventDefault();
                        dropdown.current.style.display = "flex";
                      }}>
                      <strong>select</strong>
                    </button>
                  </>
                )}
            </div>
          </Dropdown>
        )}
      </Draggable>
      {createPortal(
        <div
          ref={dropdown}
          className="modal-background"
          style={{
            display: "none",
            alignContent: "center",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            width: "100vw",
            flexDirection: "row",
          }}>
          <div
            style={{
              backgroundColor: "white",
              width: "500px",
              padding: "8px",
            }}
            className="desktop-list">
            <OutsideClickHandler
              onOutsideClick={() => {
                dropdown.current.style.display = "none";
              }}>
              <div style={{ height: "100%", overflow: "auto" }}>
                <Space style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                  <Typography.Title level={4}>Update {card.name}</Typography.Title>
                  <Button
                    style={{ fontSize: "20px" }}
                    type="ghost"
                    shape="circle"
                    icon={<CloseOutlined />}
                    onClick={() => {
                      dropdown.current.style.display = "none";
                    }}
                  />
                </Space>
                <Typography.Text style={{ paddingTop: "8px" }}>Select unit size</Typography.Text>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <List
                    bordered
                    dataSource={card?.points
                      ?.filter((p) => p.active)
                      .map((point, index) => {
                        return {
                          models: point.models,
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
                          className={selectedUnitSize?.models === item?.models ? "selected" : ""}
                          style={{ cursor: "pointer" }}>
                          <Row style={{ width: "100%", fontSize: "1.2rem" }}>
                            <Col span={20}>
                              <Typography.Text>
                                {item.models} {item.models > 1 ? "models" : "model"}
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
                    <div style={{ paddingTop: "16px" }}>
                      <Typography.Text>Enhancements</Typography.Text>
                    </div>
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <List
                        bordered
                        dataSource={cardFaction?.enhancements
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
                          .map((enhancement, index) => {
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
                    dropdown.current.style.display = "none";
                    message.success(`${card.name} update.`);
                  }}
                  icon={<AddCard />}
                  disabled={!selectedUnitSize || epicHeroAlreadyAdded}
                  style={{ marginTop: "16px" }}>
                  Set unit values
                </Button>
              </div>
            </OutsideClickHandler>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
