import { Wrench } from "lucide-react";
import { StepPatchNotes } from "./StepPatchNotes";

export const VERSION_CONFIG = {
  version: "3.7.1",
  releaseName: "Editor Help & Bug Fixes",
  steps: [
    {
      key: "3.7.1-patch-notes",
      title: "Improvements & Fixes",
      icon: Wrench,
      component: StepPatchNotes,
      isThankYou: true,
    },
  ],
};

export default VERSION_CONFIG;
