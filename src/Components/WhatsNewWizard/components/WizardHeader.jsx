import React from "react";

/**
 * WizardHeader - Header component for the WhatsNewWizard
 *
 * Displays the current step title, step counter badge, version info subtitle,
 * and a progress bar showing overall completion.
 *
 * @param {Object} props - Component props
 * @param {number} props.step - Current step index (0-based)
 * @param {Array} props.steps - Array of step configurations
 * @param {string} props.version - Version string to display when not multi-version
 * @param {boolean} props.isMultiVersion - Whether showing multiple versions (shows per-step version)
 * @returns {JSX.Element} Header component
 */
export const WizardHeader = ({ step, steps, version, isMultiVersion = false }) => (
  <header className="wnw-header">
    <div className="wnw-header-content">
      <div>
        <div className="wnw-title-row">
          <h1 className="wnw-title">{steps[step].title}</h1>
          <span className="wnw-step-badge">
            Step {step + 1} of {steps.length}
          </span>
        </div>
        <p className="wnw-subtitle">
          {isMultiVersion ? `What's new in version ${steps[step].version}` : `What's new in version ${version}`}
        </p>
      </div>
    </div>
    <div className="wnw-progress">
      <div className="wnw-progress-bar" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
    </div>
  </header>
);

export default WizardHeader;
