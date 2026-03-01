# Game Datacards - Claude Code Instructions

## Project Overview

This is a React 18.3 application built with Vite 7 for fast development and builds. It provides tools for creating custom datacards for tabletop games.

**Tech Stack:**
- React 18.3 with React Router 6
- Vite 7 with LESS support
- Ant Design 4.x for UI components
- Styled Components 6.x for styling
- Firebase and Supabase for backend services
- Vitest for testing

## Documentation

For detailed documentation on card data formats, import features, components, and infrastructure, see `docs/INDEX.md` for a full index of available docs.

- **When implementing a major feature or working on data/file formats**, add a new doc file in `docs/` with YAML frontmatter (title, description, category, tags, related, file_locations) and a table of contents. Then update `docs/INDEX.md` to include the new file in the appropriate category.

## Development Rules

- **All new features require unit tests.** Write tests using Vitest before or alongside implementation.
- **Use Chrome DevTools MCP to validate UI work.** Take snapshots and screenshots to verify visual changes render correctly in the browser.

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
| User accounts/auth | No | Yes |
| Cloud sync | No | Yes |
| Subscription/payments | No | Yes |
| Custom datasources | No | Yes |
| 2FA | No | Yes |
| Card Designer | No | Yes |

### Subscription Tiers

| Tier | Categories | Datasources | Price |
|------|-----------|-------------|-------|
| Free | 2 | 0 | - |
| Premium | 50 | 2 | €3.99/month |
| Creator | 250 | 10 | €7.99/month |
| Lifetime | 999 | 99 | Non-purchasable |
| Admin | 999 | 99 | Non-purchasable |

### Location

- **Stubs**: `src/Premium/index.js` - No-op implementations for community version
- **Premium Package**: `@gdc/premium` (separate private repository at `../gdc-premium`)
- **Premium Docs**: `../gdc-premium/docs/` - Detailed documentation for premium features

### How Stubs Work

The `src/Premium/index.js` file exports stub implementations:

- **Providers** (`AuthProvider`, `SyncProvider`, etc.) - Simply render children, no functionality
- **Hooks** (`useAuth`, `useSync`, `useSubscription`) - Return safe defaults (e.g., `user: null`, `isAuthenticated: false`)
- **Components** (`LoginModal`, `AccountButton`, `DesignerPage`, etc.) - Return `null`

When building with `VITE_USE_PREMIUM_PACKAGE=true`, Vite aliases resolve `./Premium` imports to `@gdc/premium` instead of the stubs. This is configured in `vite.config.js`:

```js
// Relative paths ending in /Premium get aliased to @gdc/premium
{ find: /^(\.\.?\/)+Premium$/, replacement: "@gdc/premium" }
```

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

See `.env.example` for a complete list of all environment variables and their descriptions.

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
