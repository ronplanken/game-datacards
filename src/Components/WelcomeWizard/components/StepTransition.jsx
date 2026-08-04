import React from "react";

/**
 * Wrapper component for step transitions with animation
 */
export const StepTransition = ({ children, direction, stepKey }) => {
  const animationClass = direction === "forward" ? "wz-step--enter-forward" : "wz-step--enter-backward";

  return (
    <div className={`wz-step-content ${animationClass}`} key={stepKey}>
      {children}
    </div>
  );
};
