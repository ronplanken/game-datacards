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

- **All branches**: Run lint, tests, and build. Deploy preview to Cloudflare Pages.
- **Main branch**: After successful CI, automatically deploys to GitHub Pages (production).

## Required Secrets for CI

The following secrets must be configured in GitHub repository settings:

- `CLOUDFLARE_API_TOKEN` - Cloudflare API token for Pages deployment
- `CLOUDFLARE_ACCOUNT_ID` - Cloudflare account ID

## Code Quality

- ESLint is configured with React and Prettier plugins
- Prettier handles code formatting (double quotes, 120 char width, 2 space tabs)
- Pre-commit hooks run lint-staged to auto-fix issues
