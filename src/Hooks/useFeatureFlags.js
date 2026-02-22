/**
 * Hook that reads deployment-level feature flags from environment variables.
 * Flags default to enabled (true) when the env var is unset.
 * Only the explicit string "false" disables a feature.
 */
export const useFeatureFlags = () => {
  return {
    designerEnabled: import.meta.env.VITE_FEATURE_DESIGNER_ENABLED !== "false",
    communityBrowserEnabled: import.meta.env.VITE_FEATURE_COMMUNITY_BROWSER_ENABLED !== "false",
    authEnabled: import.meta.env.VITE_FEATURE_AUTH_ENABLED !== "false",
    syncEnabled: import.meta.env.VITE_FEATURE_SYNC_ENABLED !== "false",
    twoFactorEnabled: import.meta.env.VITE_FEATURE_2FA_ENABLED !== "false",
    paidTierEnabled: import.meta.env.VITE_FEATURE_PAID_TIER_ENABLED !== "false",
  };
};
