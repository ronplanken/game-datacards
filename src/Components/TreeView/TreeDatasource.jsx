import React, { useState } from "react";
import { ChevronRight, GripVertical, Trash2, Package, FolderOpen } from "lucide-react";
import { message } from "../Toast/message";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { ContextMenu } from "./ContextMenu";
import { confirmDialog } from "../ConfirmChangesModal";
import { deleteConfirmDialog } from "../DeleteConfirmModal";
import "./TreeView.css";

export function TreeDatasource({
  datasource,
  selectedTreeIndex,
  setSelectedTreeIndex,
  children,
  dragHandleProps = null,
}) {
  const {
    setActiveCard,
    setActiveCategory,
    removeLocalDatasource,
    saveActiveCard,
    cardUpdated,
    updateCategory,
    convertDatasourceToCategory,
  } = useCardStorage();

  const [contextMenu, setContextMenu] = useState(null);

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleDelete = () => {
    deleteConfirmDialog({
      title: `Delete '${datasource.name}'?`,
      content: "All cards in this datasource will be permanently deleted.",
      onConfirm: async () => {
        removeLocalDatasource(datasource.uuid);
        message.success("Datasource deleted.");
      },
    });
  };

  const handleConvertToCategory = () => {
    confirmDialog({
      title: "Convert to category?",
      content:
        "Cards will be preserved but datasource metadata (ID, version, author, colours, publishing state) will be removed.",
      saveText: "Convert",
      handleSave: () => {
        const result = convertDatasourceToCategory(datasource.uuid);
        if (result.success) {
          message.success("Datasource converted to category.");
        } else {
          message.error(result.error || "Failed to convert datasource.");
        }
      },
      handleCancel: () => {},
    });
  };

  const contextMenuItems = [
    {
      key: "convert-category",
      label: "Convert to Category",
      icon: <FolderOpen size={14} />,
      onClick: handleConvertToCategory,
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
    if (selectedTreeIndex === `ds-${datasource.uuid}`) {
      setSelectedTreeIndex(null);
      setActiveCard(null);
      setActiveCategory(null);
    } else {
      setSelectedTreeIndex(`ds-${datasource.uuid}`);
      setActiveCard(null);
      setActiveCategory(datasource);
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
    updateCategory({ ...datasource, closed: !datasource.closed }, datasource.uuid);
  };

  const isSelected = selectedTreeIndex === `ds-${datasource.uuid}`;

  const datasourceClasses = ["tree-datasource", isSelected ? "selected" : ""].filter(Boolean).join(" ");

  return (
    <>
      <div className={datasourceClasses} onClick={handleClick} onContextMenu={handleContextMenu}>
        {dragHandleProps && (
          <span
            className="tree-drag-handle"
            {...dragHandleProps}
            aria-label="Drag to reorder"
            onClick={(e) => e.stopPropagation()}>
            <GripVertical size={12} />
          </span>
        )}
        <div className={`tree-datasource-toggle ${!datasource.closed ? "expanded" : ""}`} onClick={handleToggle}>
          <ChevronRight size={10} />
        </div>
        <div className="tree-datasource-icon">
          <Package size={14} />
        </div>
        <span className="tree-datasource-name">{datasource.name}</span>
      </div>

      {!datasource.closed && children}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenuItems}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  );
}
