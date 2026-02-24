import { compare } from "compare-versions";
import React, { useEffect, useCallback } from "react";
import * as ReactDOM from "react-dom";
import { message } from "../Toast/message";
import { useSettingsStorage } from "../../Hooks/useSettingsStorage";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { useWelcomeWizard } from "./hooks/useWelcomeWizard";
import { WIZARD_VERSION, WIZARD_STEPS } from "./constants";
import { WizardHeader, WizardSidebar, WizardFooter, StepTransition, MobileProgress } from "./components";
import {
  StepWelcome,
  StepGameSystem,
  StepWorkspace,
  StepAddingCards,
  StepDataPortability,
  StepSubscription,
  StepCloudSync,
  StepExploreMore,
  StepComplete,
} from "./steps";
import "./WelcomeWizard.css";

const modalRoot = document.getElementById("modal-root");

// Export for version checking
export const LAST_WIZARD_VERSION = WIZARD_VERSION;

/**
 * Main Welcome Wizard v2.0.0 component
 */
export const WelcomeWizard = () => {
  const [isWizardVisible, setIsWizardVisible] = React.useState(false);
  const [isExiting, setIsExiting] = React.useState(false);

  const { settings, updateSettings } = useSettingsStorage();
  const { addCategory, setActiveCategory } = useCardStorage();

  const wizard = useWelcomeWizard(settings, updateSettings);

  // Keyboard handler
  const handleKeyDown = useCallback(
    (e) => {
      if (!isWizardVisible) return;

      // ESC to close on last step
      if (e.key === "Escape" && wizard.isLastStep) {
        handleClose();
      }

      // Arrow keys for navigation
      if (e.key === "ArrowRight" && wizard.canProceed && !wizard.isLastStep) {
        wizard.goNext();
      }
      if (e.key === "ArrowLeft" && !wizard.isFirstStep) {
        wizard.goPrevious();
      }
    },
    [isWizardVisible, wizard],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Version check to show wizard
  useEffect(() => {
    if (!settings.wizardCompleted) {
      setIsWizardVisible(true);
      return;
    }
    if (compare(settings.wizardCompleted, WIZARD_VERSION, "<")) {
      setIsWizardVisible(true);
    }
  }, [settings]);

  // Close with exit animation
  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsWizardVisible(false);
      setIsExiting(false);
      updateSettings({
        ...settings,
        wizardCompleted: import.meta.env.VITE_VERSION,
        lastMajorWizardVersion: import.meta.env.VITE_VERSION,
      });
    }, 200);
  }, [settings, updateSettings]);

  // Skip tutorial
  const handleSkip = useCallback(() => {
    handleClose();
  }, [handleClose]);

  // Overlay click handler - only close on final step
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && wizard.isLastStep) {
      handleClose();
    }
  };

  // Quick actions from complete step
  const handleQuickAction = (action) => {
    switch (action) {
      case "browse":
        // Close wizard - the left panel shows the datasource list for browsing units
        handleClose();
        message.info("Browse units in the left panel");
        break;

      case "create":
        // Create a new category
        const newCategory = addCategory("New Category");
        if (newCategory) {
          setActiveCategory(newCategory);
          message.success("Category created! Right-click to rename it.");
        }
        handleClose();
        break;

      case "settings":
        // Close wizard and guide user to settings
        handleClose();
        message.info("Click the gear icon in the top right to open Settings");
        break;

      default:
        handleClose();
        break;
    }
  };

  // Render current step content
  const renderStepContent = () => {
    switch (wizard.currentStepConfig.id) {
      case "welcome":
        return <StepWelcome />;

      case "game-system":
        return <StepGameSystem selectedGameSystem={wizard.selectedGameSystem} onSelect={wizard.selectGameSystem} />;

      case "workspace":
        return <StepWorkspace treeData={wizard.demoTreeData} onToggleTree={wizard.toggleTreeItem} />;

      case "adding-cards":
        return <StepAddingCards />;

      case "data-portability":
        return <StepDataPortability activeTab={wizard.activeDataTab} onTabChange={wizard.setActiveDataTab} />;

      case "subscription":
        return <StepSubscription />;

      case "cloud-sync":
        return <StepCloudSync />;

      case "explore-more":
        return <StepExploreMore />;

      case "complete":
        return <StepComplete selectedGameSystem={wizard.selectedGameSystem} onAction={handleQuickAction} />;

      default:
        return null;
    }
  };

  if (!isWizardVisible) return null;

  return ReactDOM.createPortal(
    <div className={`wz-overlay ${isExiting ? "wz-overlay--exiting" : ""}`} onClick={handleOverlayClick}>
      <div className="wz-modal" onClick={(e) => e.stopPropagation()}>
        <WizardHeader currentStep={wizard.currentStep} progress={wizard.progress} />

        <MobileProgress
          currentStep={wizard.currentStep}
          completedSteps={wizard.completedSteps}
          steps={wizard.visibleSteps}
        />

        <div className="wz-body">
          <WizardSidebar
            currentStep={wizard.currentStep}
            completedSteps={wizard.completedSteps}
            onStepClick={wizard.goToStep}
            steps={wizard.visibleSteps}
          />

          <div className="wz-content">
            <StepTransition direction={wizard.transitionDirection} stepKey={wizard.currentStep}>
              {renderStepContent()}
            </StepTransition>
          </div>
        </div>

        <WizardFooter
          isFirstStep={wizard.isFirstStep}
          isLastStep={wizard.isLastStep}
          canProceed={wizard.canProceed}
          onPrevious={wizard.goPrevious}
          onNext={wizard.goNext}
          onFinish={handleClose}
          onSkip={handleSkip}
        />
      </div>
    </div>,
    modalRoot,
  );
};
