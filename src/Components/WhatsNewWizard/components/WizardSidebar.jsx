import React from "react";
import { Check } from "lucide-react";

/**
 * WizardSidebar - Sidebar navigation component for the WhatsNewWizard
 *
 * Displays all steps with their completion status and allows navigation
 * to completed steps. Shows version headers when displaying multiple versions.
 *
 * @param {Object} props - Component props
 * @param {Array} props.steps - Array of step configurations with version info
 * @param {number} props.currentStep - Current active step index
 * @param {Function} props.onStepClick - Callback when a completed step is clicked
 * @param {boolean} props.isMultiVersion - Whether showing multiple versions (shows version headers)
 * @returns {JSX.Element} Sidebar navigation component
 */
export const WizardSidebar = ({ steps, currentStep, onStepClick, isMultiVersion = false }) => {
  let lastVersion = null;

  return (
    <nav className="wnw-sidebar">
      {steps.map((stepItem, index) => {
        const isActive = currentStep === index;
        const isCompleted = currentStep > index;
        const showVersionHeader = isMultiVersion && stepItem.version !== lastVersion && index > 0;

        if (stepItem.version !== lastVersion) {
          lastVersion = stepItem.version;
        }

        return (
          <React.Fragment key={stepItem.key}>
            {showVersionHeader && <div className="wnw-sidebar-version-header">v{stepItem.version}</div>}
            <div
              className={`wnw-sidebar-item ${isActive ? "wnw-sidebar-item--active" : ""} ${
                isCompleted ? "wnw-sidebar-item--completed" : ""
              }`}
              onClick={() => isCompleted && onStepClick(index)}
              style={{ animationDelay: `${index * 0.05}s` }}>
              <div className="wnw-sidebar-marker">{isCompleted ? <Check size={14} /> : <span>{index + 1}</span>}</div>
              <span className="wnw-sidebar-title">{stepItem.title}</span>
            </div>
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default WizardSidebar;
