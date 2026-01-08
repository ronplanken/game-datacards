# Subscription Limits Documentation

This document describes how subscription tiers and their limits are implemented in the Game Datacards application.

## Overview

The application uses a three-tier subscription model with different limits for each tier. Limits are enforced at both client-side and server-side (database level) to ensure they cannot be bypassed.

## Subscription Tiers

| Tier | Categories | Datasources | Can Upload Datasources | Can Access Shares | Price |
|------|-----------|-------------|------------------------|-------------------|-------|
| **Free** | 2 | 0 | No | Yes | - |
| **Premium** | 50 | 2 | Yes | Yes | €3.99/month |
| **Creator** | 250 | 10 | Yes | Yes | €7.99/month |

### Tier Descriptions

- **Free**: Default tier for all users. Limited cloud sync for categories, no custom datasource uploads.
- **Premium**: Standard paid tier. Expanded cloud sync and ability to upload custom datasources.
- **Creator**: Power user tier. Highest limits for users creating and managing extensive content.

## Implementation Details

### Limits Configuration

Limits are defined in `src/Hooks/useSubscription.jsx`:

```javascript
export const SUBSCRIPTION_LIMITS = {
  free: {
    categories: 2,
    datasources: 0,
    canUploadDatasources: false,
    canAccessShares: true,
  },
  premium: {
    categories: 50,
    datasources: 2,
    canUploadDatasources: true,
    canAccessShares: true,
  },
  creator: {
    categories: 250,
    datasources: 10,
    canUploadDatasources: true,
    canAccessShares: true,
  },
};
```

### Key Functions

The `useSubscription` hook provides the following functions for limit enforcement:

| Function | Purpose |
|----------|---------|
| `getTier()` | Returns current tier ('free', 'premium', or 'creator') |
| `getLimits()` | Returns limit object for current tier |
| `canPerformAction(action)` | Checks if an action is allowed based on limits |
| `getRemainingQuota(resource)` | Returns remaining quota for a resource |
| `isOverQuota(resource)` | Returns true if user has reached their limit |

### Accessing Tier in Components

The hook returns a `subscription` object containing the tier. To access it:

```javascript
// Correct way - access tier from subscription object
const { subscription } = useSubscription();
const tier = subscription?.tier || "free";

// Or use the getTier function
const { getTier } = useSubscription();
const tier = getTier();

// WRONG - tier is not directly exported from the hook
// const { tier } = useSubscription(); // This returns undefined!
```

### Supported Actions

The `canPerformAction()` function supports these actions:

- `add_category` - Adding a new cloud-synced category
- `upload_datasource` - Uploading a custom datasource
- `access_shares` - Accessing community shares

### Usage Tracking

Usage is tracked by counting records in database tables:

- **Categories**: Count of records in `user_categories` table
- **Datasources**: Count of records in `user_datasources` table

## Server-Side Enforcement

Limits are enforced at the database level using PostgreSQL triggers. This prevents bypassing client-side checks via direct API calls.

### Database Functions

| Function | Purpose |
|----------|---------|
| `get_effective_tier(user_id)` | Returns tier accounting for subscription expiry |
| `get_tier_limits(tier)` | Returns limits as JSONB for a given tier |
| `validate_category_limit()` | Trigger function that enforces category limits |
| `validate_datasource_limit()` | Trigger function that enforces datasource limits |
| `check_subscription_limit(resource)` | Client-callable RPC to pre-check if action is allowed |
| `get_subscription_usage()` | RPC returning complete usage statistics |

### Triggers

```sql
-- Fires before any INSERT on user_categories
CREATE TRIGGER enforce_category_limit
  BEFORE INSERT ON public.user_categories
  FOR EACH ROW
  EXECUTE FUNCTION validate_category_limit();

-- Fires before any INSERT on user_datasources
CREATE TRIGGER enforce_datasource_limit
  BEFORE INSERT ON public.user_datasources
  FOR EACH ROW
  EXECUTE FUNCTION validate_datasource_limit();
```

### Error Format

When a limit is exceeded, the trigger raises an exception with a parseable format:

```
SUBSCRIPTION_LIMIT_EXCEEDED:<resource>:<current>:<max>;<tier>
```

Example: `SUBSCRIPTION_LIMIT_EXCEEDED:categories:2:2;free`

### Client-Side Error Parsing

The `useSync.jsx` hook parses these errors:

```javascript
const parseSubscriptionLimitError = (errorMessage) => {
  const match = errorMessage.match(/SUBSCRIPTION_LIMIT_EXCEEDED:(\w+):(\d+):(\d+);(\w+)/);
  if (match) {
    return {
      resource: match[1], // 'categories' or 'datasources'
      current: parseInt(match[2], 10),
      limit: parseInt(match[3], 10),
      tier: match[4], // 'free', 'premium', 'creator'
    };
  }
  return null;
};
```

### RPC Functions

**Check limit before action:**
```javascript
const { data } = await supabase.rpc('check_subscription_limit', {
  p_resource: 'categories'
});
// Returns: { resource, tier, current, limit, remaining, canAdd }
```

**Get complete usage stats:**
```javascript
const { data } = await supabase.rpc('get_subscription_usage');
// Returns: { tier, categories: { current, limit, remaining }, datasources: { current, limit, remaining } }
```

### Expiry Handling

The `get_effective_tier()` function checks subscription expiry:
- If `subscription_expires_at < NOW()`, returns `'free'`
- If `subscription_status = 'expired'`, returns `'free'`
- Otherwise returns the actual `subscription_tier`

### Edge Cases

| Scenario | Behavior |
|----------|----------|
| Expired premium subscription | Treated as free tier |
| Over quota after downgrade | Can't add new items, can update/delete existing |
| Rapid concurrent inserts | Database trigger counts actual records |
| Multiple devices | Transaction isolation prevents exceeding limit |

## Database Schema

### User Profiles Table

The `user_profiles` table stores subscription information:

```sql
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY,
  email TEXT,
  subscription_tier TEXT DEFAULT 'free',
  subscription_status TEXT,
  subscription_expires_at TIMESTAMPTZ,
  creem_customer_id TEXT,
  creem_subscription_id TEXT,
  creem_product_id TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### Tier Constraint

```sql
ALTER TABLE public.user_profiles
  ADD CONSTRAINT user_profiles_subscription_tier_check
  CHECK (subscription_tier IN ('free', 'premium', 'creator'));
```

### Subscription Status Values

- `active` - Subscription is active
- `cancelled` - Subscription cancelled but still within paid period
- `expired` - Subscription has expired
- `trialing` - User is in trial period

## UI Components

### UpgradeModal

**Location**: `src/Components/Subscription/UpgradeModal.jsx`

Displays upgrade options when users hit their limits. Shows:
- Current tier and usage
- Feature comparison between tiers
- Pricing information
- Checkout flow integration

**Triggers**:
- `category_limit` - When user tries to create a category at limit
- `datasource_limit` - When user tries to upload a datasource at limit

### UsageIndicator

**Location**: `src/Components/Subscription/UsageIndicator.jsx`

Visual progress bar showing usage:
- **Green** (0-79%): Normal usage
- **Yellow** (80-99%): Approaching limit
- **Red** (100%): Limit reached

### AccountButton / UserMenu

**Location**: `src/Components/Auth/AccountButton.jsx`

Shows:
- Current subscription tier badge
- Usage statistics (X/Y format)
- Upgrade or manage subscription option

## Payment Integration

The application uses **Creem** for payment processing.

### Environment Variables

```env
REACT_APP_CREEM_PRODUCT_ID=prod_...          # Premium tier product
REACT_APP_CREEM_PRODUCT_ID_CREATOR=prod_...  # Creator tier product
```

### Edge Functions

| Function | Purpose |
|----------|---------|
| `create-checkout` | Creates Creem checkout session |
| `creem-webhook` | Handles subscription lifecycle events |
| `get-portal-url` | Gets customer portal URL for subscription management |

### Webhook Events

The `creem-webhook` function handles:

- `checkout.completed` - Initial subscription setup
- `subscription.active` - Subscription activated
- `subscription.paid` - Renewal processed, tier may change
- `subscription.canceled` - Cancellation initiated
- `subscription.expired` - Subscription ended, revert to free
- `subscription.trialing` - Trial started

## Tier Detection Logic

```javascript
const getTier = useCallback(() => {
  if (!isAuthenticated) return "free";
  if (!profile) return "free";

  const tier = profile.subscription_tier;

  if (tier === "premium" || tier === "creator") {
    // Check expiry
    if (profile.subscription_expires_at) {
      const expiryDate = new Date(profile.subscription_expires_at);
      if (expiryDate < new Date()) {
        return "free"; // Expired
      }
    }
    return tier;
  }

  return "free";
}, [isAuthenticated, profile]);
```

## Feature Flag

The paid tier feature can be disabled via environment variable:

```env
REACT_APP_FEATURE_PAID_TIER_ENABLED=true
```

When disabled, upgrade functionality is hidden but existing subscriptions remain active.

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/Hooks/useSubscription.jsx` | Core subscription logic and client-side limits |
| `src/Hooks/useSync.jsx` | Cloud sync with limit error parsing |
| `src/Components/Subscription/UpgradeModal.jsx` | Upgrade UI |
| `src/Components/Subscription/UsageIndicator.jsx` | Usage display |
| `src/Components/Subscription/SubscriptionBadge.jsx` | Tier badge |
| `src/Components/Auth/AccountButton.jsx` | User menu with subscription info |
| `supabase/functions/create-checkout/index.ts` | Checkout session creation |
| `supabase/functions/creem-webhook/index.ts` | Webhook handling |
| `supabase/migrations/001_initial_schema.sql` | Base database schema |
| `supabase/migrations/005_tier_support.sql` | Tier constraint update |
| `supabase/migrations/008_subscription_limit_enforcement.sql` | Server-side limit triggers |

## Adding New Limits

To add a new limit type:

1. Add the limit to `SUBSCRIPTION_LIMITS` in `useSubscription.jsx`
2. Add a new action case in `canPerformAction()`
3. Update `fetchUsage()` to track the new resource
4. Update `getRemainingQuota()` and `isOverQuota()` if needed
5. Update UI components to display the new limit
6. Update `UpgradeModal` with the new feature comparison

## Changing Limits

To change existing limits:

1. Update values in `SUBSCRIPTION_LIMITS` constant in `useSubscription.jsx`
2. Update `TIER_CONFIG` in `UpgradeModal.jsx` for UI display
3. Update `get_tier_limits()` function in database (new migration required)
4. Update documentation comments

**Important**: Limits must be updated in both client-side code AND the database function `get_tier_limits()` to stay in sync.
