import { Crosshair, ListChecks, Sparkles } from "lucide-react";
import { Step11thEdition } from "./Step11thEdition";
import { StepLists } from "./StepLists";
import { StepMakeItYours } from "./StepMakeItYours";

export const VERSION_CONFIG = {
  version: "3.11.0",
  releaseName: "11th Edition",
  steps: [
    {
      key: "3.11.0-11th-edition",
      title: "11th Edition",
      icon: Crosshair,
      component: Step11thEdition,
    },
    {
      key: "3.11.0-lists",
      title: "Army Lists",
      icon: ListChecks,
      component: StepLists,
    },
    {
      key: "3.11.0-make-it-yours",
      title: "Make It Yours",
      icon: Sparkles,
      component: StepMakeItYours,
      isThankYou: true,
    },
  ],
};

export default VERSION_CONFIG;
