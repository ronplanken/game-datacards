import { Wrench } from "lucide-react";
import { StepPatchNotes } from "./StepPatchNotes";

export const VERSION_CONFIG = {
  version: "3.7.2",
  releaseName: "Custom Datasource Card Fixes",
  steps: [
    {
      key: "3.7.2-patch-notes",
      title: "Improvements & Fixes",
      icon: Wrench,
      component: StepPatchNotes,
      isThankYou: true,
    },
  ],
};

export default VERSION_CONFIG;
