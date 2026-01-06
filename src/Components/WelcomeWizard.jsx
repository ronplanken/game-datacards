import { compare } from "compare-versions";
import React, { useEffect, useCallback } from "react";
import * as ReactDOM from "react-dom";
import { useSettingsStorage } from "../Hooks/useSettingsStorage";
import { Image } from "antd";
import { Check, ChevronLeft, ChevronRight, AlertTriangle, Circle, CheckCircle } from "lucide-react";
import "./WelcomeWizard.css";

// Wizard images
import wizard01 from "../Images/wizard01.png";
import wizard02 from "../Images/wizard02.png";
import wizard03 from "../Images/wizard03.png";
import wizard04 from "../Images/wizard04.png";
import wizard05 from "../Images/wizard05.png";
import wizard06 from "../Images/wizard06.png";

const modalRoot = document.getElementById("modal-root");

export const LAST_WIZARD_VERSION = "1.2.0";

// Step configuration
const WIZARD_STEPS = [
  { key: 0, title: "Welcome" },
  { key: 1, title: "Managing Cards" },
  { key: 2, title: "Adding Cards" },
  { key: 3, title: "Editing Cards" },
  { key: 4, title: "Sharing Cards" },
  { key: 5, title: "Datasources" },
  { key: 6, title: "Thank You" },
];

// Datasource configuration with branding
const DATASOURCES = [
  {
    id: "basic",
    title: "Basic Cards",
    description: "Create fully custom cards from scratch",
    color: "#6366f1",
    tag: null,
  },
  {
    id: "40k-10e",
    title: "Warhammer 40K",
    subtitle: "10th Edition",
    description: "Community-maintained datacards for 10th edition games",
    color: "#dc2626",
    tag: "Popular",
  },
  {
    id: "aos",
    title: "Age of Sigmar",
    subtitle: "4th Edition",
    description: "Community-maintained warscrolls and unit cards",
    color: "#ca8a04",
    tag: "New",
  },
  {
    id: "40k",
    title: "Wahapedia Import",
    subtitle: "9th Edition (Legacy)",
    description: "Import and customize cards from Wahapedia data",
    color: "#737373",
    tag: "Legacy",
  },
  {
    id: "40k-10e-cp",
    title: "Combat Patrol",
    subtitle: "10th Edition",
    description: "Simplified cards for Combat Patrol game mode",
    color: "#0891b2",
    tag: null,
  },
  {
    id: "necromunda",
    title: "Necromunda",
    description: "Fighter cards for skirmish games",
    color: "#a05236",
    tag: null,
  },
];

// Header Component
const WizardHeader = ({ step }) => (
  <header className="wz-header">
    <div className="wz-header-content">
      <div>
        <div className="wz-title-row">
          <h1 className="wz-title">{WIZARD_STEPS[step].title}</h1>
          <span className="wz-step-badge">Step {step + 1} of 7</span>
        </div>
        <p className="wz-subtitle">Get started with Game Datacards</p>
      </div>
    </div>
    <div className="wz-progress">
      <div className="wz-progress-bar" style={{ width: `${((step + 1) / 7) * 100}%` }} />
    </div>
  </header>
);

// Sidebar Component
const WizardSidebar = ({ steps, currentStep, onStepClick }) => (
  <nav className="wz-sidebar">
    {steps.map((stepItem, index) => {
      const isActive = currentStep === index;
      const isCompleted = currentStep > index;

      return (
        <div
          key={stepItem.key}
          className={`wz-sidebar-item ${isActive ? "wz-sidebar-item--active" : ""} ${
            isCompleted ? "wz-sidebar-item--completed" : ""
          }`}
          onClick={() => isCompleted && onStepClick(index)}
          style={{ animationDelay: `${index * 0.05}s` }}>
          <div className="wz-sidebar-marker">{isCompleted ? <Check size={14} /> : <span>{index + 1}</span>}</div>
          <span className="wz-sidebar-title">{stepItem.title}</span>
        </div>
      );
    })}
  </nav>
);

// Mobile Progress Dots
const MobileProgress = ({ currentStep, totalSteps }) => (
  <div className="wz-mobile-progress">
    {Array.from({ length: totalSteps }).map((_, index) => (
      <div
        key={index}
        className={`wz-mobile-dot ${currentStep === index ? "wz-mobile-dot--active" : ""} ${
          currentStep > index ? "wz-mobile-dot--completed" : ""
        }`}
      />
    ))}
  </div>
);

// Datasource Card Component
const DatasourceCard = ({ datasource, isSelected, onSelect, style }) => (
  <div
    className={`wz-ds-card ${isSelected ? "wz-ds-card--selected" : ""}`}
    onClick={onSelect}
    style={{ "--ds-color": datasource.color, ...style }}>
    <div className="wz-ds-card-accent" />

    <div className="wz-ds-card-content">
      <div className="wz-ds-card-header">
        <h4 className="wz-ds-card-title">{datasource.title}</h4>
        {datasource.tag && (
          <span className={`wz-ds-tag wz-ds-tag--${datasource.tag.toLowerCase()}`}>{datasource.tag}</span>
        )}
      </div>
      {datasource.subtitle && <span className="wz-ds-card-subtitle">{datasource.subtitle}</span>}
      <p className="wz-ds-card-desc">{datasource.description}</p>
    </div>

    <div className="wz-ds-card-check">{isSelected ? <CheckCircle size={24} /> : <Circle size={24} />}</div>
  </div>
);

// Step Content Components
const StepWelcome = () => (
  <div className="wz-welcome-content">
    <h2 className="wz-welcome-title">Welcome to Game Datacards</h2>
    <p className="wz-welcome-subtitle">
      <em>The</em> website where you can create and manage your own datacards for any wargaming tabletop gaming system.
    </p>
    <p className="wz-welcome-subtitle">
      In order to get you started with our web app we would like to introduce you to the app and have you setup any
      datasources you would like to use.
    </p>
  </div>
);

const StepManagingCards = () => (
  <div className="wz-step-row">
    <div className="wz-step-text-col">
      <p className="wz-step-text">
        Game Datacards is setup in a way that allows you to add cards to a category and customize them. On the left of
        the app you have the treeview where you can see your current category and any cards that are added to the
        category.
      </p>
      <p className="wz-step-text">
        You can drag &amp; drop cards to re-order and optionally place them in a different category.
      </p>
      <p className="wz-step-text">Right-clicking on a card or category will give you even more options.</p>
      <p className="wz-step-text">
        Selecting a card or a category in the list with a left-click will open up the Export, Print and Sharing options.
      </p>
    </div>
    <div className="wz-step-image-col">
      <Image src={wizard01} className="wz-step-image" preview={false} />
    </div>
  </div>
);

const StepAddingCards = () => (
  <>
    <div className="wz-step-row">
      <div className="wz-step-text-col">
        <p className="wz-step-text">
          On the bottom left you have the card explorer. Depending on the datasource selected you can switch factions
          and search for a specific card by name.
        </p>
      </div>
      <div className="wz-step-image-col">
        <Image src={wizard02} className="wz-step-image" preview={false} />
      </div>
    </div>
    <div className="wz-step-row" style={{ marginTop: "24px" }}>
      <div className="wz-step-text-col">
        <p className="wz-step-text">
          Selecting a card in the card explorer will show the card in the preview window in the middle of the screen.
          You can edit it using the options on the right, but changes will only be saved if you add it to your category.
        </p>
      </div>
      <div className="wz-step-image-col">
        <Image src={wizard03} className="wz-step-image wz-step-image--small" preview={false} />
      </div>
    </div>
  </>
);

const StepEditingCards = () => (
  <div className="wz-step-row">
    <div className="wz-step-text-col">
      <p className="wz-step-text">
        When you have a card selected you can change anything you would like. Depending on the datasource certain fields
        may be prepopulated but set to in-active in order to reduce the amount of options visible.
      </p>
      <p className="wz-step-text">
        You are also able to switch between card variants using the Type option. As of now we have Cards and Sheets.
        Both with or without icons.
      </p>
      <p className="wz-step-text">
        After making changes they are only saved if you actually press the Save button located above the treeview. We
        will try to help remind you if you have any unsaved changes, but closing the browser will not save the card!
      </p>
    </div>
    <div className="wz-step-image-col">
      <Image src={wizard04} className="wz-step-image" preview={false} />
    </div>
  </div>
);

const StepSharingCards = () => (
  <div className="wz-step-row">
    <div className="wz-step-text-col">
      <p className="wz-step-text">
        When you have created your perfect set of cards, you can select your category and press the Share button in the
        top right.
      </p>
      <p className="wz-step-text" style={{ marginTop: "8px" }}>
        <Image src={wizard05} preview={false} style={{ height: "48px", display: "inline-block" }} />
      </p>
      <p className="wz-step-text">
        The generated link is perfect to share with your friends or to view on your mobile device. This way you can even
        take your cards with you on the move and use them digitally during a game!
      </p>
    </div>
    <div className="wz-step-image-col">
      <Image src={wizard06} className="wz-step-image" preview={false} />
    </div>
  </div>
);

const StepDatasources = ({ settings, updateSettings }) => {
  const handleSelect = (id) => {
    updateSettings({ ...settings, selectedDataSource: id });
  };

  return (
    <div className="wz-step-datasources">
      <div className="wz-step-intro">
        <h2 className="wz-step-title">Choose Your Datasource</h2>
        <p className="wz-step-description">
          Select the game system you want to create cards for. You can switch datasources anytime in Settings.
        </p>
      </div>

      <div className="wz-ds-grid">
        {DATASOURCES.map((ds, index) => (
          <DatasourceCard
            key={ds.id}
            datasource={ds}
            isSelected={settings.selectedDataSource === ds.id}
            onSelect={() => handleSelect(ds.id)}
            style={{ animationDelay: `${0.1 + index * 0.05}s` }}
          />
        ))}
      </div>

      <div className="wz-ds-notice">
        <AlertTriangle size={20} />
        <span>
          Game Datacards does not host any data. Everything is downloaded remotely and cached locally on your device.
        </span>
      </div>
    </div>
  );
};

const StepThankYou = () => (
  <div className="wz-thankyou-content">
    <h2 className="wz-step-title">You&apos;re All Set!</h2>
    <p className="wz-step-description">
      Thank you for using our app. We hope you are able to create the perfect cards that you need for your Tabletop
      Wargaming games. Keep on creating and keep on rolling those dice!
    </p>
    <p className="wz-step-description">
      If you would like to discuss or request features we invite you to join our Discord server.
    </p>
    <a href="https://discord.gg/anfn4qTYC4" target="_blank" rel="noreferrer" className="wz-discord-link">
      <img src="https://discordapp.com/api/guilds/997166169540788244/widget.png?style=banner2" alt="Join our Discord" />
    </a>
  </div>
);

// Step Content Router
const WizardStepContent = ({ step, settings, updateSettings }) => {
  const contentMap = {
    0: <StepWelcome />,
    1: <StepManagingCards />,
    2: <StepAddingCards />,
    3: <StepEditingCards />,
    4: <StepSharingCards />,
    5: <StepDatasources settings={settings} updateSettings={updateSettings} />,
    6: <StepThankYou />,
  };

  return (
    <div className="wz-step-content" key={step}>
      {contentMap[step]}
    </div>
  );
};

// Footer Component
const WizardFooter = ({ step, totalSteps, onPrevious, onNext, onFinish, canProceed }) => (
  <footer className="wz-footer">
    <div className="wz-footer-left">
      {step > 0 && step < totalSteps - 1 && (
        <button className="wz-btn wz-btn--secondary" onClick={onPrevious}>
          <ChevronLeft size={16} />
          Previous
        </button>
      )}
    </div>
    <div className="wz-footer-right">
      {step === 0 && (
        <button className="wz-btn wz-btn--primary" onClick={onNext}>
          Let&apos;s get started!
          <ChevronRight size={16} />
        </button>
      )}
      {step > 0 && step < totalSteps - 1 && (
        <button className="wz-btn wz-btn--primary" onClick={onNext} disabled={!canProceed}>
          Next
          <ChevronRight size={16} />
        </button>
      )}
      {step === totalSteps - 1 && (
        <button className="wz-btn wz-btn--primary wz-btn--finish" onClick={onFinish}>
          Finish Setup
        </button>
      )}
    </div>
  </footer>
);

// Main Wizard Component
export const WelcomeWizard = () => {
  const [isWizardVisible, setIsWizardVisible] = React.useState(false);
  const [step, setStep] = React.useState(0);
  const [isExiting, setIsExiting] = React.useState(false);

  const { settings, updateSettings } = useSettingsStorage();

  // Keyboard handler
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape" && isWizardVisible && step === WIZARD_STEPS.length - 1) {
        handleClose();
      }
    },
    [isWizardVisible, step]
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
    if (compare(settings.wizardCompleted, LAST_WIZARD_VERSION, "<")) {
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
        wizardCompleted: process.env.REACT_APP_VERSION,
        lastMajorWizardVersion: process.env.REACT_APP_VERSION,
      });
    }, 200);
  };

  // Overlay click handler - only close on final step
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && step === WIZARD_STEPS.length - 1) {
      handleClose();
    }
  };

  // Navigation
  const handlePrevious = () => setStep((s) => Math.max(0, s - 1));
  const handleNext = () => setStep((s) => Math.min(WIZARD_STEPS.length - 1, s + 1));

  // Can proceed check (datasource must be selected on step 5)
  const canProceed = step !== 5 || settings.selectedDataSource;

  if (!isWizardVisible) return null;

  return ReactDOM.createPortal(
    <div className={`wz-overlay ${isExiting ? "wz-overlay--exiting" : ""}`} onClick={handleOverlayClick}>
      <div className="wz-modal" onClick={(e) => e.stopPropagation()}>
        <WizardHeader step={step} />

        <MobileProgress currentStep={step} totalSteps={WIZARD_STEPS.length} />

        <div className="wz-body">
          <WizardSidebar steps={WIZARD_STEPS} currentStep={step} onStepClick={setStep} />
          <div className="wz-content">
            <WizardStepContent step={step} settings={settings} updateSettings={updateSettings} />
          </div>
        </div>

        <WizardFooter
          step={step}
          totalSteps={WIZARD_STEPS.length}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onFinish={handleClose}
          canProceed={canProceed}
        />
      </div>
    </div>,
    modalRoot
  );
};
