import { CopyOutlined, DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { Dropdown, Menu, message, Modal } from "antd";
import React from "react";
import { Draggable } from "react-beautiful-dnd";
import { v4 as uuidv4 } from "uuid";
import { useCardStorage } from "../Hooks/useCardStorage";
import { Datacard } from "../Icons/Datacard";
import { Ganger } from "../Icons/Ganger";
import { Secondary } from "../Icons/Secondary";
import { Stratagem } from "../Icons/Stratagem";
import { Vehicle } from '../Icons/Vehicle';

const { confirm } = Modal;

export function TreeItem({ card, category, selectedTreeIndex, setSelectedTreeIndex, index }) {
  const { setActiveCard, setActiveCategory, cardUpdated, removeCardFromCategory, addCardToCategory } = useCardStorage();
  const cardIndex = `card-${card.uuid}`;

  const menu = (
    <Menu>
      <Menu.Item
        key="1"
        icon={<CopyOutlined />}
        onClick={() => {
          const newCard = {
            ...card,
            name: `${card.name} Copy`,
            isCustom: true,
            uuid: uuidv4(),
          };
          addCardToCategory(newCard);
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
    <Draggable key={`${cardIndex}-draggable`} draggableId={card.uuid} index={index}>
      {(provided, snapshot) => (
        <Dropdown overlay={menu} trigger={["contextMenu"]}>
          <div
            className={["tree-item-container", selectedTreeIndex === cardIndex ? "selected" : ""].join(" ")}
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={{
              paddingLeft: 24,
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
              {card.cardType === "stratagem" && <Stratagem />}
              {card.cardType === "secondary" && <Secondary />}
              {card.cardType === "ganger" && <Ganger />}
              {card.cardType === "vehicle" && <Vehicle />}
              {card.cardType === "empty-ganger" && <Ganger />}
              {card.cardType === "empty-vehicle" && <Vehicle />}
              &nbsp;{card.name}
            </div>
          </div>
        </Dropdown>
      )}
    </Draggable>
  );
}
