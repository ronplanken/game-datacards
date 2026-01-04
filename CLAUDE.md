# Game Datacards - Claude Code Instructions

## Project Overview

This is a React 18.3 application built with Create React App and Craco 7 for custom configuration. It provides tools for creating custom datacards for tabletop games.

**Tech Stack:**
- React 18.3 with React Router 6
- Ant Design 4.x for UI components
- Styled Components for styling
- Craco 7 with LESS support
- Firebase for backend services

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

## CI/CD Pipeline

- **GitHub Actions**: Runs lint and tests on all branches (Node.js 20)
- **Cloudflare Pages**: Automatically builds and deploys all branches
  - Preview URLs generated for each branch
  - Production deployment on `main` branch

## Cloudflare Pages Configuration

When setting up Cloudflare Pages, use these build settings:

- **Build command**: `yarn build`
- **Build output directory**: `build`
- **Root directory**: `/`
- **Node.js version**: `20`

### Production Environment Variables

```
REACT_APP_URL=https://game-datacards.eu
REACT_APP_DATASOURCE_10TH_URL=https://raw.githubusercontent.com/game-datacards/datasources/main/10th/gdc
REACT_APP_DATASOURCE_10TH_COMBATPATROL_URL=https://raw.githubusercontent.com/game-datacards/datasources/main/10th/combatpatrol
REACT_APP_DATASOURCE_9TH_URL=https://raw.githubusercontent.com/game-datacards/datasources/main/40k
REACT_APP_MESSAGES_URL=https://raw.githubusercontent.com/game-datacards/messages/main/messages.json
REACT_APP_ENVIRONMENT=production
REACT_APP_IS_PRODUCTION=true
```

### Preview Environment Variables

```
REACT_APP_URL=https://<project>.pages.dev
REACT_APP_DATASOURCE_10TH_URL=https://raw.githubusercontent.com/game-datacards/datasources/develop/10th/gdc
REACT_APP_DATASOURCE_10TH_COMBATPATROL_URL=https://raw.githubusercontent.com/game-datacards/datasources/develop/10th/combatpatrol
REACT_APP_DATASOURCE_9TH_URL=https://raw.githubusercontent.com/game-datacards/datasources/develop/40k
REACT_APP_MESSAGES_URL=https://raw.githubusercontent.com/game-datacards/messages/develop/messages.json
REACT_APP_ENVIRONMENT=staging
REACT_APP_IS_PRODUCTION=false
```

## Code Quality

### Tooling Versions
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
