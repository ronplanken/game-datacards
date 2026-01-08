# Implementation Plan: Open Core Split

This document outlines the implementation plan for splitting Game-Datacards into an open-core model with free features in a public repository and premium features in a private repository.

## Table of Contents

1. [Why Open Core](#why-open-core)
2. [Business Risks of Current Model](#business-risks-of-current-model)
3. [Architecture Overview](#architecture-overview)
4. [Implementation Details](#implementation)
5. [Package Hosting](#private-package-hosting)
6. [CI/CD Pipelines](#cicd-pipelines)
7. [Migration Checklist](#migration-checklist)
8. [Action Items](#action-items)

---

## Why Open Core

### Current Problem

Game-Datacards is GPL-3.0 licensed with a freemium subscription model. This creates a fundamental tension:

| Aspect | GPL-3.0 Requirement | Business Need |
|--------|---------------------|---------------|
| Source code | Must be public | Premium features exposed |
| Derivatives | Must remain GPL-3.0 | Can't protect premium code |
| Commercial use | Allowed by anyone | Competitors can fork |
| Modifications | Must be shared | Subscription bypass possible |

### What Open Core Solves

- **Public repo**: Core features remain GPL-3.0 (community benefits)
- **Private repo**: Premium features are proprietary (business protected)
- **Forks**: Get functional app without premium features
- **Official build**: Full feature set with payment integration

---

## Business Risks of Current Model

### Risk Summary

| Risk | Level | Impact |
|------|-------|--------|
| Fork-and-deploy competition | HIGH | Competitors offer same service free |
| Subscription bypass | MEDIUM | Users self-host with modified limits |
| Payment logic exposure | LOW | Webhook secrets protected server-side |
| Community fragmentation | MEDIUM | Multiple forks split userbase |

### Fork-and-Deploy Competition

Anyone can currently:
1. Fork the repository
2. Set up their own Supabase instance
3. Configure their own payment provider
4. Deploy to any hosting provider
5. Offer the same service (potentially free)

**Your competitive advantages:**
- First-mover advantage and brand recognition
- Direct relationship with the community
- Faster feature development
- Trust as original creator

### Current Security Posture (What's Working)

| Enforcement | Location | Bypassable? |
|-------------|----------|-------------|
| Category limits | Database trigger | No |
| Datasource limits | Database trigger | No |
| Webhook verification | HMAC-SHA256 | No |
| UI restrictions | React hooks | Yes (but doesn't matter) |

The critical insight: **server-side enforcement is already correct**. Client-side code visibility doesn't matter because limits are enforced at the database level.

### What Open Core Changes

| Before (Current) | After (Open Core) |
|------------------|-------------------|
| Sync code visible | Sync code private |
| Payment logic visible | Payment logic private |
| Forks get everything | Forks get core only |
| Easy to compete | Harder to compete |

---

## Architecture Overview

Split the codebase into:
- **Public repo** (GPL-3.0): Core functionality anyone can use/fork
- **Private repo** (proprietary): Premium features only available on official instance

### What Forks Get vs What We Keep

| Feature | Public (Forks) | Private (Official) |
|---------|---------------|-------------------|
| Datacard rendering | Yes | Yes |
| Local storage | Yes | Yes |
| Printing | Yes | Yes |
| Basic auth | Yes | Yes |
| Cloud sync | No | Yes |
| Subscription/payments | No | Yes |
| Custom datasources | No | Yes |
| 2FA | No | Yes |

---

## Architecture

### Repository Structure

```
PUBLIC REPOSITORY (game-datacards)
License: GPL-3.0
─────────────────────────────────────
src/
├── Components/
│   ├── Datacard/           # Card rendering
│   ├── TreeView/           # Category management
│   ├── Printing/           # Print layouts
│   ├── Importer/           # Basic import/export
│   ├── Settings/           # App settings
│   └── Auth/               # Basic auth UI
│
├── Hooks/
│   ├── useCardStorage.jsx  # Local storage only
│   ├── useDataSources.jsx  # Datasource loading
│   └── useAuth.jsx         # Basic auth
│
├── Premium/
│   └── index.js            # Stub exports (no-ops)
│
└── index.js                # Loads premium if available

supabase/
└── migrations/
    ├── 001_initial.sql
    ├── 002_auth_setup.sql
    └── 003_basic_sharing.sql


PRIVATE REPOSITORY (@gdc/premium)
License: Proprietary
─────────────────────────────────────
src/
├── Components/
│   ├── Sync/
│   │   ├── CategorySyncIcon.jsx
│   │   ├── SyncStatusIndicator.jsx
│   │   └── SyncConflictModal.jsx
│   │
│   ├── Subscription/
│   │   ├── UpgradeModal.jsx
│   │   ├── SubscriptionBadge.jsx
│   │   ├── UsageIndicator.jsx
│   │   └── CheckoutSuccessModal.jsx
│   │
│   └── CustomDatasource/
│       ├── ExportDatasourceModal.jsx
│       └── CustomDatasourceModal.jsx
│
├── Hooks/
│   ├── useSync.jsx
│   ├── useSubscription.jsx
│   └── usePremiumFeatures.jsx
│
├── Providers/
│   ├── PremiumProvider.jsx
│   ├── SyncProvider.jsx
│   └── SubscriptionProvider.jsx
│
└── index.js

supabase/
├── functions/
│   ├── create-checkout/
│   ├── creem-webhook/
│   └── get-portal-url/
│
└── migrations/
    ├── 005_tier_support.sql
    ├── 006_user_categories_sync.sql
    ├── 007_realtime_setup.sql
    └── 008_subscription_limits.sql
```

---

## Implementation

### 1. Premium Stub System

Create stub exports in the public repo that do nothing when premium isn't available:

**`src/Premium/index.js`** (Public repo - stubs)
```javascript
// Premium feature stubs - replaced by @gdc/premium in official build

// No-op providers that just render children
export const PremiumProvider = ({ children }) => children;
export const SyncProvider = ({ children }) => children;
export const SubscriptionProvider = ({ children }) => children;

// No-op hooks that return safe defaults
export const useSync = () => ({
  syncEnabled: false,
  enableSync: () => Promise.resolve(),
  disableSync: () => Promise.resolve(),
  syncStatus: 'disabled',
  isOnline: true,
});

export const useSubscription = () => ({
  tier: 'free',
  isAuthenticated: false,
  limits: { categories: Infinity, datasources: 0 },
  usage: { categories: 0, datasources: 0 },
  canPerformAction: () => true,
  getRemainingQuota: () => Infinity,
  isOverQuota: () => false,
  startCheckout: () => {},
  openCustomerPortal: () => {},
});

export const usePremiumFeatures = () => ({
  hasPremium: false,
  hasSync: false,
  hasCustomDatasources: false,
});

// No-op components that render nothing
export const CategorySyncIcon = () => null;
export const SyncStatusIndicator = () => null;
export const SyncConflictModal = () => null;
export const UpgradeModal = () => null;
export const SubscriptionBadge = () => null;
export const UsageIndicator = () => null;
export const CheckoutSuccessModal = () => null;
export const ExportDatasourceModal = () => null;
export const CustomDatasourceModal = () => null;
```

### 2. Main App Integration

**`src/index.js`** (Public repo)
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './Hooks/useAuth';
import { CardStorageProvider } from './Hooks/useCardStorage';

// Import from Premium - will be stubs or real implementation
import {
  PremiumProvider,
  SyncProvider,
  SubscriptionProvider
} from './Premium';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <SubscriptionProvider>
        <SyncProvider>
          <CardStorageProvider>
            <App />
          </CardStorageProvider>
        </SyncProvider>
      </SubscriptionProvider>
    </AuthProvider>
  </React.StrictMode>
);
```

### 3. Build Configuration

**Official build** - swap stubs for real premium package:

**`craco.config.js`** or **`config-overrides.js`**:
```javascript
const path = require('path');

module.exports = {
  webpack: {
    alias: {
      // Replace stubs with real premium package in official build
      './Premium': '@gdc/premium',
      '../Premium': '@gdc/premium',
    },
  },
};
```

### 4. Using Premium Features in Components

Components import from `./Premium` - they get stubs or real implementation depending on build:

```javascript
import React from 'react';
import { CategorySyncIcon, useSync, usePremiumFeatures } from '../Premium';

export const TreeCategory = ({ category }) => {
  const { syncEnabled, enableSync } = useSync();
  const { hasSync } = usePremiumFeatures();

  return (
    <div className="tree-category">
      <span>{category.name}</span>

      {/* Only shows if premium is loaded AND feature available */}
      {hasSync && (
        <CategorySyncIcon
          category={category}
          onEnableSync={() => enableSync(category.uuid)}
        />
      )}
    </div>
  );
};
```

---

## Private Package Hosting

### Recommended: Git Dependency (Simplest)

No registry needed - reference private repo directly:

**`package.json`** (official build):
```json
{
  "dependencies": {
    "@gdc/premium": "git+https://github.com/yourusername/gdc-premium.git#v1.0.0"
  }
}
```

**CI/CD** - use GitHub token:
```yaml
- name: Configure git auth
  run: git config --global url."https://${{ secrets.GH_PAT }}@github.com/".insteadOf "https://github.com/"

- name: Install dependencies
  run: yarn install
```

### Alternative: GitHub Packages

**`package.json`** (private repo):
```json
{
  "name": "@yourusername/gdc-premium",
  "version": "1.0.0",
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}
```

**`.npmrc`** (official build repo):
```
@yourusername:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

---

## CI/CD Pipelines

### Public Build (GitHub Pages)

**`.github/workflows/build-public.yml`**:
```yaml
name: Build Public Version

on:
  push:
    branches: [main]
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: yarn install

      - name: Build (public version - uses stubs)
        run: yarn build

      - name: Deploy to GitHub Pages
        if: github.ref == 'refs/heads/main'
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./build
```

### Official Build (Premium)

**`.github/workflows/build-official.yml`** (in private repo):
```yaml
name: Deploy Official Instance

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout public repo
        uses: actions/checkout@v4
        with:
          repository: yourusername/game-datacards
          path: app

      - name: Checkout premium repo
        uses: actions/checkout@v4
        with:
          path: premium

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Build premium package
        run: |
          cd premium
          yarn install
          yarn build
          yarn link

      - name: Build app with premium
        run: |
          cd app
          yarn link @gdc/premium
          yarn install
          yarn build
        env:
          REACT_APP_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          REACT_APP_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          REACT_APP_CREEM_PRODUCT_ID: ${{ secrets.CREEM_PRODUCT_ID }}
          REACT_APP_CREEM_PRODUCT_ID_CREATOR: ${{ secrets.CREEM_PRODUCT_ID_CREATOR }}

      - name: Deploy to production
        # Deploy to Vercel, Netlify, or your hosting
```

### Supabase Functions Deployment

**`.github/workflows/deploy-functions.yml`** (in private repo):
```yaml
name: Deploy Supabase Functions

on:
  push:
    branches: [main]
    paths:
      - 'supabase/functions/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1

      - name: Deploy functions
        run: |
          supabase functions deploy create-checkout --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
          supabase functions deploy creem-webhook --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
          supabase functions deploy get-portal-url --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

---

## Migration Checklist

### Phase 1: Create Stub Interface

- [ ] Create `src/Premium/index.js` with all stub exports
- [ ] Define TypeScript interfaces in `src/Premium/types.d.ts`
- [ ] Update all components to import from `./Premium` or `../Premium`
- [ ] Test that app works correctly with stubs only
- [ ] Verify no premium functionality when using stubs

### Phase 2: Create Private Repository

- [ ] Initialize new private repo `gdc-premium`
- [ ] Set up package.json with proper name and config
- [ ] Configure build tooling (TypeScript optional, Rollup/esbuild)
- [ ] Create proper exports in `src/index.js`

### Phase 3: Move Premium Code

**Hooks to move:**
- [ ] `src/Hooks/useSync.jsx` → premium
- [ ] `src/Hooks/useSubscription.jsx` → premium

**Components to move:**
- [ ] `src/Components/Sync/*` → premium
- [ ] `src/Components/Subscription/*` → premium
- [ ] `src/Components/CustomDatasource/*` → premium

**Supabase to move:**
- [ ] `supabase/functions/create-checkout/` → premium
- [ ] `supabase/functions/creem-webhook/` → premium
- [ ] `supabase/functions/get-portal-url/` → premium
- [ ] `supabase/migrations/005-008` → premium

### Phase 4: Set Up Builds

- [ ] Configure webpack alias for premium package
- [ ] Create GitHub Action for public build
- [ ] Create GitHub Action for official build (in private repo)
- [ ] Create GitHub Action for Supabase function deployment
- [ ] Set up required secrets in both repos

### Phase 5: Test & Deploy

- [ ] Build and test public version (stubs only)
- [ ] Build and test official version (with premium)
- [ ] Verify premium features work in official build
- [ ] Verify graceful degradation in public build
- [ ] Deploy both versions

### Phase 6: Cleanup

- [ ] Remove premium code from public repo (keep stubs)
- [ ] Update README to explain open-core model
- [ ] Update CONTRIBUTING.md
- [ ] Add proprietary LICENSE to private repo

---

## Files Reference

### Files to KEEP in Public Repo

| File | Purpose |
|------|---------|
| `src/App.jsx` | Core app shell |
| `src/Components/Datacard/*` | Card rendering |
| `src/Components/TreeView/*` | Category tree |
| `src/Components/Printing/*` | Print functionality |
| `src/Components/Importer/*` | Basic import/export |
| `src/Components/Settings/*` | Basic settings |
| `src/Components/Auth/LoginModal.jsx` | Basic auth UI |
| `src/Hooks/useCardStorage.jsx` | Local storage |
| `src/Hooks/useAuth.jsx` | Basic auth |
| `src/Hooks/useDataSources.jsx` | Datasource loading |
| `supabase/migrations/001-003` | Core schema |

### Files to MOVE to Private Repo

| File | Purpose |
|------|---------|
| `src/Hooks/useSync.jsx` | Cloud sync logic |
| `src/Hooks/useSubscription.jsx` | Tier management |
| `src/Components/Sync/*` | Sync UI |
| `src/Components/Subscription/*` | Payment UI |
| `src/Components/CustomDatasource/*` | Datasource management |
| `supabase/functions/*` | Edge functions |
| `supabase/migrations/005-008` | Premium schema |

### Files to MODIFY

| File | Changes Needed |
|------|----------------|
| `src/index.js` | Import from Premium |
| `src/Components/TreeView/TreeCategory.jsx` | Import sync from Premium |
| `src/Components/Auth/AccountButton.jsx` | Import subscription from Premium |
| `src/Hooks/useCardStorage.jsx` | Remove sync integration, keep local only |
| `package.json` | Remove premium deps, add as optional |

---

## Summary

This implementation creates a sustainable open-core model:

1. **Public repo** contains core features that work standalone
2. **Private repo** contains premium features as an npm package
3. **Stubs** ensure public builds work without premium code
4. **Webpack alias** swaps stubs for real implementation in official builds
5. **Forks** get a fully functional app, just without premium features

The key insight: premium features render as `null` or return safe defaults when not available, so the app gracefully degrades without errors.

---

## Action Items

### Before Starting Migration

- [ ] Verify webhook secret is not in any public code or commits
- [ ] Audit RLS policies to ensure no data leakage
- [ ] Implement CLA for future contributor flexibility (optional but recommended)
- [ ] Consider trademark registration for "Game-Datacards"

### Quick Wins (Can Do Now)

- [ ] Add rate limiting to Supabase API
- [ ] Set up security scanning in CI (CodeQL, Dependabot)
- [ ] Create SECURITY.md with vulnerability reporting process
- [ ] Document which files are security-critical

### Strategic Considerations

| Decision | Options | Recommendation |
|----------|---------|----------------|
| Package hosting | Git dependency vs GitHub Packages | Start with git dependency |
| Build tool | Rollup vs esbuild vs none | esbuild (fast, simple) |
| TypeScript | Yes or No | Optional - can add later |
| Hosting | Same domain vs separate | Same domain, different builds |

---

*Last updated: January 2026*
