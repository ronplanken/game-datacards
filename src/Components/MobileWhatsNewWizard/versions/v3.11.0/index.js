import { Crosshair } from "lucide-react";
import { Step11thEdition } from "./Step11thEdition";

export const MOBILE_VERSION_CONFIG = {
  version: "3.11.0",
  releaseName: "11th Edition",
  steps: [
    {
      key: "3.11.0-11th-edition",
      title: "What's New",
      icon: Crosshair,
      component: Step11thEdition,
      isThankYou: true,
    },
  ],
};

export default MOBILE_VERSION_CONFIG;
