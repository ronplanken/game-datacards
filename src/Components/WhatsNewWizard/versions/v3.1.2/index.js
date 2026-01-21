import { Wrench } from "lucide-react";
import { StepUpdate } from "./StepUpdate";

/**
 * Version 3.1.2 wizard configuration
 * Bug fix release for stratagem phase icon export
 */
export const VERSION_CONFIG = {
  version: "3.1.2",
  releaseName: "Bug Fix",
  steps: [
    {
      key: "3.1.2-update",
      title: "Update",
      icon: Wrench,
      component: StepUpdate,
      isThankYou: true,
    },
  ],
};

export default VERSION_CONFIG;
