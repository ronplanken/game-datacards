# Game Datacards - Claude Code Instructions

## Project Overview

This is a React 18.3 application built with Vite 7 for fast development and builds. It provides tools for creating custom datacards for tabletop games.

**Tech Stack:**
- React 18.3 with React Router 6
- Vite 7 with LESS support
- Ant Design 4.x for UI components
- Styled Components 6.x for styling
- Supabase (self-hosted on Coolify) for backend services
- TanStack React Query 4.x for server state
- Fabric.js 7.x / Konva 10.x for canvas rendering (Card Designer)
- Vitest for testing

## Documentation

For detailed documentation on card data formats, import features, components, and infrastructure, see `docs/INDEX.md` for a full index of available docs.

- **When implementing a major feature or working on data/file formats**, add a new doc file in `docs/` with YAML frontmatter (title, description, category, tags, related, file_locations) and a table of contents. Then update `docs/INDEX.md` to include the new file in the appropriate category.
- **When changing datasource schema structure** (field types, card type schemas, editor properties, colours, sections, abilities, or metadata), update `docs/custom datasource/datasource-schema-architecture.md` to reflect the changes. This file is the canonical reference for the custom datasource schema format.

## Development Rules

- **All new features require unit tests.** Write tests using Vitest before or alongside implementation.
- **Use Chrome DevTools MCP to validate UI work.** Take snapshots and screenshots to verify visual changes render correctly in the browser.
- **WhatsNew wizard mobile steps must use `mwnw-*` CSS classes.** Desktop wizard uses `wnw-*` classes, mobile uses `mwnw-*`. When adding a new version step to `MobileWhatsNewWizard/versions/`, use an existing mobile step (e.g., v3.7.0 `StepMobileEditor.jsx`) as the template, not the desktop counterpart.

## Before Making Changes

Always run the following checks before committing code changes:

### 1. Linting

```bash
yarn lint
```

To automatically fix linting issues:

```bash
yarn lint:fix
```

### 2. Formatting

To format code with Prettier:

```bash
yarn prettier:fix
```

### 3. Testing

Run the test suite:

```bash
yarn test:ci
```

For interactive test mode during development:

```bash
yarn test
```

## Build

To create a production build:

```bash
yarn build
```

## Development

Start the development server:

```bash
yarn start
```

### Development Commands

| Command | Description |
|---------|-------------|
| `yarn start` | Start dev server (community version) |
| `yarn start:premium` | Start dev server with premium features enabled |
| `yarn build` | Production build (community version) |
| `yarn build:premium` | Production build with premium features |
| `yarn build:beta` | Beta build with beta mode config |

## Premium Package

The app has a dual-mode architecture: a community version with local-only features, and a premium version with cloud features (auth, sync, subscriptions, designer).

### Feature Split

| Feature | Community | Premium |
|---------|-----------|---------|
| Datacard rendering | Yes | Yes |
| Local storage | Yes | Yes |
| Printing | Yes | Yes |
| Datasource Editor | Yes | Yes |
| User accounts/auth | No | Yes |
| Cloud sync | No | Yes |
| Subscription/payments | No | Yes |
| Cloud datasource publishing | No | Yes |
| Community browser | No | Yes |
| 2FA | No | Yes |
| Card Designer | No | Yes |
| Template sharing | No | Yes |
| Category sharing (owned) | No | Yes |

### Subscription Tiers

| Tier | Categories | Datasources | Templates | Price |
|------|-----------|-------------|-----------|-------|
| Free | 2 | 0 | 2 | - |
| Premium | 50 | 2 | 4 | €3.99/month |
| Creator | 250 | 10 | 10 | €7.99/month |
| Lifetime | 999 | 99 | 99 | Non-purchasable |
| Admin | 999 | 99 | 99 | Non-purchasable |

Tier limits are enforced both client-side (`src/Premium/constants.js`) and server-side via PostgreSQL triggers (see migrations 008, 013, 014).

### Location

- **Stubs**: `src/Premium/index.js` - No-op implementations for community version
- **Premium Package**: `@gdc/premium` (separate private repository at `../gdc-premium`)
- **Premium Docs**: `../gdc-premium/docs/` - Detailed documentation for premium features

### How Stubs Work

The `src/Premium/index.js` file exports stub implementations:

- **Providers** (`AuthProvider`, `SyncProvider`, `SubscriptionProvider`, `CloudCategoriesProvider`, `TemplateStorageProvider`, `TemplateSharingProvider`, `CardEditProvider`) - Simply render children, no functionality
- **Hooks** (`useAuth`, `useSync`, `useSubscription`, `useCloudCategories`, `usePremiumFeatures`, `useProducts`, `useTemplateStorage`, `useTemplateSharing`, `useDataBinding`, `useTemplateRenderer`) - Return safe defaults
- **Components** (auth modals, sync indicators, designer pages, community browser, checkout, sharing) - Return `null`
- **Constants** (`SUBSCRIPTION_LIMITS`, `TEMPLATE_PRESETS`, `TEMPLATE_GAME_SYSTEMS`, `TEMPLATE_SORT_OPTIONS`) - Shared between community and premium

When building with `VITE_USE_PREMIUM_PACKAGE=true`, Vite aliases resolve `./Premium` imports to `@gdc/premium` instead of the stubs. This is configured in `vite.config.js` via a custom `premiumPackageResolver` plugin.

### Premium Documentation

For detailed premium feature documentation, see the `gdc-premium` repository:

- `docs/open-core-split.md` - Architecture overview and migration details
- `docs/subscription-limits.md` - Tier limits and enforcement
- `docs/syncing-feature.md` - Cloud sync implementation
- `docs/designer-implementation.md` - Card Designer documentation
- `docs/custom-datasources.md` - Custom datasource feature

### Developing with Premium

To work with premium features locally:

1. Clone the `gdc-premium` repository alongside this one
2. Run `yarn link` in the premium package
3. Run `yarn link @gdc/premium` in this project
4. Use `yarn start:premium` to run with premium enabled

### Editing the Premium Package

The `gdc-premium` package lives at `../gdc-premium` and is fully editable. You can add, update, and modify any code in the premium package directly alongside this repository. Changes to premium providers, hooks, components, and features should be made in the premium package source, not in the community stubs. The stubs in `src/Premium/index.js` only need updating when new exports are added to the premium package.

## Datasource Editor

The Datasource Editor (`/datasources`) is a community feature for creating custom card data structures. It provides a three-panel workspace:

- **Left Panel** - Datasource management, card type hierarchy, add/delete/reorder cards
- **Center Panel** - Live card preview with zoom toolbar (25-200%, auto-fit), schema tree view
- **Right Panel** - Schema definition editors, card data editor, metadata editor

### Base Systems

Datasources are created for a specific base system that determines rendering and available field types:
- `40k-10e` - Warhammer 40K 10th Edition (units, stratagems, enhancements, rules)
- `aos` - Age of Sigmar (warscrolls)
- `blank` / `custom` - Custom card format with fallback renderers

### Card Types and Schema Editors

| Card Type | Schema Editors | Storage Array |
|-----------|---------------|---------------|
| Unit | Stats, Weapons, Abilities, Metadata | datasheets |
| Stratagem | Fields | stratagems |
| Enhancement | Fields + Keywords | enhancements |
| Rule | Fields + Rules | rules |

Specialized editors: `StatsSchemaEditor`, `WeaponsSchemaEditor`, `AbilitiesSchemaEditor`, `MetadataSchemaEditor`, `FieldsSchemaEditor`, `CardTypeSettingsEditor`.

### Datasource Wizard

Two-mode wizard (`src/Components/DatasourceWizard/`) for creating datasources ("create" mode) or adding card types to existing ones ("add-card-type" mode). Steps are dynamically filtered based on base system and card type selection.

### Key Datasource Files

| Feature | Path |
|---------|------|
| Editor Page | `src/Pages/DatasourceEditor.jsx` |
| Help Page | `src/Pages/DatasourceHelp.jsx` |
| Editor Components | `src/Components/DatasourceEditor/` |
| Card Renderers | `src/Components/DatasourceEditor/cards/` |
| Wizard | `src/Components/DatasourceWizard/` |
| State Hook | `src/Components/DatasourceEditor/hooks/useDatasourceEditorState.js` |
| Helpers & Validation | `src/Helpers/customDatasource.helpers.js` |
| Tree Integration | `src/Components/TreeView/TreeDatasource.jsx` |

### Datasource Validation Limits

- Max 200 char names, 50 char versions
- Max 10 factions, 2000 total cards
- Schema export/import via JSON

## Card Designer (Premium)

The Card Designer (`/designer`) is a premium-only canvas-based template editor for creating custom card layouts. It requires authentication and the `VITE_FEATURE_DESIGNER_ENABLED` feature flag.

- **DesignerPage** - Main canvas editor with layer panel, floating toolbar, properties panel
- **TemplateRenderer** - Renders templates with data binding (`{{field}}` syntax)
- **Template Presets** - Predefined canvas sizes for 40K, AoS, and custom formats
- **Repeater Frames** - Iterate over arrays (e.g., weapons, abilities)
- **Help Page** - 12-section guide at `/designer/help`

Templates can be published to the community browser, subscribed to by other users, and synced to cloud storage.

## Supabase Database

Self-hosted Supabase on Coolify with 18 migrations. Payment processing via Creem.

### Tables

| Table | Purpose |
|-------|---------|
| user_profiles | Subscription management, payment info |
| user_categories | Cloud-synced category storage |
| user_datasources | Custom datasource sync with edit/published workflow |
| user_templates | Designer template sync |
| datasource_subscriptions | Track datasource subscriptions |
| template_subscriptions | Track template subscriptions |
| category_shares | Publicly shared categories |
| sync_metadata | Conflict resolution tracking |

### Migration Overview

| # | Name | Purpose |
|---|------|---------|
| 001 | initial_schema | Core tables, user profiles, categories, datasources, shares |
| 002 | rls_policies | Row Level Security on all tables |
| 003 | indexes | Performance indexes for queries |
| 004 | creem_integration | Switch payment provider from Polar to Creem |
| 005 | tier_support | Premium/Creator tier distinction |
| 006 | fix_user_categories_trigger | Fix timestamp trigger bug |
| 007 | realtime_setup | Enable real-time sync with device tracking |
| 008 | subscription_limit_enforcement | Server-side tier limit enforcement via triggers |
| 009 | datasource_sharing | Datasource publishing and subscriber tracking |
| 010 | datasource_rpc | RPC functions for browse, subscribe, publish |
| 011 | local_datasource_support | Edit/publish workflow with conflict detection |
| 012 | soft_delete_datasources | Soft delete for datasources |
| 013 | lifetime_admin_tiers | Lifetime and admin tiers (never expire) |
| 014 | user_templates | Designer template cloud sync with tier limits |
| 015 | template_publishing | Template sharing, subscriptions, community browser |
| 016 | fix_search_path | Security hardening for search-path hijacking |
| 017 | fix_rls_initplan | RLS performance optimization |
| 018 | category_sharing | Enhanced category sharing with owned shares |

### Feature Flags

Feature flags (set in `.env`, all default to `true` if omitted):

| Flag | Feature |
|------|---------|
| `VITE_FEATURE_AUTH_ENABLED` | User authentication |
| `VITE_FEATURE_SYNC_ENABLED` | Cloud sync |
| `VITE_FEATURE_2FA_ENABLED` | Two-factor authentication |
| `VITE_FEATURE_PAID_TIER_ENABLED` | Subscription payments |
| `VITE_FEATURE_DESIGNER_ENABLED` | Card Designer |
| `VITE_FEATURE_COMMUNITY_BROWSER_ENABLED` | Community browser |

## CI/CD Pipeline

- **GitHub Actions**: Runs lint on all branches, tests on pull requests only (Node.js 20)
- **Cloudflare Pages**: Automatically builds and deploys all branches
  - Preview URLs generated for each branch
  - Production deployment on `main` branch

## Cloudflare Pages Configuration

When setting up Cloudflare Pages, use these build settings:

- **Build command**: `yarn build`
- **Build output directory**: `build`
- **Root directory**: `/`
- **Node.js version**: `20`

### Environment Variables

See `.env.example` for a complete list of all environment variables and their descriptions. Key variable groups:
- **Supabase**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (self-hosted on Coolify)
- **Datasource URLs**: `VITE_DATASOURCE_9TH_URL`, `VITE_DATASOURCE_10TH_URL`, `VITE_DATASOURCE_AOS_URL`, etc.
- **Premium**: `VITE_USE_PREMIUM_PACKAGE` (build-time toggle)
- **Feature flags**: See Feature Flags section above

## Code Quality

### Tooling Versions
- **Vite**: 7.x for builds
- **Vitest**: 3.x for testing
- **ESLint**: 8.x with React and Prettier plugins
- **Prettier**: 3.x
- **Husky**: 9.x for Git hooks
- **lint-staged**: 15.x

### Prettier Configuration
- Double quotes (no single quotes)
- 120 character print width
- 2 space indentation
- Brackets on same line for JSX

### Pre-commit Hooks
Husky runs lint-staged on commit, which auto-fixes ESLint issues on staged `.js`, `.ts`, and `.tsx` files.

## Package Manager

This project uses **Yarn 1.22.22**. Do not use npm.

```bash
yarn install    # Install dependencies
yarn add <pkg>  # Add a dependency
```

## Git Commit and PR Guidelines

- Never sign commits or PRs with your own name or as co-author
- No emojis in commit messages or PR descriptions
- Keep commit messages and PR descriptions short and to the point
- Use imperative mood for commit messages (e.g., "Fix bug" not "Fixed bug")
