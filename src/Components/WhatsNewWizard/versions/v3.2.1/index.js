import { Sparkles } from "lucide-react";
import { StepUpdate } from "./StepUpdate";

/**
 * Version 3.2.1 wizard configuration
 * UI improvements: drag-and-drop reordering, refreshed styling, mobile list sync
 */
export const VERSION_CONFIG = {
  version: "3.2.1",
  releaseName: "UI Improvements",
  steps: [
    {
      key: "3.2.1-update",
      title: "Update",
      icon: Sparkles,
      component: StepUpdate,
      isThankYou: true,
    },
  ],
};

export default VERSION_CONFIG;
