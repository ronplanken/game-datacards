import React, { useEffect, useState, useCallback } from "react";
import * as ReactDOM from "react-dom";
import { compare } from "compare-versions";
import { useCardStorage } from "../Hooks/useCardStorage";
import { useSettingsStorage } from "../Hooks/useSettingsStorage";
import { LAST_WIZARD_VERSION } from "./WelcomeWizard";
import { getMajorWizardVersion } from "./WhatsNewWizard";

const modalRoot = document.getElementById("modal-root");
const DISMISS_KEY = "gdc-local-ds-migration-dismissed";

export const LocalDatasourceMigrationNotice = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { cardStorage } = useCardStorage();
  const { settings } = useSettingsStorage();

  const localDatasources = cardStorage.categories?.filter((cat) => cat.type === "local-datasource") || [];

  useEffect(() => {
    if (localDatasources.length === 0) return;

    const currentVersion = import.meta.env.VITE_VERSION;

    // Wait for welcome wizard to complete
    if (!settings.wizardCompleted || compare(settings.wizardCompleted, LAST_WIZARD_VERSION, "<")) {
      return;
    }

    // Wait for major what's new wizard to complete
    const majorVersion = getMajorWizardVersion(currentVersion);
    if (
      majorVersion &&
      settings.lastMajorWizardVersion &&
      compare(settings.lastMajorWizardVersion, majorVersion, "<")
    ) {
      return;
    }

    // Wait for regular what's new to complete
    if (settings.wizardCompleted && compare(settings.wizardCompleted, currentVersion, "<")) {
      return;
    }

    // Check if dismissed for these specific datasources
    try {
      const dismissed = JSON.parse(localStorage.getItem(DISMISS_KEY) || "[]");
      const currentUuids = localDatasources.map((ds) => ds.uuid).sort();
      const dismissedUuids = [...dismissed].sort();
      if (JSON.stringify(currentUuids) === JSON.stringify(dismissedUuids)) {
        return;
      }
    } catch {
      // Corrupted dismiss state — show the modal
    }

    setIsVisible(true);
  }, [localDatasources.length, settings.wizardCompleted, settings.lastMajorWizardVersion]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    const uuids = localDatasources.map((ds) => ds.uuid);
    localStorage.setItem(DISMISS_KEY, JSON.stringify(uuids));
  }, [localDatasources]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape" && isVisible) {
        handleDismiss();
      }
    },
    [isVisible, handleDismiss],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleDismiss();
    }
  };

  if (!isVisible || !modalRoot) return null;

  return ReactDOM.createPortal(
    <div className="wn-overlay" onClick={handleOverlayClick} style={{ zIndex: 10000 }}>
      <div className="wn-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <header className="wn-header">
          <div className="wn-header-content">
            <h1 className="wn-title">Migration Required</h1>
            <p className="wn-subtitle">Local datasources need to be converted</p>
          </div>
          <button className="wn-close" onClick={handleDismiss} aria-label="Close">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <div className="wn-body" style={{ padding: "20px 24px" }}>
          <p style={{ margin: "0 0 12px", lineHeight: 1.5, fontSize: 14 }}>
            The old local datasource format is no longer supported. Please convert them to categories using the
            right-click menu in the tree view, then recreate them as custom datasources in the{" "}
            <strong>Datasource Editor</strong> (/datasources).
          </p>

          <p style={{ margin: "0 0 12px", fontWeight: 600, fontSize: 14 }}>Affected datasources:</p>
          <ul style={{ margin: "0 0 16px", paddingLeft: 20, fontSize: 14, lineHeight: 1.6 }}>
            {localDatasources.map((ds) => (
              <li key={ds.uuid}>{ds.name}</li>
            ))}
          </ul>
        </div>

        <div style={{ padding: "12px 24px 20px", display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={handleDismiss}
            style={{
              padding: "8px 20px",
              background: "#722ed1",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}>
            Got it
          </button>
        </div>
      </div>
    </div>,
    modalRoot,
  );
};
