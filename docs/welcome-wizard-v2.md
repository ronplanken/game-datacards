---
title: Welcome Wizard v2.0.0
description: Onboarding wizard that introduces new users to Game Datacards features and guides game system selection
category: features
tags: [onboarding, wizard, game-systems, ux]
version: "2.0.0"
related:
  - draggable-tree-component.md
file_locations:
  entry: src/Components/WelcomeWizard/index.jsx
  styles: src/Components/WelcomeWizard/WelcomeWizard.css
  constants: src/Components/WelcomeWizard/constants.js
  hook: src/Components/WelcomeWizard/hooks/useWelcomeWizard.js
---

# Welcome Wizard v2.0.0

The Welcome Wizard is the primary onboarding experience for new Game Datacards users. It showcases platform features, guides game system selection, and provides interactive demos.

## Table of Contents

- [Overview](#overview)
- [Wizard Steps](#wizard-steps)
- [Supported Game Systems](#supported-game-systems)
- [Platform Features Catalog](#platform-features-catalog)
- [Component Architecture](#component-architecture)
- [State Management](#state-management)
- [Configuration Constants](#configuration-constants)
- [Design Tokens](#design-tokens)
- [Integration Points](#integration-points)

## Overview

### Goals

- Introduce users to all major platform features
- Guide game system selection with informed choices
- Demonstrate core workflows through interactive demos
- Present cloud sync and subscription value proposition
- Highlight community and mobile companion features

## Wizard Steps

The wizard has 9 steps (8 when the subscription step is hidden). The subscription step is conditionally shown based on premium mode and paid tier feature flag.

| Step | ID | Title | Required | Description |
|------|----|-------|----------|-------------|
| 0 | `welcome` | Welcome | No | Animated intro with feature highlight carousel |
| 1 | `game-system` | Choose Your Game | Yes | Select primary game system (required to proceed) |
| 2 | `workspace` | Your Workspace | No | Interactive tree view demo, workspace overview |
| 3 | `adding-cards` | Adding Cards | No | Card explorer and adding cards workflow |
| 4 | `data-portability` | Import, Export & Print | No | Tab interface showing import/export/print features |
| 5 | `subscription` | Premium Options | No | Subscription tiers (conditional: premium + paid tier) |
| 6 | `cloud-sync` | Cloud Sync | No | Cloud sync and multi-device features |
| 7 | `explore-more` | Explore More | No | Community marketplace and mobile companion |
| 8 | `complete` | Get Started | No | Summary and quick action buttons |

### Step Details

#### Step 0: Welcome
- Animated Game Datacards logo
- Tagline: "Create, customize, and share datacards for your favorite tabletop games"
- Feature highlight cards (auto-rotating): "6 Game Systems", "Print-Ready Cards", "Cloud Sync", "Community Content"
- "Skip Tutorial" option for returning users

#### Step 1: Choose Your Game
- 6 game system cards in a grid
- Each card shows name, subtitle, description, colored accent bar, and optional tag (Popular/New/Legacy)
- Single selection required to proceed
- Selected card gets visual highlight

#### Step 2: Your Workspace
- Split layout with interactive tree view demo on left
- Right side shows workspace description text
- Pre-populated with sample categories ("My Army", "Characters") and sample cards
- Drag items to reorder, click to expand/collapse categories

#### Step 3: Adding Cards
- Card explorer and adding cards workflow demo

#### Step 4: Import, Export & Print
- Tab interface with 3 tabs: Import, Export, Print
- Each tab lists available formats and options
- Informational only (no actual import/export in wizard)

#### Step 5: Premium Options (Conditional)
- Only shown when `hasSubscription` and `paidTierEnabled` are both true
- Imported from the Premium package (`StepSubscription`)
- Shows subscription tier comparison

#### Step 6: Cloud Sync
- Cloud sync and multi-device feature overview
- Interactive mock demos: `MockHeaderBar`, `MockTreeRow`, `MockConflictDialog`

#### Step 7: Explore More
- Feature cards for Community Marketplace and Mobile Companion
- Informational, non-interactive

#### Step 8: Get Started
- Completion summary with selected game system
- Quick action buttons: Browse Units, Create Category, Open Settings
- Discord community link
- "Don't show again" checkbox

## Supported Game Systems

| System | ID | Color | Tag | Description |
|--------|----|-------|-----|-------------|
| Warhammer 40K 10th Edition | `40k-10e` | `#dc2626` | Popular | Community-maintained datacards |
| Age of Sigmar 4th Edition | `aos` | `#ca8a04` | New | Community-maintained warscrolls |
| Combat Patrol 10th Edition | `40k-10e-cp` | `#0891b2` | - | Simplified Combat Patrol cards |
| Necromunda | `necromunda` | `#a05236` | - | Fighter cards for skirmish games |
| Basic Cards | `basic` | `#6366f1` | - | Fully custom cards from scratch |
| Wahapedia Import 9th Edition | `40k` | `#737373` | Legacy | Import from Wahapedia data |

## Platform Features Catalog

### Card Management
- Hierarchical category tree with drag-and-drop reordering
- Nested parent/child category relationships
- Right-click context menus for actions
- Search and filtering across categories
- Auto-save functionality

### Import & Export

**Import Formats:**

| Format | Description |
|--------|-------------|
| GDC JSON | Native Game Datacards format (backup/restore, sharing) |
| GW App | Games Workshop app list format |

**Export Formats:**

| Format | Description |
|--------|-------------|
| JSON | Full category with cards (sharing, backup) |
| GW App | Compatible with GW app |
| PNG Images | Individual card images (social sharing, TTS) |
| Datasource | Convert to custom datasource format |

### Print Features
- Paper sizes: A4, A5, Letter, Half-Letter
- Orientation: Portrait, Landscape
- Cards per page layout customization

### Cloud Sync & Accounts (Premium)
- Real-time category sync to cloud
- Multi-device access
- Email/password and Google OAuth authentication
- Two-factor authentication (2FA)

### Subscription Tiers

| Feature | Free | Premium | Creator |
|---------|------|---------|---------|
| Cloud Categories | 2 | 50 | 250 |
| Custom Datasources | 0 | 2 | 10 |
| Upload Datasources | No | Yes | Yes |
| Publish to Community | No | Yes | Yes |
| Price | Free | 3.99/mo | 7.99/mo |

### Custom Datasources (Premium)
- Import from URL or local JSON file
- Export categories as datasource format
- Version management with semantic versioning
- Update checking for URL sources

### Community Marketplace
- Browse and subscribe to public datasources
- Search by game system
- Premium/Creator users can publish and push updates

### Mobile Companion
- Touch-optimized card viewing
- PWA support (installable)
- Cross-device sync with desktop

## Component Architecture

```
src/Components/WelcomeWizard/
├── index.jsx                    # Main orchestrator
├── WelcomeWizard.css            # Styles
├── constants.js                 # Configuration and sample data
├── hooks/
│   └── useWelcomeWizard.js      # State management hook
├── components/
│   ├── index.js                 # Barrel export
│   ├── WizardHeader.jsx         # Progress bar + title
│   ├── WizardSidebar.jsx        # Step navigation sidebar
│   ├── WizardFooter.jsx         # Navigation buttons
│   ├── StepTransition.jsx       # Step animation transitions
│   └── MobileProgress.jsx       # Mobile progress indicator
├── steps/
│   ├── index.js                 # Barrel export (includes StepSubscription from Premium)
│   ├── StepWelcome.jsx
│   ├── StepGameSystem.jsx
│   ├── StepWorkspace.jsx
│   ├── StepAddingCards.jsx
│   ├── StepDataPortability.jsx
│   ├── StepCloudSync.jsx
│   ├── StepExploreMore.jsx
│   └── StepComplete.jsx
└── demos/
    ├── index.js                 # Barrel export
    ├── TreeViewDemo.jsx         # Interactive drag-and-drop tree
    ├── CardEditorDemo.jsx       # Card stat editor demo
    ├── MockHeaderBar.jsx        # Mock app header for sync demo
    ├── MockTreeRow.jsx          # Mock tree row for sync demo
    ├── MockConflictDialog.jsx   # Mock conflict resolution dialog
    ├── MockComponents.css       # Styles for mock components
    └── __tests__/
        └── MockComponents.test.jsx
```

The `StepSubscription` component is imported from the Premium package via `steps/index.js`.

## State Management

The `useWelcomeWizard` hook manages all wizard state:

```javascript
// Hook signature
useWelcomeWizard(settings, updateSettings)

// Returned state
{
  // Navigation
  currentStep,          // number - current step index
  currentStepConfig,    // object - { key, id, title, required }
  totalSteps,           // number - count of visible steps
  progress,             // number - percentage (0-100)
  isFirstStep,          // boolean
  isLastStep,           // boolean
  completedSteps,       // Set<number> - completed step indices
  transitionDirection,  // "forward" | "backward"
  canProceed,           // boolean - whether Next is enabled
  visibleSteps,         // array - filtered WIZARD_STEPS

  // Navigation actions
  goToStep,             // (stepIndex, direction?) => void
  goNext,               // () => void
  goPrevious,           // () => void

  // Game system
  selectedGameSystem,   // string | null
  selectGameSystem,     // (systemId) => void

  // Demo state
  demoTreeData,         // array - TreeItem[] for tree demo
  demoCardData,         // object - { name, movement, toughness, save, wounds, leadership, objectiveControl }
  activeDataTab,        // string - "import" | "export" | "print"

  // Demo actions
  toggleTreeItem,       // (itemId) => void
  reorderTreeItems,     // (sourceId, targetId) => void
  updateDemoCard,       // (field, value) => void
  resetDemoCard,        // () => void
  setActiveDataTab,     // (tabId) => void
}
```

### Step Visibility Logic

The subscription step is filtered out when either `hasSubscription` (from `usePremiumFeatures`) or `paidTierEnabled` (from `useFeatureFlags`) is false:

```javascript
const visibleSteps = useMemo(() => {
  if (hasSubscription && paidTierEnabled) {
    return WIZARD_STEPS; // All 9 steps
  }
  return WIZARD_STEPS.filter((step) => step.id !== "subscription"); // 8 steps
}, [hasSubscription, paidTierEnabled]);
```

### Proceed Validation

Only the game-system step enforces a requirement (a game system must be selected).

## Configuration Constants

Defined in `constants.js`:

| Export | Description |
|--------|-------------|
| `WIZARD_VERSION` | `"2.0.0"` |
| `WIZARD_STEPS` | Array of 9 step config objects (`{ key, id, title, required }`) |
| `GAME_SYSTEMS` | Array of 6 game system objects |
| `FEATURE_HIGHLIGHTS` | Array of 4 feature cards for welcome carousel |
| `ADVANCED_FEATURES` | Array of 2 feature cards for explore-more step |
| `DATA_TABS` | Array of 3 tab configs (import/export/print) with items |
| `DEMO_TREE_DATA` | Sample tree data for workspace demo |
| `DEMO_CARD_DATA` | Sample card stats for editor demo |

## Design Tokens

```css
/* Colors */
--wz-bg-primary: #001529;
--wz-bg-secondary: #0a1f35;
--wz-accent-blue: #1677ff;
--wz-accent-gold: #f59e0b;
--wz-accent-rose: #f43f5e;
--wz-text-primary: #ffffff;
--wz-text-secondary: #94a3b8;

/* Game System Colors */
--wz-40k: #dc2626;
--wz-aos: #ca8a04;
--wz-cp: #0891b2;
--wz-necromunda: #a05236;
--wz-basic: #6366f1;
--wz-legacy: #737373;

/* Animation */
--wz-transition-enter: 0.35s cubic-bezier(0.22, 1, 0.36, 1);
--wz-transition-exit: 0.2s ease-out;
--wz-stagger-delay: 0.08s;
```

## Integration Points

| Hook/Component | Purpose |
|----------------|---------|
| `useSettingsStorage` | Persist wizard completion and game system selection |
| `usePremiumFeatures` | Check `hasSubscription` for subscription step visibility |
| `useFeatureFlags` | Check `paidTierEnabled` for subscription step visibility |
| `StepSubscription` | Imported from Premium package for subscription step content |
