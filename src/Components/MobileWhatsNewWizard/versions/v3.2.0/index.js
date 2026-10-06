import { Sparkles, Crown, Cloud, GitMerge } from "lucide-react";
import { StepWelcome } from "./StepWelcome";
import { StepPremiumFeatures } from "./StepPremiumFeatures";
import { StepCloudSync } from "./StepCloudSync";
import { StepConflicts } from "./StepConflicts";
import { StepThankYou } from "./StepThankYou";

/**
 * Mobile version 3.2.0 wizard configuration
 * Features: User accounts, cloud sync, conflict resolution, and premium tiers
 */
export const MOBILE_VERSION_CONFIG = {
  version: "3.2.0",
  releaseName: "Accounts & Cloud Sync",
  steps: [
    {
      key: "3.2.0-welcome",
      title: "Welcome",
      icon: Sparkles,
      component: StepWelcome,
      isWelcome: true,
    },
    {
      key: "3.2.0-premium",
      title: "Premium Features",
      icon: Crown,
      component: StepPremiumFeatures,
      requiresPaidTier: true,
    },
    {
      key: "3.2.0-cloudsync",
      title: "Cloud Sync",
      icon: Cloud,
      component: StepCloudSync,
    },
    {
      key: "3.2.0-conflicts",
      title: "Conflicts",
      icon: GitMerge,
      component: StepConflicts,
    },
    {
      key: "3.2.0-thankyou",
      title: "Thank You",
      icon: null,
      component: StepThankYou,
      isThankYou: true,
    },
  ],
};

export default MOBILE_VERSION_CONFIG;
