import { compare } from "compare-versions";
import React, { useEffect, useCallback } from "react";
import * as ReactDOM from "react-dom";
import { useSettingsStorage } from "../Hooks/useSettingsStorage";
import { LAST_WIZARD_VERSION } from "./WelcomeWizard";
import "./WhatsNew.css";

const modalRoot = document.getElementById("modal-root");

const features = [
  {
    title: "Age of Sigmar Support",
    description:
      "Full support for Age of Sigmar warscrolls with spell lores, manifestations, and faction-specific styling.",
    isNew: true,
  },
  {
    title: "Updated Styling",
    description: "Refreshed modal designs and UI components for a more modern look and feel.",
  },
  {
    title: "Custom Faction Icons",
    description: "Upload your own faction symbol with positioning and scaling controls.",
  },
  {
    title: "Custom Colours",
    description: "Override faction colours with custom banner and header colours per card.",
  },
  {
    title: "Linkable Leaders",
    description: "Link Leader and Led By entries to your own custom cards.",
  },
  {
    title: "Updated Controls",
    description: "Auto-fit card scaling and improved zoom controls in the editor.",
  },
  {
    title: "Sub-categories",
    description: "Organise your cards with nested sub-categories in the tree view.",
  },
];

export const WhatsNew = () => {
  const [isWhatsNewVisible, setIsWhatsNewVisible] = React.useState(true); // TODO: change back to false

  const { settings, updateSettings } = useSettingsStorage();

  const closeWhatsNew = () => {
    setIsWhatsNewVisible(false);
    updateSettings({
      ...settings,
      wizardCompleted: process.env.REACT_APP_VERSION,
    });
  };

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape" && isWhatsNewVisible) {
        closeWhatsNew();
      }
    },
    [isWhatsNewVisible]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (
      compare(settings.wizardCompleted, LAST_WIZARD_VERSION, ">=") &&
      compare(settings.wizardCompleted, process.env.REACT_APP_VERSION, "<")
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
              <span className="wn-version-badge">v{process.env.REACT_APP_VERSION}</span>
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
    modalRoot
  );
};
