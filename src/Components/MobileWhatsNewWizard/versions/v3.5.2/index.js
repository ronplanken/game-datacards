import { Wrench } from "lucide-react";
import { StepExportFixes } from "./StepExportFixes";

/**
 * Mobile version 3.5.2 wizard configuration
 * Image export fixes: custom images, weapon stats on Windows, legacy loadouts
 */
export const MOBILE_VERSION_CONFIG = {
  version: "3.5.2",
  releaseName: "Image Export Fixes",
  steps: [
    {
      key: "3.5.2-export-fixes",
      title: "Image Export Fixes",
      icon: Wrench,
      component: StepExportFixes,
      isThankYou: true,
    },
  ],
};

export default MOBILE_VERSION_CONFIG;
