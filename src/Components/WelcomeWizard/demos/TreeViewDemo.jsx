import React, { useState, useEffect } from "react";
import { Folder, FolderOpen, ChevronRight, GripVertical } from "lucide-react";
import { Datacard10e } from "../../../Icons/Datacard10e";

/**
 * Interactive tree view demo for the workspace step
 * Styled to match the actual app's CategoryTree component
 *
 * @param {Object} props
 * @param {Array} props.treeData - Hierarchical tree data
 * @param {Function} props.onToggle - Callback when category is expanded/collapsed
 */
export const TreeViewDemo = ({ treeData: initialTreeData, onToggle }) => {
  const [treeData, setTreeData] = useState(initialTreeData);
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedItemParent, setDraggedItemParent] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

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

  const handleToggle = (e, itemId) => {
    e.stopPropagation();
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

  const handleSelect = (itemId) => {
    setSelectedItem(selectedItem === itemId ? null : itemId);
  };

  const renderCategory = (item) => {
    const isDragging = draggedItem?.id === item.id;
    const isDragOver = dragOverItem === item.id;
    const isSelected = selectedItem === item.id;

    return (
      <div key={item.id}>
        <div
          className={`wz-tree-category ${isSelected ? "wz-tree-category--selected" : ""} ${
            isDragOver ? "wz-tree-category--drag-over" : ""
          }`}
          draggable
          onDragStart={(e) => handleDragStart(e, item, null)}
          onDragOver={(e) => handleDragOver(e, item)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, item)}
          onDragEnd={handleDragEnd}
          onClick={() => handleSelect(item.id)}
          style={{ opacity: isDragging ? 0.5 : 1 }}>
          <div
            className={`wz-tree-toggle ${item.expanded ? "wz-tree-toggle--expanded" : ""}`}
            onClick={(e) => handleToggle(e, item.id)}>
            <ChevronRight size={10} />
          </div>
          <div className="wz-tree-icon">{item.expanded ? <FolderOpen size={14} /> : <Folder size={14} />}</div>
          <span className="wz-tree-name">{item.name}</span>
        </div>

        {/* Render children if category is expanded */}
        {item.expanded && item.children && (
          <div className="wz-tree-children">{item.children.map((child) => renderCard(child, item.id))}</div>
        )}
      </div>
    );
  };

  const renderCard = (item, parentId) => {
    const isDragging = draggedItem?.id === item.id;
    const isDragOver = dragOverItem === item.id;
    const isSelected = selectedItem === item.id;

    return (
      <div
        key={item.id}
        className={`wz-tree-card ${isSelected ? "wz-tree-card--selected" : ""} ${
          isDragOver ? "wz-tree-card--drag-over" : ""
        }`}
        draggable
        onDragStart={(e) => handleDragStart(e, item, parentId)}
        onDragOver={(e) => handleDragOver(e, item)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, item)}
        onDragEnd={handleDragEnd}
        onClick={() => handleSelect(item.id)}
        style={{ opacity: isDragging ? 0.5 : 1 }}>
        <GripVertical className="wz-tree-grip" size={12} />
        <div className="wz-tree-icon">
          <Datacard10e />
        </div>
        <span className="wz-tree-name">{item.name}</span>
      </div>
    );
  };

  return (
    <div className="wz-tree">
      {treeData.map((item) => (item.type === "category" ? renderCategory(item) : renderCard(item, null)))}
    </div>
  );
};
