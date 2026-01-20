import { Sparkles, Smartphone, Palette, SlidersHorizontal } from "lucide-react";
import { StepWelcome } from "./StepWelcome";
import { StepAgeOfSigmar } from "./StepAgeOfSigmar";
import { StepMobileRedesign } from "./StepMobileRedesign";
import { StepCustomColours } from "./StepCustomColours";
import { StepUpdatedControls } from "./StepUpdatedControls";
import { StepThankYou } from "./StepThankYou";

/**
 * Version 3.0.0 wizard configuration
 * Major release with Age of Sigmar support, mobile redesign, and more
 */
export const VERSION_CONFIG = {
  version: "3.0.0",
  releaseName: "Major Update",
  steps: [
    {
      key: "3.0.0-welcome",
      title: "Welcome",
      icon: Sparkles,
      component: StepWelcome,
      isWelcome: true,
    },
    {
      key: "3.0.0-aos",
      title: "Age of Sigmar",
      icon: null,
      component: StepAgeOfSigmar,
    },
    {
      key: "3.0.0-mobile",
      title: "Mobile Redesign",
      icon: Smartphone,
      component: StepMobileRedesign,
    },
    {
      key: "3.0.0-colours",
      title: "Custom Colours",
      icon: Palette,
      component: StepCustomColours,
    },
    {
      key: "3.0.0-controls",
      title: "Updated Controls",
      icon: SlidersHorizontal,
      component: StepUpdatedControls,
    },
    {
      key: "3.0.0-thankyou",
      title: "Thank You",
      icon: null,
      component: StepThankYou,
      isThankYou: true,
    },
  ],
};

export default VERSION_CONFIG;
