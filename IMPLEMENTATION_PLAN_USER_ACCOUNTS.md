# Implementation Plan: User Accounts & Online Backup System

## Overview
Migrate from Firebase (analytics-only) to Supabase with full user authentication, online backup, and tiered subscription system via polar.sh.

## Requirements Summary
- **Free Tier**: 2 categories online backup, can consume shared datasources
- **Paid Tier**: 50 categories online backup, can upload/share custom datasources
- **Payment**: polar.sh integration
- **Auth**: Supabase Auth
- **Sync**: Auto-sync to cloud with conflict resolution
- **Backwards Compatibility**: Anonymous users continue working locally

---

## Phase 1: Infrastructure Setup

### 1.1 Supabase Project Setup
**Action Items:**
- [ ] Create new Supabase project
- [ ] Configure authentication providers (Email, Google, GitHub)
- [ ] Set up Row Level Security (RLS) policies
- [ ] Create database schema (see schema below)

**Database Schema:**

```sql
-- Users table (extended from auth.users)
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  subscription_tier TEXT DEFAULT 'free', -- 'free' or 'paid'
  polar_customer_id TEXT,
  polar_subscription_id TEXT,
  subscription_status TEXT, -- 'active', 'cancelled', 'expired'
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User categories (cloud backup)
CREATE TABLE public.user_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  uuid TEXT NOT NULL, -- matches client-side UUID
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  parent_id TEXT,
  cards JSONB NOT NULL,
  closed BOOLEAN DEFAULT false,
  last_modified TIMESTAMPTZ DEFAULT NOW(),
  version INTEGER DEFAULT 1, -- for conflict detection
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, uuid)
);

-- User datasources (paid feature)
CREATE TABLE public.user_datasources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  datasource_id TEXT NOT NULL, -- matches client-side ID
  name TEXT NOT NULL,
  data JSONB NOT NULL,
  display_format TEXT,
  version TEXT,
  is_public BOOLEAN DEFAULT false,
  share_code TEXT UNIQUE, -- for sharing
  downloads INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, datasource_id)
);

-- Share tracking (migrated from Firebase)
CREATE TABLE public.category_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- nullable for backward compat
  share_id TEXT UNIQUE NOT NULL, -- public share ID
  category JSONB NOT NULL,
  description TEXT,
  likes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  version TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sync metadata (for conflict resolution)
CREATE TABLE public.sync_metadata (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  last_sync_at TIMESTAMPTZ,
  device_id TEXT,
  sync_version INTEGER DEFAULT 1
);
```

**RLS Policies:**

```sql
-- user_profiles: Users can only read/update their own profile
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);

-- user_categories: Users can only access their own categories
ALTER TABLE public.user_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own categories" ON public.user_categories FOR ALL USING (auth.uid() = user_id);

-- user_datasources: Users can manage own, anyone can read public ones
ALTER TABLE public.user_datasources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own datasources" ON public.user_datasources FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view public datasources" ON public.user_datasources FOR SELECT USING (is_public = true);

-- category_shares: Users can manage own shares, anyone can read
ALTER TABLE public.category_shares ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view shares" ON public.category_shares FOR SELECT USING (true);
CREATE POLICY "Users can create shares" ON public.category_shares FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can manage own shares" ON public.category_shares FOR UPDATE USING (auth.uid() = user_id);
```

### 1.2 Polar.sh Integration Setup
**Action Items:**
- [ ] Create polar.sh account and product
- [ ] Set up subscription tiers (Free/Paid)
- [ ] Configure webhook endpoints for subscription events
- [ ] Get API keys (sandbox + production)

**Webhook Events to Handle:**
- `subscription.created`
- `subscription.updated`
- `subscription.cancelled`
- `subscription.expired`

### 1.3 Dependencies Installation
**Files to modify:** `package.json`

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "@polar-sh/sdk": "^latest", // Check if SDK exists, otherwise use REST API
    "react-query": "^3.39.3" // For data fetching/caching
  }
}
```

---

## Phase 2: Authentication & User Management

### 2.1 Supabase Client Setup
**New file:** `src/config/supabase.js`

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**Environment variables needed:**
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`
- `REACT_APP_POLAR_API_KEY`

### 2.2 Auth Context/Hook
**New file:** `src/Hooks/useAuth.jsx`

**Responsibilities:**
- Manage authentication state (user, session)
- Provide login/logout/signup methods
- Handle auth state persistence
- Sync with user_profiles table
- Expose auth methods to components

**Key methods:**
```javascript
{
  user,              // Current user object or null
  session,           // Current session or null
  loading,           // Auth state loading
  signIn,            // Email/password or OAuth
  signUp,            // Create new account
  signOut,           // Logout
  resetPassword,     // Password reset
  isAuthenticated,   // Boolean
}
```

### 2.3 Subscription Context/Hook
**New file:** `src/Hooks/useSubscription.jsx`

**Responsibilities:**
- Track user's subscription tier (free/paid)
- Check feature access (category limits, datasource uploads)
- Handle polar.sh API calls
- Provide upgrade/manage subscription links

**Key methods:**
```javascript
{
  tier,                    // 'free' or 'paid'
  isLoading,
  canBackupCategory,      // Check against limits
  canUploadDatasource,    // Paid only
  categoryLimit,          // 2 or 50
  usedCategorySlots,      // Current count
  upgradeUrl,             // Link to polar.sh checkout
  manageSubscriptionUrl,  // Link to polar.sh portal
  refreshSubscription,    // Force refresh from server
}
```

### 2.4 UI Components

**New file:** `src/Components/Auth/LoginModal.jsx`
- Modal with email/password login
- OAuth buttons (Google, GitHub)
- Switch to signup mode
- Password reset link
- Uses Supabase Auth methods

**New file:** `src/Components/Auth/AccountButton.jsx`
- Shows login button when not authenticated
- Shows user avatar/email when authenticated
- Dropdown menu with:
  - Account settings
  - Subscription status
  - My shares
  - Logout

**New file:** `src/Components/Auth/SignupModal.jsx`
- Email/password signup
- OAuth signup
- Terms acceptance

**File to modify:** `src/Components/AppHeader.jsx`
- Add `<AccountButton />` to header
- Show sync status indicator when authenticated

---

## Phase 3: Data Sync & Backup

### 3.1 Sync Engine
**New file:** `src/Hooks/useSyncEngine.jsx`

**Responsibilities:**
- Auto-sync categories to cloud when changes detected
- Download categories from cloud on login
- Handle conflict resolution
- Debounce sync operations
- Show sync status (syncing, synced, error, conflict)

**Sync Strategy:**
1. On login: Download all user categories from cloud
2. Merge with local categories (by UUID)
3. If conflict detected (version mismatch), prompt user
4. On local change: Debounce 2s, then upload to cloud
5. Increment version number on each upload

**Conflict Resolution UI:**
```
Conflict detected for category "My Army"
Local version: Modified 2 minutes ago
Cloud version: Modified 5 minutes ago (from another device)

[Keep Local] [Keep Cloud] [View Diff]
```

### 3.2 Modify Card Storage Hook
**File to modify:** `src/Hooks/useCardStorage.jsx`

**Changes needed:**
1. Import `useAuth` and `useSyncEngine`
2. After `setCardStorage`, trigger sync if authenticated
3. Add methods:
   - `syncToCloud()` - Manual sync trigger
   - `downloadFromCloud()` - Manual download
   - `resolveConflict(resolution)` - Apply conflict resolution

**Pseudo-code integration:**
```javascript
const { user, isAuthenticated } = useAuth();
const { syncCategories, downloadCategories, hasConflict } = useSyncEngine();

// Wrap existing setCardStorage updates
const wrappedSetCardStorage = (newStorage) => {
  setCardStorage(newStorage);
  if (isAuthenticated) {
    syncCategories(newStorage.categories);
  }
};

// On initial mount when authenticated
useEffect(() => {
  if (isAuthenticated && user) {
    downloadCategories().then(cloudCategories => {
      // Merge logic here
    });
  }
}, [isAuthenticated, user]);
```

### 3.3 Sync Indicator UI
**New file:** `src/Components/Sync/SyncIndicator.jsx`

Shows in header:
- ✓ Synced (green)
- ⟳ Syncing... (blue, animated)
- ⚠ Conflict (yellow, clickable)
- ✗ Sync Error (red, clickable)
- — Offline (gray)

### 3.4 Conflict Resolution Modal
**New file:** `src/Components/Sync/ConflictModal.jsx`

- Show side-by-side diff of local vs cloud
- Buttons: "Keep Local", "Keep Cloud", "Cancel"
- Apply resolution and re-sync

---

## Phase 4: Tier Management & Limits

### 4.1 Category Limit Enforcement
**File to modify:** `src/Hooks/useCardStorage.jsx`

**Changes in `addCategory` and `importCategory`:**
```javascript
const { canBackupCategory, tier, categoryLimit } = useSubscription();

const addCategory = (categoryName, type = "category") => {
  if (isAuthenticated) {
    const cloudCategoryCount = cardStorage.categories.filter(
      cat => !cat.parentId // Only count top-level categories
    ).length;

    if (!canBackupCategory(cloudCategoryCount)) {
      // Show upgrade modal
      showUpgradeModal(`You've reached the limit of ${categoryLimit} categories for ${tier} tier`);
      return;
    }
  }

  // Existing logic...
};
```

### 4.2 Upgrade Modal
**New file:** `src/Components/Subscription/UpgradeModal.jsx`

- Show current tier limits
- Show paid tier benefits
- Button linking to polar.sh checkout
- "Maybe later" option (local-only mode continues)

**Benefits comparison:**
```
Free Tier:
✓ Unlimited local categories
✓ 2 categories backed up online
✓ Import shared datasources
✗ Upload custom datasources

Paid Tier ($X/month):
✓ Unlimited local categories
✓ 50 categories backed up online
✓ Import shared datasources
✓ Upload & share custom datasources
```

### 4.3 Polar.sh Webhook Handler
**New file:** `src/api/webhooks/polar.js` (if backend exists)
OR
**Use Supabase Edge Functions**

**Webhook handler should:**
1. Verify webhook signature
2. Parse event type
3. Update `user_profiles` table with subscription status
4. Return 200 OK

Example Supabase Edge Function:
```javascript
// supabase/functions/polar-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const payload = await req.json()
  const supabase = createClient(...)

  if (payload.event === 'subscription.created') {
    await supabase.from('user_profiles').update({
      subscription_tier: 'paid',
      polar_subscription_id: payload.data.id,
      subscription_status: 'active',
      subscription_expires_at: payload.data.current_period_end
    }).eq('polar_customer_id', payload.data.customer_id)
  }

  // Handle other events...

  return new Response(JSON.stringify({ received: true }), { status: 200 })
})
```

---

## Phase 5: Datasource Sharing (Paid Feature)

### 5.1 Datasource Upload Restriction
**File to modify:** `src/Hooks/useDataSourceStorage.jsx`

**Changes in `importCustomDatasource`:**
```javascript
const { tier, canUploadDatasource } = useSubscription();
const { user } = useAuth();

const importCustomDatasource = async (datasourceData, sourceType, sourceUrl = null) => {
  // If uploading (not importing from URL), check tier
  if (sourceType === 'local' && user && !canUploadDatasource()) {
    return {
      success: false,
      error: 'Custom datasource uploads require a paid subscription',
      needsUpgrade: true
    };
  }

  // Existing validation...

  // If user is authenticated and uploading, also save to cloud
  if (user && sourceType === 'local') {
    await uploadDatasourceToCloud(preparedDatasource);
  }

  // Existing logic...
};
```

### 5.2 Cloud Datasource Upload
**New method in `useDataSourceStorage.jsx`:**
```javascript
const uploadDatasourceToCloud = async (datasource) => {
  const { data, error } = await supabase
    .from('user_datasources')
    .insert({
      user_id: user.id,
      datasource_id: datasource.id,
      name: datasource.name,
      data: datasource,
      display_format: datasource.displayFormat,
      version: datasource.version,
      is_public: false // Default to private
    });

  return { data, error };
};
```

### 5.3 "My Shares" View
**New file:** `src/Components/Account/MySharesView.jsx`

Shows two tabs:
1. **My Category Shares** - Categories shared via ShareModal
2. **My Datasources** - Custom datasources uploaded

Each item shows:
- Name
- Share link (copy button)
- Views/Downloads count
- Public/Private toggle
- Delete option

### 5.4 Modify Share Modal
**File to modify:** `src/Components/ShareModal.jsx`

**Changes:**
1. If user is authenticated, save to `category_shares` with `user_id`
2. Show "View my shares" link
3. After sharing, show in My Shares list

---

## Phase 6: Migration & Polish

### 6.1 One-Time Backup Prompt
**New file:** `src/Components/Onboarding/BackupPrompt.jsx`

**Trigger logic:**
- Show once to existing users (check localStorage flag)
- Only show if they have categories and are not authenticated
- Message: "You have X categories. Create an account to back them up online!"
- Buttons: "Create Account", "Remind me later", "Don't ask again"

### 6.2 Settings Integration
**File to modify:** `src/Components/SettingsModal.jsx`

Add new section: "Account & Sync"
- Login status
- Subscription tier
- Auto-sync toggle (on by default)
- Manual sync trigger button
- Category backup usage: "2/2 categories backed up" (with upgrade link)
- "View my shares" link

### 6.3 Analytics Migration Decision
**File to modify:** `src/Hooks/useFirebase.jsx`

**Option A:** Keep Firebase for analytics only
- Minimal changes
- Keep existing analytics tracking
- Only migrate Firestore shares to Supabase

**Option B:** Migrate to Supabase Analytics
- Remove Firebase dependency entirely
- Use Supabase's analytics or integrate PostHog/Plausible
- Cleaner architecture

**Recommendation:** Keep Firebase for analytics (Option A) to minimize breaking changes.

### 6.4 Testing Checklist
- [ ] Anonymous user flow (no changes to existing behavior)
- [ ] Free tier signup and category backup
- [ ] Free tier limit enforcement (3rd category prompts upgrade)
- [ ] Paid tier signup via polar.sh
- [ ] Subscription webhook handling
- [ ] Category sync across devices
- [ ] Conflict resolution flow
- [ ] Datasource upload restriction (free vs paid)
- [ ] Share tracking with user accounts
- [ ] Offline mode (auto-sync when back online)
- [ ] Session persistence across refreshes

---

## Implementation Order (Recommended)

### Sprint 1: Foundation (Week 1-2)
1. Set up Supabase project and database schema
2. Set up polar.sh account and products
3. Install dependencies
4. Create Supabase client config
5. Implement `useAuth` hook and auth UI (LoginModal, AccountButton)
6. Add account button to header
7. Test authentication flow

### Sprint 2: Subscription Integration (Week 2-3)
8. Implement `useSubscription` hook
9. Set up polar.sh webhook (Supabase Edge Function)
10. Create UpgradeModal component
11. Implement tier checking logic
12. Test subscription flow end-to-end

### Sprint 3: Sync Engine (Week 3-5)
13. Implement `useSyncEngine` hook
14. Modify `useCardStorage` to integrate sync
15. Create SyncIndicator component
16. Create ConflictModal component
17. Test sync across multiple devices
18. Test conflict resolution

### Sprint 4: Tier Limits (Week 5-6)
19. Add category limit enforcement
20. Show upgrade prompts at limits
21. Test free tier limits
22. Test paid tier limits

### Sprint 5: Datasource Features (Week 6-7)
23. Restrict datasource uploads to paid tier
24. Implement cloud datasource storage
25. Create MySharesView component
26. Update ShareModal to link shares to accounts
27. Test datasource upload/sharing flow

### Sprint 6: Polish & Migration (Week 7-8)
28. Create BackupPrompt for existing users
29. Update SettingsModal with account section
30. Add comprehensive error handling
31. Add loading states throughout
32. Write user documentation
33. End-to-end testing
34. Beta testing with real users
35. Production deployment

---

## Database Indexes (Performance)

```sql
-- Speed up category queries by user
CREATE INDEX idx_user_categories_user_id ON public.user_categories(user_id);
CREATE INDEX idx_user_categories_last_modified ON public.user_categories(last_modified DESC);

-- Speed up datasource queries
CREATE INDEX idx_user_datasources_user_id ON public.user_datasources(user_id);
CREATE INDEX idx_user_datasources_public ON public.user_datasources(is_public) WHERE is_public = true;
CREATE INDEX idx_user_datasources_share_code ON public.user_datasources(share_code);

-- Speed up share queries
CREATE INDEX idx_category_shares_user_id ON public.category_shares(user_id);
CREATE INDEX idx_category_shares_share_id ON public.category_shares(share_id);
```

---

## Environment Variables Summary

**.env** (Development)
```
REACT_APP_SUPABASE_URL=https://xxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJxxx...
REACT_APP_POLAR_API_KEY=polar_sk_xxx
REACT_APP_POLAR_WEBHOOK_SECRET=whsec_xxx
REACT_APP_ENVIRONMENT=development
```

**.env.production**
```
REACT_APP_SUPABASE_URL=https://xxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJxxx...
REACT_APP_POLAR_API_KEY=polar_sk_xxx (production key)
REACT_APP_POLAR_WEBHOOK_SECRET=whsec_xxx (production secret)
REACT_APP_ENVIRONMENT=production
```

---

## Key Technical Decisions

1. **Why Supabase?**
   - Built-in auth with OAuth providers
   - Real-time subscriptions (future feature: live collaboration)
   - PostgreSQL with full SQL capabilities
   - Edge functions for webhooks
   - Row Level Security for data protection

2. **Why keep Firebase Analytics?**
   - Already integrated and working
   - No need to migrate existing analytics data
   - Minimal changes to codebase
   - Can always migrate later if needed

3. **Why polar.sh?**
   - As specified by user
   - Good for SaaS subscriptions
   - Handles international taxes
   - Clean checkout experience

4. **Conflict Resolution Strategy:**
   - Version-based detection (increment on each save)
   - Last-write-wins by default (with user confirmation)
   - Show diff when possible
   - Never auto-overwrite without user consent

5. **Sync Strategy:**
   - Optimistic updates (save local first)
   - Debounced cloud sync (2s after change)
   - Queue failed syncs for retry
   - Background sync when app regains focus

---

## Potential Future Enhancements

- Real-time collaboration (multiple users editing same category)
- Public datasource marketplace
- Version history / backup snapshots
- Export entire account data (GDPR compliance)
- Team/organization accounts
- Mobile app with same sync engine
- Advanced conflict resolution (merge changes)
- Share categories with specific users (private sharing)

---

## Security Considerations

1. **Row Level Security**: All tables must have RLS policies
2. **API Keys**: Never expose Supabase service role key in frontend
3. **Webhook Security**: Verify polar.sh webhook signatures
4. **Input Validation**: Validate all user input on both client and server
5. **Rate Limiting**: Implement on Supabase edge functions
6. **XSS Protection**: Sanitize JSONB data when rendering
7. **SQL Injection**: Use parameterized queries (Supabase client handles this)

---

## Rollback Strategy

If critical issues are found after deployment:

1. **Authentication disabled**: Add feature flag to hide login button
2. **Sync disabled**: Add feature flag to disable cloud sync
3. **Database rollback**: Keep database migration scripts versioned
4. **Gradual rollout**: Use feature flags to enable for % of users
5. **Monitoring**: Set up alerts for sync errors, auth failures

---

## Success Metrics

- User signup rate
- Free to paid conversion rate
- Average categories per user (free vs paid)
- Datasource upload count (paid users)
- Sync success rate
- Conflict resolution frequency
- Churn rate
- Support tickets related to sync/auth

---

## Questions for Review

1. Should we implement a "local-only mode" toggle for privacy-conscious users?
2. Should we add 2FA/MFA support from day one?
3. What should happen to datasources when a paid subscription expires?
4. Should there be a grace period before enforcing category limits?
5. Do we need GDPR-compliant data export/deletion flows?

---

## Files Manifest

### New Files (23)
```
src/config/supabase.js
src/Hooks/useAuth.jsx
src/Hooks/useSubscription.jsx
src/Hooks/useSyncEngine.jsx
src/Components/Auth/LoginModal.jsx
src/Components/Auth/SignupModal.jsx
src/Components/Auth/AccountButton.jsx
src/Components/Sync/SyncIndicator.jsx
src/Components/Sync/ConflictModal.jsx
src/Components/Subscription/UpgradeModal.jsx
src/Components/Account/MySharesView.jsx
src/Components/Account/AccountSettings.jsx
src/Components/Onboarding/BackupPrompt.jsx
src/utils/syncHelpers.js
src/utils/conflictResolution.js
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_rls_policies.sql
supabase/migrations/003_indexes.sql
supabase/functions/polar-webhook/index.ts
.env.example
docs/USER_GUIDE_ACCOUNTS.md
docs/SYNC_ARCHITECTURE.md
tests/sync.test.js
```

### Modified Files (7)
```
package.json (add dependencies)
src/App.jsx (wrap with AuthProvider, SubscriptionProvider)
src/Components/AppHeader.jsx (add AccountButton, SyncIndicator)
src/Components/SettingsModal.jsx (add account section)
src/Components/ShareModal.jsx (link shares to user)
src/Hooks/useCardStorage.jsx (integrate sync engine)
src/Hooks/useDataSourceStorage.jsx (add tier restrictions)
```

---

## Next Steps

Once this plan is approved, we can start with Phase 1:

1. I'll help set up the Supabase project and database schema
2. Create the initial migration files
3. Set up the authentication system
4. Then proceed through each phase systematically

Let me know if you'd like me to:
- Clarify any section
- Add more detail to specific features
- Adjust the timeline/sprint breakdown
- Start implementing Phase 1

