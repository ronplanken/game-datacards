import React, { useState } from "react";
import {
  CaretRightOutlined,
  DeleteOutlined,
  FolderOpenOutlined,
  FolderOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { message } from "antd";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { List } from "../../Icons/List";
import { ContextMenu } from "./ContextMenu";
import { RenameModal } from "./RenameModal";
import { confirmDialog } from "../ConfirmChangesModal";
import "./TreeView.css";

export function TreeCategory({ category, selectedTreeIndex, setSelectedTreeIndex, children, isSubCategory = false }) {
  const {
    cardStorage,
    setActiveCard,
    setActiveCategory,
    removeCategory,
    saveActiveCard,
    renameCategory,
    cardUpdated,
    updateCategory,
    addSubCategory,
    getSubCategories,
  } = useCardStorage();

  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isSubCategoryModalOpen, setIsSubCategoryModalOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);

  const handleRename = (newName) => {
    renameCategory(category.uuid, newName);
    setIsRenameModalOpen(false);
    message.success("Category has been renamed.");
  };

  const handleAddSubCategory = (name) => {
    addSubCategory(name, category.uuid);
    setIsSubCategoryModalOpen(false);
    message.success("Sub-category has been created.");
  };

  const pointsTotal = category.cards?.reduce((total, card) => {
    if (card?.source === "40k-10e" && card?.unitSize?.cost) {
      if (card.selectedEnhancement) {
        return total + Number(card?.unitSize?.cost) + Number(card.selectedEnhancement.cost);
      }
      return total + Number(card?.unitSize?.cost);
    }
    return total;
  }, 0);

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleDelete = () => {
    const subCategories = getSubCategories(category.uuid);
    const hasSubCategories = subCategories.length > 0;
    const deleteMessage = hasSubCategories
      ? "This action cannot be undone and will delete all cards and sub-categories in this category."
      : "This action cannot be undone and will delete all cards in the category.";

    confirmDialog({
      title: "Are you sure you want to delete this category?",
      content: deleteMessage,
      handleSave: () => {
        message.success("Category has been removed.");
        removeCategory(category.uuid);
      },
      handleDiscard: () => {},
      handleCancel: () => {},
      saveText: "Delete",
      discardText: "Cancel",
      hideDiscard: true,
    });
  };

  // Can add sub-category if: type is "category" AND not already a sub-category
  const canAddSubCategory = category.type === "category" && !isSubCategory;

  // Count top-level categories (to prevent deleting the last one)
  const topLevelCategoryCount = cardStorage.categories.filter((cat) => !cat.parentId).length;

  const contextMenuItems = [
    // Add sub-category option (only for regular categories, not sub-categories)
    ...(canAddSubCategory
      ? [
          {
            key: "add-subcategory",
            label: "Add sub-category",
            icon: <PlusOutlined />,
            onClick: () => setIsSubCategoryModalOpen(true),
          },
          {
            type: "divider",
          },
        ]
      : []),
    {
      key: "rename",
      label: "Rename",
      onClick: () => setIsRenameModalOpen(true),
    },
    {
      type: "divider",
    },
    {
      key: "delete",
      label: "Delete",
      icon: <DeleteOutlined />,
      danger: true,
      // Disable delete if this is the last top-level category (sub-categories can always be deleted)
      disabled: !isSubCategory && topLevelCategoryCount === 1,
      onClick: handleDelete,
    },
  ];

  const onSelect = () => {
    if (selectedTreeIndex === `cat-${category.uuid}`) {
      setSelectedTreeIndex(null);
      setActiveCard(null);
      setActiveCategory(null);
    } else {
      setSelectedTreeIndex(`cat-${category.uuid}`);
      setActiveCard(null);
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

  const handleToggle = (e) => {
    e.stopPropagation();
    updateCategory({ ...category, closed: !category.closed }, category.uuid);
  };

  const isSelected = selectedTreeIndex === `cat-${category.uuid}`;

  const categoryClasses = ["tree-category", isSelected ? "selected" : "", isSubCategory ? "sub-category" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <div className={categoryClasses} onClick={handleClick} onContextMenu={handleContextMenu}>
        <div className={`tree-category-toggle ${!category.closed ? "expanded" : ""}`} onClick={handleToggle}>
          <CaretRightOutlined style={{ fontSize: 10 }} />
        </div>
        <div className="tree-category-icon">
          {category.type === "list" ? <List /> : isSubCategory ? <FolderOpenOutlined /> : <FolderOutlined />}
        </div>
        <span className="tree-category-name">{category.name}</span>
        {category.type === "list" && <span className="tree-category-badge">{pointsTotal}</span>}
      </div>

      {!category.closed && children}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenuItems}
          onClose={() => setContextMenu(null)}
        />
      )}

      <RenameModal
        isOpen={isRenameModalOpen}
        title="Rename category"
        initialValue={category.name}
        onConfirm={handleRename}
        onCancel={() => setIsRenameModalOpen(false)}
      />

      <RenameModal
        isOpen={isSubCategoryModalOpen}
        title="Add sub-category"
        initialValue=""
        onConfirm={handleAddSubCategory}
        onCancel={() => setIsSubCategoryModalOpen(false)}
      />
    </>
  );
}
