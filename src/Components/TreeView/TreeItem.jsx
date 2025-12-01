import React, { useEffect, useState } from "react";
import { X, Copy, Crown, Trash2, Flame } from "lucide-react";
import { Button, Col, List, Row, Select, Space, Typography, message } from "antd";
import classNames from "classnames";
import { Draggable } from "react-beautiful-dnd";
import { v4 as uuidv4 } from "uuid";
import { capitalizeSentence } from "../../Helpers/external.helpers";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";
import { useSettingsStorage } from "../../Hooks/useSettingsStorage";
import { AddCard } from "../../Icons/AddCard";
import { Datacard } from "../../Icons/Datacard";
import { Datacard10e } from "../../Icons/Datacard10e";
import { Ganger } from "../../Icons/Ganger";
import { PsychicPower } from "../../Icons/PsychicPower";
import { Secondary } from "../../Icons/Secondary";
import { Stratagem } from "../../Icons/Stratagem";
import { Vehicle } from "../../Icons/Vehicle";
import { Enhancement } from "../../Icons/Enhancement";
import { Battlerule } from "../../Icons/Battlerule";
import { confirmDialog } from "../ConfirmChangesModal";
import { ContextMenu } from "./ContextMenu";
import "./TreeView.css";

const { Option } = Select;

export function TreeItem({ card, category, selectedTreeIndex, setSelectedTreeIndex, index, isInSubCategory = false }) {
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
  const [contextMenu, setContextMenu] = useState(null);

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

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleDuplicate = () => {
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
  };

  const handleDelete = () => {
    confirmDialog({
      title: "Are you sure you want to delete this card?",
      content: "This action cannot be undone.",
      handleSave: () => {
        removeCardFromCategory(card.uuid, category.uuid);
        setActiveCard(null);
        setSelectedTreeIndex(null);
        message.success("Card has been deleted.");
      },
      handleDiscard: () => {},
      handleCancel: () => {},
      saveText: "Delete",
      discardText: "Cancel",
      hideDiscard: true,
    });
  };

  const contextMenuItems = [
    {
      key: "duplicate",
      label: "Duplicate",
      icon: <Copy size={14} />,
      onClick: handleDuplicate,
    },
    {
      type: "divider",
    },
    {
      key: "delete",
      label: "Delete",
      icon: <Trash2 size={14} />,
      danger: true,
      onClick: handleDelete,
    },
  ];

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

  const handleClick = () => {
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
        handleCancel: () => {},
      });
    } else {
      onSelect();
    }
  };

  const isListItem =
    category?.type === "list" && card?.source === "40k-10e" && card?.cardType === "DataCard" && !card?.unitSize;

  const getCardIcon = () => {
    switch (card.cardType) {
      case "datasheet":
        return <Datacard />;
      case "DataCard":
        return <Datacard10e />;
      case "stratagem":
        return <Stratagem />;
      case "enhancement":
        return <Enhancement />;
      case "battlerule":
        return <Battlerule />;
      case "secondary":
        return <Secondary />;
      case "psychic":
        return <PsychicPower />;
      case "ganger":
      case "empty-ganger":
        return <Ganger />;
      case "vehicle":
      case "empty-vehicle":
        return <Vehicle />;
      default:
        return null;
    }
  };

  const isSelected = selectedTreeIndex === cardIndex;

  return (
    <>
      <Draggable key={`${cardIndex}-draggable`} draggableId={card.uuid} index={index}>
        {(provided, snapshot) => (
          <div
            className={classNames("tree-item-row", {
              selected: isSelected,
              dragging: snapshot.isDragging,
              "in-sub-category": isInSubCategory,
            })}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={provided.draggableProps.style}
            onClick={handleClick}
            onContextMenu={handleContextMenu}>
            <div className="tree-item-icon">{getCardIcon()}</div>
            <span className="tree-item-name">{card.name}</span>

            <div className="tree-item-indicators">
              {category?.type === "list" && card?.source === "40k-10e" && card?.selectedEnhancement && (
                <span
                  className="tree-item-indicator"
                  title={`Enhancement: ${capitalizeSentence(card?.selectedEnhancement?.name)} (+${
                    card?.selectedEnhancement?.cost
                  }pts)`}>
                  <Flame size={14} />
                </span>
              )}
              {category?.type === "list" && card?.source === "40k-10e" && card?.isWarlord && (
                <span className="tree-item-indicator" title="This unit is the warlord">
                  <Crown size={14} fill="currentColor" />
                </span>
              )}
            </div>

            {category?.type === "list" && card?.source === "40k-10e" && card?.unitSize?.cost && (
              <button
                className="tree-item-points"
                onClick={(e) => {
                  e.stopPropagation();
                  setModalVisible(true);
                }}>
                {Number(card?.unitSize?.cost) + (Number(card.selectedEnhancement?.cost) || 0)}
              </button>
            )}

            {isListItem && (
              <button
                className="tree-item-select"
                onClick={(e) => {
                  e.stopPropagation();
                  setModalVisible(true);
                }}>
                select
              </button>
            )}
          </div>
        )}
      </Draggable>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenuItems}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Keep existing unit config modal as-is */}
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
                  icon={<X size={14} />}
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
                  }}
                />
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
                      }}
                    />
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
