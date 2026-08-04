import { LayoutTemplate } from "lucide-react";
import { StepAoSTemplates } from "./StepAoSTemplates";

/**
 * Version 3.4.1 wizard configuration
 * AoS Custom Templates: Card Designer template support for Age of Sigmar cards
 */
export const VERSION_CONFIG = {
  version: "3.4.1",
  releaseName: "AoS Custom Templates",
  steps: [
    {
      key: "3.4.1-aos-templates",
      title: "AoS Custom Templates",
      icon: LayoutTemplate,
      component: StepAoSTemplates,
      isThankYou: true,
    },
  ],
};

export default VERSION_CONFIG;
