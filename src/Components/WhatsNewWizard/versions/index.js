import compareVersions, { compare } from "compare-versions";
import v300Config from "./v3.0.0";
import v310Config from "./v3.1.0";
import v311Config from "./v3.1.1";

/**
 * Registry of all version wizard configurations
 * Sorted in ascending version order
 *
 * To add a new version:
 * 1. Create a new folder in versions/ (e.g., v3.2.0/)
 * 2. Create step components and index.js with VERSION_CONFIG
 * 3. Import and add to VERSION_REGISTRY array below
 */
export const VERSION_REGISTRY = [v300Config, v310Config, v311Config]
  .filter((config) => config && config.version)
  .sort((a, b) => compareVersions(a.version, b.version));

/**
 * Get all version configs
 * @returns {Array} Array of version configurations
 */
export const getVersionConfigs = () => VERSION_REGISTRY;

/**
 * Get a specific version config by version string
 * @param {string} version - Semantic version string (e.g., "3.0.0")
 * @returns {Object|undefined} Version configuration or undefined
 */
export const getVersionConfig = (version) => VERSION_REGISTRY.find((v) => v.version === version);

/**
 * Get the latest version that has wizard content
 * @returns {string|undefined} Latest version string
 */
export const getLatestWizardVersion = () => VERSION_REGISTRY[VERSION_REGISTRY.length - 1]?.version;

/**
 * Helper to find the applicable major version for the current app version
 * Used by WhatsNew.jsx for backwards compatibility
 *
 * @param {string} currentVersion - Current app version
 * @returns {string|undefined} The highest version that applies
 */
export const getMajorWizardVersion = (currentVersion) => {
  if (!currentVersion) return undefined;
  return VERSION_REGISTRY.map((v) => v.version)
    .sort((a, b) => compareVersions(b, a))
    .find((v) => compare(currentVersion, v, ">="));
};

/**
 * Merges multiple version wizard steps into a single flow
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
export const mergeVersionSteps = (versions) => {
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
 * Get versions that the user hasn't seen yet
 *
 * @param {string} lastSeenVersion - Last version the user completed (e.g., "0.0.0")
 * @param {string} currentVersion - Current app version
 * @returns {Array} Array of unseen version configs
 */
export const getUnseenVersions = (lastSeenVersion, currentVersion) => {
  if (!lastSeenVersion || !currentVersion) return [];
  return VERSION_REGISTRY.filter(
    (v) => compare(v.version, lastSeenVersion, ">") && compare(v.version, currentVersion, "<="),
  );
};
