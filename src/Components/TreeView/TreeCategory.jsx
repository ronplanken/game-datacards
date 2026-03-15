import React, { useState } from "react";
import { ChevronRight, GripVertical, Trash2, FolderOpen, Folder, Plus } from "lucide-react";
import { message } from "../Toast/message";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { useSync, CategorySyncIcon } from "../../Premium";
import { useUmami } from "../../Hooks/useUmami";
import { List } from "../../Icons/List";
import { ContextMenu } from "./ContextMenu";
import { RenameModal } from "./RenameModal";
import { confirmDialog } from "../ConfirmChangesModal";
import { deleteConfirmDialog } from "../DeleteConfirmModal";
import "./TreeView.css";

export function TreeCategory({
  category,
  selectedTreeIndex,
  setSelectedTreeIndex,
  children,
  isSubCategory = false,
  dragHandleProps = null,
}) {
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
  const { deleteFromCloud } = useSync();
  const { trackEvent } = useUmami();

  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isSubCategoryModalOpen, setIsSubCategoryModalOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);

  const handleRename = (newName) => {
    renameCategory(category.uuid, newName);
    setIsRenameModalOpen(false);
    trackEvent("category-rename");
    message.success("Category renamed.");
  };

  const handleAddSubCategory = (name) => {
    addSubCategory(name, category.uuid);
    setIsSubCategoryModalOpen(false);
    trackEvent("subcategory-create");
    message.success("Sub-category created.");
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
      ? "All cards and sub-categories will be permanently deleted."
      : "All cards in this category will be permanently deleted.";

    deleteConfirmDialog({
      title: `Delete '${category.name}'?`,
      content: deleteMessage,
      onConfirm: async () => {
        // If synced, also delete from cloud
        if (category.syncEnabled) {
          await deleteFromCloud(category.uuid);
        }
        trackEvent("category-delete");
        message.success("Category deleted.");
        removeCategory(category.uuid);
      },
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
            icon: <Plus size={14} />,
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
      icon: <Trash2 size={14} />,
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
        {dragHandleProps && (
          <span
            className="tree-drag-handle"
            {...dragHandleProps}
            aria-label="Drag to reorder"
            onClick={(e) => e.stopPropagation()}>
            <GripVertical size={12} />
          </span>
        )}
        <div className={`tree-category-toggle ${!category.closed ? "expanded" : ""}`} onClick={handleToggle}>
          <ChevronRight size={10} />
        </div>
        <div className="tree-category-icon">
          {category.type === "list" ? <List /> : isSubCategory ? <FolderOpen size={14} /> : <Folder size={14} />}
        </div>
        <span className="tree-category-name">{category.name}</span>
        <CategorySyncIcon category={category} />
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
