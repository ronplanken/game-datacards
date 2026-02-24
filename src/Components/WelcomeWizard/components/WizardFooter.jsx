import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Wizard footer with navigation buttons
 */
export const WizardFooter = ({ isFirstStep, isLastStep, canProceed, onPrevious, onNext, onFinish, onSkip }) => {
  return (
    <footer className="wz-footer">
      <div className="wz-footer-left">
        {/* Skip tutorial option on first step */}
        {isFirstStep && onSkip && (
          <button className="wz-btn wz-btn--ghost" onClick={onSkip}>
            Skip Tutorial
          </button>
        )}
        {/* Previous button (not on first step) */}
        {!isFirstStep && !isLastStep && (
          <button className="wz-btn wz-btn--secondary" onClick={onPrevious}>
            <ChevronLeft size={16} />
            Previous
          </button>
        )}
      </div>

      <div className="wz-footer-right">
        {/* First step: Get Started button */}
        {isFirstStep && (
          <button className="wz-btn wz-btn--primary" onClick={onNext}>
            Let&apos;s get started!
            <ChevronRight size={16} />
          </button>
        )}

        {/* Middle steps: Next button */}
        {!isFirstStep && !isLastStep && (
          <button className="wz-btn wz-btn--primary" onClick={onNext} disabled={!canProceed}>
            Next
            <ChevronRight size={16} />
          </button>
        )}

        {/* Last step: Finish button */}
        {isLastStep && (
          <button className="wz-btn wz-btn--primary wz-btn--finish" onClick={onFinish}>
            Start Creating
          </button>
        )}
      </div>
    </footer>
  );
};
