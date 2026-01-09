import React, { useState, useEffect } from "react";
import { Folder, FolderOpen, FileText, ChevronRight, GripVertical } from "lucide-react";

/**
 * Interactive tree view demo for the workspace step
 *
 * @param {Object} props
 * @param {Array} props.treeData - Hierarchical tree data
 * @param {Function} props.onToggle - Callback when category is expanded/collapsed
 * @param {"dark" | "light"} props.theme - Color theme variant (default: "dark")
 */
export const TreeViewDemo = ({ treeData: initialTreeData, onToggle, theme = "dark" }) => {
  const [treeData, setTreeData] = useState(initialTreeData);
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedItemParent, setDraggedItemParent] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);

  // Sync with external data changes
  useEffect(() => {
    setTreeData(initialTreeData);
  }, [initialTreeData]);

  // Find an item and its parent in the tree
  const findItemAndParent = (items, itemId, parent = null) => {
    for (const item of items) {
      if (item.id === itemId) {
        return { item, parent };
      }
      if (item.children) {
        const result = findItemAndParent(item.children, itemId, item);
        if (result) return result;
      }
    }
    return null;
  };

  // Remove an item from its current location
  const removeItem = (items, itemId) => {
    return items
      .filter((item) => item.id !== itemId)
      .map((item) => {
        if (item.children) {
          return { ...item, children: removeItem(item.children, itemId) };
        }
        return item;
      });
  };

  // Add an item to a category's children
  const addItemToCategory = (items, categoryId, newItem) => {
    return items.map((item) => {
      if (item.id === categoryId && item.type === "category") {
        return {
          ...item,
          expanded: true, // Auto-expand when dropping into
          children: [...(item.children || []), newItem],
        };
      }
      if (item.children) {
        return { ...item, children: addItemToCategory(item.children, categoryId, newItem) };
      }
      return item;
    });
  };

  // Insert an item before another item (for reordering)
  const insertItemBefore = (items, targetId, newItem, parentId = null) => {
    const result = [];
    for (const item of items) {
      if (item.id === targetId) {
        result.push(newItem);
      }
      if (item.children) {
        result.push({ ...item, children: insertItemBefore(item.children, targetId, newItem, item.id) });
      } else {
        result.push(item);
      }
    }
    return result;
  };

  const handleDragStart = (e, item, parentId) => {
    setDraggedItem(item);
    setDraggedItemParent(parentId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", item.id);
  };

  const handleDragOver = (e, item) => {
    e.preventDefault();
    if (draggedItem && draggedItem.id !== item.id) {
      setDragOverItem(item.id);
    }
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  const handleDrop = (e, targetItem) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedItem || draggedItem.id === targetItem.id) {
      setDraggedItem(null);
      setDraggedItemParent(null);
      setDragOverItem(null);
      return;
    }

    // Don't allow dropping a category into itself or its children
    if (draggedItem.type === "category" && targetItem.type === "card") {
      const targetParent = findItemAndParent(treeData, targetItem.id)?.parent;
      if (targetParent && targetParent.id === draggedItem.id) {
        setDraggedItem(null);
        setDraggedItemParent(null);
        setDragOverItem(null);
        return;
      }
    }

    let newTreeData = removeItem(treeData, draggedItem.id);

    if (targetItem.type === "category") {
      // Drop into a category - add as child
      newTreeData = addItemToCategory(newTreeData, targetItem.id, { ...draggedItem });
    } else {
      // Drop onto a card - insert before it
      newTreeData = insertItemBefore(newTreeData, targetItem.id, { ...draggedItem });
    }

    setTreeData(newTreeData);
    setDraggedItem(null);
    setDraggedItemParent(null);
    setDragOverItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDraggedItemParent(null);
    setDragOverItem(null);
  };

  const handleToggle = (itemId) => {
    setTreeData((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return { ...item, expanded: !item.expanded };
        }
        if (item.children) {
          return {
            ...item,
            children: item.children.map((child) =>
              child.id === itemId ? { ...child, expanded: !child.expanded } : child
            ),
          };
        }
        return item;
      })
    );
    onToggle?.(itemId);
  };

  const renderItem = (item, parentId = null, isChild = false) => {
    const isCategory = item.type === "category";
    const isDragging = draggedItem?.id === item.id;
    const isDragOver = dragOverItem === item.id;

    return (
      <div key={item.id}>
        <div
          className={`wz-tree-item ${isCategory ? "wz-tree-item--category" : ""} ${
            isChild ? "wz-tree-item--child" : ""
          } ${isDragging ? "wz-tree-item--dragging" : ""} ${isDragOver ? "wz-tree-item--drag-over" : ""}`}
          draggable
          onDragStart={(e) => handleDragStart(e, item, parentId)}
          onDragOver={(e) => handleDragOver(e, item)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, item)}
          onDragEnd={handleDragEnd}
          style={{
            opacity: isDragging ? 0.5 : 1,
            borderColor: isDragOver ? "var(--wz-primary)" : undefined,
            boxShadow: isDragOver ? "0 0 0 2px rgba(22, 119, 255, 0.3)" : undefined,
          }}>
          <GripVertical className="wz-tree-grip" size={14} style={{ color: "var(--wz-text-dim)", opacity: 0.5 }} />

          {isCategory ? (
            item.expanded ? (
              <FolderOpen className="wz-tree-icon" size={18} />
            ) : (
              <Folder className="wz-tree-icon" size={18} />
            )
          ) : (
            <FileText className="wz-tree-icon" size={18} />
          )}

          <span className="wz-tree-name">{item.name}</span>

          {isCategory && (
            <ChevronRight
              className={`wz-tree-expand ${item.expanded ? "wz-tree-expand--expanded" : ""}`}
              size={18}
              onClick={(e) => {
                e.stopPropagation();
                handleToggle(item.id);
              }}
              style={{ cursor: "pointer" }}
            />
          )}
        </div>

        {/* Render children if category is expanded */}
        {isCategory && item.expanded && item.children && (
          <div className="wz-tree-children">{item.children.map((child) => renderItem(child, item.id, true))}</div>
        )}
      </div>
    );
  };

  const themeClass = theme === "light" ? "wz-tree--light" : "";

  return <div className={`wz-tree ${themeClass}`}>{treeData.map((item) => renderItem(item, null, false))}</div>;
};
