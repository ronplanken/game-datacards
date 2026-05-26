import { MousePointerClick } from "lucide-react";
import { StepPatchNotes } from "./StepPatchNotes";

export const VERSION_CONFIG = {
  version: "3.10.1",
  releaseName: "Mobile Card Tapping",
  steps: [
    {
      key: "3.10.1-patch-notes",
      title: "What's New",
      icon: MousePointerClick,
      component: StepPatchNotes,
      isThankYou: true,
    },
  ],
};

export default VERSION_CONFIG;
