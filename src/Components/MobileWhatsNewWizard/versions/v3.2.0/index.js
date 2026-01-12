import { Sparkles, Crown } from "lucide-react";
import { StepWelcome } from "./StepWelcome";
import { StepPremiumFeatures } from "./StepPremiumFeatures";
import { StepThankYou } from "./StepThankYou";

/**
 * Mobile version 3.2.0 wizard configuration
 * Features: Premium subscription tiers introduction
 */
export const MOBILE_VERSION_CONFIG = {
  version: "3.2.0",
  releaseName: "Premium Options",
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
