import { History } from "lucide-react";
import { StepDataVersion } from "./StepDataVersion";

export const MOBILE_VERSION_CONFIG = {
  version: "3.12.0",
  releaseName: "Data Versions",
  steps: [
    {
      key: "3.12.0-data-version",
      title: "Data Versions",
      icon: History,
      component: StepDataVersion,
      isThankYou: true,
    },
  ],
};

export default MOBILE_VERSION_CONFIG;
