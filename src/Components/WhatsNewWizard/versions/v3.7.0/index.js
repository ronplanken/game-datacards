import { Pencil } from "lucide-react";
import { StepMobileEditor } from "./StepMobileEditor";

export const VERSION_CONFIG = {
  version: "3.7.0",
  releaseName: "Mobile Card Editor",
  steps: [
    {
      key: "3.7.0-mobile-editor",
      title: "Mobile Card Editor",
      icon: Pencil,
      component: StepMobileEditor,
      isThankYou: true,
    },
  ],
};

export default VERSION_CONFIG;
