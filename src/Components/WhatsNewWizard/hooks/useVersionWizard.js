import { useMemo, useCallback } from "react";
import { compare } from "compare-versions";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { LAST_WIZARD_VERSION } from "../../WelcomeWizard";
import { getUnseenVersions, mergeVersionSteps } from "../versions";

/**
 * useVersionWizard - Hook for managing version wizard state and logic
 *
 * Handles determining which versions need to be shown, merging steps from
 * multiple versions, and tracking wizard completion in settings.
 *
 * @returns {Object} Wizard state and handlers
 * @returns {boolean} returns.shouldShowWizard - Whether the wizard should be visible
 * @returns {Array} returns.mergedSteps - Combined steps from all unseen versions
 * @returns {Array} returns.unseenVersions - Version configurations not yet seen by user
 * @returns {string|undefined} returns.highestVersion - Highest version being shown
 * @returns {boolean} returns.isMultiVersion - Whether multiple versions are being shown
 * @returns {Function} returns.completeWizard - Marks all shown versions as completed
 */
export const useVersionWizard = () => {
  const { settings, updateSettings } = useSettingsStorage();
  const currentVersion = import.meta.env.VITE_VERSION;

  // Determine which versions need to be shown
  const unseenVersions = useMemo(() => {
    return getUnseenVersions(settings.lastMajorWizardVersion, currentVersion);
  }, [settings.lastMajorWizardVersion, currentVersion]);

  // Check if wizard should be visible
  // Only show if:
  // 1. There are unseen versions
  // 2. User has completed the welcome wizard (not a new user)
  const shouldShowWizard = useMemo(() => {
    if (!settings.wizardCompleted) return false;
    return unseenVersions.length > 0 && compare(settings.wizardCompleted, LAST_WIZARD_VERSION, ">=");
  }, [unseenVersions, settings.wizardCompleted]);

  // Merge all unseen version steps into a single flow
  const mergedSteps = useMemo(() => {
    return mergeVersionSteps(unseenVersions);
  }, [unseenVersions]);

  // Get the highest version being shown
  const highestVersion = useMemo(() => {
    return unseenVersions[unseenVersions.length - 1]?.version;
  }, [unseenVersions]);

  // Check if showing multiple versions
  const isMultiVersion = unseenVersions.length > 1;

  // Complete the wizard - update settings to mark versions as seen
  const completeWizard = useCallback(() => {
    if (highestVersion) {
      updateSettings({
        ...settings,
        lastMajorWizardVersion: highestVersion,
        wizardCompleted: currentVersion,
      });
    }
  }, [settings, updateSettings, highestVersion, currentVersion]);

  return {
    shouldShowWizard,
    mergedSteps,
    unseenVersions,
    highestVersion,
    isMultiVersion,
    completeWizard,
  };
};

export default useVersionWizard;
