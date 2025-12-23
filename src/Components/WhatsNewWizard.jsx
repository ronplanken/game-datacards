import { compare } from "compare-versions";
import React, { useEffect, useCallback } from "react";
import * as ReactDOM from "react-dom";
import { useSettingsStorage } from "../Hooks/useSettingsStorage";
import { LAST_WIZARD_VERSION } from "./WelcomeWizard";
import { Check, ChevronLeft, ChevronRight, Sparkles, Smartphone, Palette, SlidersHorizontal } from "lucide-react";
import "./WhatsNewWizard.css";

const modalRoot = document.getElementById("modal-root");

// Configuration for major releases that should show a wizard
export const MAJOR_RELEASES = {
  "3.0.0": {
    steps: [
      { key: 0, title: "Welcome", icon: Sparkles },
      { key: 1, title: "Age of Sigmar", icon: null },
      { key: 2, title: "Mobile Redesign", icon: Smartphone },
      { key: 3, title: "Custom Colours", icon: Palette },
      { key: 4, title: "Updated Controls", icon: SlidersHorizontal },
      { key: 5, title: "Thank You", icon: null },
    ],
  },
};

// Helper to find the applicable major version for the current app version
export const getMajorWizardVersion = (currentVersion) => {
  return Object.keys(MAJOR_RELEASES)
    .sort((a, b) => compare(b, a))
    .find((v) => compare(currentVersion, v, ">="));
};

// Header Component
const WizardHeader = ({ step, steps, version }) => (
  <header className="wnw-header">
    <div className="wnw-header-content">
      <div>
        <div className="wnw-title-row">
          <h1 className="wnw-title">{steps[step].title}</h1>
          <span className="wnw-step-badge">
            Step {step + 1} of {steps.length}
          </span>
        </div>
        <p className="wnw-subtitle">What&apos;s new in version {version}</p>
      </div>
    </div>
    <div className="wnw-progress">
      <div className="wnw-progress-bar" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
    </div>
  </header>
);

// Sidebar Component
const WizardSidebar = ({ steps, currentStep, onStepClick }) => (
  <nav className="wnw-sidebar">
    {steps.map((stepItem, index) => {
      const isActive = currentStep === index;
      const isCompleted = currentStep > index;

      return (
        <div
          key={stepItem.key}
          className={`wnw-sidebar-item ${isActive ? "wnw-sidebar-item--active" : ""} ${
            isCompleted ? "wnw-sidebar-item--completed" : ""
          }`}
          onClick={() => isCompleted && onStepClick(index)}
          style={{ animationDelay: `${index * 0.05}s` }}>
          <div className="wnw-sidebar-marker">{isCompleted ? <Check size={14} /> : <span>{index + 1}</span>}</div>
          <span className="wnw-sidebar-title">{stepItem.title}</span>
        </div>
      );
    })}
  </nav>
);

// Mobile Progress Dots
const MobileProgress = ({ currentStep, totalSteps }) => (
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

// Step Content Components for v3.0.0
const StepWelcome = () => (
  <div className="wnw-welcome-content">
    <div className="wnw-welcome-badge">
      <Sparkles size={24} />
      <span>Major Update</span>
    </div>
    <h2 className="wnw-welcome-title">Welcome to Version 3.0</h2>
    <p className="wnw-welcome-subtitle">
      We&apos;ve been working hard to bring you some exciting new features and improvements. Let us walk you through the
      highlights of this major release.
    </p>
  </div>
);

const StepAgeOfSigmar = () => (
  <div className="wnw-feature-content">
    <div className="wnw-feature-header">
      <div className="wnw-feature-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </div>
      <h2 className="wnw-feature-title">Age of Sigmar Support</h2>
    </div>
    <p className="wnw-feature-description">
      Full support for Age of Sigmar is here! Create and customize warscrolls for your armies with all the features you
      love.
    </p>
    <div className="wnw-feature-highlights">
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Warscroll Cards</strong>
          <p>Complete warscroll support with all unit stats and abilities</p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Spell Lores</strong>
          <p>Add and customize spell lores for your wizards</p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Manifestations</strong>
          <p>Include manifestation cards in your collections</p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Faction Styling</strong>
          <p>Unique visual styling for each Age of Sigmar faction</p>
        </div>
      </div>
    </div>
  </div>
);

const StepMobileRedesign = () => (
  <div className="wnw-feature-content">
    <div className="wnw-feature-header">
      <div className="wnw-feature-icon">
        <Smartphone size={28} />
      </div>
      <h2 className="wnw-feature-title">Mobile Redesign</h2>
    </div>
    <p className="wnw-feature-description">
      The mobile viewer has been completely redesigned for a better experience on your phone or tablet.
    </p>
    <div className="wnw-feature-highlights">
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Improved Navigation</strong>
          <p>Quickly browse through your cards and factions</p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Better Touch Interactions</strong>
          <p>Swipe, tap, and navigate with ease</p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Optimized Layout</strong>
          <p>Cards look great on any screen size</p>
        </div>
      </div>
    </div>
  </div>
);

const StepCustomColours = () => (
  <div className="wnw-feature-content">
    <div className="wnw-feature-header">
      <div className="wnw-feature-icon">
        <Palette size={28} />
      </div>
      <h2 className="wnw-feature-title">Custom Colours</h2>
    </div>
    <p className="wnw-feature-description">Take full control of your card appearance with custom colour options.</p>
    <div className="wnw-feature-highlights">
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Banner Colours</strong>
          <p>Override the faction banner colour on any card</p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Header Colours</strong>
          <p>Customize header colours for a unique look</p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Per-Card Customization</strong>
          <p>Each card can have its own colour scheme</p>
        </div>
      </div>
    </div>
  </div>
);

const StepUpdatedControls = () => (
  <div className="wnw-feature-content">
    <div className="wnw-feature-header">
      <div className="wnw-feature-icon">
        <SlidersHorizontal size={28} />
      </div>
      <h2 className="wnw-feature-title">Updated Controls</h2>
    </div>
    <p className="wnw-feature-description">
      We&apos;ve improved the editor controls to make creating and editing cards even easier.
    </p>
    <div className="wnw-feature-highlights">
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Auto-fit Scaling</strong>
          <p>Cards automatically scale to fit the available space</p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Improved Zoom</strong>
          <p>Better zoom controls for precise card viewing</p>
        </div>
      </div>
      <div className="wnw-highlight-item">
        <div className="wnw-highlight-dot" />
        <div>
          <strong>Smoother Experience</strong>
          <p>Overall performance improvements in the editor</p>
        </div>
      </div>
    </div>
  </div>
);

const StepThankYou = () => (
  <div className="wnw-thankyou-content">
    <h2 className="wnw-feature-title">You&apos;re All Set!</h2>
    <p className="wnw-feature-description">
      Thank you for using Game Datacards. We hope these new features help you create even better cards for your games.
    </p>
    <p className="wnw-feature-description">Have feedback or want to discuss features? Join our Discord community!</p>
    <a href="https://discord.gg/anfn4qTYC4" target="_blank" rel="noreferrer" className="wnw-discord-link">
      <img src="https://discordapp.com/api/guilds/997166169540788244/widget.png?style=banner2" alt="Join our Discord" />
    </a>
  </div>
);

// Step Content Router
const WizardStepContent = ({ step }) => {
  const contentMap = {
    0: <StepWelcome />,
    1: <StepAgeOfSigmar />,
    2: <StepMobileRedesign />,
    3: <StepCustomColours />,
    4: <StepUpdatedControls />,
    5: <StepThankYou />,
  };

  return (
    <div className="wnw-step-content" key={step}>
      {contentMap[step]}
    </div>
  );
};

// Footer Component
const WizardFooter = ({ step, totalSteps, onPrevious, onNext, onFinish }) => (
  <footer className="wnw-footer">
    <div className="wnw-footer-left">
      {step > 0 && step < totalSteps - 1 && (
        <button className="wnw-btn wnw-btn--secondary" onClick={onPrevious}>
          <ChevronLeft size={16} />
          Previous
        </button>
      )}
    </div>
    <div className="wnw-footer-right">
      {step === 0 && (
        <button className="wnw-btn wnw-btn--primary" onClick={onNext}>
          See what&apos;s new
          <ChevronRight size={16} />
        </button>
      )}
      {step > 0 && step < totalSteps - 1 && (
        <button className="wnw-btn wnw-btn--primary" onClick={onNext}>
          Next
          <ChevronRight size={16} />
        </button>
      )}
      {step === totalSteps - 1 && (
        <button className="wnw-btn wnw-btn--primary wnw-btn--finish" onClick={onFinish}>
          Get Started
        </button>
      )}
    </div>
  </footer>
);

// Main Wizard Component
export const WhatsNewWizard = () => {
  const [isWizardVisible, setIsWizardVisible] = React.useState(false);
  const [step, setStep] = React.useState(0);
  const [isExiting, setIsExiting] = React.useState(false);
  const [majorVersion, setMajorVersion] = React.useState(null);

  const { settings, updateSettings } = useSettingsStorage();

  // Keyboard handler
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape" && isWizardVisible && majorVersion) {
        const steps = MAJOR_RELEASES[majorVersion].steps;
        if (step === steps.length - 1) {
          handleClose();
        }
      }
    },
    [isWizardVisible, step, majorVersion]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Version check to show wizard
  useEffect(() => {
    const currentVersion = process.env.REACT_APP_VERSION;
    const applicableMajorVersion = getMajorWizardVersion(currentVersion);

    // Show wizard if:
    // 1. There's an applicable major version
    // 2. User hasn't seen this major version's wizard yet
    // 3. User has completed the welcome wizard (not a new user)
    if (
      applicableMajorVersion &&
      compare(settings.lastMajorWizardVersion, applicableMajorVersion, "<") &&
      compare(settings.wizardCompleted, LAST_WIZARD_VERSION, ">=")
    ) {
      setMajorVersion(applicableMajorVersion);
      setIsWizardVisible(true);
    }
  }, [settings]);

  // Close with exit animation
  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsWizardVisible(false);
      setIsExiting(false);
      setStep(0);
      updateSettings({
        ...settings,
        lastMajorWizardVersion: majorVersion,
        wizardCompleted: process.env.REACT_APP_VERSION,
      });
    }, 200);
  };

  // Overlay click handler - only close on final step
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && majorVersion) {
      const steps = MAJOR_RELEASES[majorVersion].steps;
      if (step === steps.length - 1) {
        handleClose();
      }
    }
  };

  // Navigation
  const handlePrevious = () => setStep((s) => Math.max(0, s - 1));
  const handleNext = () => {
    if (majorVersion) {
      const steps = MAJOR_RELEASES[majorVersion].steps;
      setStep((s) => Math.min(steps.length - 1, s + 1));
    }
  };

  if (!isWizardVisible || !majorVersion) return null;

  const steps = MAJOR_RELEASES[majorVersion].steps;

  return ReactDOM.createPortal(
    <div className={`wnw-overlay ${isExiting ? "wnw-overlay--exiting" : ""}`} onClick={handleOverlayClick}>
      <div className="wnw-modal" onClick={(e) => e.stopPropagation()}>
        <WizardHeader step={step} steps={steps} version={majorVersion} />

        <MobileProgress currentStep={step} totalSteps={steps.length} />

        <div className="wnw-body">
          <WizardSidebar steps={steps} currentStep={step} onStepClick={setStep} />
          <div className="wnw-content">
            <WizardStepContent step={step} />
          </div>
        </div>

        <WizardFooter
          step={step}
          totalSteps={steps.length}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onFinish={handleClose}
        />
      </div>
    </div>,
    modalRoot
  );
};
