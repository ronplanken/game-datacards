import { Rocket } from "lucide-react";
import { StepPatchNotes } from "./StepPatchNotes";

export const VERSION_CONFIG = {
  version: "3.8.0",
  releaseName: "Starcraft TMG & Faction Management",
  steps: [
    {
      key: "3.8.0-patch-notes",
      title: "What's New",
      icon: Rocket,
      component: StepPatchNotes,
      isThankYou: true,
    },
  ],
};

export default VERSION_CONFIG;
