import { Sparkles, Shield, Heart } from "lucide-react";
import { StepWelcome } from "./StepWelcome";
import { StepDetachments } from "./StepDetachments";
import { StepThankYou } from "./StepThankYou";

/**
 * Version 3.1.1 wizard configuration
 * Features chapter-specific detachment filtering for Space Marines
 */
export const VERSION_CONFIG = {
  version: "3.1.1",
  releaseName: "Chapter Detachments",
  steps: [
    {
      key: "3.1.1-welcome",
      title: "Welcome",
      icon: Sparkles,
      component: StepWelcome,
      isWelcome: true,
    },
    {
      key: "3.1.1-detachments",
      title: "Chapter Detachments",
      icon: Shield,
      component: StepDetachments,
    },
    {
      key: "3.1.1-thankyou",
      title: "Thank You",
      icon: Heart,
      component: StepThankYou,
      isThankYou: true,
    },
  ],
};

export default VERSION_CONFIG;
