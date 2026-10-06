import { GitCompare } from "lucide-react";
import { StepCompareDatasource } from "./StepCompareDatasource";

export const VERSION_CONFIG = {
  version: "3.13.0",
  releaseName: "Compare with Datasource",
  steps: [
    {
      key: "3.13.0-compare-datasource",
      title: "Compare with Datasource",
      icon: GitCompare,
      component: StepCompareDatasource,
      isThankYou: true,
    },
  ],
};

export default VERSION_CONFIG;
