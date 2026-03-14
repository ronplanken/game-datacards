import { Sparkles, LayoutDashboard, Layers, RefreshCw, Heart } from "lucide-react";
import { StepWelcome } from "./StepWelcome";
import { StepWorkspace } from "./StepWorkspace";
import { StepCardTypes } from "./StepCardTypes";
import { StepMigration } from "./StepMigration";
import { StepThankYou } from "./StepThankYou";

/**
 * Version 3.5.0 wizard configuration
 * Datasource Editor beta: build and manage custom card structures
 */
export const VERSION_CONFIG = {
  version: "3.5.0",
  releaseName: "Datasource Editor",
  steps: [
    {
      key: "3.5.0-welcome",
      title: "Welcome",
      icon: Sparkles,
      component: StepWelcome,
      isWelcome: true,
    },
    {
      key: "3.5.0-workspace",
      title: "The Workspace",
      icon: LayoutDashboard,
      component: StepWorkspace,
    },
    {
      key: "3.5.0-card-types",
      title: "Card Types & Fields",
      icon: Layers,
      component: StepCardTypes,
    },
    {
      key: "3.5.0-migration",
      title: "Existing Datasources",
      icon: RefreshCw,
      component: StepMigration,
    },
    {
      key: "3.5.0-thankyou",
      title: "Thank You",
      icon: Heart,
      component: StepThankYou,
      isThankYou: true,
    },
  ],
};

export default VERSION_CONFIG;
