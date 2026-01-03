# Game Datacards - Claude Code Instructions

## Project Overview

This is a React application built with Create React App and Craco for custom configuration. It provides tools for creating custom datacards for tabletop games.

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

- **GitHub Actions**: Runs lint and tests on all branches
- **Cloudflare Pages**: Automatically builds and deploys all branches
  - Preview URLs generated for each branch
  - Production deployment on `main` branch

## Cloudflare Pages Configuration

When setting up Cloudflare Pages, use these build settings:

- **Build command**: `yarn build`
- **Build output directory**: `build`
- **Root directory**: `/`
- **Node.js version**: `20`

### Required Environment Variables

Set these in Cloudflare Pages dashboard:

```
REACT_APP_URL=https://game-datacards.eu
REACT_APP_DATASOURCE_10TH_URL=https://raw.githubusercontent.com/game-datacards/datasources/main/10th/gdc
REACT_APP_DATASOURCE_10TH_COMBATPATROL_URL=https://raw.githubusercontent.com/game-datacards/datasources/main/10th/combatpatrol
REACT_APP_DATASOURCE_9TH_URL=https://raw.githubusercontent.com/game-datacards/datasources/main/40k
REACT_APP_MESSAGES_URL=https://raw.githubusercontent.com/game-datacards/messages/main/messages.json
REACT_APP_ENVIRONMENT=production
REACT_APP_IS_PRODUCTION=true
```

## Code Quality

- ESLint is configured with React and Prettier plugins
- Prettier handles code formatting (double quotes, 120 char width, 2 space tabs)
- Pre-commit hooks run lint-staged to auto-fix issues
