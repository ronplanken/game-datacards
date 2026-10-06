import React, { useState, useCallback } from "react";
import * as ReactDOM from "react-dom";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useMobileVersionWizard } from "./hooks/useMobileVersionWizard";
import "./MobileWhatsNewWizard.css";

const modalRoot = document.getElementById("modal-root");

/**
 * MobileWhatsNewWizard - Mobile-optimized What's New wizard
 *
 * Shows mobile-specific feature updates in a streamlined wizard flow.
 * Uses the same step-based navigation as MobileWelcomeWizard.
 *
 * @returns {JSX.Element|null} The wizard portal or null if not visible
 */
export const MobileWhatsNewWizard = () => {
  const { shouldShowWizard, mergedSteps, completeWizard } = useMobileVersionWizard();
  const [currentStep, setCurrentStep] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [isStepTransitioning, setIsStepTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState("forward");

  // Transition helper for step changes
  const transitionToStep = useCallback((nextStep, direction = "forward") => {
    setTransitionDirection(direction);
    setIsStepTransitioning(true);
    setTimeout(() => {
      setCurrentStep(nextStep);
      setIsStepTransitioning(false);
    }, 200);
  }, []);

  // Handle next button
  const handleNext = useCallback(() => {
    if (currentStep < mergedSteps.length - 1) {
      transitionToStep(currentStep + 1, "forward");
    }
  }, [currentStep, mergedSteps.length, transitionToStep]);

  // Handle previous button
  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      transitionToStep(currentStep - 1, "backward");
    }
  }, [currentStep, transitionToStep]);

  // Handle wizard completion
  const handleComplete = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      completeWizard();
    }, 250);
  }, [completeWizard]);

  // Don't render if wizard shouldn't be shown or no steps
  if (!shouldShowWizard || mergedSteps.length === 0) return null;

  const currentStepData = mergedSteps[currentStep];
  const StepComponent = currentStepData?.component;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === mergedSteps.length - 1;

  return ReactDOM.createPortal(
    <div className={`mwnw-overlay ${isExiting ? "mwnw-overlay--exiting" : ""}`}>
      <div className="mwnw-container">
        {/* Header with step indicator */}
        <header className="mwnw-header">
          <div className="mwnw-header-step">
            Step {currentStep + 1} of {mergedSteps.length}
          </div>
          <div className="mwnw-header-title">{currentStepData?.title}</div>
        </header>

        {/* Content area */}
        <div className="mwnw-content">
          <div
            className={`mwnw-step ${isStepTransitioning ? `mwnw-step--exiting-${transitionDirection}` : ""}`}
            key={currentStep}>
            {StepComponent && <StepComponent />}
          </div>
        </div>

        {/* Footer with progress and navigation */}
        <footer className="mwnw-footer">
          {/* Progress dots */}
          <div className="mwnw-progress">
            {mergedSteps.map((_, index) => (
              <div
                key={index}
                className={`mwnw-progress-dot ${currentStep === index ? "mwnw-progress-dot--active" : ""} ${
                  currentStep > index ? "mwnw-progress-dot--completed" : ""
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="mwnw-nav">
            {/* Previous button - shown from step 2 onwards, not on last step */}
            {!isFirstStep && !isLastStep && (
              <button className="mwnw-btn mwnw-btn--secondary" onClick={handlePrevious} type="button">
                <ChevronLeft />
                Previous
              </button>
            )}

            {/* Get Started button on first step (hidden when it's also the last step) */}
            {isFirstStep && !isLastStep && (
              <button className="mwnw-btn mwnw-btn--primary" onClick={handleNext} type="button">
                Get Started
                <ChevronRight />
              </button>
            )}

            {/* Next button for middle steps */}
            {!isFirstStep && !isLastStep && (
              <button className="mwnw-btn mwnw-btn--primary" onClick={handleNext} type="button">
                Next
                <ChevronRight />
              </button>
            )}

            {/* Complete button on last step */}
            {isLastStep && (
              <button className="mwnw-btn mwnw-btn--finish" onClick={handleComplete} type="button">
                Start Browsing
                <ChevronRight />
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>,
    modalRoot,
  );
};

export default MobileWhatsNewWizard;
