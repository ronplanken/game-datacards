import { Crown } from "lucide-react";
import { StepPremiumAnnouncement } from "./StepPremiumAnnouncement";

/**
 * Version 3.6.0 wizard configuration
 * Premium accounts announcement for existing users
 */
export const VERSION_CONFIG = {
  version: "3.6.0",
  releaseName: "Premium Accounts",
  steps: [
    {
      key: "3.6.0-premium-announcement",
      title: "Premium Accounts",
      icon: Crown,
      component: StepPremiumAnnouncement,
      isThankYou: true,
    },
  ],
};

export default VERSION_CONFIG;
