import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * WizardFooter - Footer component for the WhatsNewWizard
 *
 * Contains navigation buttons (Previous, Next, Finish) with contextual
 * visibility based on current step position.
 *
 * @param {Object} props - Component props
 * @param {number} props.step - Current step index (0-based)
 * @param {number} props.totalSteps - Total number of steps
 * @param {Function} props.onPrevious - Callback for Previous button click
 * @param {Function} props.onNext - Callback for Next button click
 * @param {Function} props.onFinish - Callback for Finish button click (final step)
 * @returns {JSX.Element} Footer component with navigation buttons
 */
export const WizardFooter = ({ step, totalSteps, onPrevious, onNext, onFinish }) => {
  const isSingleStep = totalSteps === 1;
  const isFirstStep = step === 0;
  const isLastStep = step === totalSteps - 1;
  const isMiddleStep = step > 0 && step < totalSteps - 1;

  return (
    <footer className="wnw-footer">
      <div className="wnw-footer-left">
        {isMiddleStep && (
          <button className="wnw-btn wnw-btn--secondary" onClick={onPrevious}>
            <ChevronLeft size={16} />
            Previous
          </button>
        )}
      </div>
      <div className="wnw-footer-right">
        {isFirstStep && !isSingleStep && (
          <button className="wnw-btn wnw-btn--primary" onClick={onNext}>
            See what&apos;s new
            <ChevronRight size={16} />
          </button>
        )}
        {isMiddleStep && (
          <button className="wnw-btn wnw-btn--primary" onClick={onNext}>
            Next
            <ChevronRight size={16} />
          </button>
        )}
        {isLastStep && (
          <button className="wnw-btn wnw-btn--primary wnw-btn--finish" onClick={onFinish}>
            {isSingleStep ? "Close" : "Get Started"}
          </button>
        )}
      </div>
    </footer>
  );
};

export default WizardFooter;
