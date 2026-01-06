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
  },
  "devDependencies": {
    "@testing-library/react-hooks": "^8.0.1",
    "@testing-library/user-event": "^14.5.1",
    "msw": "^2.0.0", // Mock Service Worker for API mocking
    "codecov": "^3.8.3" // Code coverage reporting
  }
}
```

**Note:** Jest and @testing-library/react are already in the project.

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

### 2.5 Two-Factor Authentication (2FA)
**Implementation using Supabase Auth TOTP**

**New file:** `src/Components/Auth/TwoFactorSetup.jsx`
- QR code display for authenticator app enrollment
- Manual code entry option
- Verify TOTP code during setup
- Generate and display backup codes
- Disable 2FA option (requires password confirmation)

**New file:** `src/Components/Auth/TwoFactorPrompt.jsx`
- Challenge user for TOTP code after password login
- Backup code entry option
- "Remember this device" checkbox (30-day cookie)

**File to modify:** `src/Components/Auth/LoginModal.jsx`
- After successful password auth, check if user has 2FA enabled
- If enabled, show `<TwoFactorPrompt />` before completing login
- Handle backup codes

**File to modify:** `src/Components/Account/AccountSettings.jsx`
- "Enable Two-Factor Authentication" section
- Show 2FA status (enabled/disabled)
- Setup wizard button
- List of backup codes (regenerate option)

**Supabase Implementation:**
```javascript
// Enable 2FA
const { data, error } = await supabase.auth.mfa.enroll({
  factorType: 'totp'
});
// Returns QR code URI and secret

// Verify and activate
await supabase.auth.mfa.challengeAndVerify({
  factorId: data.id,
  code: userEnteredCode
});

// Login with 2FA
const { data, error } = await supabase.auth.mfa.challenge({
  factorId: factorId
});

await supabase.auth.mfa.verify({
  factorId: factorId,
  challengeId: data.id,
  code: userEnteredCode
});
```

**User Flow:**
1. User enables 2FA in account settings
2. Scan QR code with authenticator app (Google Authenticator, Authy, etc.)
3. Enter verification code to confirm setup
4. Receive backup codes (download/print)
5. On next login: password → 2FA code → access granted

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

### 5.5 Handling Expired Subscriptions
**Datasource Behavior on Subscription Expiry:**

When a paid subscription expires or is cancelled:
- Existing uploaded datasources remain **public and accessible**
- Datasources become **read-only** for the owner:
  - Cannot edit datasource metadata
  - Cannot delete datasources
  - Cannot upload new datasources
  - Cannot toggle public/private status
- Other users can still view and import public datasources
- Owner sees banner: "Your subscription has expired. Datasources are read-only. Upgrade to manage."

**Implementation in `useSubscription.jsx`:**
```javascript
const canManageDatasources = () => {
  return tier === 'paid' && subscription_status === 'active';
};

const canUploadDatasource = () => {
  return canManageDatasources();
};
```

**UI Changes in `MySharesView.jsx`:**
```javascript
// Show read-only state if subscription expired
{!canManageDatasources() && (
  <Alert type="warning">
    Your subscription has expired. Your datasources are read-only.
    <Button onClick={handleUpgrade}>Upgrade to manage</Button>
  </Alert>
)}

// Disable edit/delete buttons when read-only
<Button
  disabled={!canManageDatasources()}
  onClick={handleDelete}
>
  Delete
</Button>
```

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

### 6.4 GDPR Compliance (Required for EU)

**New file:** `src/Components/Account/DataExport.jsx`
**Purpose:** Allow users to download all their data

**Features:**
- Button: "Download My Data" in Account Settings
- Generates comprehensive JSON export including:
  - User profile information
  - All categories (with full card data)
  - All uploaded datasources
  - Share history and statistics
  - Account metadata (created date, subscription info)
- Download as `game-datacards-export-[date].json`
- Privacy notice explaining what data is included

**Implementation:**
```javascript
const exportUserData = async () => {
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  const { data: categories } = await supabase
    .from('user_categories')
    .select('*')
    .eq('user_id', user.id);

  const { data: datasources } = await supabase
    .from('user_datasources')
    .select('*')
    .eq('user_id', user.id);

  const { data: shares } = await supabase
    .from('category_shares')
    .select('*')
    .eq('user_id', user.id);

  const exportData = {
    exportDate: new Date().toISOString(),
    profile,
    categories,
    datasources,
    shares,
    version: process.env.REACT_APP_VERSION
  };

  // Download as JSON file
  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `game-datacards-export-${Date.now()}.json`;
  link.click();
};
```

**New file:** `src/Components/Account/DeleteAccount.jsx`
**Purpose:** Allow users to permanently delete their account and data

**Features:**
- Button: "Delete Account" in Account Settings (danger zone)
- Multi-step confirmation process:
  1. Warning modal explaining consequences
  2. Type "DELETE" to confirm
  3. Re-enter password for verification
  4. Final confirmation
- Deletion includes:
  - User profile from `user_profiles`
  - All categories from `user_categories` (CASCADE)
  - All datasources from `user_datasources` (CASCADE)
  - All shares from `category_shares` (SET NULL on user_id, keep shares public)
  - Cancel polar.sh subscription (via API)
  - Auth user from Supabase Auth
- Optional: 30-day grace period (soft delete) before permanent deletion

**Implementation:**
```javascript
const deleteAccount = async () => {
  // 1. Cancel subscription via polar.sh API
  if (subscription_tier === 'paid') {
    await cancelPolarSubscription(polar_subscription_id);
  }

  // 2. Delete user data (CASCADE will handle related tables)
  await supabase.from('user_profiles').delete().eq('id', user.id);

  // 3. Delete auth user (requires admin API or edge function)
  await supabase.functions.invoke('delete-user', {
    body: { userId: user.id }
  });

  // 4. Sign out and redirect
  await supabase.auth.signOut();
  window.location.href = '/';
};
```

**Supabase Edge Function:** `supabase/functions/delete-user/index.ts`
```typescript
// Admin function to delete auth user
import { createClient } from '@supabase/supabase-js'

serve(async (req) => {
  const { userId } = await req.json()

  // Use service role key (admin privileges)
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  )

  const { error } = await supabase.auth.admin.deleteUser(userId)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400
    })
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200
  })
})
```

**Privacy Policy Updates:**
- Document data retention policies
- Explain user rights (access, export, deletion)
- GDPR compliance statement
- Contact email for data requests

**File to modify:** `src/Components/Account/AccountSettings.jsx`
Add new sections:
- **Privacy & Data**
  - Download my data button
  - Delete account button (in danger zone at bottom)

### 6.5 Testing Checklist
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
- [ ] 2FA enrollment and login flow
- [ ] 2FA backup codes
- [ ] GDPR data export functionality
- [ ] GDPR account deletion (full cleanup)
- [ ] Subscription expiry - datasources become read-only
- [ ] Subscription expiry - categories soft limit (no new backups beyond free tier)

---

## Unit Testing Strategy (Medium Coverage ~60-70%)

### Testing Tools
- **Jest**: Test runner (already in project)
- **React Testing Library**: Component testing
- **MSW (Mock Service Worker)**: API mocking for Supabase
- **@testing-library/user-event**: User interaction testing

### Test Coverage Requirements

#### Critical Path Testing (Must Have)
**Authentication (`src/Hooks/useAuth.test.js`)**
- Sign up with email/password
- Login with email/password
- OAuth login flow
- Logout
- Session persistence
- Password reset
- 2FA enrollment
- 2FA login challenge
- 2FA backup codes

**Subscription Management (`src/Hooks/useSubscription.test.js`)**
- Tier detection (free/paid)
- Category limit checking (`canBackupCategory`)
- Datasource upload permission (`canUploadDatasource`)
- Webhook processing (subscription created/cancelled/expired)
- Polar.sh API integration

**Sync Engine (`src/Hooks/useSyncEngine.test.js`)**
- Upload categories to cloud
- Download categories from cloud
- Merge local and cloud data
- Conflict detection
- Conflict resolution (keep local/keep cloud)
- Version increment logic
- Debounced sync
- Offline queue

**Category Storage (`src/Hooks/useCardStorage.test.js`)**
- Add category (with tier limit check)
- Update category (triggers sync)
- Delete category (syncs deletion)
- Category limit enforcement
- Local-only mode (when not authenticated)

#### Feature Testing (Should Have)
**Datasource Management (`src/Hooks/useDataSourceStorage.test.js`)**
- Import custom datasource
- Upload restriction (free tier)
- Cloud upload (paid tier)
- Public datasource browsing
- Read-only mode after subscription expires

**GDPR Compliance (`src/Components/Account/DataExport.test.js`, `DeleteAccount.test.js`)**
- Data export includes all user data
- Export format is valid JSON
- Account deletion removes all data
- Deletion confirmation flow
- Subscription cancellation on deletion

**Share Management (`src/Components/ShareModal.test.js`, `MySharesView.test.js`)**
- Share category (creates share link)
- Link shares to authenticated user
- View user's shares
- Share visibility tracking

#### Component Testing (Should Have)
**UI Components**
- `LoginModal.test.js`: Login/signup forms
- `AccountButton.test.js`: Account dropdown menu
- `TwoFactorSetup.test.js`: 2FA enrollment wizard
- `TwoFactorPrompt.test.js`: 2FA login challenge
- `UpgradeModal.test.js`: Tier comparison and upgrade CTA
- `SyncIndicator.test.js`: Sync status display
- `ConflictModal.test.js`: Conflict resolution UI

### Test File Structure

```javascript
// Example: src/Hooks/useAuth.test.js
import { renderHook, act } from '@testing-library/react-hooks';
import { useAuth } from './useAuth';
import { supabase } from '../config/supabase';

jest.mock('../config/supabase');

describe('useAuth', () => {
  describe('signUp', () => {
    it('creates a new user account', async () => {
      supabase.auth.signUp.mockResolvedValue({
        data: { user: { id: '123', email: 'test@example.com' } },
        error: null
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.signUp('test@example.com', 'password123');
      });

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    it('handles signup errors', async () => {
      supabase.auth.signUp.mockResolvedValue({
        data: null,
        error: { message: 'Email already exists' }
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        const response = await result.current.signUp('test@example.com', 'password123');
        expect(response.error).toBe('Email already exists');
      });
    });
  });

  describe('2FA', () => {
    it('enrolls user in 2FA', async () => {
      supabase.auth.mfa.enroll.mockResolvedValue({
        data: { id: 'factor-123', qr_code: 'data:image/png...' },
        error: null
      });

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        const response = await result.current.enroll2FA();
        expect(response.data.id).toBe('factor-123');
      });
    });
  });
});
```

### Integration Tests (Nice to Have)

**End-to-End User Flows**
Using Playwright (already in project):
- Complete user journey: Signup → Add categories → Upgrade → Upload datasource
- Multi-device sync: Login on device A → make changes → login on device B → verify sync
- Subscription lifecycle: Subscribe → upload datasource → cancel → verify read-only

```javascript
// Example: tests/e2e/auth.spec.js
import { test, expect } from '@playwright/test';

test('complete authentication flow', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Click login button
  await page.click('[data-testid="account-button"]');

  // Switch to signup
  await page.click('[data-testid="signup-tab"]');

  // Fill signup form
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'SecurePassword123!');
  await page.click('[data-testid="signup-submit"]');

  // Verify redirect and authenticated state
  await expect(page.locator('[data-testid="user-email"]')).toContainText('test@example.com');
});
```

### Test Coverage Goals

| Module | Target Coverage |
|--------|----------------|
| Auth hooks | 80%+ |
| Subscription hooks | 80%+ |
| Sync engine | 70%+ |
| Storage hooks | 60%+ |
| UI Components | 50%+ (critical paths only) |
| Utilities | 70%+ |
| **Overall** | **~60-70%** |

### Continuous Integration

**GitHub Actions Workflow** (`.github/workflows/test.yml`):
```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: yarn install
      - run: yarn test:ci
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

### Testing Checklist by Phase

**Phase 1 (Foundation):**
- [ ] useAuth unit tests
- [ ] LoginModal component tests
- [ ] SignupModal component tests
- [ ] Session persistence tests

**Phase 2 (Subscription):**
- [ ] useSubscription unit tests
- [ ] Tier limit tests
- [ ] Webhook handler tests
- [ ] 2FA enrollment tests
- [ ] 2FA login tests

**Phase 3 (Sync):**
- [ ] useSyncEngine unit tests
- [ ] Conflict detection tests
- [ ] Merge logic tests
- [ ] Debounce tests

**Phase 4 (Tier Limits):**
- [ ] Category limit enforcement tests
- [ ] Upgrade prompt tests

**Phase 5 (Datasources):**
- [ ] Upload restriction tests
- [ ] Read-only mode tests
- [ ] Share visibility tests

**Phase 6 (GDPR):**
- [ ] Data export tests
- [ ] Account deletion tests
- [ ] Privacy compliance tests

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

### Sprint 2: Subscription & 2FA (Week 2-3)
8. Implement `useSubscription` hook
9. Set up polar.sh webhook (Supabase Edge Function)
10. Create UpgradeModal component
11. Implement tier checking logic
12. **Implement 2FA enrollment (TwoFactorSetup component)**
13. **Implement 2FA login challenge (TwoFactorPrompt component)**
14. **Add 2FA settings to AccountSettings**
15. Test subscription flow end-to-end
16. **Test 2FA enrollment and login flows**
17. Write unit tests for auth and subscription

### Sprint 3: Sync Engine (Week 3-5)
18. Implement `useSyncEngine` hook
19. Modify `useCardStorage` to integrate sync
20. Create SyncIndicator component
21. Create ConflictModal component
22. Test sync across multiple devices
23. Test conflict resolution
24. Write unit tests for sync engine

### Sprint 4: Tier Limits (Week 5-6)
25. Add category limit enforcement (free: 2, paid: 50)
26. Implement soft limit on subscription expiry (categories stay read-only)
27. Show upgrade prompts at limits
28. Test free tier limits
29. Test paid tier limits
30. Test subscription expiry behavior
31. Write unit tests for tier enforcement

### Sprint 5: Datasource Features (Week 6-7)
32. Restrict datasource uploads to paid tier
33. Implement cloud datasource storage
34. Implement read-only mode for expired subscriptions
35. Create MySharesView component
36. Update ShareModal to link shares to accounts
37. Test datasource upload/sharing flow
38. Write unit tests for datasource management

### Sprint 6: GDPR, Polish & Migration (Week 7-8)
39. **Implement data export (DataExport component)**
40. **Implement account deletion (DeleteAccount component)**
41. **Create delete-user Supabase Edge Function**
42. **Test GDPR compliance (export, deletion)**
43. Create BackupPrompt for existing users
44. Update SettingsModal with account section
45. Add comprehensive error handling
46. Add loading states throughout
47. Write user documentation (including GDPR/privacy policy)
48. Complete all unit tests (target 60-70% coverage)
49. End-to-end testing with Playwright
50. Beta testing with real users
51. Production deployment

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

- **Local-only mode toggle**: Privacy mode to disable cloud sync while keeping account benefits
- Real-time collaboration (multiple users editing same category)
- Public datasource marketplace with search/ratings
- Version history / backup snapshots (time-travel recovery)
- Team/organization accounts
- Mobile app with same sync engine
- Advanced conflict resolution (merge changes intelligently)
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

## Requirements Summary (Finalized)

**Answered:**
- **Timeline**: 7-8 weeks is acceptable ✓
- **Datasource expiry**: When paid subscription expires, uploaded datasources become read-only (remain public but user cannot edit/delete/upload new ones) ✓
- **Local-only mode**: Not for MVP, add to future enhancements ✓
- **2FA/MFA**: Implement from day one using Supabase Auth ✓
- **Grace period**: Soft limit (Option C) - categories stay read-only in cloud when subscription expires, cannot add new ones beyond free tier limit ✓
- **GDPR compliance**: Required - implement data export and account deletion ✓
- **Unit testing**: Medium coverage (~60-70%) with Jest + React Testing Library ✓

---

## Files Manifest

### New Files (43)

**Core Configuration:**
```
src/config/supabase.js
.env.example
```

**Hooks:**
```
src/Hooks/useAuth.jsx
src/Hooks/useSubscription.jsx
src/Hooks/useSyncEngine.jsx
```

**Authentication Components:**
```
src/Components/Auth/LoginModal.jsx
src/Components/Auth/SignupModal.jsx
src/Components/Auth/AccountButton.jsx
src/Components/Auth/TwoFactorSetup.jsx
src/Components/Auth/TwoFactorPrompt.jsx
```

**Account Management Components:**
```
src/Components/Account/AccountSettings.jsx
src/Components/Account/MySharesView.jsx
src/Components/Account/DataExport.jsx
src/Components/Account/DeleteAccount.jsx
```

**Sync Components:**
```
src/Components/Sync/SyncIndicator.jsx
src/Components/Sync/ConflictModal.jsx
```

**Subscription Components:**
```
src/Components/Subscription/UpgradeModal.jsx
```

**Onboarding:**
```
src/Components/Onboarding/BackupPrompt.jsx
```

**Utilities:**
```
src/utils/syncHelpers.js
src/utils/conflictResolution.js
```

**Database & Backend:**
```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_rls_policies.sql
supabase/migrations/003_indexes.sql
supabase/functions/polar-webhook/index.ts
supabase/functions/delete-user/index.ts
```

**Unit Tests:**
```
src/Hooks/useAuth.test.js
src/Hooks/useSubscription.test.js
src/Hooks/useSyncEngine.test.js
src/Hooks/useCardStorage.test.js
src/Hooks/useDataSourceStorage.test.js
src/Components/Auth/LoginModal.test.js
src/Components/Auth/TwoFactorSetup.test.js
src/Components/Account/DataExport.test.js
src/Components/Account/DeleteAccount.test.js
src/Components/ShareModal.test.js
src/Components/Account/MySharesView.test.js
```

**Integration Tests:**
```
tests/e2e/auth.spec.js
tests/e2e/subscription.spec.js
tests/e2e/sync.spec.js
```

**Documentation:**
```
docs/USER_GUIDE_ACCOUNTS.md
docs/SYNC_ARCHITECTURE.md
docs/PRIVACY_POLICY.md
```

**CI/CD:**
```
.github/workflows/test.yml
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

