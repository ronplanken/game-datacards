import React from "react";
import { WIZARD_STEPS } from "../constants";

/**
 * Wizard header with title, step badge, and progress bar
 */
export const WizardHeader = ({ currentStep, progress }) => {
  const stepConfig = WIZARD_STEPS[currentStep];

  return (
    <header className="wz-header">
      <div className="wz-header-content">
        <div>
          <div className="wz-title-row">
            <h1 className="wz-title">{stepConfig.title}</h1>
            <span className="wz-step-badge">
              Step {currentStep + 1} of {WIZARD_STEPS.length}
            </span>
          </div>
          <p className="wz-subtitle">Get started with Game Datacards</p>
        </div>
      </div>
      <div className="wz-progress">
        <div className="wz-progress-bar" style={{ width: `${progress}%` }} />
      </div>
    </header>
  );
};
