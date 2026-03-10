# Custom Datasource Editor - Implementation Loop

> **Prompt:** Implement the next unchecked item in this plan. After completing each item, run `yarn lint`, `yarn prettier:fix`, and `yarn test:ci`. Mark the checkbox as done when complete. If a phase is fully complete, commit your work and move to the next phase. Always read the relevant reference files before writing new code. Follow existing codebase patterns (plain CSS with `--designer-*` variables for editor UI, lucide-react icons, localForage storage). The editor page uses Designer-style CSS classes — NOT styled-components or Ant Design Collapse for panel layout. Write unit tests for all new helpers and components.
>
> **Design quality:** Every UI phase (3, 5, 6, 7, 8, 9) includes a design quality step. Do not skip it.

---

## Phase 1: Schema Definition and Helpers

**Goal:** Define the custom schema data structure, presets, and validation.

**New files:**
- `src/Helpers/customSchema.helpers.js`
- `src/Helpers/__tests__/customSchema.helpers.test.js`

**Schema structure** : 
Description and file format can be found in `docs/custom datasource/datasource-schema-architecture.md`.

- [x] Define schema shape with JSDoc types
- [x] `create40kPreset()` - schema matching 40K 10e format as a base (consolidate nested abilities and stats into the new format)
- [x] `createAoSPreset()` - schema matching AoS format (stats: move/save/control/health/ward/wizard/priest)
- [x] `createBlankPreset()` - minimal empty schema
- [x] `validateSchema(schema)` - integrity checks
- [x] `migrateCardToSchema(card, oldSchema, newSchema)` - handle schema changes
- [x] Unit tests for all helpers

---

## Phase 2: Creation Wizard State Management

**Goal:** Build wizard hook following the `useWelcomeWizard` pattern, with dynamic step resolution based on `baseType` and wizard mode.

**Reference:** `src/Components/WelcomeWizard/hooks/useWelcomeWizard.js`

**New files:**
- `src/Components/DatasourceWizard/constants.js`
- `src/Components/DatasourceWizard/hooks/useDatasourceWizard.js`

**Wizard modes:**

The wizard operates in one of two modes, determined by whether an existing datasource is passed in:

| Mode              | Trigger                          | Starting step | Creates          |
|-------------------|----------------------------------|---------------|------------------|
| `create`          | No existing datasource           | metadata      | New datasource   |
| `add-card-type`   | Existing datasource passed in    | card-type     | New card type entry appended to existing `schema.cardTypes` |

**Wizard flow:**
```
create mode:        metadata -> base-system -> card-type -> [type-specific steps] -> review
add-card-type mode:                            card-type -> [type-specific steps] -> review
```

Type-specific step sequences:

| baseType      | Steps                                      |
|---------------|--------------------------------------------|
| `unit`        | stats -> weapons -> abilities -> metadata   |
| `rule`        | fields -> rules                             |
| `enhancement` | fields -> keywords                          |
| `stratagem`   | fields                                      |

The step list must be recomputed whenever `baseType` changes in the card-type step. Steps that have already accumulated state from a previous `baseType` selection should be discarded on change.

- [x] Wizard mode constant (`create` | `add-card-type`), derived from presence of existing datasource prop
- [x] Step definitions in `constants.js`: shared creation steps as a fixed array, type-specific steps as a map keyed by `baseType`
- [ ] Step resolver function that concatenates the appropriate prefix (mode-dependent) + type-specific steps + review
- [ ] `useDatasourceWizard({ existingDatasource? })` hook with: wizard mode resolution, step navigation (`goNext`, `goPrevious`, `goToStep`), per-step validation (`canProceed`), schema state accumulation across steps, transition direction tracking, step list recomputation on `baseType` change (resetting type-specific state)
- [ ] In `add-card-type` mode: the card-type step should exclude `baseType` values that already have a card type defined in the existing datasource (prevent duplicates)
- [ ] On completion in `add-card-type` mode: return the new card type entry to be appended, not a full datasource object
- [ ] Unit tests for wizard hook, including: both wizard modes, step sequence changes on `baseType` switch, duplicate `baseType` prevention in add-card-type mode

---

## Phase 3: Creation Wizard UI

**Goal:** Multi-step wizard modal for creating a custom datasource or adding a card type to an existing one. Shared steps render for all types; type-specific steps render conditionally based on `baseType`. Steps before card-type are skipped in `add-card-type` mode.

**Reference patterns:** `src/Components/WelcomeWizard/index.jsx`, `src/Components/WelcomeWizard/steps/StepGameSystem.jsx`

**New files:**

Shared steps (always rendered):
- `src/Components/DatasourceWizard/index.jsx` - Main wizard modal, accepts optional `existingDatasource` prop
- `src/Components/DatasourceWizard/DatasourceWizard.css`
- `src/Components/DatasourceWizard/steps/StepMetadata.jsx` - Name, version, author (create mode only)
- `src/Components/DatasourceWizard/steps/StepBaseSystem.jsx` - 40K / AoS / Blank selection (create mode only)
- `src/Components/DatasourceWizard/steps/StepCardType.jsx` - Select baseType (unit / rule / enhancement / stratagem), disables already-defined types in add-card-type mode
- `src/Components/DatasourceWizard/steps/StepReview.jsx` - Summary + create/add button (label adapts to mode)

Unit-specific steps (`baseType: "unit"`):
- `src/Components/DatasourceWizard/steps/StepStats.jsx` - Add/remove/rename stat fields, toggle multi-profile
- `src/Components/DatasourceWizard/steps/StepWeapons.jsx` - Configure weapon types + columns per type
- `src/Components/DatasourceWizard/steps/StepAbilities.jsx` - Define ability categories, format selection, invuln/damaged toggles
- `src/Components/DatasourceWizard/steps/StepUnitMetadata.jsx` - Keywords, faction keywords, points config

Generic field steps (used by `rule`, `enhancement`, `stratagem`):
- `src/Components/DatasourceWizard/steps/StepFields.jsx` - Editable field list (add/remove/reorder), supports `type` selection (string, richtext, enum, boolean), enum options editor when type is enum
- `src/Components/DatasourceWizard/steps/StepRules.jsx` - Configure the nested `rules` collection fields (rule type only)
- `src/Components/DatasourceWizard/steps/StepKeywords.jsx` - Configure the `keywords` collection schema (enhancement type only)

**Tasks:**

Wizard shell:
- [ ] Modal container, sidebar with step indicators, header, footer with navigation buttons, animated step transitions
- [ ] Sidebar should reflect the dynamic step list and highlight the current step
- [ ] Header title adapts to mode: "Create Datasource" vs "Add Card Type"
- [ ] Completion action adapts to mode: creates full datasource vs returns new card type entry

Shared steps:
- [ ] StepMetadata - form inputs for name, version, author (create mode only)
- [ ] StepBaseSystem - card grid selection (40K / AoS / Blank) (create mode only)
- [ ] StepCardType - card grid or radio selection for baseType, changing selection resets type-specific state, already-defined types shown as disabled with a label indicating they exist in add-card-type mode
- [ ] StepReview - read-only summary of the assembled schema, action button labelled "Create Datasource" or "Add Card Type" depending on mode

Unit steps:
- [ ] StepStats - editable field list with add/remove/rename, drag-to-reorder, displayOrder auto-assignment, allowMultipleProfiles toggle
- [ ] StepWeapons - tabbed interface per weapon type, editable column list per tab, add/remove weapon types, hasKeywords/hasProfiles toggles per type
- [ ] StepAbilities - editable category list with format selection (name-only / name-description), invulnerable save and damaged ability toggles
- [ ] StepUnitMetadata - keyword toggles, faction keyword toggle, points toggle with format selection (per-model / per-unit)

Generic steps:
- [ ] StepFields - reusable editable field list, used by rule/enhancement/stratagem for their top-level `fields[]` definition, type dropdown per field, conditional enum options editor
- [ ] StepRules - configure `rules` collection field definitions, allowMultiple toggle
- [ ] StepKeywords - configure `keywords` collection field definitions, allowMultiple toggle

- [ ] Component tests for each step, including both wizard modes where behaviour differs

Design quality:
- [ ] Run `/frontend-design` on wizard modal and all step components
- [ ] Run `/clarify` to review all labels, button text, empty states, and validation messages
- [ ] Run `/normalize` to ensure consistency with game-datacards.eu and gdc-premium design system

---

## Phase 4: Storage Integration

**Goal:** Wire wizard output into the existing localForage/localStorage storage system.

**Files to modify:**
- `src/Hooks/useDataSourceStorage.jsx` - Add `createCustomDatasource(metadata, schema)`
- `src/Helpers/customDatasource.helpers.js` - Extend validation for schema, add `"custom"` to `VALID_DISPLAY_FORMATS`
- `src/Hooks/useSettingsStorage.jsx` - May need minor updates

**Reuse:** Existing `custom-{uuid}` key pattern in localForage, `settings.customDatasources` registry.

- [ ] `createCustomDatasource(metadata, schema)` in useDataSourceStorage that creates datasource object with schema at root, creates default faction with name + colours, stores in localForage with `custom-{uuid}` key, registers in `settings.customDatasources`, switches active datasource to new one
- [ ] Add `"custom"` to `VALID_DISPLAY_FORMATS` in `customDatasource.helpers.js`
- [ ] Extend `validateCustomDatasource()` to handle optional `schema` property
- [ ] Integration tests

---

## Phase 5: Datasource Editor Page - Route and Layout

**Goal:** Create `/datasources` route with 3-panel layout matching the Card Designer's styling and component patterns.

**Reference files:**
- `gdc-premium/src/Pages/Designer.jsx` — Page layout (`Layout` > `AppHeader` > `Content` > `PanelGroup` with sizing)
- `gdc-premium/src/Components/Designer/Designer.css` — CSS variable system, panel styles, buttons, empty states, scrollbars
- `gdc-premium/src/Components/Designer/DesignerLayerPanel.jsx` — Left panel tree structure and item patterns
- `gdc-premium/src/Components/Designer/PropertiesPanel/index.jsx` — Right panel router pattern and empty states
- `gdc-premium/src/Components/Designer/PropertiesPanel/components/Section.jsx` — Collapsible section component
- `gdc-premium/src/Components/Designer/PropertiesPanel/components/CompactInput.jsx` — Compact input component
- `gdc-premium/src/Components/Designer/PropertiesPanel/components/ColorInput.jsx` — Color swatch + hex input component
- `src/Components/AppHeader.jsx` — Nav link pattern (lines 73-96)
- `src/index.jsx` — Route definitions

**New files:**

| File | Purpose |
|------|---------|
| `src/Pages/DatasourceEditor.jsx` | Page component: `Layout` > `AppHeader` > `Content` > `PanelGroup` |
| `src/Components/DatasourceEditor/DatasourceEditor.css` | All editor styles using `--designer-*` CSS variables |
| `src/Components/DatasourceEditor/EditorLeftPanel.jsx` | Datasource/card type tree with Designer layer panel patterns |
| `src/Components/DatasourceEditor/EditorCenterPanel.jsx` | Schema visualization area with empty state |
| `src/Components/DatasourceEditor/EditorRightPanel.jsx` | Schema property editor panel with empty state |
| `src/Components/DatasourceEditor/components/Section.jsx` | Collapsible section (mirrors Designer's `Section`) |
| `src/Components/DatasourceEditor/components/CompactInput.jsx` | Compact inline-label input (mirrors Designer's `CompactInput`) |
| `src/Components/DatasourceEditor/components/ColorInput.jsx` | Color swatch + hex input (mirrors Designer's `ColorInput`) |
| `src/Components/DatasourceEditor/components/index.js` | Barrel export |
| `src/Pages/__tests__/DatasourceEditor.test.jsx` | Route and layout tests |
| `src/Components/DatasourceEditor/__tests__/EditorLeftPanel.test.jsx` | Left panel tests |

**Files to modify:**

| File | Change |
|------|--------|
| `src/index.jsx` (~line 357) | Add route `{ path: "datasources", element: <DatasourceEditorPage /> }` — no feature gate (community feature), place between designer routes and legal pages |
| `src/Components/AppHeader.jsx` (~line 80) | Add nav link: `<Link to="/datasources">` with `app-header-nav-item` class, active state via `location.pathname.startsWith("/datasources")`, positioned after Viewer and before Designer |

### CSS foundation
- [ ] Create `DatasourceEditor.css` with `--designer-*` CSS variable system (copy from Designer.css `:root` block: bg-deep `#f0f2f5`, bg-primary `#ffffff`, bg-secondary `#fafafa`, bg-tertiary `#f5f5f5`, border `#d9d9d9`, border-subtle `#e8e8e8`, text-primary `#1f1f1f`, text-secondary `rgba(0,0,0,0.65)`, text-tertiary `rgba(0,0,0,0.45)`, text-muted `rgba(0,0,0,0.25)`, accent `#1677ff`, accent-hover `#4096ff`, accent-subtle `rgba(22,119,255,0.1)`, radius-sm `4px`, radius-md `8px`, radius-lg `12px`, shadow, shadow-elevated)
- [ ] Panel layout styles: `.datasource-editor-layout`, `.datasource-editor-content` (`height: calc(100vh - 64px)`)
- [ ] Panel styles: `.designer-layer-panel` (full height, flex column, bg-primary, border-right), `.designer-properties-panel.props-panel` (full height, flex column, bg-primary, border-left, overflow hidden)
- [ ] Panel header styles: `.designer-panel-header` (flex, 16px padding), `.designer-panel-title` (12px, uppercase, 600 weight, letter-spacing 0.5px)
- [ ] Section styles: `.props-section` (border-bottom divider), `.props-section-header` (flex row, 8x12px padding, cursor pointer, hover bg secondary), `.props-section-title` (11px, 600 weight, uppercase, 0.3px letter-spacing), `.props-section-content` (8x12px padding, flex column, 8px gap)
- [ ] Compact input styles: `.props-compact-input` (flex row, 28px height, border), `.props-compact-label` (22px width, bg tertiary, 10px font, weight 600), `.props-compact-field` (flex 1, 11px font, hide spinners), `.props-compact-suffix` (10px font, text-muted)
- [ ] Color input styles: `.props-color-input` (flex row, gap 6px, 28px height), `.props-color-swatch` (28x28px, rounded), `.props-color-swatch.transparent` (checkered bg pattern), `.props-color-text` (monospace 11px, secondary bg)
- [ ] Button styles: `.designer-btn` (32px height, secondary border), `.designer-btn-primary` (accent bg, white text), `.designer-btn-sm`, `.designer-template-btn` (100% width, 36px, accent bg, white, 13px font)
- [ ] Layer item styles: `.designer-layer-item` (8x12px padding), `.designer-layer-icon` (16x16px), `.designer-layer-name` (truncate ellipsis), `.designer-layer-actions` (hidden, reveal on hover), `.designer-layer-item.selected` (accent-subtle bg, accent border)
- [ ] Empty state styles: `.designer-empty-state` (centered flex, icon + text), `.props-empty` (flex column center, gap 8px, 40px padding, icon opacity 0.4, 12px text)
- [ ] Resize handle styles: `.designer-resizer.vertical` (1px width, border-subtle bg, accent on hover, transition 0.2s)
- [ ] Custom scrollbar styles: 6px width, transparent track, `--designer-border` thumb, 3px radius

### Shared components
- [ ] `Section.jsx` — collapsible section with `title`, `icon`, `defaultOpen` props, uses `ChevronDown`/`ChevronRight` from lucide-react, CSS classes `.props-section`, `.props-section-header`, `.props-section-content`
- [ ] `CompactInput.jsx` — inline-label input with `label`, `value`, `onChange`, `type`, `suffix`, `min`, `max`, `step` props, 28px height, hides number spinners
- [ ] `ColorInput.jsx` — color swatch + hex text input with `value`, `onChange`, `allowTransparent` props, transparent checkerboard pattern for null/transparent values, monospace font
- [ ] `index.js` barrel export

### Page layout
- [ ] `DatasourceEditorPage` with `<Layout className="datasource-editor-layout">` > `<AppHeader showModals={false} showNav={true} showActions={false} />` > `<Content className="datasource-editor-content">` > `<PanelGroup direction="horizontal" autoSaveId="datasourceEditorLayout">`
- [ ] Left Panel: `<Panel defaultSize={18} minSize={12} maxSize={30} order={1}>`
- [ ] Center Panel: `<Panel defaultSize={52} minSize={30} order={2}>`
- [ ] Right Panel: `<Panel defaultSize={22} minSize={15} maxSize={35} order={3}>`
- [ ] `<PanelResizeHandle className="designer-resizer vertical" />` between panels
- [ ] Import `DatasourceEditor.css` in the page component

### EditorLeftPanel
- [ ] Container: `.designer-layer-panel` (full height, flex column, bg-primary, border-right)
- [ ] Datasource selector section (top): `.designer-template-selector` padding with "New Datasource" button (`.designer-template-btn` — full width, 36px, accent bg, white, `Plus` icon from lucide-react) that opens the DatasourceWizard in `create` mode (Phase 3)
- [ ] "Open Datasource" expand/collapse list (`.designer-btn`) showing available custom datasources
- [ ] Active datasource info section (`.designer-template-info`): datasource name, version, base system, card type count
- [ ] Panel header: `.designer-panel-header` with `.designer-panel-title` "Card Types"
- [ ] Scrollable content: `.designer-panel-content` with datasource tree — datasource as parent item (clicking selects it and opens datasource-level schema editor in right panel), card types as children (clicking selects one and opens its field/attribute editor in right panel)
- [ ] Card type icons by `baseType`: `Swords` for unit, `BookOpen` for rule, `Sparkles` for enhancement, `Zap` for stratagem
- [ ] Tree items using `.designer-layer-item` pattern: lucide-react icon per baseType, label truncated with ellipsis, hover actions (delete using `Trash2` icon), selected state (accent border + accent-subtle bg)
- [ ] "Add Card Type" button (`.designer-btn-sm`) below card type list, opens DatasourceWizard in `add-card-type` mode (Phase 3)
- [ ] Empty state when no datasources: `.designer-empty-state` with `Database` icon, "No custom datasources yet" text, and "New Datasource" CTA button

### EditorCenterPanel
- [ ] Container: flex column, full height, `--designer-bg-deep` background
- [ ] Empty state: `.designer-empty-state` centered with `FileText` icon and "Select a card type to view its schema" text
- [ ] (Wired to schema tree visualization in Phase 8)

### EditorRightPanel
- [ ] Container: `.designer-properties-panel.props-panel` (full height, flex column, bg-primary, border-left, overflow hidden)
- [ ] Empty state (nothing selected): `.props-empty` with icon (opacity 0.4) and "Select a datasource or card type" text (12px)
- [ ] When datasource parent selected: show datasource metadata editor using `Section` components — name, version, author, baseSystem (read-only summary)
- [ ] When card type selected: show that card type's schema definition editor — the fields, stats, weapon columns, ability categories etc. that define the shape of cards of this type (editing the schema, not card data)
- [ ] (Wired to SchemaDefinitionEditor in Phase 6)

### Route and navigation
- [ ] Add route in `src/index.jsx`: `{ path: "datasources", element: <DatasourceEditorPage /> }` — no gate, placed between designer routes and legal pages
- [ ] Add nav link in `src/Components/AppHeader.jsx`: `<Link to="/datasources">Datasources</Link>` with `app-header-nav-item` class, active detection via `location.pathname.startsWith("/datasources")`, positioned after Viewer before Designer

### Tests
- [ ] `DatasourceEditor.test.jsx`: route renders page, PanelGroup mounts with 3 panels
- [ ] `EditorLeftPanel.test.jsx`: empty state renders, datasource list renders, New Datasource button present

### Design quality
- [ ] Run `/frontend-design` on all three panels, empty states, and shared components
- [ ] Run `/clarify` to review panel headers, empty state messages, button labels, and nav link text
- [ ] Run `/normalize` to ensure consistency with game-datacards.eu and gdc-premium design system

### Verification
- [ ] `yarn lint` and `yarn prettier:fix` pass
- [ ] `yarn test:ci` passes
- [ ] `yarn start` — navigate to `/datasources`, verify 3-panel layout renders
- [ ] Panels resize correctly
- [ ] Empty states display in all three panels
- [ ] Navigation link shows active state on the datasources page

---

## Phase 6: Schema Definition Editor

**Goal:** Editors for modifying the schema definition itself — the field definitions, stat columns, weapon type columns, ability categories, etc. that define the shape of cards. This is NOT a card data editor; it edits the schema that describes what fields a card type has.

**Reference:** Phase 5 shared components (`Section`, `CompactInput`, `ColorInput`), `docs/custom datasource/datasource-schema-architecture.md`

**New files:**
- `src/Components/DatasourceEditor/SchemaDefinitionEditor.jsx` - Router that renders the correct sub-editor based on `baseType`
- `src/Components/DatasourceEditor/editors/DatasourceMetadataEditor.jsx` - Edit datasource name, version, author, baseSystem
- `src/Components/DatasourceEditor/editors/StatsSchemaEditor.jsx` - Edit stat field definitions (add/remove/reorder fields, toggle allowMultipleProfiles)
- `src/Components/DatasourceEditor/editors/WeaponsSchemaEditor.jsx` - Edit weapon type definitions (add/remove weapon types, edit columns per type, toggle hasKeywords/hasProfiles)
- `src/Components/DatasourceEditor/editors/AbilitiesSchemaEditor.jsx` - Edit ability category definitions (add/remove categories, format selection, toggle invuln/damaged)
- `src/Components/DatasourceEditor/editors/MetadataSchemaEditor.jsx` - Edit metadata flags (hasKeywords, hasFactionKeywords, hasPoints, pointsFormat)
- `src/Components/DatasourceEditor/editors/FieldsSchemaEditor.jsx` - Generic field list editor for rule/enhancement/stratagem (add/remove/reorder fields, type selection, enum options)

**Styling:** Uses `DatasourceEditor.css` classes from Phase 5 (`.props-section`, `.props-compact-input`, etc.) — NOT Ant Design Collapse.

- [ ] `SchemaDefinitionEditor` switches on selected item: datasource parent → `DatasourceMetadataEditor`, card type → sub-editor based on `baseType`
- [ ] `DatasourceMetadataEditor` - edit datasource name, version, author using `CompactInput`, baseSystem as read-only display
- [ ] For `baseType: "unit"`: render `Section` components for `StatsSchemaEditor`, `WeaponsSchemaEditor`, `AbilitiesSchemaEditor`, `MetadataSchemaEditor`
- [ ] `StatsSchemaEditor` - editable field list (key, label, type, displayOrder), add/remove/reorder, `allowMultipleProfiles` toggle
- [ ] `WeaponsSchemaEditor` - tabbed per weapon type, editable column list per tab, add/remove weapon types, `hasKeywords`/`hasProfiles` toggles
- [ ] `AbilitiesSchemaEditor` - editable category list (key, label, format dropdown), `hasInvulnerableSave`/`hasDamagedAbility` toggles
- [ ] `MetadataSchemaEditor` - toggles for `hasKeywords`, `hasFactionKeywords`, `hasPoints`, `pointsFormat` dropdown
- [ ] For `baseType: "rule"/"enhancement"/"stratagem"`: render `FieldsSchemaEditor` with type-specific sections (e.g. `rules` collection for rule, `keywords` collection for enhancement)
- [ ] `FieldsSchemaEditor` - generic editable field list (key, label, type dropdown, required toggle), conditional enum options editor, add/remove/reorder
- [ ] Wire into EditorRightPanel (replace empty state when datasource or card type is selected)
- [ ] Component tests

Design quality:
- [ ] Run `/frontend-design` on all schema editors and form layouts
- [ ] Run `/clarify` to review field labels, section titles, toggle descriptions, and dropdown options
- [ ] Run `/normalize` to ensure consistency with game-datacards.eu and gdc-premium design system

---

## Phase 7: Generic Card Renderer

**Goal:** Card display that renders dynamically based on schema.

**Reference:** `src/Components/Warhammer40k-10e/CardDisplay.jsx`, `UnitCard.jsx`

**New files:**
- `src/Components/Custom/CustomCardDisplay.jsx` - Top-level display switcher
- `src/Components/Custom/CustomUnitCard.jsx` - Schema-driven unit card
- `src/Components/Custom/CustomCardStats.jsx` - Dynamic stat line
- `src/Components/Custom/CustomCardWeapons.jsx` - Dynamic weapon tables
- `src/Components/Custom/CustomCardAbilities.jsx` - Dynamic abilities
- `src/Components/Custom/CustomCard.styled.js` - Styled components

**Files to modify:**
- `src/App.jsx` line ~143 - Add `{activeCard?.source === "custom" && <CustomCardDisplay />}`
- `src/App.jsx` line ~168 - Add `{activeCard?.source === "custom" && <CustomCardEditor />}`
- `src/Mobile.js` - Check if the mobile view has a similar card source switch and add `custom` source support if needed, so custom cards render correctly on mobile devices

- [ ] CustomCardDisplay: looks up datasource schema, delegates to card type renderer
- [ ] CustomUnitCard: layout based on 40K style but with dynamic stat headers from schema
- [ ] CustomCardStats: iterate `schema.stats.fields` for columns
- [ ] CustomCardWeapons: render table per weapon type with schema-defined columns
- [ ] CustomCardAbilities: grouped by category with format from schema
- [ ] Support `--header-colour` / `--banner-colour` CSS variables
- [ ] Check Mobile.js for a card source switch and add custom source rendering support so custom cards display correctly on mobile
- [ ] Component tests

Design quality:
- [ ] Run `/frontend-design` on card renderer components and layout
- [ ] Run `/clarify` to review any visible text, labels, or fallback content on rendered cards
- [ ] Run `/normalize` to ensure card styling is consistent with existing 40K/AoS card renderers

---

## Phase 8: Schema Tree View

**Goal:** Collapsible tree visualization of the schema definition in the center panel. Shows the selected card type's field structure, types, required flags, and nested collections in a visual tree format.

**New files:**
- `src/Components/DatasourceEditor/SchemaTreeView.jsx`

**Styling:** Uses `DatasourceEditor.css` classes from Phase 5 (`.designer-layer-item`, tree connectors). Center panel uses `--designer-bg-deep` background.

- [ ] Tree component rendering schema structure: top-level sections (stats, weaponTypes, abilities, metadata for units; fields, rules/keywords for other types)
- [ ] Collapsible nodes for nested definitions (e.g. expand weaponTypes → ranged → columns) using `ChevronDown`/`ChevronRight` from lucide-react
- [ ] Field nodes show: key, label, type badge, required indicator
- [ ] Color-coded type badges (string, richtext, enum, boolean)
- [ ] When datasource parent selected: show overview of all card types with their field counts
- [ ] When card type selected: show that type's full schema tree (replaces empty state from Phase 5)

Design quality:
- [ ] Run `/frontend-design` on tree view, type badges, and collapsible nodes
- [ ] Run `/clarify` to review node labels, type badge text, and overview content
- [ ] Run `/normalize` to ensure tree styling matches the left panel tree and gdc-premium patterns

---

## Phase 9: Integration and Polish

**Goal:** Wire everything together, add card type CRUD, import/export of schema definitions.

**Files to modify:**
- `src/Components/DatasourceEditor/EditorCenterPanel.jsx` - Wire SchemaTreeView (replace Phase 5 empty state)
- `src/Components/DatasourceEditor/EditorLeftPanel.jsx` - Card type CRUD (add via wizard, delete) using `.designer-layer-actions` hover buttons
- `src/Helpers/customDatasource.helpers.js` - Export includes schema
- `src/Hooks/useDataSourceStorage.jsx` - Add `addCardType()`, `removeCardType()`, `updateSchema()` methods

- [ ] "Add Card Type" in left panel opens DatasourceWizard in `add-card-type` mode, appends result to schema
- [ ] Delete card type via `.designer-layer-actions` hover icon (`Trash2`) with confirmation
- [ ] Reorder card types via drag or move-up/move-down actions
- [ ] Export datasource schema as JSON
- [ ] Import datasource schema with validation
- [ ] Inline schema editing via right panel persists changes to localForage
- [ ] End-to-end testing: create datasource, add card types, edit schema fields, export, re-import
- [ ] Verify in browser with Chrome DevTools MCP (requires manual testing)

Design quality:
- [ ] Run `/frontend-design` on any new UI (confirmation dialogs, import/export flows)
- [ ] Run `/clarify` to review confirmation messages, export/import labels, and error states
- [ ] Run `/normalize` final pass across all editor components for full design system consistency

---

## Verification Plan

After each phase:
1. Run `yarn lint` and `yarn prettier:fix`
2. Run `yarn test:ci` to ensure no regressions
3. After Phase 5+: `yarn start` and verify page renders in browser
4. After Phase 7+: Create a test datasource via wizard, verify card renders in App.jsx with custom source
5. After Phase 9: Full flow test - create datasource, add card types via wizard, edit schema fields in right panel, verify schema tree in center panel, export, re-import

---

## Styling and Code Standards

All new code must follow the existing game-datacards.eu and gdc-premium conventions. Do not introduce new patterns.

### No styled-components for editor UI

The datasource editor uses **plain CSS with `--designer-*` CSS custom properties**, matching the Card Designer in gdc-premium. Styled-components are only used for card rendering components (e.g. `CustomCard.styled.js`), never for editor panels, sections, inputs, or layout.

### Reuse existing CSS classes — do not duplicate

Before writing new CSS, check whether a class already exists in `DatasourceEditor.css` or the Designer's CSS. Reuse classes like `.designer-layer-panel`, `.designer-layer-item`, `.props-section`, `.props-compact-input`, `.designer-btn`, `.designer-empty-state`, etc. Only add new classes when no existing class covers the need.

### DRY component patterns

- Shared components (`Section`, `CompactInput`, `ColorInput`) are community copies of gdc-premium's Designer components with identical APIs. Do not create alternative versions.
- Wizard steps should reuse the same field list editor component (`StepFields.jsx`) across rule, enhancement, and stratagem types — not separate implementations per type.
- Schema sub-editors in Phase 6 should compose `Section` and `CompactInput` rather than building custom form layouts.

### Consistent conventions

| Convention | Standard |
|------------|----------|
| Icons | lucide-react only (no Ant Design icons in editor UI) |
| Layout | Ant Design `Layout` / `Content` for page shell, plain CSS for panel internals |
| Spacing / sizing | Use `--designer-*` variables, not hardcoded values |
| State management | React hooks + context, matching existing codebase patterns |
| File naming | PascalCase for components, camelCase for helpers, `__tests__/` directories for tests |
| CSS class naming | `.designer-*` for layout/panels, `.props-*` for property editor elements |

---

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Source identifier | `source: "custom"` | Clean integration with existing source-based switch statements in App.jsx |
| Schema location | Datasource root, not per-card | Matches how system-specific formats work; all cards share one schema |
| Abilities format | Single array + category field | Consolidates 40K's 5 arrays; simpler for custom use |
| Storage | Existing localForage + settings pattern | Reuses `custom-{uuid}` key and `settings.customDatasources` registry |
| Wizard pattern | Copy WelcomeWizard architecture | Proven pattern already in codebase |
| Feature gating | None (community) | Available to all users |
| Editor styling | Plain CSS with `--designer-*` variables | Matches Card Designer pattern (not styled-components for panel UI) |
| Editor layout | 3-panel with Designer sizing (18/52/22) | Consistent with Card Designer UX |
| Shared components | Community copies of `Section`, `CompactInput`, `ColorInput` | Can't import from gdc-premium; identical API for consistency |
| Icons | lucide-react throughout | Matches Card Designer icon library |
| Datasource content | Schema definitions only, no card data | Schema describes shape; card data lives separately and conforms to schema |
| Editor left panel | Datasource → card types tree (no factions/cards) | Datasource defines card type schemas, not individual cards |
