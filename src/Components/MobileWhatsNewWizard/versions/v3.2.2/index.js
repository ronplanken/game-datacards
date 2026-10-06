import { Share2 } from "lucide-react";
import { StepSharing } from "./StepSharing";

/**
 * Mobile version 3.2.2 wizard configuration
 * Sharing rebuilt: one-click sharing, share management, backend migration
 */
export const MOBILE_VERSION_CONFIG = {
  version: "3.2.2",
  releaseName: "Sharing, Rebuilt",
  steps: [
    {
      key: "3.2.2-sharing",
      title: "Sharing",
      icon: Share2,
      component: StepSharing,
      isThankYou: true,
    },
  ],
};

export default MOBILE_VERSION_CONFIG;
