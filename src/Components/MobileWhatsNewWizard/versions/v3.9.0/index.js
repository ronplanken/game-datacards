import { BookOpen } from "lucide-react";
import { StepPatchNotes } from "./StepPatchNotes";

export const MOBILE_VERSION_CONFIG = {
  version: "3.9.0",
  releaseName: "Keyword Glossary",
  steps: [
    {
      key: "3.9.0-patch-notes",
      title: "What's New",
      icon: BookOpen,
      component: StepPatchNotes,
      isThankYou: true,
    },
  ],
};

export default MOBILE_VERSION_CONFIG;
