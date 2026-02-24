# Draggable Tree Component

> A modern, interactive tree view component with drag-and-drop support, designed for the Game Datacards Welcome Wizard. Supports both dark and light themes.

## Overview

The Draggable Tree component provides a visual representation of hierarchical data (categories and cards) with the following features:

- **Drag and drop** - Reorder items and move between categories
- **Expand/Collapse** - Toggle category visibility
- **Visual feedback** - Hover, active, and drag states
- **Theme support** - Dark (default) and light variants
- **Internal state management** - Component manages its own tree state

### Drag and Drop Behavior

| Action | Result |
|--------|--------|
| Drop card onto category | Card moves into that category (category auto-expands) |
| Drop card onto another card | Card inserts before the target card |
| Drop category onto category | Category moves into target as nested category |
| Drop onto self | No change (ignored) |

## Visual Design

### Anatomy

```
┌─────────────────────────────────────────────────┐
│ ⋮⋮  📁  Category Name                      ▶   │  ← Category (collapsible)
├─────────────────────────────────────────────────┤
│     ⋮⋮  📄  Card Name                          │  ← Child item (indented)
│     ⋮⋮  📄  Another Card                       │
└─────────────────────────────────────────────────┘
```

| Element | Description |
|---------|-------------|
| Grip handle (⋮⋮) | Indicates draggable, shows on all items |
| Icon | Folder (open/closed) for categories, FileText for cards |
| Name | Item label, truncates on overflow |
| Expand chevron | Only on categories, rotates 90° when expanded |

### States

| State | Visual Change |
|-------|---------------|
| Default | Subtle background, muted border |
| Hover | Elevated background, blue-tinted border |
| Active (dragging) | Scaled down (98%), grabbing cursor |
| Drag over | Primary color border highlight |
| Category | Slight blue tint background |

## Color Tokens

### Dark Theme (Default)

```css
--tree-bg: #0a1628;
--tree-bg-elevated: #162a46;
--tree-bg-category: rgba(22, 119, 255, 0.05);
--tree-border: rgba(255, 255, 255, 0.08);
--tree-border-hover: rgba(22, 119, 255, 0.3);
--tree-border-category: rgba(22, 119, 255, 0.2);
--tree-text: #f1f5f9;
--tree-text-dim: #64748b;
--tree-icon-category: #4096ff;
--tree-primary: #1677ff;
```

### Light Theme

```css
--tree-bg: #ffffff;
--tree-bg-elevated: #f8fafc;
--tree-bg-category: rgba(22, 119, 255, 0.04);
--tree-border: #e2e8f0;
--tree-border-hover: rgba(22, 119, 255, 0.4);
--tree-border-category: rgba(22, 119, 255, 0.25);
--tree-text: #1e293b;
--tree-text-dim: #64748b;
--tree-icon-category: #1677ff;
--tree-primary: #1677ff;
```

## Spacing & Sizing

| Property | Value |
|----------|-------|
| Item padding | 10px 12px |
| Item gap (between icon/text) | 8px |
| Item border radius | 6px |
| Child indent | 24px |
| Icon size | 18px |
| Font size | 13px |
| Gap between items | 4px |

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
  theme="dark"
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `treeData` | `Array` | Required | Initial hierarchical data structure |
| `onToggle` | `Function` | Optional | Called when category expand/collapse is clicked |
| `theme` | `"dark" \| "light"` | `"dark"` | Color theme variant |

> **Note:** The component maintains internal state for drag-and-drop operations. The `treeData` prop is used as the initial state, and changes from drag operations are managed internally. If you need to sync external changes, the component will update when `treeData` prop changes.

### Data Structure

```typescript
interface TreeItem {
  id: string;           // Unique identifier
  name: string;         // Display label
  type: "category" | "card";
  expanded?: boolean;   // Only for categories
  children?: TreeItem[]; // Only for categories
}
```

## CSS Classes

| Class | Description |
|-------|-------------|
| `.wz-tree` | Container element |
| `.wz-tree--light` | Light theme modifier |
| `.wz-tree-item` | Individual tree row |
| `.wz-tree-item--category` | Category-specific styling |
| `.wz-tree-item--child` | Indented child item |
| `.wz-tree-item--dragging` | Currently being dragged |
| `.wz-tree-item--drag-over` | Drop target highlight |
| `.wz-tree-icon` | Icon container |
| `.wz-tree-name` | Text label |
| `.wz-tree-expand` | Chevron button |
| `.wz-tree-expand--expanded` | Rotated state |
| `.wz-tree-grip` | Drag handle |

## Animation

```css
/* Hover transition */
transition: all 0.15s ease;

/* Active scale */
transform: scale(0.98);

/* Expand chevron rotation */
transition: transform 0.2s;
transform: rotate(90deg); /* when expanded */
```

## Accessibility

- Items are `draggable` with proper drag events
- Expand buttons have `cursor: pointer`
- `user-select: none` prevents text selection during drag
- Color contrast meets WCAG AA standards in both themes

## Integration Example

```jsx
// In a wizard or settings panel
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
      theme={isDarkMode ? "dark" : "light"}
    />
  </div>
);
```

## File Locations

- **Component**: `src/Components/WelcomeWizard/demos/TreeViewDemo.jsx`
- **Styles**: `src/Components/WelcomeWizard/WelcomeWizard.css` (search for "Tree Demo")
- **Sample Data**: `src/Components/WelcomeWizard/constants.js` (`DEMO_TREE_DATA`)
