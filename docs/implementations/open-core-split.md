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
8. [Implementation Progress](#implementation-progress)
9. [Action Items](#action-items)

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
| User accounts/auth | No | Yes |
| Cloud sync | No | Yes |
| Subscription/payments | No | Yes |
| Custom datasources | No | Yes |
| 2FA | No | Yes |

> **Note:** The public version has **NO cloud features** - it's purely local storage. All authentication, sync, and subscription features are premium-only.

---

## Architecture

### Repository Structure

```
PUBLIC REPOSITORY (game-datacards) - LOCAL ONLY
License: GPL-3.0
───────────────────────────────────────────────
src/
├── Components/
│   ├── Datacard/           # Card rendering
│   ├── TreeView/           # Category management
│   ├── Printing/           # Print layouts
│   ├── Importer/           # Basic import/export
│   ├── Settings/           # App settings
│   ├── WelcomeWizard/      # Welcome wizard (public steps only)
│   └── Viewer/Mobile/
│       └── BottomSheet.jsx # Bottom sheet UI component
│
├── Hooks/
│   ├── useCardStorage.jsx  # Local storage only
│   └── useDataSources.jsx  # Datasource loading
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


PRIVATE REPOSITORY (@gdc/premium) - ALL CLOUD FEATURES
License: Proprietary
───────────────────────────────────────────────────────
src/
├── Components/
│   ├── Viewer/Mobile/
│   │   ├── Auth/           # ✅ Implemented
│   │   │   ├── MobileLoginPage.jsx
│   │   │   ├── MobileSignupPage.jsx
│   │   │   ├── MobilePasswordResetPage.jsx
│   │   │   └── MobileTwoFactorPage.jsx
│   │   │
│   │   ├── Account/        # ✅ Implemented
│   │   │   └── MobileAccountSheet.jsx
│   │   │
│   │   └── Sync/           # ✅ Implemented
│   │       ├── MobileSyncSheet.jsx
│   │       └── CloudCategorySheet.jsx
│   │
│   ├── WelcomeWizard/
│   │   └── steps/
│   │       └── StepSubscription.jsx  # ✅ Implemented
│   │
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
│   ├── useAuth.jsx              # ✅ Implemented
│   ├── useSync.jsx              # ✅ Implemented (1312 lines)
│   ├── useSubscription.jsx      # ✅ Implemented
│   ├── useCloudCategories.jsx   # ✅ Implemented
│   └── usePremiumFeatures.jsx
│
├── Providers/
│   ├── AuthProvider.jsx
│   ├── PremiumProvider.jsx
│   ├── SyncProvider.jsx
│   ├── SubscriptionProvider.jsx
│   └── CloudCategoriesProvider.jsx
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

Create stub exports in the public repo that do nothing when premium isn't available.
**All cloud features return no-ops/disabled state:**

**`src/Premium/index.js`** (Public repo - stubs)
```javascript
// Premium feature stubs - replaced by @gdc/premium in official build

// =====================================================
// PROVIDERS - No-op providers that just render children
// =====================================================
export const AuthProvider = ({ children }) => children;
export const PremiumProvider = ({ children }) => children;
export const SyncProvider = ({ children }) => children;
export const SubscriptionProvider = ({ children }) => children;
export const CloudCategoriesProvider = ({ children }) => children;

// =====================================================
// HOOKS - Return safe defaults / disabled state
// =====================================================

// Stub for useAuth - no authentication in public version
export const useAuth = () => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: false,
  signIn: () => Promise.resolve({ error: { message: 'Not available' } }),
  signUp: () => Promise.resolve({ error: { message: 'Not available' } }),
  signOut: () => Promise.resolve(),
  resetPassword: () => Promise.resolve({ error: { message: 'Not available' } }),
});

// Stub for useSync - sync disabled in public version
export const useSync = () => ({
  syncStatus: 'disabled',
  isOnline: true,
  lastSyncTime: null,
  syncedCategories: [],
  pendingCategories: [],
  enableCategorySync: () => Promise.resolve(),
  disableCategorySync: () => Promise.resolve(),
  uploadCategory: () => Promise.resolve(),
  downloadCategory: () => Promise.resolve(),
  syncedDatasources: [],
  uploadDatasource: () => Promise.resolve(),
  deleteDatasource: () => Promise.resolve(),
  conflicts: [],
  resolveConflict: () => Promise.resolve(),
  getSyncStats: () => ({ categories: 0, datasources: 0, pending: 0 }),
});

// Stub for useSubscription - always "free" with unlimited local
export const useSubscription = () => ({
  tier: 'free',
  isAuthenticated: false,
  limits: {
    syncedCategories: 0,  // No cloud sync
    datasources: 0,
    canUploadDatasource: false
  },
  usage: { syncedCategories: 0, datasources: 0 },
  canPerformAction: () => true,  // Local actions always allowed
  getRemainingQuota: () => Infinity,  // Unlimited local categories
  isOverQuota: () => false,
  startCheckout: () => {},
  openCustomerPortal: () => {},
});

// Stub for useCloudCategories - empty in public version
export const useCloudCategories = () => ({
  cloudCategories: [],
  isLoading: false,
  error: null,
  refetch: () => Promise.resolve(),
});

export const usePremiumFeatures = () => ({
  hasPremium: false,
  hasSync: false,
  hasCustomDatasources: false,
});

// =====================================================
// COMPONENTS - All render null in public version
// =====================================================

// Auth components
export const MobileLoginPage = () => null;
export const MobileSignupPage = () => null;
export const MobilePasswordResetPage = () => null;
export const MobileTwoFactorPage = () => null;

// Account components
export const MobileAccountSheet = () => null;

// Sync components
export const MobileSyncSheet = () => null;
export const CloudCategorySheet = () => null;
export const CategorySyncIcon = () => null;
export const SyncStatusIndicator = () => null;
export const SyncConflictModal = () => null;

// Subscription components
export const UpgradeModal = () => null;
export const SubscriptionBadge = () => null;
export const UsageIndicator = () => null;
export const CheckoutSuccessModal = () => null;
export const StepSubscription = () => null;

// Custom datasource components
export const ExportDatasourceModal = () => null;
export const CustomDatasourceModal = () => null;
```

### 2. Main App Integration

**`src/index.js`** (Public repo)
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { CardStorageProvider } from './Hooks/useCardStorage';

// Import from Premium - will be stubs or real implementation
// All cloud features (auth, sync, subscription) come from Premium
import {
  AuthProvider,
  PremiumProvider,
  SyncProvider,
  SubscriptionProvider,
  CloudCategoriesProvider
} from './Premium';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <SubscriptionProvider>
        <SyncProvider>
          <CloudCategoriesProvider>
            <CardStorageProvider>
              <App />
            </CardStorageProvider>
          </CloudCategoriesProvider>
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

> **Status:** Premium features are fully implemented. The open-core split (moving to separate repos) is pending.

### Pre-Migration: Implement Premium Features ✅ COMPLETE

**Authentication:**
- [x] `src/Hooks/useAuth.jsx` - Authentication hook
- [x] `src/Components/Viewer/Mobile/Auth/*` - Mobile auth pages

**Subscription:**
- [x] `src/Hooks/useSubscription.jsx` - Tier management
- [x] Three-tier model with database enforcement
- [x] Creem payment integration

**Cloud Sync:**
- [x] `src/Hooks/useSync.jsx` - Full sync implementation (1312 lines)
- [x] `src/Hooks/useCloudCategories.jsx` - Real-time cloud categories
- [x] `src/Components/Viewer/Mobile/Sync/*` - Sync UI
- [x] `src/Components/Viewer/Mobile/Account/*` - Account management

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
- [ ] `src/Hooks/useAuth.jsx` → premium
- [ ] `src/Hooks/useSync.jsx` → premium
- [ ] `src/Hooks/useSubscription.jsx` → premium
- [ ] `src/Hooks/useCloudCategories.jsx` → premium

**Components to move:**
- [ ] `src/Components/Viewer/Mobile/Auth/*` → premium
- [ ] `src/Components/Viewer/Mobile/Account/*` → premium
- [ ] `src/Components/Viewer/Mobile/Sync/*` → premium
- [ ] `src/Components/WelcomeWizard/steps/StepSubscription.jsx` → premium
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
| `src/Components/WelcomeWizard/*` | Welcome wizard (except StepSubscription) |
| `src/Components/Viewer/Mobile/BottomSheet.jsx` | Bottom sheet UI component |
| `src/Hooks/useCardStorage.jsx` | Local storage |
| `src/Hooks/useDataSources.jsx` | Datasource loading |
| `src/Premium/index.js` | Stub exports (no-ops) |

### Files to MOVE to Private Repo

| File | Purpose |
|------|---------|
| `src/Hooks/useAuth.jsx` | Authentication hook |
| `src/Hooks/useSync.jsx` | Cloud sync logic (1312 lines) |
| `src/Hooks/useSubscription.jsx` | Tier management |
| `src/Hooks/useCloudCategories.jsx` | Real-time cloud categories |
| `src/Components/Viewer/Mobile/Auth/*` | Mobile auth UI (Login, Signup, 2FA, Password Reset) |
| `src/Components/Viewer/Mobile/Account/*` | Account management UI |
| `src/Components/Viewer/Mobile/Sync/*` | Sync status UI |
| `src/Components/WelcomeWizard/steps/StepSubscription.jsx` | Premium upsell step |
| `src/Components/Sync/*` | Sync UI components |
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

## Implementation Progress

### Phase 1: Core Features ✅ COMPLETE

- [x] Supabase Auth integration
- [x] Session management
- [x] Mobile auth UI (Login, Signup, Password Reset, 2FA)
- [x] OAuth support (Google, GitHub)

### Phase 2: Subscription System ✅ COMPLETE

- [x] Three-tier model (Free/Premium/Creator)
- [x] useSubscription hook
- [x] Database trigger enforcement
- [x] Creem payment integration
- [x] Customer portal

**Implemented Tiers:**
```
Free:    2 synced categories, 0 custom datasources, €0/mo
Premium: 50 synced categories, 2 custom datasources, €3.99/mo
Creator: 250 synced categories, 10 custom datasources, €7.99/mo
```

### Phase 3: Cloud Sync ✅ COMPLETE

- [x] useSync hook (1312 lines - full implementation)
- [x] Category upload/download to `user_categories` table
- [x] Local datasource sync to `user_datasources` table
- [x] Real-time Supabase subscriptions for multi-device sync
- [x] Conflict detection with 3 resolution strategies (local/cloud/both)
- [x] Version tracking with device ID
- [x] Offline queue with auto-retry on reconnection
- [x] 2-second debounce for pending changes

### Phase 4: Mobile UI ✅ COMPLETE

- [x] Mobile auth pages (MobileLoginPage, MobileSignupPage, etc.)
- [x] Account sheet with tier display (MobileAccountSheet)
- [x] Sync status sheet (MobileSyncSheet, CloudCategorySheet)
- [x] Bottom sheet component (reusable UI)
- [x] Welcome wizard subscription step (StepSubscription)
- [x] useCloudCategories hook

### Phase 5: Open-Core Split ⏳ PENDING

- [ ] Create `src/Premium/index.js` with all stub exports
- [ ] Create private repository `@gdc/premium`
- [ ] Move premium files to private repo
- [ ] Configure webpack alias for premium package
- [ ] Set up CI/CD for both repos
- [ ] Test public build with stubs
- [ ] Test official build with premium
- [ ] Deploy and verify both versions

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
