import { Wrench } from "lucide-react";
import { StepUpdate } from "./StepUpdate";

/**
 * Version 3.1.3 wizard configuration
 * Bug fix release for ability keyword styling
 */
export const VERSION_CONFIG = {
  version: "3.1.3",
  releaseName: "Bug Fix",
  steps: [
    {
      key: "3.1.3-update",
      title: "Update",
      icon: Wrench,
      component: StepUpdate,
      isThankYou: true,
    },
  ],
};

export default VERSION_CONFIG;
