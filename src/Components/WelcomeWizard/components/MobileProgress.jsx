import React from "react";
import { WIZARD_STEPS } from "../constants";

/**
 * Mobile progress dots indicator
 */
export const MobileProgress = ({ currentStep, completedSteps }) => {
  return (
    <div className="wz-mobile-progress">
      {WIZARD_STEPS.map((_, index) => {
        const isActive = currentStep === index;
        const isCompleted = completedSteps.has(index);

        return (
          <div
            key={index}
            className={`wz-mobile-dot ${isActive ? "wz-mobile-dot--active" : ""} ${
              isCompleted ? "wz-mobile-dot--completed" : ""
            }`}
          />
        );
      })}
    </div>
  );
};
