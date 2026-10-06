import { PenTool } from "lucide-react";
import { StepCardDesigner } from "./StepCardDesigner";

/**
 * Mobile version 3.4.0 wizard configuration
 * Card Designer beta: visual template builder for custom datacards
 */
export const MOBILE_VERSION_CONFIG = {
  version: "3.4.0",
  releaseName: "Card Designer Beta",
  steps: [
    {
      key: "3.4.0-card-designer",
      title: "Card Designer",
      icon: PenTool,
      component: StepCardDesigner,
      isThankYou: true,
    },
  ],
};

export default MOBILE_VERSION_CONFIG;
