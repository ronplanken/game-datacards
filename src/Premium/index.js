/**
 * Premium Feature Stubs
 *
 * This file contains stub exports for premium features.
 * In the public/community version, these stubs provide no-op implementations.
 * In the official build, webpack aliases replace this with the @gdc/premium package.
 *
 * All cloud features (auth, sync, subscriptions) are premium-only.
 * The public version works with local storage only.
 */

// =====================================================
// PROVIDERS - No-op providers that just render children
// =====================================================

export const AuthProvider = ({ children }) => children;
export const SyncProvider = ({ children }) => children;
export const SubscriptionProvider = ({ children }) => children;
export const CloudCategoriesProvider = ({ children }) => children;

// =====================================================
// HOOKS - Return safe defaults / disabled state
// =====================================================

/**
 * Stub for useAuth - no authentication in public version
 */
export const useAuth = () => ({
  user: null,
  session: null,
  profile: null,
  loading: false,
  isAuthenticated: false,
  // Auth methods - all return failure
  signUp: () => Promise.resolve({ success: false, error: "Not available in community version" }),
  signIn: () => Promise.resolve({ success: false, error: "Not available in community version" }),
  signInWithOAuth: () => Promise.resolve({ success: false, error: "Not available in community version" }),
  signOut: () => Promise.resolve({ success: true }),
  resetPassword: () => Promise.resolve({ success: false, error: "Not available in community version" }),
  updatePassword: () => Promise.resolve({ success: false, error: "Not available in community version" }),
  updateUserMetadata: () => Promise.resolve({ success: false, error: "Not available in community version" }),
  fetchUserProfile: () => Promise.resolve(),
  // 2FA methods - all return failure
  enroll2FA: () => Promise.resolve({ success: false, error: "Not available in community version" }),
  verify2FAEnrollment: () => Promise.resolve({ success: false, error: "Not available in community version" }),
  challenge2FA: () => Promise.resolve({ success: false, error: "Not available in community version" }),
  verify2FA: () => Promise.resolve({ success: false, error: "Not available in community version" }),
  unenroll2FA: () => Promise.resolve({ success: false, error: "Not available in community version" }),
  getFactors: () => Promise.resolve({ success: true, factors: [], totpFactors: [] }),
});

/**
 * Stub for useSync - sync disabled in public version
 */
export const useSync = () => ({
  // Category Actions
  uploadCategory: () => Promise.resolve({ success: false }),
  downloadCategories: () => Promise.resolve({ success: false, data: [] }),
  enableSync: () => Promise.resolve({ success: false }),
  disableSync: () => Promise.resolve({ success: false }),
  syncAll: () => Promise.resolve({ success: false }),
  checkConflicts: () => Promise.resolve({ success: false, conflicts: [] }),
  resolveConflict: () => Promise.resolve({ success: false }),
  deleteFromCloud: () => Promise.resolve({ success: false }),
  // Local Datasource Actions
  uploadLocalDatasource: () => Promise.resolve({ success: false }),
  downloadLocalDatasources: () => Promise.resolve({ success: false, data: [] }),
  syncAllDatasources: () => Promise.resolve({ success: false }),
  syncDatasourcesFromCloud: () => Promise.resolve({ success: false, imported: 0 }),
  deleteLocalDatasourceFromCloud: () => Promise.resolve({ success: false }),
  // State
  isSyncing: false,
  isOnline: true,
  lastSyncTime: null,
  conflicts: [],
  globalSyncStatus: "disabled",
  syncedCount: 0,
  syncedCategoryCount: 0,
  syncedDatasourceCount: 0,
  pendingCount: 0,
  errorCount: 0,
  conflictCount: 0,
});

/**
 * Stub for useSubscription - always "free" tier with unlimited local storage
 */
export const useSubscription = () => ({
  // State
  subscription: null,
  loading: false,
  usage: { categories: 0, datasources: 0 },
  // Utilities - local actions always allowed
  getTier: () => "free",
  getLimits: () => ({
    categories: 0, // No cloud sync in free
    datasources: 0,
    canUploadDatasources: false,
    canAccessShares: false,
  }),
  canPerformAction: () => true, // Local actions always allowed
  getRemainingQuota: () => Infinity, // Unlimited local categories
  isOverQuota: () => false,
  // Actions - all no-ops
  startCheckout: () => Promise.resolve({ success: false }),
  openCustomerPortal: () => Promise.resolve({ success: false }),
  refreshSubscription: () => Promise.resolve(),
  fetchUsage: () => Promise.resolve(),
  // Feature flags
  isPaidTierEnabled: false,
});

/**
 * Stub for useCloudCategories - empty in public version
 */
export const useCloudCategories = () => ({
  categories: [],
  isLoading: false,
  error: null,
  refresh: () => Promise.resolve(),
  lastFetchTime: null,
});

/**
 * Stub for usePremiumFeatures - check if premium features are available
 */
export const usePremiumFeatures = () => ({
  hasPremium: false,
  hasSync: false,
  hasAuth: false,
  hasSubscription: false,
  hasCustomDatasources: false,
});

// =====================================================
// SUBSCRIPTION LIMITS CONSTANT
// =====================================================

export const SUBSCRIPTION_LIMITS = {
  free: {
    categories: 0,
    datasources: 0,
    canUploadDatasources: false,
    canAccessShares: false,
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
  lifetime: {
    categories: 999,
    datasources: 99,
    canUploadDatasources: true,
    canAccessShares: true,
  },
  admin: {
    categories: 999,
    datasources: 99,
    canUploadDatasources: true,
    canAccessShares: true,
  },
};

// =====================================================
// DESKTOP AUTH COMPONENTS - All render null
// =====================================================

export const AccountButton = () => null;
export const LoginModal = () => null;
export const SignupModal = () => null;
export const TwoFactorPrompt = () => null;
export const TwoFactorSetup = () => null;

// =====================================================
// MOBILE AUTH COMPONENTS - All render null
// =====================================================

export const MobileLoginPage = () => null;
export const MobileSignupPage = () => null;
export const MobilePasswordResetPage = () => null;
export const MobileTwoFactorPage = () => null;

// =====================================================
// ACCOUNT COMPONENTS - All render null
// =====================================================

export const MobileAccountSheet = () => null;

// =====================================================
// SYNC COMPONENTS - All render null
// =====================================================

export const MobileSyncSheet = () => null;
export const CloudCategorySheet = () => null;
export const CategorySyncIcon = () => null;
export const DatasourcePublishIcon = () => null;
export const DatasourceSyncIcon = () => null;
export const SyncClaimModal = () => null;
export const SyncConflictModal = () => null;
export const SyncConflictHandler = () => null;
export const SyncStatusIndicator = () => null;

// =====================================================
// SUBSCRIPTION COMPONENTS - All render null
// =====================================================

export const CheckoutSuccessModal = () => null;
export const DatasourceUpdateBadge = () => null;
export const UpgradeModal = () => null;
export const UsageIndicator = () => null;
export const SubscriptionBadge = () => null;

// =====================================================
// CUSTOM DATASOURCE COMPONENTS - All render null
// =====================================================

export const ConvertToDatasourceModal = () => null;
export const CustomDatasourceModal = () => null;
export const EditDatasourceMetadataModal = () => null;
export const ExportDatasourceModal = () => null;

// =====================================================
// WELCOME WIZARD COMPONENTS - All render null
// =====================================================

export const StepSubscription = () => null;
