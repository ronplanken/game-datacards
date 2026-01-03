import { Sparkles, Database, Zap, Wrench } from "lucide-react";
import { StepWelcome } from "./StepWelcome";
import { StepCustomDatasources } from "./StepCustomDatasources";
import { StepQuickAdd } from "./StepQuickAdd";
import { StepPrintingFixes } from "./StepPrintingFixes";
import { StepThankYou } from "./StepThankYou";

/**
 * Version 3.1.0 wizard configuration
 * Features custom datasources, quick add, and improved imports
 */
export const VERSION_CONFIG = {
  version: "3.1.0",
  releaseName: "Custom Datasources",
  steps: [
    {
      key: "3.1.0-welcome",
      title: "Welcome",
      icon: Sparkles,
      component: StepWelcome,
      isWelcome: true,
    },
    {
      key: "3.1.0-datasources",
      title: "Custom Datasources",
      icon: Database,
      component: StepCustomDatasources,
    },
    {
      key: "3.1.0-quickadd",
      title: "Quick Add",
      icon: Zap,
      component: StepQuickAdd,
    },
    {
      key: "3.1.0-various",
      title: "Various",
      icon: Wrench,
      component: StepPrintingFixes,
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

export default VERSION_CONFIG;
