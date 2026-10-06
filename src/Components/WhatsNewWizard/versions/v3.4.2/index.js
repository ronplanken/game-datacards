import { TextSearch } from "lucide-react";
import { StepKeywordParsing } from "./StepKeywordParsing";

/**
 * Version 3.4.2 wizard configuration
 * Smarter Keyword Parsing: word boundary detection and backslash escape support
 */
export const VERSION_CONFIG = {
  version: "3.4.2",
  releaseName: "Improved Keyword Highlighting",
  steps: [
    {
      key: "3.4.2-keyword-highlighting",
      title: "Improved Keyword Highlighting",
      icon: TextSearch,
      component: StepKeywordParsing,
      isThankYou: true,
    },
  ],
};

export default VERSION_CONFIG;
