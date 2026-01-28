# Welcome Wizard v2.0.0 - Feature Documentation

> This document provides comprehensive documentation of the Game Datacards Welcome Wizard redesign, cataloging all platform features to be showcased during user onboarding.

## Table of Contents

1. [Overview](#overview)
2. [Current State Analysis](#current-state-analysis)
3. [Platform Features Catalog](#platform-features-catalog)
4. [Wizard Step Design](#wizard-step-design)
5. [Technical Specifications](#technical-specifications)

---

## Overview

The Welcome Wizard serves as the primary onboarding experience for new Game Datacards users. Version 2.0.0 represents a complete redesign to showcase the full breadth of platform capabilities that have evolved since version 1.0.

### Goals

- Introduce users to all major platform features
- Guide game system selection with informed choices
- Demonstrate core workflows through interactive demos
- Present cloud sync and subscription value proposition
- Highlight community and mobile companion features

---

## Current State Analysis

### Existing Wizard (v1.2.0)

| Step | Title | Content |
|------|-------|---------|
| 0 | Welcome | Basic introduction |
| 1 | Managing Cards | Tree view navigation |
| 2 | Adding Cards | Card explorer basics |
| 3 | Editing Cards | Card customization |
| 4 | Sharing Cards | Category sharing |
| 5 | Datasources | Game system selection |
| 6 | Thank You | Discord link |

### Gaps Identified

Features **not covered** in the current wizard:

- Cloud synchronization and multi-device support
- Subscription tiers (Free/Premium/Creator)
- Custom datasources (URL import, file upload, export)
- Community datasource marketplace
- Image export functionality
- Print customization options
- Account features (login, 2FA)
- Mobile companion experience
- Age of Sigmar 4th Edition
- GW App import/export format

---

## Platform Features Catalog

### 1. Supported Game Systems

| System | ID | Status | Description |
|--------|-----|--------|-------------|
| Warhammer 40K 10th Edition | `40k-10e` | Active | Full datasheet support, most popular |
| Age of Sigmar 4th Edition | `aos` | Active | Warscrolls, spell lores, manifestations |
| Combat Patrol 10th Edition | `40k-10e-cp` | Active | Simplified 40K subset |
| Necromunda | `necromunda` | Active | Gang warfare skirmish system |
| Basic Cards | `basic` | Active | Universal custom card creation |
| Wahapedia 9th Edition | `40k` | Legacy | Import from Wahapedia format |

### 2. Card Management

**Category System:**
- Hierarchical category tree with drag-and-drop reordering
- Nested parent/child category relationships
- Category types: Standard and List modes
- Right-click context menus for actions
- Search and filtering across categories

**Card Operations:**
- Add cards from faction databases
- Edit card properties with live preview
- Duplicate cards for variations
- Mark cards as custom/modified
- Auto-save functionality

### 3. Import & Export Capabilities

**Import Formats:**
| Format | Description | Use Case |
|--------|-------------|----------|
| GDC JSON | Native Game Datacards format | Backup/restore, sharing |
| GW App | Games Workshop app list format | Import existing army lists |
| Custom Datasource | External JSON datasources | Community content |
| URL Import | Load datasource from web URL | Live updating sources |

**Export Formats:**
| Format | Description | Use Case |
|--------|-------------|----------|
| GDC JSON | Full category with cards | Sharing, backup |
| GW App Format | Compatible with GW app | Cross-app usage |
| PNG Images | Individual card images | Social sharing, TTS |
| ZIP Archive | Batch image export | Bulk download |
| Datasource JSON | Convert to datasource | Publishing content |

### 4. Print Functionality

**Page Settings:**
- Paper sizes: A4, A5, Letter, Half-Letter, Custom
- Orientation: Portrait, Landscape
- Card alignment options
- Cards per page configuration
- Vertical alignment control

**Print Features:**
- Print preview with live updates
- Browser print dialog integration
- Print-optimized CSS styles
- Multi-page support
- Double-sided card handling

### 5. Cloud Sync & Account Features

**Authentication:**
- Email/password registration
- Google OAuth integration
- Two-factor authentication (2FA)
- Password reset via email
- Email verification

**Cloud Synchronization:**
- Real-time category sync to cloud
- Multi-device access
- Offline-first with sync on reconnect
- Conflict detection and resolution
- Device-specific tracking

### 6. Subscription Tiers

| Feature | Free | Premium | Creator |
|---------|------|---------|---------|
| Cloud Categories | 2 | 50 | 250 |
| Custom Datasources | 0 | 2 | 10 |
| Upload Datasources | No | Yes | Yes |
| Publish to Community | No | Yes | Yes |
| Push Updates | No | Yes | Yes |
| Price | Free | €3.99/mo | €7.99/mo |

### 7. Custom Datasources

**Capabilities:**
- Import from URL (HTTP/HTTPS endpoints)
- Import from local JSON file
- Export categories as datasource format
- Version management with semantic versioning
- Update checking for URL sources

**Validation Limits:**
- Maximum 10 factions per datasource
- Maximum 2000 cards total
- Maximum 200 character names
- Maximum 50 character versions

### 8. Community Marketplace

**For All Users:**
- Browse public datasources
- Subscribe to community content
- Search by game system
- View ratings and subscriber counts

**For Premium/Creator:**
- Upload datasources to cloud
- Publish datasources publicly
- Push updates to subscribers
- Share codes for direct linking

### 9. Mobile Companion

**Mobile Features:**
- Touch-optimized card viewing
- Faction drawer navigation
- GW App list import
- Offline card access
- Share functionality
- PWA support (installable)

**Cross-Device Sync:**
- View desktop categories on mobile
- Real-time sync updates
- Shared account access

### 10. Card Editing Features

**40K 10th Edition:**
- Unit datasheets with full stat editing
- Weapon profiles and loadouts
- Enhancement selection
- Keyword management
- Point calculations
- Stratagem, Enhancement, Rule cards

**Age of Sigmar:**
- Warscroll editing
- Stat wheel or badge display modes
- Spell and manifestation lores
- Faction color customization

**Universal Features:**
- Custom faction colors (header/banner)
- Markdown support in descriptions
- Zoom controls (25%-100%, Auto)
- Double-sided card toggle
- Fancy fonts option

---

## Wizard Step Design

### Desktop Wizard Flow (6 Steps)

#### Step 1: Welcome
**Purpose:** Create excitement and set expectations

**Content:**
- Animated Game Datacards logo
- Tagline: "Create, customize, and share datacards for your favorite tabletop games"
- Feature highlight cards (auto-rotating):
  - "6 Game Systems"
  - "Print-Ready Cards"
  - "Cloud Sync"
  - "Community Content"
- "Skip Tutorial" option for returning users

#### Step 2: Choose Your Game
**Purpose:** Select primary game system

**Content:**
- 6 game system cards in 2x3 grid
- Each card includes:
  - Game name and edition
  - Colored accent bar (game-specific)
  - Tags where applicable (Popular, New, Legacy)
- Selection required to proceed

**Game Systems Displayed:**
1. Warhammer 40K 10th Edition (Popular tag, red accent)
2. Age of Sigmar 4th Edition (New tag, gold accent)
3. Combat Patrol 10th Edition (cyan accent)
4. Necromunda (brown accent)
5. Basic Cards (indigo accent)
6. Wahapedia 9th Edition (Legacy tag, gray accent)

**Interaction:**
- Click to select (single selection)
- Selected card gets glow effect + checkmark

#### Step 3: Your Workspace
**Purpose:** Demonstrate card management and editing through hands-on interaction

**Content:**
- Split view layout:
  - Left: Interactive tree view demo
  - Right: Live card editor with preview
- Brief instructional text above each section

**Interactive Demo - Tree View:**
- Pre-populated with sample categories ("My Army", "Characters", "Units")
- Drag items to reorder
- Click to expand/collapse categories
- Right-click shows context menu preview

**Interactive Demo - Card Editor:**
- Editable unit name field
- Stat adjustment with clickable +/- buttons
- Live card preview updates in real-time as user types/clicks

#### Step 4: Import, Export & Print
**Purpose:** Showcase data portability features

**Content:**
- Tab interface with 3 tabs:
  1. **Import** - JSON files, GW App format
  2. **Export** - JSON, GW App format, PNG images, Datasource format
  3. **Print** - Paper sizes, orientation, cards per page slider

**Interaction:**
- Click tabs to switch views
- Each tab shows visual preview/illustration
- Informational only (no actual import/export in wizard)

#### Step 5: Explore More
**Purpose:** Introduce advanced features without requiring account action

**Content:**
- 3 feature cards in a row (informational, non-interactive):
  1. **Cloud Sync** - "Access your cards from any device"
  2. **Community Marketplace** - "Browse and share custom datasources"
  3. **Mobile Companion** - "View your cards on the go"
- Small text below: "Create an account in Settings to unlock cloud features"

**Design:**
- Cards have subtle gradient backgrounds
- Icons for each feature (Cloud, Store, Smartphone)
- No auth buttons or account prompts

#### Step 6: Get Started
**Purpose:** Completion and next steps

**Content:**
- "You're all set!" heading
- Summary of selected game system
- Quick action buttons:
  - "Browse Units" (primary CTA)
  - "Create Category"
  - "Open Settings"
- Discord community link
- "Don't show again" checkbox

---

### Mobile Wizard Flow (6 Steps)

| Step | Title | Key Content |
|------|-------|-------------|
| 1 | Welcome | Logo, 3-feature highlights |
| 2 | Import Your List | GW App import instructions |
| 3 | Desktop Features | Teaser for full editor |
| 4 | Choose Game | 40K or AoS selection |
| 5 | Game Settings | System-specific options |
| 6 | Ready | Browse CTA, completion |

---

## Technical Specifications

### Component Architecture

```
src/Components/WelcomeWizard/
├── index.jsx                    # Main orchestrator
├── WelcomeWizard.css           # Styles
├── constants.js                 # Configuration
├── hooks/
│   └── useWelcomeWizard.js     # State management
├── components/
│   ├── WizardHeader.jsx        # Progress + title
│   ├── WizardSidebar.jsx       # Step navigation
│   ├── WizardFooter.jsx        # Navigation buttons
│   └── StepTransition.jsx      # Animations
├── steps/
│   ├── StepWelcome.jsx
│   ├── StepGameSystem.jsx
│   ├── StepCardManagement.jsx
│   ├── StepCardEditor.jsx
│   ├── StepImportExport.jsx
│   ├── StepPrinting.jsx
│   ├── StepAccountSync.jsx
│   ├── StepSubscription.jsx
│   ├── StepCustomDatasources.jsx
│   ├── StepMarketplace.jsx
│   ├── StepMobileCompanion.jsx
│   └── StepComplete.jsx
└── demos/
    ├── TreeViewDemo.jsx
    ├── CardEditorDemo.jsx
    └── MarketplaceBrowseDemo.jsx
```

### State Management

```typescript
interface WizardState {
  currentStep: number;
  completedSteps: Set<number>;
  transitionDirection: 'forward' | 'backward';
  selectedGameSystem: string | null;
  selectedTier: 'free' | 'premium' | 'creator' | null;
  hasSkippedAuth: boolean;
  demoState: {
    cardName: string;
    treeItems: DemoTreeItem[];
  };
}
```

### Version Configuration

```javascript
export const WIZARD_VERSION = "2.0.0";

export const WIZARD_STEPS = [
  { id: "welcome", title: "Welcome", required: false },
  { id: "game-system", title: "Choose Your Game", required: true },
  { id: "card-management", title: "Card Management", required: false },
  { id: "card-editor", title: "Card Editor", required: false },
  { id: "import-export", title: "Import & Export", required: false },
  { id: "printing", title: "Print Cards", required: false },
  { id: "account-sync", title: "Account & Sync", required: false },
  { id: "subscription", title: "Subscription", required: false, conditional: "authenticated" },
  { id: "custom-datasources", title: "Custom Datasources", required: false },
  { id: "marketplace", title: "Marketplace", required: false },
  { id: "mobile", title: "Mobile Companion", required: false },
  { id: "complete", title: "Get Started", required: false },
];
```

### Design Tokens

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

### Integration Points

| Hook/Component | Purpose |
|----------------|---------|
| `useSettingsStorage` | Persist wizard completion, game system selection |
| `useAuth` | Account creation/login in Step 7 |
| `useSubscription` | Tier display in Step 8 |
| `useDataSourceStorage` | Custom datasource demo in Step 9 |
| `useDatasourceSharing` | Marketplace preview in Step 10 |

---

## Verification Plan

### Testing Checklist

- [ ] All 12 desktop steps render correctly
- [ ] All 8 mobile steps render correctly
- [ ] Game system selection persists to settings
- [ ] Auth flow integrates without breaking wizard
- [ ] Subscription step conditional visibility works
- [ ] Interactive demos function as expected
- [ ] Keyboard navigation (arrows, Enter, Esc)
- [ ] Mobile swipe gestures work
- [ ] Progress persistence across sessions
- [ ] Version migration from v1.2.0 to v2.0.0
- [ ] Responsive breakpoints (desktop, tablet, mobile)
- [ ] Animation performance (no jank)
- [ ] Accessibility (screen reader, focus management)
