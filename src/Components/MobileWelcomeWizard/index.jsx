import { compare } from "compare-versions";
import React, { useState, useEffect, useCallback } from "react";
import * as ReactDOM from "react-dom";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useSettingsStorage } from "../../Hooks/useSettingsStorage";
import { StepWelcome } from "./steps/StepWelcome";
import { StepImportList } from "./steps/StepImportList";
import { StepDesktopInfo } from "./steps/StepDesktopInfo";
import { StepGameSystem } from "./steps/StepGameSystem";
import { Step40KSettings } from "./steps/Step40KSettings";
import { StepAoSSettings } from "./steps/StepAoSSettings";
import { StepComplete } from "./steps/StepComplete";
import "./MobileWelcomeWizard.css";

const modalRoot = document.getElementById("modal-root");

export const LAST_WIZARD_VERSION = "1.2.0";

// Step definitions
const STEPS = {
  WELCOME: 0,
  IMPORT_LIST: 1,
  DESKTOP_INFO: 2,
  GAME_SYSTEM: 3,
  SETTINGS: 4,
  COMPLETE: 5,
};

// Step titles for progress indicator
const STEP_TITLES = {
  [STEPS.WELCOME]: "Welcome",
  [STEPS.IMPORT_LIST]: "Import",
  [STEPS.DESKTOP_INFO]: "Desktop",
  [STEPS.GAME_SYSTEM]: "Game System",
  [STEPS.SETTINGS]: "Settings",
  [STEPS.COMPLETE]: "Done",
};

export const MobileWelcomeWizard = () => {
  const [isWizardVisible, setIsWizardVisible] = useState(false);
  const [step, setStep] = useState(STEPS.WELCOME);
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [isExiting, setIsExiting] = useState(false);
  const [isStepTransitioning, setIsStepTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState("forward");

  const { settings, updateSettings } = useSettingsStorage();

  // Get visible steps based on selected system
  const getVisibleSteps = () => {
    // Base steps: Welcome, Import, Desktop, Game System, Complete
    // Settings step is inserted between Game System and Complete
    const baseSteps = [STEPS.WELCOME, STEPS.IMPORT_LIST, STEPS.DESKTOP_INFO, STEPS.GAME_SYSTEM];

    if (selectedSystem) {
      // Both 40K and AoS have settings steps
      baseSteps.push(STEPS.SETTINGS);
    }

    baseSteps.push(STEPS.COMPLETE);
    return baseSteps;
  };

  const visibleSteps = getVisibleSteps();
  const totalSteps = visibleSteps.length;
  const currentStepIndex = visibleSteps.indexOf(step);

  // Version check to show wizard
  useEffect(() => {
    if (!settings.wizardCompleted) {
      setIsWizardVisible(true);
      return;
    }
    if (compare(settings.wizardCompleted, LAST_WIZARD_VERSION, "<")) {
      setIsWizardVisible(true);
    }
  }, [settings]);

  // Transition helper for step changes
  const transitionToStep = useCallback((nextStep, direction = "forward") => {
    setTransitionDirection(direction);
    setIsStepTransitioning(true);
    setTimeout(() => {
      setStep(nextStep);
      setIsStepTransitioning(false);
    }, 200);
  }, []);

  // Handle game system selection (toggle, doesn't navigate)
  const handleGameSystemSelect = (system) => {
    setSelectedSystem(system);
  };

  // Handle wizard completion
  const handleComplete = () => {
    setIsExiting(true);
    setTimeout(() => {
      updateSettings({
        ...settings,
        selectedDataSource: selectedSystem,
        showCardsAsDoubleSided: true,
        mobile: {
          ...settings.mobile,
          gameSystemSelected: true,
        },
        wizardCompleted: process.env.REACT_APP_VERSION,
        lastMajorWizardVersion: process.env.REACT_APP_VERSION,
      });
      setIsWizardVisible(false);
      setIsExiting(false);
      setStep(STEPS.WELCOME);
      setSelectedSystem(null);
    }, 250);
  };

  // Handle next button for linear steps
  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < visibleSteps.length) {
      transitionToStep(visibleSteps[nextIndex], "forward");
    }
  };

  // Handle previous button
  const handlePrevious = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      // If going back from settings, clear the selected system
      if (step === STEPS.SETTINGS) {
        setSelectedSystem(null);
      }
      transitionToStep(visibleSteps[prevIndex], "backward");
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (step) {
      case STEPS.WELCOME:
        return <StepWelcome />;
      case STEPS.IMPORT_LIST:
        return <StepImportList />;
      case STEPS.DESKTOP_INFO:
        return <StepDesktopInfo />;
      case STEPS.GAME_SYSTEM:
        return <StepGameSystem selectedSystem={selectedSystem} onSelect={handleGameSystemSelect} />;
      case STEPS.SETTINGS:
        if (selectedSystem === "aos") {
          return <StepAoSSettings />;
        }
        return <Step40KSettings />;
      case STEPS.COMPLETE:
        return <StepComplete />;
      default:
        return null;
    }
  };

  // Check if Next button should be disabled
  const isNextDisabled = step === STEPS.GAME_SYSTEM && !selectedSystem;

  if (!isWizardVisible) return null;

  return ReactDOM.createPortal(
    <div className={`mww-overlay ${isExiting ? "mww-overlay--exiting" : ""}`}>
      <div className="mww-container">
        {/* Header with step indicator */}
        <header className="mww-header">
          <div className="mww-header-step">
            Step {currentStepIndex + 1} of {totalSteps}
          </div>
          <div className="mww-header-title">{STEP_TITLES[step]}</div>
        </header>

        <div className="mww-content">
          <div
            className={`mww-step ${isStepTransitioning ? `mww-step--exiting-${transitionDirection}` : ""}`}
            key={step}>
            {renderStepContent()}
          </div>
        </div>

        <footer className="mww-footer">
          {/* Progress dots */}
          <div className="mww-progress">
            {visibleSteps.map((_, index) => (
              <div
                key={index}
                className={`mww-progress-dot ${currentStepIndex === index ? "mww-progress-dot--active" : ""} ${
                  currentStepIndex > index ? "mww-progress-dot--completed" : ""
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="mww-nav">
            {/* Previous button - shown from step 2 onwards, not on Complete */}
            {currentStepIndex > 0 && step !== STEPS.COMPLETE && (
              <button className="mww-btn mww-btn--secondary" onClick={handlePrevious} type="button">
                <ChevronLeft />
                Previous
              </button>
            )}

            {/* Next/Get Started button */}
            {step === STEPS.WELCOME && (
              <button className="mww-btn mww-btn--primary" onClick={handleNext} type="button">
                Get Started
                <ChevronRight />
              </button>
            )}

            {step !== STEPS.WELCOME && step !== STEPS.COMPLETE && (
              <button className="mww-btn mww-btn--primary" onClick={handleNext} type="button" disabled={isNextDisabled}>
                Next
                <ChevronRight />
              </button>
            )}

            {step === STEPS.COMPLETE && (
              <button className="mww-btn mww-btn--finish" onClick={handleComplete} type="button">
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
