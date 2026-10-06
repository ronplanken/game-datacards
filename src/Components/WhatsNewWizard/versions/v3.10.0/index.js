import { FolderTree } from "lucide-react";
import { StepPatchNotes } from "./StepPatchNotes";

export const VERSION_CONFIG = {
  version: "3.10.0",
  releaseName: "Subcategories & Sorting",
  steps: [
    {
      key: "3.10.0-patch-notes",
      title: "What's New",
      icon: FolderTree,
      component: StepPatchNotes,
      isThankYou: true,
    },
  ],
};

export default VERSION_CONFIG;
