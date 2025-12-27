import React, { useState } from "react";
import { Dropdown, List } from "antd";
import classNames from "classnames";
import { ChevronDown, ChevronRight, CirclePlus, CopyPlus } from "lucide-react";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";
import { useSettingsStorage } from "../../Hooks/useSettingsStorage";
import { confirmDialog } from "../ConfirmChangesModal";
import { ContextMenu } from "../TreeView/ContextMenu";
import { buildCategoryMenuItems } from "../../util/menu-helper";

export const DataSourceList = ({ isLoading, dataSource, selectedFaction, setSelectedTreeIndex, onAddToCategory }) => {
  const { settings, updateSettings } = useSettingsStorage();
  const {
    cardUpdated,
    activeCard,
    setActiveCard,
    saveActiveCard,
    cardStorage: { categories },
  } = useCardStorage();
  const { dataSource: dsStorage } = useDataSourceStorage();

  const handleCardClick = (card) => {
    if (cardUpdated) {
      confirmDialog({
        title: "You have unsaved changes",
        content: "Do you want to save before switching?",
        handleSave: () => {
          saveActiveCard();
          setSelectedTreeIndex(null);
          setActiveCard(card);
        },
        handleDiscard: () => {
          setSelectedTreeIndex(null);
          setActiveCard(card);
        },
        handleCancel: () => {
          //do nothing
        },
      });
    } else {
      setSelectedTreeIndex(null);
      setActiveCard(card);
    }
  };

  const handleCategoryClick = (card) => {
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
  };

  const handleRoleClick = (card) => {
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
  };
  const handleAddCardToCategoryClick = (card, category = undefined) => {
    switch (card.type) {
      case "role":
        // add cards that belong to this role
        dataSource.filter((c) => c.role === card.name).forEach((i) => onAddToCategory(category, i));
        break;
      case undefined:
        onAddToCategory(category, card);
        break;
      default:
      case "header":
      case "category":
      case "allied":
        break;
    }
  };
  const [contextMenu, setContextMenu] = useState(null);

  const handleContextMenu = (e, card) => {
    e.preventDefault();
    e.stopPropagation();
    if (card.type === undefined) {
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        items: [
          {
            key: "clicked-item",
            label: <b>{card.name}</b>,
            disabled: true,
          },
          {
            key: "add-single",
            label: (
              <Dropdown
                getPopupContainer={(node) => node}
                menu={{
                  items: buildCategoryMenuItems(categories),
                  onClick: (e) => handleAddCardToCategoryClick(card, e.key),
                }}>
                <div>Add item to...</div>
              </Dropdown>
            ),
            icon: <CirclePlus size={14} />,
          },
        ],
      });
    } else if (card.type === "role") {
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        items: [
          {
            key: "clicked-item",
            label: <b>{card.name}</b>,
            disabled: true,
          },
          {
            key: "add-all",
            label: (
              <Dropdown
                getPopupContainer={(node) => node}
                menu={{
                  items: buildCategoryMenuItems(categories),
                  onClick: (e) => handleAddCardToCategoryClick(card, e.key),
                }}>
                <div>Add all items to..</div>
              </Dropdown>
            ),
            icon: <CopyPlus size={14} />,
          },
        ],
      });
    } else {
      // other items have no actions yet
    }
  };

  const renderItem = (card, index) => {
    if (card.type === "header") {
      return (
        <List.Item
          key={`list-header-${index}`}
          className={`list-header`}
          onClick={() => {}}
          onContextMenu={(e) => handleContextMenu(e, card)}>
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
            onClick={() => handleCategoryClick(card)}>
            onContextMenu={(e) => handleContextMenu(e, card)}
            <span className="icon">
              {settings?.mobile?.closedFactions?.includes(card.id) ? (
                <ChevronRight size={14} />
              ) : (
                <ChevronDown size={14} />
              )}
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
          onClick={() => handleCategoryClick(card)}
          onContextMenu={(e) => handleContextMenu(e, card)}>
          <span className="icon">
            {settings?.mobile?.closedFactions?.includes(card.id) ? (
              <ChevronRight size={14} />
            ) : (
              <ChevronDown size={14} />
            )}
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
          onClick={() => handleRoleClick(card)}
          onContextMenu={(e) => handleContextMenu(e, card)}>
          <span className="icon">
            {settings?.mobile?.closedRoles?.includes(card.name) ? (
              <ChevronRight size={14} />
            ) : (
              <ChevronDown size={14} />
            )}
          </span>
          <span className="name">{card.name}</span>
        </List.Item>
      );
    }

    // Check if item should be hidden due to collapsed section
    if (settings?.mobile?.closedFactions?.includes(card.faction_id) && card.allied) {
      return <></>;
    }
    if (settings?.mobile?.closedRoles?.includes(card.role)) {
      return <></>;
    }

    return (
      <List.Item
        key={`list-${card.id}`}
        onClick={() => handleCardClick(card)}
        className={classNames({
          "list-item": true,
          selected: activeCard && !activeCard.isCustom && activeCard.id === card.id,
          legends: card.legends,
        })}
        onContextMenu={(e) => handleContextMenu(e, card)}>
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
  };

  return (
    <>
      <List
        bordered
        size="small"
        loading={isLoading}
        dataSource={dataSource}
        style={{ overflowY: "auto", flex: 1, minHeight: 0 }}
        locale={{
          emptyText: selectedFaction ? "No datasheets found" : "No faction selected",
        }}
        renderItem={renderItem}
      />
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenu.items}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  );
};
