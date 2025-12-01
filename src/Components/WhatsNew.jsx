import { compare } from "compare-versions";
import React, { useEffect, useCallback } from "react";
import * as ReactDOM from "react-dom";
import { useSettingsStorage } from "../Hooks/useSettingsStorage";
import { LAST_WIZARD_VERSION } from "./WelcomeWizard";
import "./WhatsNew.css";

const modalRoot = document.getElementById("modal-root");

export const WhatsNew = () => {
  const [isWhatsNewVisible, setIsWhatsNewVisible] = React.useState(false);

  const { settings, updateSettings } = useSettingsStorage();

  const closeWhatsNew = () => {
    setIsWhatsNewVisible(false);
    updateSettings({
      ...settings,
      wizardCompleted: process.env.REACT_APP_VERSION,
    });
  };

  // Handle escape key
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

  // Handle overlay click
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closeWhatsNew();
    }
  };

  if (!isWhatsNewVisible) return null;

  return ReactDOM.createPortal(
    <div className="whatsnew-modal-overlay" onClick={handleOverlayClick}>
      <div className="whatsnew-modal" onClick={(e) => e.stopPropagation()}>
        <div className="whatsnew-modal-header">
          <h1 className="whatsnew-modal-title">What&apos;s new in {process.env.REACT_APP_VERSION}</h1>
        </div>

        <div className="whatsnew-modal-body">
          <h3 className="whatsnew-section-title">New in 3.0</h3>
          <ul className="whatsnew-list">
            <li className="whatsnew-list-item">
              <strong>Updated Styling</strong>
              <span>Refreshed modal designs and UI components for a more modern look and feel.</span>
            </li>
            <li className="whatsnew-list-item">
              <strong>Custom Faction Icons</strong>
              <span>Upload your own faction symbol with positioning and scaling controls.</span>
            </li>
            <li className="whatsnew-list-item">
              <strong>Custom Colours</strong>
              <span>Override faction colours with custom banner and header colours per card.</span>
            </li>
            <li className="whatsnew-list-item">
              <strong>Linkable Leaders</strong>
              <span>Link Leader and Led By entries to your own custom cards.</span>
            </li>
            <li className="whatsnew-list-item">
              <strong>Updated Controls</strong>
              <span>Auto-fit card scaling and improved zoom controls in the editor.</span>
            </li>
            <li className="whatsnew-list-item">
              <strong>Sub-categories</strong>
              <span>Organise your cards with nested sub-categories in the tree view.</span>
            </li>
          </ul>
        </div>

        <div className="whatsnew-modal-footer">
          <button className="whatsnew-close-btn" onClick={closeWhatsNew}>
            Close
          </button>
        </div>
      </div>
    </div>,
    modalRoot
  );
};
