import { Crosshair, ListChecks } from "lucide-react";
import { Step11thEdition } from "./Step11thEdition";
import { StepLists } from "./StepLists";

export const MOBILE_VERSION_CONFIG = {
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
      isThankYou: true,
    },
  ],
};

export default MOBILE_VERSION_CONFIG;
