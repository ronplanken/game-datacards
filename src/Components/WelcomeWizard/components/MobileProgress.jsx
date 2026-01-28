import React from "react";

/**
 * Mobile progress dots indicator
 */
export const MobileProgress = ({ currentStep, completedSteps, steps }) => {
  return (
    <div className="wz-mobile-progress">
      {steps.map((_, index) => {
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
