import { compare } from "compare-versions";
import React, { useEffect, useCallback } from "react";
import * as ReactDOM from "react-dom";
import { useSettingsStorage } from "../Hooks/useSettingsStorage";
import { LAST_WIZARD_VERSION } from "./WelcomeWizard";
import { getMajorWizardVersion } from "./WhatsNewWizard";
import "./WhatsNew.css";

const modalRoot = document.getElementById("modal-root");

const features = [
  {
    title: "Premium Subscriptions",
    description:
      "Introducing optional Premium and Creator tiers with expanded storage. All core features remain free forever.",
    isNew: true,
  },
  {
    title: "Premium: 50 Categories & 2 Datasources",
    description: "Upgrade to Premium for more card storage and the ability to import custom datasources.",
    isNew: true,
  },
  {
    title: "Creator: 250 Categories & 10 Datasources",
    description: "For power users and content creators who need maximum storage capacity.",
    isNew: true,
  },
  {
    title: "Redesigned Onboarding",
    description: "A fresh welcome wizard that better introduces Game Datacards features to new users.",
    isNew: true,
  },
  {
    title: "Floating Toolbar Guide",
    description: "New onboarding step explaining how to add and save cards using the floating toolbar.",
  },
  {
    title: "Improved Workspace Demo",
    description: "Interactive tree view demo in the wizard that matches the actual app styling.",
  },
];

export const WhatsNew = () => {
  const [isWhatsNewVisible, setIsWhatsNewVisible] = React.useState(false);

  const { settings, updateSettings } = useSettingsStorage();

  const closeWhatsNew = () => {
    setIsWhatsNewVisible(false);
    updateSettings({
      ...settings,
      wizardCompleted: import.meta.env.VITE_VERSION,
    });
  };

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape" && isWhatsNewVisible) {
        closeWhatsNew();
      }
    },
    [isWhatsNewVisible],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    // Check if major wizard should show instead
    const currentVersion = import.meta.env.VITE_VERSION;
    const majorVersion = getMajorWizardVersion(currentVersion);

    // Guard against undefined settings values
    if (!settings.wizardCompleted || !settings.lastMajorWizardVersion) {
      return;
    }

    // Don't show regular WhatsNew if major wizard should be showing
    if (majorVersion && compare(settings.lastMajorWizardVersion, majorVersion, "<")) {
      return;
    }

    if (
      compare(settings.wizardCompleted, LAST_WIZARD_VERSION, ">=") &&
      compare(settings.wizardCompleted, currentVersion, "<")
    ) {
      setIsWhatsNewVisible(true);
    }
  }, [settings]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closeWhatsNew();
    }
  };

  if (!isWhatsNewVisible) return null;

  return ReactDOM.createPortal(
    <div className="wn-overlay" onClick={handleOverlayClick}>
      <div className="wn-modal" onClick={(e) => e.stopPropagation()}>
        <header className="wn-header">
          <div className="wn-header-content">
            <div className="wn-title-row">
              <h1 className="wn-title">What&apos;s New</h1>
              <span className="wn-version-badge">v{import.meta.env.VITE_VERSION}</span>
            </div>
            <p className="wn-subtitle">Check out the latest updates and improvements.</p>
          </div>
          <button className="wn-close" onClick={closeWhatsNew} aria-label="Close">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </header>

        <div className="wn-body">
          <div className="wn-features">
            {features.map((feature, index) => (
              <article
                key={index}
                className={`wn-feature ${feature.isNew ? "wn-feature--new" : ""}`}
                style={{ animationDelay: `${0.1 + index * 0.05}s` }}>
                <div className="wn-feature-marker"></div>
                <div className="wn-feature-content">
                  <h3 className="wn-feature-title">
                    {feature.title}
                    {feature.isNew && <span className="wn-tag">New</span>}
                  </h3>
                  <p className="wn-feature-desc">{feature.description}</p>
                </div>{" "}
              </article>
            ))}
          </div>
        </div>

        <footer className="wn-footer">
          <button className="wn-btn" onClick={closeWhatsNew}>
            Okay, got it
          </button>
        </footer>
      </div>
    </div>,
    modalRoot,
  );
};
