/**
 * Premium Constants
 *
 * Shared constants between community stubs and premium package.
 * This file is the single source of truth for subscription limits and template presets.
 * The gdc-premium package imports from here to ensure consistency.
 */

// =====================================================
// SUBSCRIPTION TIER LIMITS
// =====================================================

/**
 * Limits for each subscription tier.
 *
 * NOTE: The 'free' tier values are used differently:
 * - In community version: Local storage is unlimited, cloud sync disabled
 * - In premium version: These are cloud sync limits for authenticated free users
 */
export const SUBSCRIPTION_LIMITS = {
  free: {
    categories: 2, // Cloud categories (premium feature)
    datasources: 1,
    templates: 2,
    canUploadDatasources: true,
    canAccessShares: true, // Can view shared content
  },
  premium: {
    categories: 50,
    datasources: 2,
    templates: 4,
    canUploadDatasources: true,
    canAccessShares: true,
  },
  creator: {
    categories: 250,
    datasources: 10,
    templates: 10,
    canUploadDatasources: true,
    canAccessShares: true,
  },
  lifetime: {
    categories: 999,
    datasources: 99,
    templates: 99,
    canUploadDatasources: true,
    canAccessShares: true,
  },
  admin: {
    categories: 999,
    datasources: 99,
    templates: 99,
    canUploadDatasources: true,
    canAccessShares: true,
  },
};

// =====================================================
// TEMPLATE PRESETS
// =====================================================

/**
 * Template presets for quick creation in the Designer.
 * These define default canvas sizes for different card types.
 */
export const TEMPLATE_PRESETS = {
  "40k-datacard": {
    name: "40K Datacard",
    width: 500,
    height: 700,
    targetFormat: "40k-10e",
  },
  "40k-datacard-styled": {
    name: "40K Datacard (Styled)",
    width: 500,
    height: 700,
    targetFormat: "40k-10e",
    useFactory: true, // Indicates this preset uses a template factory
  },
  "40k-stratagem": {
    name: "40K Stratagem",
    width: 500,
    height: 350,
    targetFormat: "40k-10e",
  },
  "aos-warscroll": {
    name: "AoS Warscroll",
    width: 500,
    height: 700,
    targetFormat: "aos",
  },
  "40k-datacard-desktop": {
    name: "40K Datacard (Desktop)",
    width: 1080,
    height: 720,
    targetFormat: "40k-10e",
    useFactory: true,
  },
  custom: {
    name: "Custom",
    width: 500,
    height: 700,
    targetFormat: "40k-10e",
  },
};
