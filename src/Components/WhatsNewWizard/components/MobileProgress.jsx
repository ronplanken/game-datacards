import React from "react";

/**
 * MobileProgress - Mobile progress dots component for the WhatsNewWizard
 *
 * Shows on mobile devices as an alternative to the sidebar navigation,
 * displaying dots for each step with active and completed states.
 *
 * @param {Object} props - Component props
 * @param {number} props.currentStep - Current active step index (0-based)
 * @param {number} props.totalSteps - Total number of steps
 * @returns {JSX.Element} Progress dots for mobile display
 */
export const MobileProgress = ({ currentStep, totalSteps }) => (
  <div className="wnw-mobile-progress">
    {Array.from({ length: totalSteps }).map((_, index) => (
      <div
        key={index}
        className={`wnw-mobile-dot ${currentStep === index ? "wnw-mobile-dot--active" : ""} ${
          currentStep > index ? "wnw-mobile-dot--completed" : ""
        }`}
      />
    ))}
  </div>
);

export default MobileProgress;
