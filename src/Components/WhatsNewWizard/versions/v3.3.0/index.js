import { Swords } from "lucide-react";
import { StepListForge } from "./StepListForge";

/**
 * Version 3.3.0 wizard configuration
 * List Forge import: upload or paste JSON rosters from List Forge
 */
export const VERSION_CONFIG = {
  version: "3.3.0",
  releaseName: "List Forge Import",
  steps: [
    {
      key: "3.3.0-listforge",
      title: "List Forge",
      icon: Swords,
      component: StepListForge,
      isThankYou: true,
    },
  ],
};

export default VERSION_CONFIG;
