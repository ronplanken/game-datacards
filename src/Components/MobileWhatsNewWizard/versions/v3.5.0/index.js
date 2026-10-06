import { Database } from "lucide-react";
import { StepDatasourceEditor } from "./StepDatasourceEditor";

/**
 * Mobile version 3.5.0 wizard configuration
 * Datasource Editor beta: build and manage custom card structures
 */
export const MOBILE_VERSION_CONFIG = {
  version: "3.5.0",
  releaseName: "Datasource Editor",
  steps: [
    {
      key: "3.5.0-datasource-editor",
      title: "Datasource Editor",
      icon: Database,
      component: StepDatasourceEditor,
      isThankYou: true,
    },
  ],
};

export default MOBILE_VERSION_CONFIG;
