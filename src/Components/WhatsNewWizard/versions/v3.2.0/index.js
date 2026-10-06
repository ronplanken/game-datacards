import { Sparkles, UserCircle, Cloud, BarChart3, GitMerge, Heart } from "lucide-react";
import { StepWelcome } from "./StepWelcome";
import { StepAccounts } from "./StepAccounts";
import { StepCloudSync } from "./StepCloudSync";
import { StepSyncStatus } from "./StepSyncStatus";
import { StepConflicts } from "./StepConflicts";
import { StepThankYou } from "./StepThankYou";

/**
 * Version 3.2.0 wizard configuration
 * Features user accounts, cloud sync, sync status, and conflict resolution
 */
export const VERSION_CONFIG = {
  version: "3.2.0",
  releaseName: "User Accounts & Cloud Sync",
  steps: [
    {
      key: "3.2.0-welcome",
      title: "Welcome",
      icon: Sparkles,
      component: StepWelcome,
      isWelcome: true,
    },
    {
      key: "3.2.0-accounts",
      title: "User Accounts",
      icon: UserCircle,
      component: StepAccounts,
    },
    {
      key: "3.2.0-cloudsync",
      title: "Cloud Sync",
      icon: Cloud,
      component: StepCloudSync,
    },
    {
      key: "3.2.0-syncstatus",
      title: "Sync Status & Limits",
      icon: BarChart3,
      component: StepSyncStatus,
    },
    {
      key: "3.2.0-conflicts",
      title: "Resolving Conflicts",
      icon: GitMerge,
      component: StepConflicts,
    },
    {
      key: "3.2.0-thankyou",
      title: "Thank You",
      icon: Heart,
      component: StepThankYou,
      isThankYou: true,
    },
  ],
};

export default VERSION_CONFIG;
