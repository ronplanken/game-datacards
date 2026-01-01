import { Sparkles, Smartphone } from "lucide-react";
import { StepWelcome } from "./StepWelcome";
import { StepMobileFeatures } from "./StepMobileFeatures";
import { StepThankYou } from "./StepThankYou";

/**
 * Mobile version 3.1.0 wizard configuration
 * Features mobile-specific updates: GW App Import and List Categorization
 */
export const MOBILE_VERSION_CONFIG = {
  version: "3.1.0",
  releaseName: "Mobile Improvements",
  steps: [
    {
      key: "3.1.0-welcome",
      title: "Welcome",
      icon: Sparkles,
      component: StepWelcome,
      isWelcome: true,
    },
    {
      key: "3.1.0-features",
      title: "New Features",
      icon: Smartphone,
      component: StepMobileFeatures,
    },
    {
      key: "3.1.0-thankyou",
      title: "Thank You",
      icon: null,
      component: StepThankYou,
      isThankYou: true,
    },
  ],
};

export default MOBILE_VERSION_CONFIG;
