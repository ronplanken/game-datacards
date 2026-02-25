import { Sparkles } from "lucide-react";
import { StepUpdate } from "./StepUpdate";

/**
 * Mobile version 3.2.1 wizard configuration
 * UI improvements: drag-and-drop reordering, refreshed styling, mobile list sync
 */
export const MOBILE_VERSION_CONFIG = {
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

export default MOBILE_VERSION_CONFIG;
