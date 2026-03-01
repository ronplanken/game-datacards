import React, { useState } from "react";
import { Copy, Crown, Trash2, Flame } from "lucide-react";
import { Tooltip } from "../Tooltip/Tooltip";
import { message } from "../Toast/message";
import classNames from "classnames";
import { Draggable } from "react-beautiful-dnd";
import { v4 as uuidv4 } from "uuid";
import { capitalizeSentence } from "../../Helpers/external.helpers";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { Datacard } from "../../Icons/Datacard";
import { Datacard10e } from "../../Icons/Datacard10e";
import { Ganger } from "../../Icons/Ganger";
import { PsychicPower } from "../../Icons/PsychicPower";
import { Secondary } from "../../Icons/Secondary";
import { Stratagem } from "../../Icons/Stratagem";
import { Vehicle } from "../../Icons/Vehicle";
import { Enhancement } from "../../Icons/Enhancement";
import { Battlerule } from "../../Icons/Battlerule";
import { Warscroll } from "../../Icons/Warscroll";
import { Spell } from "../../Icons/Spell";
import { Rule } from "../../Icons/Rule";
import { useUmami } from "../../Hooks/useUmami";
import { confirmDialog } from "../ConfirmChangesModal";
import { deleteConfirmDialog } from "../DeleteConfirmModal";
import { ContextMenu } from "./ContextMenu";
import { UnitConfigModal } from "./UnitConfigModal";
import "./TreeView.css";

export function TreeItem({
  card,
  category,
  selectedTreeIndex,
  setSelectedTreeIndex,
  index,
  isInSubCategory = false,
  isInDatasource = false,
}) {
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
  const { trackEvent } = useUmami();
  const cardIndex = `card-${card.uuid}`;

  const [modalVisible, setModalVisible] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);

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
    trackEvent("card-duplicate", { cardType: card.cardType });
  };

  const handleDelete = () => {
    deleteConfirmDialog({
      title: "Are you sure you want to delete this card?",
      content: "This action cannot be undone.",
      onConfirm: () => {
        removeCardFromCategory(card.uuid, category.uuid);
        setActiveCard(null);
        setSelectedTreeIndex(null);
        trackEvent("card-delete", { cardType: card.cardType });
        message.success("Card has been deleted.");
      },
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
      case "warscroll":
        return <Warscroll />;
      case "spell":
        return <Spell />;
      case "rule":
        return <Rule />;
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
              "in-datasource": isInDatasource,
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
                <Tooltip
                  content={`${capitalizeSentence(card?.selectedEnhancement?.name)} (+${card?.selectedEnhancement?.cost}pts)`}
                  placement="top">
                  <span className="tree-item-indicator enhancement">
                    <Flame size={12} />
                  </span>
                </Tooltip>
              )}
              {category?.type === "list" && card?.source === "40k-10e" && card?.isWarlord && (
                <Tooltip content="Warlord - Army Commander" placement="top">
                  <span className="tree-item-indicator warlord">
                    <Crown size={12} fill="currentColor" />
                  </span>
                </Tooltip>
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

      <UnitConfigModal
        isOpen={modalVisible}
        onClose={() => setModalVisible(false)}
        card={card}
        category={category}
        onSave={(updatedCard) => {
          saveCard(updatedCard, category);
          setModalVisible(false);
          message.success(`${card.name} updated.`);
        }}
      />
    </>
  );
}
