import React, { useCallback, useEffect, useState } from "react";
import * as ReactDOM from "react-dom";
import { Check, ChevronLeft, ChevronRight, Database } from "lucide-react";
import { useDatasourceWizard } from "./hooks/useDatasourceWizard";
import { WIZARD_MODES } from "./constants";
import { StepMetadata } from "./steps/StepMetadata";
import { StepBaseSystem } from "./steps/StepBaseSystem";
import { StepCardType } from "./steps/StepCardType";
import { StepReview } from "./steps/StepReview";
import { StepStats } from "./steps/StepStats";
import { StepWeapons } from "./steps/StepWeapons";
import { StepAbilities } from "./steps/StepAbilities";
import { StepSections } from "./steps/StepSections";
import { StepUnitMetadata } from "./steps/StepUnitMetadata";
import { StepFields } from "./steps/StepFields";
import { StepRules } from "./steps/StepRules";
import { StepKeywords } from "./steps/StepKeywords";
import "./DatasourceWizard.css";

/**
 * Sidebar step indicator for the datasource wizard.
 */
const WizardSidebar = ({ steps, currentStepIndex, completedSteps, onStepClick }) => {
  return (
    <nav className="dsw-sidebar" data-testid="dsw-sidebar">
      {steps.map((step, index) => {
        const isActive = currentStepIndex === index;
        const isCompleted = completedSteps.has(index);
        const canClick = isCompleted || index < currentStepIndex;

        return (
          <div
            key={step.id}
            className={`dsw-sidebar-item ${isActive ? "dsw-sidebar-item--active" : ""} ${isCompleted ? "dsw-sidebar-item--completed" : ""}`}
            onClick={() => canClick && onStepClick(index)}
            style={{ animationDelay: `${index * 0.05}s` }}
            role="button"
            tabIndex={canClick ? 0 : -1}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && canClick) {
                onStepClick(index);
              }
            }}>
            <div className="dsw-sidebar-marker">{isCompleted ? <Check size={14} /> : <span>{index + 1}</span>}</div>
            <span className="dsw-sidebar-title">{step.title}</span>
          </div>
        );
      })}
    </nav>
  );
};

/**
 * Step transition wrapper with directional animation.
 */
const StepTransition = ({ children, direction, stepKey }) => {
  const animationClass = direction === "forward" ? "dsw-step--enter-forward" : "dsw-step--enter-backward";

  return (
    <div className={`dsw-step-content ${animationClass}`} key={stepKey}>
      {children}
    </div>
  );
};

/**
 * Placeholder content for steps that are not yet implemented.
 */
const StepPlaceholder = ({ step }) => {
  return (
    <div className="dsw-step-placeholder" data-testid={`dsw-step-${step.id}`}>
      <div className="dsw-step-placeholder-icon">
        <Database size={24} />
      </div>
      <h3 className="dsw-step-placeholder-title">{step.title}</h3>
      <p className="dsw-step-placeholder-text">This step will be implemented in a later phase.</p>
    </div>
  );
};

/**
 * DatasourceWizard - Multi-step modal for creating a custom datasource
 * or adding a card type to an existing one.
 *
 * @param {Object} props
 * @param {boolean} props.open - Whether the wizard is visible
 * @param {Function} props.onClose - Called when the wizard is dismissed
 * @param {Function} props.onComplete - Called with the assembled result on completion
 * @param {Object} [props.existingDatasource] - Pass an existing datasource to enter add-card-type mode
 */
export const DatasourceWizard = ({ open, onClose, onComplete, existingDatasource }) => {
  const [isExiting, setIsExiting] = useState(false);
  const modalRoot = document.getElementById("modal-root");

  const wizard = useDatasourceWizard({ existingDatasource });

  const isCreateMode = wizard.mode === WIZARD_MODES.CREATE;
  const headerTitle = isCreateMode ? "Create Datasource" : "Add Card Type";
  const headerSubtitle = isCreateMode
    ? "Define the structure for your custom game system"
    : "Add a new card type to your datasource";

  // Close with exit animation
  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsExiting(false);
      onClose?.();
    }, 200);
  }, [onClose]);

  // Complete the wizard
  const handleComplete = useCallback(() => {
    const result = wizard.assembleResult();
    setIsExiting(true);
    setTimeout(() => {
      setIsExiting(false);
      onComplete?.(result);
    }, 200);
  }, [wizard, onComplete]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e) => {
      if (!open) return;

      if (e.key === "Escape") {
        handleClose();
      }
      if (e.key === "ArrowRight" && wizard.canProceed && !wizard.isLastStep) {
        wizard.goNext();
      }
      if (e.key === "ArrowLeft" && !wizard.isFirstStep) {
        wizard.goPrevious();
      }
    },
    [open, wizard, handleClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Overlay click to close
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Render current step content
  const renderStepContent = () => {
    switch (wizard.currentStep.id) {
      case "metadata":
        return <StepMetadata wizard={wizard} />;
      case "base-system":
        return <StepBaseSystem wizard={wizard} />;
      case "card-type":
        return <StepCardType wizard={wizard} />;
      case "stats":
        return <StepStats wizard={wizard} />;
      case "weapons":
        return <StepWeapons wizard={wizard} />;
      case "abilities":
        return <StepAbilities wizard={wizard} />;
      case "sections":
        return <StepSections wizard={wizard} />;
      case "unit-metadata":
        return <StepUnitMetadata wizard={wizard} />;
      case "fields":
        return <StepFields wizard={wizard} />;
      case "rules":
        return <StepRules wizard={wizard} />;
      case "keywords":
        return <StepKeywords wizard={wizard} />;
      case "review":
        return <StepReview wizard={wizard} />;
      default:
        return <StepPlaceholder step={wizard.currentStep} />;
    }
  };

  if (!open) return null;

  return ReactDOM.createPortal(
    <div
      className={`dsw-overlay ${isExiting ? "dsw-overlay--exiting" : ""}`}
      onClick={handleOverlayClick}
      data-testid="dsw-overlay">
      <div className="dsw-modal" onClick={(e) => e.stopPropagation()} data-testid="dsw-modal">
        {/* Header */}
        <header className="dsw-header">
          <div className="dsw-header-content">
            <div>
              <div className="dsw-title-row">
                <h1 className="dsw-title">{headerTitle}</h1>
                <span className="dsw-step-badge">
                  Step {wizard.currentStepIndex + 1} of {wizard.totalSteps}
                </span>
              </div>
              <p className="dsw-subtitle">{headerSubtitle}</p>
            </div>
          </div>
          <div className="dsw-progress">
            <div className="dsw-progress-bar" style={{ width: `${wizard.progress}%` }} />
          </div>
        </header>

        {/* Body */}
        <div className="dsw-body">
          <WizardSidebar
            steps={wizard.steps}
            currentStepIndex={wizard.currentStepIndex}
            completedSteps={wizard.completedSteps}
            onStepClick={wizard.goToStep}
          />

          <div className="dsw-content">
            <StepTransition direction={wizard.transitionDirection} stepKey={wizard.currentStep.id}>
              {renderStepContent()}
            </StepTransition>
          </div>
        </div>

        {/* Footer */}
        <footer className="dsw-footer">
          <div className="dsw-footer-left">
            {!wizard.isFirstStep && (
              <button className="dsw-btn dsw-btn--secondary" onClick={wizard.goPrevious} data-testid="dsw-btn-previous">
                <ChevronLeft size={16} />
                Previous
              </button>
            )}
            {wizard.isFirstStep && (
              <button className="dsw-btn dsw-btn--ghost" onClick={handleClose} data-testid="dsw-btn-cancel">
                Cancel
              </button>
            )}
          </div>

          <div className="dsw-footer-right">
            {!wizard.isLastStep && (
              <button
                className="dsw-btn dsw-btn--primary"
                onClick={wizard.goNext}
                disabled={!wizard.canProceed}
                data-testid="dsw-btn-next">
                Next
                <ChevronRight size={16} />
              </button>
            )}
            {wizard.isLastStep && (
              <button className="dsw-btn dsw-btn--primary" onClick={handleComplete} data-testid="dsw-btn-complete">
                {isCreateMode ? "Create Datasource" : "Add Card Type"}
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>,
    modalRoot,
  );
};
