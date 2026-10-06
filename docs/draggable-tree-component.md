---
title: Draggable Tree Component
description: Interactive tree view with drag-and-drop for the Welcome Wizard workspace step
category: components
tags: [wizard, tree-view, drag-and-drop, ui]
related:
  - welcome-wizard-v2.md
file_locations:
  component: src/Components/WelcomeWizard/demos/TreeViewDemo.jsx
  styles: src/Components/WelcomeWizard/WelcomeWizard.css
  sample_data: src/Components/WelcomeWizard/constants.js (DEMO_TREE_DATA)
---

# Draggable Tree Component

Interactive tree view component with drag-and-drop support, used in the Welcome Wizard workspace step. Supports hierarchical categories with expandable children.

## Table of Contents

- [Overview](#overview)
- [Props](#props)
- [Data Structure](#data-structure)
- [Drag and Drop Behavior](#drag-and-drop-behavior)
- [Visual Design](#visual-design)
- [CSS Classes](#css-classes)
- [Animation](#animation)
- [Usage](#usage)

## Overview

The `TreeViewDemo` component provides a visual representation of hierarchical data (categories and cards) with:

- **Drag and drop** - Reorder items and move between categories
- **Expand/Collapse** - Toggle category visibility
- **Selection** - Click to select/deselect items
- **Visual feedback** - Hover, selected, and drag-over states
- **Internal state management** - Component manages its own tree state from initial props

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `treeData` | `Array<TreeItem>` | Yes | Initial hierarchical data structure. Used as initial state; drag operations update internal state. |
| `onToggle` | `(itemId: string) => void` | No | Called when a category expand/collapse toggle is clicked |

The component syncs with external `treeData` changes via a `useEffect`.

## Data Structure

```typescript
interface TreeItem {
  id: string;           // Unique identifier
  name: string;         // Display label
  type: "category" | "card";
  expanded?: boolean;   // Only for categories - controls child visibility
  children?: TreeItem[]; // Only for categories - nested items
}
```

## Drag and Drop Behavior

| Action | Result |
|--------|--------|
| Drop card onto category | Card moves into that category (category auto-expands) |
| Drop card onto another card | Card inserts before the target card |
| Drop onto self | No change (ignored) |
| Drop category into its own child | No change (prevented) |

During drag, the source item renders at 50% opacity.

## Visual Design

### Anatomy

```
┌─────────────────────────────────────────────────┐
│  ▶  📁  Category Name                          │  ← Category (collapsible)
├─────────────────────────────────────────────────┤
│     ⋮⋮  🃏  Card Name                          │  ← Child card (indented)
│     ⋮⋮  🃏  Another Card                       │
└─────────────────────────────────────────────────┘
```

| Element | Description |
|---------|-------------|
| Toggle chevron (▶) | Only on categories, rotates 90deg when expanded |
| Icon | `FolderOpen`/`Folder` (categories), `Datacard10e` (cards) |
| Name | Item label |
| Grip handle (⋮⋮) | Drag handle, shown on card items only |

### States

| State | Visual Change |
|-------|---------------|
| Default | Subtle background, muted border |
| Selected | Elevated background, blue-tinted border |
| Drag over | Primary color border highlight |
| Dragging | 50% opacity |

## CSS Classes

| Class | Element |
|-------|---------|
| `.wz-tree` | Container element |
| `.wz-tree-category` | Category row |
| `.wz-tree-category--selected` | Selected category highlight |
| `.wz-tree-category--drag-over` | Category drop target highlight |
| `.wz-tree-toggle` | Chevron expand/collapse button |
| `.wz-tree-toggle--expanded` | Rotated chevron (90deg) when expanded |
| `.wz-tree-children` | Indented container for child items |
| `.wz-tree-card` | Card row |
| `.wz-tree-card--selected` | Selected card highlight |
| `.wz-tree-card--drag-over` | Card drop target highlight |
| `.wz-tree-icon` | Icon container (categories and cards) |
| `.wz-tree-name` | Text label |
| `.wz-tree-grip` | Drag handle icon (cards only) |

## Animation

```css
/* Expand chevron rotation */
transition: transform 0.2s;
transform: rotate(90deg); /* when .wz-tree-toggle--expanded */
```

## Usage

### Basic Usage

```jsx
import { TreeViewDemo } from "./demos/TreeViewDemo";

const treeData = [
  {
    id: "cat-1",
    name: "My Category",
    type: "category",
    expanded: true,
    children: [
      { id: "card-1", name: "Item One", type: "card" },
      { id: "card-2", name: "Item Two", type: "card" },
    ],
  },
];

<TreeViewDemo
  treeData={treeData}
  onToggle={(id) => handleToggle(id)}
/>
```

### Integration Example

```jsx
const [treeData, setTreeData] = useState(initialData);

const handleToggle = (itemId) => {
  setTreeData(prev =>
    prev.map(item =>
      item.id === itemId
        ? { ...item, expanded: !item.expanded }
        : item
    )
  );
};

return (
  <div className="panel">
    <h3>Your Categories</h3>
    <TreeViewDemo
      treeData={treeData}
      onToggle={handleToggle}
    />
  </div>
);
```
