import compareVersions, { compare } from "compare-versions";
import v310Config from "./v3.1.0";
import v320Config from "./v3.2.0";

/**
 * Registry of all mobile version wizard configurations
 * Sorted in ascending version order
 *
 * To add a new version:
 * 1. Create a new folder in versions/ (e.g., v3.2.0/)
 * 2. Create step components and index.js with MOBILE_VERSION_CONFIG
 * 3. Import and add to MOBILE_VERSION_REGISTRY array below
 */
export const MOBILE_VERSION_REGISTRY = [v310Config, v320Config]
  .filter((config) => config && config.version)
  .sort((a, b) => compareVersions(a.version, b.version));

/**
 * Get all mobile version configs
 * @returns {Array} Array of mobile version configurations
 */
export const getMobileVersionConfigs = () => MOBILE_VERSION_REGISTRY;

/**
 * Get a specific mobile version config by version string
 * @param {string} version - Semantic version string (e.g., "3.1.0")
 * @returns {Object|undefined} Version configuration or undefined
 */
export const getMobileVersionConfig = (version) => MOBILE_VERSION_REGISTRY.find((v) => v.version === version);

/**
 * Get the latest mobile version that has wizard content
 * @returns {string|undefined} Latest version string
 */
export const getLatestMobileWizardVersion = () => MOBILE_VERSION_REGISTRY[MOBILE_VERSION_REGISTRY.length - 1]?.version;

/**
 * Merges multiple mobile version wizard steps into a single flow
 *
 * Rules:
 * 1. Each version's welcome step becomes a version introduction
 * 2. Thank you steps are removed from all but the final version
 * 3. Steps maintain their original order within each version
 * 4. Version context is added to each step for display purposes
 *
 * @param {Array} versions - Versions to merge (sorted ascending)
 * @returns {Array} Unified step array with version context
 */
export const mergeMobileVersionSteps = (versions) => {
  const mergedSteps = [];

  versions.forEach((versionConfig, versionIndex) => {
    const isLastVersion = versionIndex === versions.length - 1;

    versionConfig.steps.forEach((step, stepIndex) => {
      // Skip thank you steps except for the final version
      if (step.isThankYou && !isLastVersion) {
        return;
      }

      // Add version context to each step
      mergedSteps.push({
        ...step,
        version: versionConfig.version,
        versionName: versionConfig.releaseName,
        isVersionStart: stepIndex === 0,
        originalIndex: stepIndex,
        globalIndex: mergedSteps.length,
      });
    });
  });

  return mergedSteps;
};

/**
 * Get mobile versions that the user hasn't seen yet
 *
 * @param {string} lastSeenVersion - Last version the user completed (e.g., "0.0.0")
 * @param {string} currentVersion - Current app version
 * @returns {Array} Array of unseen mobile version configs
 */
export const getMobileUnseenVersions = (lastSeenVersion, currentVersion) => {
  if (!lastSeenVersion || !currentVersion) return [];
  return MOBILE_VERSION_REGISTRY.filter(
    (v) => compare(v.version, lastSeenVersion, ">") && compare(v.version, currentVersion, "<="),
  );
};
