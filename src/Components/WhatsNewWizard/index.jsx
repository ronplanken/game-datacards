import React, { useEffect, useCallback, useState } from "react";
import * as ReactDOM from "react-dom";
import { WizardHeader, WizardSidebar, WizardFooter, MobileProgress } from "./components";
import { useVersionWizard } from "./hooks/useVersionWizard";
import "./WhatsNewWizard.css";

// Re-export for backwards compatibility with WhatsNew.jsx
export { getMajorWizardVersion } from "./versions";

const modalRoot = document.getElementById("modal-root");

/**
 * WizardStepContent - Step Content Renderer
 * Dynamically renders the step component based on the current step configuration
 *
 * @param {Object} props - Component props
 * @param {Object} props.step - Step configuration with component property
 * @returns {JSX.Element} Rendered step content
 */
const WizardStepContent = ({ step }) => {
  const StepComponent = step.component;
  return (
    <div className="wnw-step-content" key={step.key}>
      <StepComponent />
    </div>
  );
};

/**
 * WhatsNewWizard - Multi-version wizard that shows users what's new in the application
 *
 * Supports combining steps from multiple versions into a single flow when
 * users haven't seen previous version wizards.
 *
 * Features:
 * - Externalized version data in /versions folder
 * - Automatic step merging for multiple unseen versions
 * - Version headers in sidebar for multi-version flows
 * - Responsive design with mobile progress dots
 * - Keyboard navigation (Escape to close on final step)
 *
 * @returns {JSX.Element|null} Wizard modal or null if not visible
 */
export const WhatsNewWizard = () => {
  const [isWizardVisible, setIsWizardVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const { shouldShowWizard, mergedSteps, highestVersion, isMultiVersion, completeWizard } = useVersionWizard();

  // Show wizard when conditions are met
  useEffect(() => {
    if (shouldShowWizard && !isWizardVisible) {
      setIsWizardVisible(true);
    }
  }, [shouldShowWizard, isWizardVisible]);

  // Keyboard handler - close on Escape (only on last step)
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape" && isWizardVisible && mergedSteps.length > 0) {
        if (step === mergedSteps.length - 1) {
          handleClose();
        }
      }
    },
    [isWizardVisible, step, mergedSteps.length]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Close with exit animation
  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsWizardVisible(false);
      setIsExiting(false);
      setStep(0);
      completeWizard();
    }, 200);
  };

  // Overlay click handler - only close on final step
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && mergedSteps.length > 0) {
      if (step === mergedSteps.length - 1) {
        handleClose();
      }
    }
  };

  // Navigation handlers
  const handlePrevious = () => setStep((s) => Math.max(0, s - 1));
  const handleNext = () => {
    if (mergedSteps.length > 0) {
      setStep((s) => Math.min(mergedSteps.length - 1, s + 1));
    }
  };

  // Don't render if wizard shouldn't be visible or no steps
  if (!isWizardVisible || mergedSteps.length === 0) return null;

  return ReactDOM.createPortal(
    <div className={`wnw-overlay ${isExiting ? "wnw-overlay--exiting" : ""}`} onClick={handleOverlayClick}>
      <div className="wnw-modal" onClick={(e) => e.stopPropagation()}>
        <WizardHeader step={step} steps={mergedSteps} version={highestVersion} isMultiVersion={isMultiVersion} />
        <MobileProgress currentStep={step} totalSteps={mergedSteps.length} />
        <div className="wnw-body">
          <WizardSidebar steps={mergedSteps} currentStep={step} onStepClick={setStep} isMultiVersion={isMultiVersion} />
          <div className="wnw-content">
            <WizardStepContent step={mergedSteps[step]} />
          </div>
        </div>
        <WizardFooter
          step={step}
          totalSteps={mergedSteps.length}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onFinish={handleClose}
        />
      </div>
    </div>,
    modalRoot
  );
};

export default WhatsNewWizard;
